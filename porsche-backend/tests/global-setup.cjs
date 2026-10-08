/*
 * Runs once before the test suite: syncs the Prisma schema into the throwaway test database.
 * Fails fast with a clear message if the database is not running.
 *
 * Deliberately non-destructive (no --force-reset). The test-db container keeps its data in
 * tmpfs, so a clean slate is `npm run test:db:down && npm run test:db:up`.
 */
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
    require('./test-env.cjs');
    try {
        execSync('npx prisma db push', {
            cwd: path.resolve(__dirname, '..'),
            env: process.env,
            stdio: 'pipe',
        });
    } catch (err) {
        const out = `${err.stdout || ''}${err.stderr || ''}`;
        throw new Error(
            'Could not prepare the test database. Is it running? Start it with:\n' +
            '  docker compose up -d test-db   (from the repo root)\n\n' + out.slice(-1500)
        );
    }
};
