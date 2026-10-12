/*
 * The throwaway test database, with no Docker required.
 *
 * ensureTestDb() picks, in order:
 *   1. DATABASE_URL_TEST, if set (any Postgres you point it at; must be named porsche_test);
 *   2. the Docker test-db on localhost:5433, if it is already running (Docker is optional);
 *   3. otherwise an embedded, real PostgreSQL 17 (npm `embedded-postgres`: real binaries run as a
 *      normal process, no Docker, no admin rights) in a fresh temp folder on a free port, removed
 *      again by stop().
 * Real Postgres in every case: the tests rely on triggers, FOR UPDATE SKIP LOCKED and migrations.
 *
 *   node scripts/test-db.mjs        start one and keep it running (prints DATABASE_URL_TEST)
 */
import net from 'net';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import pg from 'pg';

const USER = 'porsche_test';
const PASSWORD = 'porsche_test';
const DB = 'porsche_test';
export const DOCKER_TEST_DB = `postgresql://${USER}:${PASSWORD}@localhost:5433/${DB}`;

/** True if a Postgres at `url` accepts a connection within `timeoutMs`. */
export async function isReachable(url, timeoutMs = 1500) {
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: timeoutMs });
    try {
        await client.connect();
        await client.query('SELECT 1');
        return true;
    } catch {
        return false;
    } finally {
        await client.end().catch(() => {});
    }
}

const freePort = () => new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
});

const DIR_PREFIX = 'porsche-test-pg-';
const STALE_MS = 6 * 60 * 60 * 1000;
// Windows can hold a file for a moment after the process that used it has exited.
const removeDir = (dir) => fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });

/** Removes data folders left by runs that crashed before stop() (best effort; skips busy ones). */
function pruneStale() {
    for (const name of fs.readdirSync(os.tmpdir())) {
        if (!name.startsWith(DIR_PREFIX)) continue;
        const dir = path.join(os.tmpdir(), name);
        try {
            if (Date.now() - fs.statSync(dir).mtimeMs > STALE_MS) removeDir(dir);
        } catch { /* in use or already gone */ }
    }
}

/** Start an embedded PostgreSQL with an empty porsche_test database. */
export async function startEmbedded({ log = () => {} } = {}) {
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    pruneStale();
    const port = await freePort();
    const databaseDir = fs.mkdtempSync(path.join(os.tmpdir(), DIR_PREFIX));
    fs.rmSync(databaseDir, { recursive: true, force: true }); // initdb wants to create it itself
    const server = new EmbeddedPostgres({ databaseDir, port, user: USER, password: PASSWORD, persistent: false, onLog: () => {}, onError: () => {} });
    const started = Date.now();
    await server.initialise();
    await server.start();
    await server.createDatabase(DB);
    log(`embedded PostgreSQL ready on port ${port} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
    let stopped = false;
    return {
        url: `postgresql://${USER}:${PASSWORD}@localhost:${port}/${DB}`,
        stop: async () => {
            if (stopped) return;
            stopped = true;
            // Bounded: after a client was killed mid-connection, stop() was seen never to resolve, and
            // the process then exited before the folder was removed.
            let timer;
            await Promise.race([
                server.stop().catch(() => {}),
                new Promise((resolve) => { timer = setTimeout(resolve, 10000); }),
            ]);
            clearTimeout(timer);
            try { removeDir(databaseDir); } catch { /* still busy: pruned by a later run */ }
        },
    };
}

/** A test database URL plus where it came from and how to release it. */
export async function ensureTestDb({ log = () => {} } = {}) {
    if (process.env.DATABASE_URL_TEST) {
        return { url: process.env.DATABASE_URL_TEST, source: 'DATABASE_URL_TEST', stop: async () => {} };
    }
    if (await isReachable(DOCKER_TEST_DB)) {
        log('using the test database on localhost:5433 (Docker test-db)');
        return { url: DOCKER_TEST_DB, source: 'docker', stop: async () => {} };
    }
    const embedded = await startEmbedded({ log });
    return { ...embedded, source: 'embedded' };
}

// CLI: keep a test database running until Ctrl+C.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
    const db = await ensureTestDb({ log: console.log });
    console.log(`DATABASE_URL_TEST=${db.url}  (${db.source}); Ctrl+C to stop`);
    const bye = async () => { await db.stop(); process.exit(0); };
    process.on('SIGINT', bye);
    process.on('SIGTERM', bye);
    setInterval(() => {}, 1 << 30);
}
