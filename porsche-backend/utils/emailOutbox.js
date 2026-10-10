// UPG-03: transactional email outbox.
//
// The contact route writes the lead and one EmailOutbox row per email in ONE transaction, so a
// lead can never exist without its emails being recorded. This worker delivers them:
//   - claim: one UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED) stamps a lease
//     (lockedUntil). Concurrent workers skip each other's rows instead of waiting on them, and the
//     row lock lasts only for that statement: the SMTP send happens outside any transaction, so a
//     slow mail server never holds a database connection or lock.
//   - deliver each email on its own; success -> sent, failure -> retry with exponential backoff,
//     after MAX_ATTEMPTS -> failed (logged).
//   - a worker that dies mid-send leaves a lease that simply expires, and the row is retried.
//     Delivery is therefore at-least-once: a crash between "SMTP accepted" and "marked sent" can
//     send that one email twice. SMTP offers no idempotency key, so that is the honest guarantee.
// All times come from the database clock (now()), so several app servers agree on what is due.
import { Prisma } from '@prisma/client';
import prisma from '../prisma/client.js';
import { buildEmail, sendEmail } from './emailService.js';

export const EMAIL_KINDS = ['customer_confirmation', 'admin_notification'];
export const MAX_ATTEMPTS = 5;
export const BASE_BACKOFF_MS = 30_000;          // 30 s, 1 min, 2 min, 4 min, ...
export const MAX_BACKOFF_MS = 30 * 60_000;      // ... capped at 30 min
// A claimed batch is sent one email after another, so the lease must cover the whole batch:
// per email, the SMTP timeouts (connect/greeting 10 s, socket 20 s) with room to spare.
const LEASE_PER_EMAIL_MS = 60_000;

export const backoffMs = (attempts) => Math.min(BASE_BACKOFF_MS * 2 ** (attempts - 1), MAX_BACKOFF_MS);

/** Called inside the contact's transaction (tx): records the emails this lead needs. */
export async function enqueueContactEmails(tx, contactId) {
    await tx.emailOutbox.createMany({ data: EMAIL_KINDS.map((kind) => ({ contactId, kind })) });
}

/** Claims up to batchSize due emails for this worker. contactIds optionally limits the scope. */
async function claimDue(batchSize, contactIds) {
    const leaseSeconds = (LEASE_PER_EMAIL_MS * batchSize) / 1000;
    const scope = contactIds ? Prisma.sql`AND "contactId" = ANY(${contactIds}::text[])` : Prisma.empty;
    return prisma.$queryRaw`
        UPDATE "EmailOutbox"
        SET "lockedUntil" = now() + make_interval(secs => ${leaseSeconds}::double precision), "updatedAt" = now()
        WHERE id IN (
            SELECT id FROM "EmailOutbox"
            WHERE status = 'pending'
              AND "nextAttemptAt" <= now()
              AND ("lockedUntil" IS NULL OR "lockedUntil" < now())
              ${scope}
            ORDER BY "nextAttemptAt"
            LIMIT ${batchSize}
            FOR UPDATE SKIP LOCKED
        )
        RETURNING id, "contactId", kind::text AS kind, attempts`;
}

async function deliver(row, send) {
    const attempts = row.attempts + 1;
    try {
        const contact = await prisma.contact.findUnique({ where: { id: row.contactId } });
        if (!contact) return; // lead deleted meanwhile; its outbox rows went with it (cascade)
        await send(buildEmail(row.kind, contact), row);
        await prisma.emailOutbox.updateMany({
            where: { id: row.id, status: 'pending' },
            data: { status: 'sent', sentAt: new Date(), attempts, lockedUntil: null, lastError: null },
        });
    } catch (err) {
        const message = String(err?.message || err).slice(0, 500);
        const where = `${row.kind} email for contact ${row.contactId}`;
        if (attempts >= MAX_ATTEMPTS) {
            await prisma.$executeRaw`
                UPDATE "EmailOutbox" SET status = 'failed', attempts = ${attempts}, "lockedUntil" = NULL,
                       "lastError" = ${message}, "updatedAt" = now()
                WHERE id = ${row.id}`;
            console.error(`Email outbox: gave up on the ${where} after ${attempts} attempts: ${message}`);
        } else {
            const delaySeconds = backoffMs(attempts) / 1000;
            await prisma.$executeRaw`
                UPDATE "EmailOutbox" SET attempts = ${attempts}, "lockedUntil" = NULL, "lastError" = ${message},
                       "nextAttemptAt" = now() + make_interval(secs => ${delaySeconds}::double precision), "updatedAt" = now()
                WHERE id = ${row.id}`;
            console.error(`Email outbox: attempt ${attempts}/${MAX_ATTEMPTS} of the ${where} failed (retry in ${delaySeconds} s): ${message}`);
        }
    }
}

/**
 * Delivers every email that is due now, batch by batch. Returns how many were attempted.
 * send(message, row) defaults to the real SMTP sender; tests pass their own.
 */
export async function runOnce({ send = sendEmail, batchSize = 10, contactIds } = {}) {
    let attempted = 0;
    for (;;) {
        const batch = await claimDue(batchSize, contactIds);
        if (batch.length === 0) return attempted;
        for (const row of batch) await deliver(row, send);
        attempted += batch.length;
    }
}

let activeWorker = null;

/** Polls every intervalMs; stop() stops polling and waits for an in-progress run to finish. */
export function startEmailWorker({ intervalMs = 5000, ...options } = {}) {
    let running = null;
    let stopped = false;
    const tick = () => {
        if (running || stopped) return;
        running = runOnce(options)
            .catch((err) => console.error(`Email outbox: worker run failed: ${err.message}`))
            .finally(() => { running = null; });
    };
    const timer = setInterval(tick, intervalMs);
    timer.unref?.();
    tick();
    const worker = {
        nudge: tick,
        stop: async () => {
            stopped = true;
            clearInterval(timer);
            if (activeWorker === worker) activeWorker = null;
            if (running) await running;
        },
    };
    activeWorker = worker;
    return worker;
}

/** Lets the contact route ask for immediate delivery instead of waiting for the next poll. */
export const nudgeEmailWorker = () => activeWorker?.nudge();
