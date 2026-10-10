// UPG-03: transactional email outbox. A lead is saved together with one outbox row per email;
// a worker delivers them with retries, backoff, a lease and SKIP LOCKED.
import request from 'supertest';
import { jest } from '@jest/globals';

let app;
let prisma;
let outbox;
const DOMAIN = 'outbox.test';

beforeAll(async () => {
    // Each submit gets its own client IP (as behind a proxy), so the 5-per-hour contact limiter
    // doesn't interfere with this file's ~15 submissions (same approach as contact-validation).
    process.env.TRUST_PROXY = '1';
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
    outbox = await import('../utils/emailOutbox.js');
});

afterAll(async () => {
    await prisma.contact.deleteMany({ where: { email: { endsWith: `@${DOMAIN}` } } }); // cascades to the outbox
    await prisma.$disconnect();
    delete process.env.TRUST_PROXY;
});

let seq = 0;
const newLead = async () => {
    const res = await request(app).post('/api/contact/submit').set('X-Forwarded-For', `198.51.100.${++seq}`).send({
        firstName: 'Out', lastName: 'Box', email: `lead${seq}-${Date.now()}@${DOMAIN}`, phone: '5550101',
        inquiryType: 'Sales', message: 'Outbox test lead.',
    });
    expect(res.statusCode).toBe(201);
    return res.body.data.id;
};
const rows = (contactId) => prisma.emailOutbox.findMany({ where: { contactId }, orderBy: { kind: 'asc' } });
// Makes every pending row of these leads due now (instead of waiting out the real backoff).
const makeDue = (contactIds) => prisma.emailOutbox.updateMany({ where: { contactId: { in: contactIds } }, data: { nextAttemptAt: new Date(Date.now() - 1000) } });
const recorder = (fail = () => false) => {
    const sent = [];
    const send = async (message, row) => {
        if (fail(row, message)) throw new Error(`SMTP down for ${row.kind}`);
        sent.push({ id: row.id, kind: row.kind, to: message.to });
    };
    return { sent, send };
};

describe('submitting a lead', () => {
    test('saves the lead and one pending outbox row per email, and sends nothing itself', async () => {
        const id = await newLead();
        const r = await rows(id);
        expect(r.map((x) => `${x.kind}:${x.status}:${x.attempts}`).sort()).toEqual([
            'admin_notification:pending:0',
            'customer_confirmation:pending:0',
        ]);
    });

    test('if the outbox write fails, the lead is not saved either (same transaction)', async () => {
        // A real database-level failure on the SECOND outbox insert, after the contact and the
        // first outbox row were already written inside the transaction.
        // Scoped to THIS test's lead: test files run in parallel on the same database, and a blanket
        // trigger would fail other files' submissions too. (The contact row was inserted earlier in
        // the same transaction, so the trigger can see its email.)
        await prisma.$executeRawUnsafe(`
            CREATE OR REPLACE FUNCTION outbox_test_fail() RETURNS trigger AS $$
            BEGIN
                IF (SELECT email FROM "Contact" WHERE id = NEW."contactId") LIKE 'rollback-%@${DOMAIN}' THEN
                    RAISE EXCEPTION 'outbox insert failed (test)';
                END IF;
                RETURN NEW;
            END $$ LANGUAGE plpgsql;`);
        await prisma.$executeRawUnsafe(`
            CREATE TRIGGER outbox_test_fail BEFORE INSERT ON "EmailOutbox"
            FOR EACH ROW WHEN (NEW.kind = 'admin_notification') EXECUTE FUNCTION outbox_test_fail();`);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const email = `rollback-${Date.now()}@${DOMAIN}`;
            const res = await request(app).post('/api/contact/submit').set('X-Forwarded-For', '198.51.100.250').send({
                firstName: 'Roll', lastName: 'Back', email, phone: '5550102', inquiryType: 'Sales', message: 'Must not be saved.',
            });
            expect(res.statusCode).toBe(500);
            expect(await prisma.contact.count({ where: { email } })).toBe(0);
        } finally {
            errorSpy.mockRestore();
            await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS outbox_test_fail ON "EmailOutbox"');
            await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS outbox_test_fail()');
        }
    });
});

