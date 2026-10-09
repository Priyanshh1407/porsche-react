/*
 * Runs once before the test suite: applies prisma/migrations to the throwaway test database
 * (`migrate deploy`, the same path production uses; never --force-reset).
 * Fails fast with a clear message if the database is not running.
 *
 * The test-db container keeps its data in tmpfs, so a clean slate is
 * `npm run test:db:down && npm run test:db:up`. That is also needed once if the container still
 * holds a schema created by the old `db push` setup.
 */
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
    require('./test-env.cjs');
    try {
        execSync('npx prisma migrate deploy', {
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
