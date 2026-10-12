import crypto from 'crypto';
import pg from 'pg';

/*
 * Live admin notifications (Phase 9).
 *
 * Publish: `publish(tx, type, data)` runs pg_notify inside the caller's transaction. Postgres only
 * delivers a NOTIFY when that transaction commits (never on rollback), in commit order, to every
 * listening connection, so several API instances all see every event.
 *
 * Deliver: one dedicated connection per process LISTENs (started with the first subscriber,
 * reconnecting with backoff) and fans events out to the open SSE streams (routes/events.js).
 *
 * Auth: EventSource can't send an Authorization header, and a JWT in a URL ends up in logs. The
 * admin trades the JWT for a ticket: random, single use, valid 30 s, kept only as a hash, in memory.
 * (With several instances behind a load balancer, the ticket and the stream must reach the same
 * instance: sticky sessions, or move the ticket store to a shared one.)
 */
export const CHANNEL = 'porsche_events';
const HEARTBEAT_MS = 25_000;

// ------------------------------------------------------------------ publish

/** Queue an event in transaction `tx` (a Prisma transaction client). Delivered on commit. */
export function publish(tx, type, data) {
    // NOTIFY payloads are limited to 8000 bytes: events carry ids and a few labels, never full rows.
    const payload = JSON.stringify({ type, data, at: new Date().toISOString() });
    return tx.$executeRaw`SELECT pg_notify(${CHANNEL}, ${payload})`;
}

// ------------------------------------------------------------------ tickets

export function createTicketStore({ ttlMs = 30_000, now = Date.now } = {}) {
    const tickets = new Map(); // sha256(ticket) -> { admin, expires }
    const hash = (ticket) => crypto.createHash('sha256').update(String(ticket)).digest('hex');
    const prune = () => { for (const [key, t] of tickets) if (t.expires <= now()) tickets.delete(key); };
    return {
        ttlSeconds: Math.round(ttlMs / 1000),
        issue(admin) {
            prune();
            const ticket = crypto.randomBytes(32).toString('base64url');
            tickets.set(hash(ticket), { admin, expires: now() + ttlMs });
            return ticket;
        },
        /** The admin the ticket was issued to, or null. A ticket works once. */
        redeem(ticket) {
            if (!ticket) return null;
            const key = hash(ticket);
            const entry = tickets.get(key);
            tickets.delete(key);
            return entry && entry.expires > now() ? entry.admin : null;
        },
    };
}

export const tickets = createTicketStore();

// ------------------------------------------------------------------ listen + fan out

const streams = new Set(); // { send(type, data, at), end() }
let listener = null; // Promise<pg.Client> while connecting/connected
let closing = false;
let retryTimer = null;
let retryDelay = 1000;

function connectListener() {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, options: '-c TimeZone=UTC' });
    const ready = (async () => {
        await client.connect();
        await client.query(`LISTEN ${CHANNEL}`);
        retryDelay = 1000;
        return client;
    })();
    client.on('notification', (msg) => {
        let event;
        try { event = JSON.parse(msg.payload); } catch { return; }
        for (const stream of streams) stream.send(event.type, event.data, event.at);
    });
    // A lost connection (DB restart): reconnect with backoff while anyone is listening. Events sent
    // in between are missed; the dashboard refreshes its data whenever it reconnects.
    const lost = (err) => {
        if (listener !== ready) return;
        listener = null;
        client.end().catch(() => {});
        if (closing || streams.size === 0) return;
        console.error(`Live events connection lost (${err?.message || 'closed'}); reconnecting in ${retryDelay / 1000} s`);
        retryTimer = setTimeout(() => { retryTimer = null; if (!listener && streams.size) ensureListening().catch(() => {}); }, retryDelay);
        retryTimer.unref();
        retryDelay = Math.min(retryDelay * 2, 30_000);
    };
    client.on('error', lost);
    client.on('end', () => lost());
    listener = ready;
    ready.catch(lost);
    return ready;
}

/** Resolves once this process is LISTENing. */
export function ensureListening() {
    closing = false;
    return listener || connectListener();
}

/**
 * Turns an HTTP response into an SSE stream for one admin. `expiresAt` (ms) ends it when the
 * admin's JWT expires: the browser then has to get a new ticket, which re-checks the login.
 */
export async function openStream(req, res, { expiresAt }) {
    await ensureListening();
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        // no-transform: proxies and the dev server's compression must not buffer the stream.
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');

    let ended = false;
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
    const expiry = setTimeout(() => stream.end(), Math.max(0, Math.min(expiresAt - Date.now(), 2 ** 31 - 1)));
    heartbeat.unref();
    expiry.unref();
    const stream = {
        send(type, data, at) {
            if (!ended) res.write(`event: ${type}\ndata: ${JSON.stringify({ ...data, at })}\n\n`);
        },
        end() {
            if (ended) return;
            ended = true;
            clearInterval(heartbeat);
            clearTimeout(expiry);
            streams.delete(stream);
            res.end();
        },
    };
    streams.add(stream);
    req.on('close', () => stream.end());
}

/** Ends every stream and stops listening (graceful shutdown; also used by tests). */
export async function closeLiveEvents() {
    closing = true;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    for (const stream of [...streams]) stream.end();
    const current = listener;
    listener = null;
    if (current) {
        const client = await current.catch(() => null);
        await client?.end().catch(() => {});
    }
}