describe('the worker', () => {
    test('delivers both emails once and marks them sent', async () => {
        const id = await newLead();
        const { sent, send } = recorder();
        await outbox.runOnce({ send, contactIds: [id] });
        expect(sent.map((s) => s.kind).sort()).toEqual(['admin_notification', 'customer_confirmation']);
        expect(sent.find((s) => s.kind === 'admin_notification').to).toBe(process.env.ADMIN_EMAIL);
        const r = await rows(id);
        expect(r.every((x) => x.status === 'sent' && x.sentAt && x.attempts === 1 && x.lockedUntil === null)).toBe(true);

        await makeDue([id]);
        await outbox.runOnce({ send, contactIds: [id] });
        expect(sent).toHaveLength(2); // sent rows are never picked up again
    });

    test('a failure is retried later with backoff, then succeeds', async () => {
        const id = await newLead();
        let smtpUp = false;
        const { sent, send } = recorder(() => !smtpUp);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const before = Date.now();
            await outbox.runOnce({ send, contactIds: [id] });
            let r = await rows(id);
            expect(r.every((x) => x.status === 'pending' && x.attempts === 1 && x.lastError.includes('SMTP down'))).toBe(true);
            // Not due again until the backoff has passed.
            for (const x of r) expect(x.nextAttemptAt.getTime()).toBeGreaterThanOrEqual(before + outbox.backoffMs(1) - 1000);
            await outbox.runOnce({ send, contactIds: [id] });
            expect(sent).toHaveLength(0);

            smtpUp = true;
            await makeDue([id]);
            await outbox.runOnce({ send, contactIds: [id] });
            r = await rows(id);
            expect(r.every((x) => x.status === 'sent' && x.attempts === 2)).toBe(true);
            expect(sent).toHaveLength(2);
        } finally {
            errorSpy.mockRestore();
        }
    });

    test('a partial failure never re-sends the email that already went out', async () => {
        const id = await newLead();
        let adminUp = false;
        const { sent, send } = recorder((row) => row.kind === 'admin_notification' && !adminUp);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            await outbox.runOnce({ send, contactIds: [id] });
            adminUp = true;
            await makeDue([id]);
            await outbox.runOnce({ send, contactIds: [id] });
        } finally {
            errorSpy.mockRestore();
        }
        expect(sent.filter((s) => s.kind === 'customer_confirmation')).toHaveLength(1);
        expect(sent.filter((s) => s.kind === 'admin_notification')).toHaveLength(1);
    });

    test('gives up after MAX_ATTEMPTS and marks the email failed (logged, not silently lost)', async () => {
        const id = await newLead();
        const { send } = recorder(() => true);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            for (let i = 0; i < outbox.MAX_ATTEMPTS; i++) {
                await makeDue([id]);
                await outbox.runOnce({ send, contactIds: [id] });
            }
            const r = await rows(id);
            expect(r.every((x) => x.status === 'failed' && x.attempts === outbox.MAX_ATTEMPTS)).toBe(true);
            expect(errorSpy.mock.calls.some((c) => String(c[0]).includes('gave up'))).toBe(true);

            await makeDue([id]);
            await outbox.runOnce({ send, contactIds: [id] });
            expect((await rows(id)).every((x) => x.attempts === outbox.MAX_ATTEMPTS)).toBe(true); // never retried again
        } finally {
            errorSpy.mockRestore();
        }
    });

    test('two workers running at the same time never send the same email twice', async () => {
        const ids = [];
        for (let i = 0; i < 6; i++) ids.push(await newLead());
        const sent = [];
        // A slow send keeps each worker's claim open while the other one looks for work.
        const slowSend = (worker) => async (message, row) => {
            await new Promise((r) => setTimeout(r, 30));
            sent.push({ id: row.id, worker });
        };
        await Promise.all([
            outbox.runOnce({ send: slowSend('A'), contactIds: ids, batchSize: 3 }),
            outbox.runOnce({ send: slowSend('B'), contactIds: ids, batchSize: 3 }),
        ]);
        const outboxIds = (await prisma.emailOutbox.findMany({ where: { contactId: { in: ids } } })).map((r) => r.id);
        expect(outboxIds).toHaveLength(12);
        expect(sent.map((s) => s.id).sort()).toEqual([...outboxIds].sort()); // each exactly once
    });

    test('a claim skips an email another worker holds instead of waiting for it (SKIP LOCKED)', async () => {
        const id = await newLead();
        const [held, free] = await rows(id);
        // Another worker's claim in progress: a transaction holding a row lock on one email.
        let release;
        let signalLocked;
        const locked = new Promise((r) => { signalLocked = r; });
        const holder = prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "EmailOutbox" WHERE id = ${held.id} FOR UPDATE`;
            signalLocked();
            await new Promise((r) => { release = r; });
        }, { timeout: 15000 });
        await locked;

        const { sent, send } = recorder();
        const outcome = await Promise.race([
            outbox.runOnce({ send, contactIds: [id] }).then(() => 'finished'),
            new Promise((r) => setTimeout(() => r('blocked'), 2000)),
        ]);
        release();
        await holder;
        expect(outcome).toBe('finished');           // did not wait for the other worker's lock
        expect(sent.map((s) => s.id)).toEqual([free.id]); // and did not touch the locked email
    });

    test('an email held by a crashed worker is retried once its lease expires', async () => {
        const id = await newLead();
        // Simulate a worker that claimed the rows and died: a lease in the future, still pending.
        await prisma.emailOutbox.updateMany({ where: { contactId: id }, data: { lockedUntil: new Date(Date.now() + 60_000) } });
        const { sent, send } = recorder();
        await outbox.runOnce({ send, contactIds: [id] });
        expect(sent).toHaveLength(0); // the lease is respected

        await prisma.emailOutbox.updateMany({ where: { contactId: id }, data: { lockedUntil: new Date(Date.now() - 1000) } });
        await outbox.runOnce({ send, contactIds: [id] });
        expect(sent).toHaveLength(2);
    });

    test('deleting a lead deletes its pending emails', async () => {
        const id = await newLead();
        await prisma.contact.delete({ where: { id } });
        expect(await prisma.emailOutbox.count({ where: { contactId: id } })).toBe(0);
    });

    test('backoff grows exponentially and is capped', () => {
        const delays = [1, 2, 3, 4, 10].map((n) => outbox.backoffMs(n));
        expect(delays[1]).toBe(delays[0] * 2);
        expect(delays[2]).toBe(delays[1] * 2);
        expect(delays[4]).toBe(outbox.MAX_BACKOFF_MS);
    });
});

describe('start/stop', () => {
    test('a started worker delivers on its own and stop() waits for it to finish', async () => {
        const id = await newLead();
        const { sent, send } = recorder();
        const worker = outbox.startEmailWorker({ send, intervalMs: 50, contactIds: [id] });
        const deadline = Date.now() + 3000;
        while (sent.length < 2 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 25));
        await worker.stop();
        expect(sent).toHaveLength(2);
        expect((await rows(id)).every((x) => x.status === 'sent')).toBe(true);
    });
});
