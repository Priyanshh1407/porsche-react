// The committed migrations must produce exactly what prisma/schema.prisma describes. Production
// runs `migrate deploy` (the SQL files), the app runs the client generated from the schema: a
// difference would only show up as a runtime error on some query.
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const BACKEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('migrations and schema.prisma describe the same database', () => {
    // DATABASE_URL is the migrated test database (tests/test-env.cjs + global-setup.cjs).
    const diff = execSync('npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script', {
        cwd: BACKEND, env: process.env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    expect(diff.trim()).toBe('-- This is an empty migration.');
}, 60000);
