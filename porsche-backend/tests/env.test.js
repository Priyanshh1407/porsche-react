import { spawnSync } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnv } from '../config/env.js';

const complete = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    JWT_SECRET: 'x'.repeat(32),
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'secret',
};

describe('SEC-01: startup configuration check', () => {
    test('passes with every required variable', () => {
        expect(() => validateEnv(complete)).not.toThrow();
    });

    test.each(['DATABASE_URL', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'])('throws when %s is missing', (name) => {
        const env = { ...complete };
        delete env[name];
        expect(() => validateEnv(env)).toThrow(name);
    });

    test('treats blank values as missing', () => {
        expect(() => validateEnv({ ...complete, ADMIN_PASSWORD: '   ' })).toThrow('ADMIN_PASSWORD');
    });

    test('accepts a JWT_SECRET of any length without a warning (developer decision)', () => {
        expect(() => validateEnv({ ...complete, JWT_SECRET: 'short' })).not.toThrow();
        expect(validateEnv({ ...complete, JWT_SECRET: 'short' })).toBeUndefined();
    });

    test('the real server process refuses to start without configuration', () => {
        const serverPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'server.js');
        // Run from a temp directory so dotenv finds no .env file, with no app variables set.
        const result = spawnSync(process.execPath, [serverPath], {
            cwd: os.tmpdir(),
            env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot },
            encoding: 'utf8',
            timeout: 60000,
        });

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Missing required environment variable(s): DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD');
    });
});
