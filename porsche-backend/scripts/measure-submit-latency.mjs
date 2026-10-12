#!/usr/bin/env node
/*
 * Contact-submit latency (UPG-03 evidence): runs the real Express app on an ephemeral port against
 * the TEST database and times N sequential POST /api/contact/submit round trips.
 *
 *   node scripts/measure-submit-latency.mjs [--n 200] [--warmup 20]
 *
 * The test database comes from scripts/test-db.mjs (DATABASE_URL_TEST, the Docker test-db if it is
 * running, or an embedded PostgreSQL started and stopped here); Docker is optional.
 *
 * Uses tests/test-env.cjs, which refuses any database not named porsche_test, so it can never
 * write to a real database. Every lead it creates is deleted afterwards. Email is in demo mode
 * (no SMTP), so this measures the request path only, which is the point: the visitor's wait.
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureTestDb } from './test-db.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const testDb = await ensureTestDb({ log: console.log });
process.env.DATABASE_URL_TEST = testDb.url;
createRequire(import.meta.url)(path.join(here, '..', 'tests', 'test-env.cjs'));
if (testDb.source === 'embedded') execSync('npx prisma migrate deploy', { cwd: path.join(here, '..'), env: process.env, stdio: 'pipe' });
process.env.NODE_ENV = 'test'; // import the app without server.js start() (no port 5000, no worker)
process.env.TRUST_PROXY = '1'; // one client IP per request, so the 5-per-hour limiter stays out of it

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : Number(args[i + 1]); };
const N = opt('--n', 200);
const WARMUP = opt('--warmup', 20);
const TAG = `latency-${Date.now()}`;

const { default: app } = await import('../server.js');
const { default: prisma, pool } = await import('../prisma/client.js');
const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
const base = `http://127.0.0.1:${server.address().port}`;

// The contact route logs on demo-mode email (old code path); keep the output to the numbers.
console.log = () => {};
const report = (...line) => process.stdout.write(`${line.join(' ')}\n`);

let ip = 0;
const submitOnce = async (i) => {
    ip += 1;
    const t0 = process.hrtime.bigint();
    const res = await fetch(`${base}/api/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.${(ip >> 16) & 255}.${(ip >> 8) & 255}.${ip & 255}` },
        body: JSON.stringify({
            firstName: 'Lat', lastName: 'Ency', email: `${TAG}-${i}@latency.test`, phone: '5550199',
            inquiryType: 'Sales', message: 'Latency measurement lead.',
        }),
    });
    await res.arrayBuffer();
    if (res.status !== 201) throw new Error(`submit ${i}: HTTP ${res.status}`);
    return Number(process.hrtime.bigint() - t0) / 1e6;
};

try {
    for (let i = 0; i < WARMUP; i++) await submitOnce(`w${i}`);
    const times = [];
    for (let i = 0; i < N; i++) times.push(await submitOnce(i));
    times.sort((a, b) => a - b);
    const pct = (p) => times[Math.min(times.length - 1, Math.ceil((p / 100) * times.length) - 1)];
    report(`submit latency over ${N} sequential requests (after ${WARMUP} warm-up):`,
        `p50 ${pct(50).toFixed(1)} ms | p95 ${pct(95).toFixed(1)} ms | max ${times[times.length - 1].toFixed(1)} ms`);
} finally {
    await prisma.contact.deleteMany({ where: { email: { endsWith: '@latency.test' } } });
    server.close();
    await prisma.$disconnect();
    await pool.end(); // the driver adapter does not own the pool, so close it before the DB stops
    await testDb.stop();
}
