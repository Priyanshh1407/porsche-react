// ERR-02: liveness vs readiness, and no "Connected" lie at boot.
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const UNREACHABLE_DB = 'postgresql://porsche_test:porsche_test@127.0.0.1:1/porsche_test';

afterAll(async () => {
    await prisma.$disconnect();
});

const childEnv = (overrides) => ({
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    EMAIL_PASS: '',
    ...overrides,
});

describe('with the database up', () => {
    test('GET /health (liveness) -> 200 without touching the DB', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('GET /ready (readiness) -> 200 after a real DB round-trip', async () => {
        const res = await request(app).get('/ready');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ready');
    });

    test('the old /api/contact/health still answers (backwards compatible)', async () => {
        expect((await request(app).get('/api/contact/health')).statusCode).toBe(200);
    });
});

describe('with the database unreachable', () => {
    test('/health stays 200 but /ready -> 503, quickly', () => {
        const result = spawnSync(process.execPath, [path.join(here, 'helpers', 'ready-probe.mjs')], {
            cwd: path.resolve(here, '..'),
            env: childEnv({ NODE_ENV: 'test', DATABASE_URL: UNREACHABLE_DB }),
            encoding: 'utf8',
            timeout: 60000,
        });
        const line = result.stdout.trim().split('\n').pop();
        const probe = JSON.parse(line);
        expect(probe.health).toBe(200);
        expect(probe.ready).toBe(503);
        expect(probe.readyBody.status).toBe('unavailable');
        expect(probe.readyMs).toBeLessThan(10000);
    });

    test('the server refuses to start instead of logging "Connected"', () => {
        const result = spawnSync(process.execPath, [path.join(here, '..', 'server.js')], {
            cwd: path.resolve(here, '..'),
            env: childEnv({ NODE_ENV: 'development', PORT: '0', DATABASE_URL: UNREACHABLE_DB }),
            encoding: 'utf8',
            timeout: 60000,
        });
        expect(result.status).toBe(1);
        expect(result.stdout + result.stderr).not.toContain('Connected to Postgres');
        expect(result.stderr).toContain('Database unreachable');
    });
});
