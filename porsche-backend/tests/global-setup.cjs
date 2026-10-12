/*
 * Runs once before the test suite: finds or starts the throwaway test database, then applies
 * prisma/migrations to it (`migrate deploy`, the same path production uses; never --force-reset).
 *
 * No Docker needed (scripts/test-db.mjs): DATABASE_URL_TEST if set, else the Docker test-db if it is
 * already running, else an embedded PostgreSQL started here and stopped in global-teardown.cjs.
 * Workers are started after this, so they inherit DATABASE_URL_TEST.
 */
const { execSync } = require('child_process');
const path = require('path');
const { pathToFileURL } = require('url');

module.exports = async () => {
    const { ensureTestDb } = await import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'test-db.mjs')).href);
    const db = await ensureTestDb({ log: (msg) => console.log(`\n[test-db] ${msg}`) });
    process.env.DATABASE_URL_TEST = db.url;
    globalThis.__TEST_DB__ = db; // read by global-teardown.cjs (same process)

    require('./test-env.cjs');
    try {
        execSync('npx prisma migrate deploy', {
            cwd: path.resolve(__dirname, '..'),
            env: process.env,
            stdio: 'pipe',
        });
    } catch (err) {
        await db.stop();
        const out = `${err.stdout || ''}${err.stderr || ''}`;
        throw new Error(`Could not prepare the test database (${db.source}).\n\n${out.slice(-1500)}`);
    }
};
