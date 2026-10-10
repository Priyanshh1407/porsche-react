#!/usr/bin/env node
/*
 * Verifies the backend's graceful shutdown (ERR-02) with a REAL SIGTERM, which Windows can't send.
 * Runs the backend in a Linux container (node:22-alpine) on the test-db's Docker network:
 *
 *   1. start the server, wait until it is listening
 *   2. begin a request and send only half of its body, so it is genuinely in flight
 *   3. `docker stop` (sends SIGTERM), then finish sending the body
 *   4. expect: the in-flight request still gets its response, the logs show the shutdown
 *      sequence, and the container exits with code 0 (not 137 = killed, not 143 = unhandled)
 *
 * Needs the test DB running (docker compose up -d --wait test-db). The backend source is copied
 * into the container without node_modules (installed fresh for Linux) and without .env.
 */
import { execFileSync, spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKEND = path.join(ROOT, 'porsche-backend').replace(/\\/g, '/');
const NAME = 'porsche-sigterm-check';
const NETWORK = 'porsche_default'; // created by docker-compose.yml for test-db
const IMAGE = 'node:22-alpine';

const docker = (args, opts = {}) => execFileSync('docker', args, { encoding: 'utf8', ...opts }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, msg) => { results.push(ok); console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${msg}`); };

async function main() {
    try { docker(['rm', '-f', NAME], { stdio: 'ignore' }); } catch { /* not running */ }

    const startScript = [
        'mkdir -p /app',
        // copy the source, excluding host node_modules (Windows binaries) and the secret .env
        "tar -C /src --exclude=./node_modules --exclude=./.env -cf - . | tar -C /app -xf -",
        'cd /app',
        // Installed exactly like a production deploy: runtime dependencies only, and no manual
        // "prisma generate" (the backend's postinstall must produce the client by itself).
        'npm ci --omit=dev --no-audit --no-fund --loglevel=error',
        'exec node server.js',
    ].join(' && ');

    console.log(`starting backend in ${IMAGE} (first run downloads the image and installs packages)...`);
    docker(['run', '-d', '--name', NAME, '--network', NETWORK, '-p', '127.0.0.1::5000',
        '-v', `${BACKEND}:/src:ro`, '-v', 'porsche-sigterm-node-modules:/app/node_modules',
        '-e', 'NODE_ENV=production', '-e', 'PORT=5000',
        '-e', 'DATABASE_URL=postgresql://porsche_test:porsche_test@test-db:5432/porsche_test',
        '-e', 'JWT_SECRET=sigterm-check-secret-0123456789abcdef0123',
        '-e', 'ADMIN_EMAIL=admin@sigterm.local', '-e', 'ADMIN_PASSWORD=sigterm-check',
        '-e', 'EMAIL_PASS=',
        IMAGE, 'sh', '-c', startScript]);

    // Wait until it listens.
    const deadline = Date.now() + 240000;
    while (!docker(['logs', NAME], { stdio: ['ignore', 'pipe', 'pipe'] }).includes('Server running on port')) {
        if (Date.now() > deadline) throw new Error(`server did not start:\n${docker(['logs', NAME])}`);
        if (docker(['inspect', '-f', '{{.State.Running}}', NAME]) !== 'true') throw new Error(`container exited:\n${docker(['logs', NAME])}`);
        await sleep(1000);
    }
    const port = Number(docker(['port', NAME, '5000/tcp']).split(':').pop());
    console.log(`server listening (host port ${port}); kernel: ${docker(['exec', NAME, 'uname', '-sr'])}`);

    // A request that is genuinely in flight: send headers + half the JSON body, then pause.
    const body = JSON.stringify({
        firstName: 'Graceful', lastName: 'Shutdown', email: `sigterm-${Date.now()}@example.com`,
        phone: '5550142', inquiryType: 'Sales', message: 'Submitted while the server was shutting down.',
    });
    const half = Math.floor(body.length / 2);
    const response = new Promise((resolve, reject) => {
        const req = http.request({ host: '127.0.0.1', port, path: '/api/contact/submit', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
            let data = '';
            res.on('data', (d) => { data += d; });
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.write(body.slice(0, half));
        globalThis.finishRequest = () => req.end(body.slice(half));
    });
    await sleep(500);

    // SIGTERM (docker stop waits up to 20 s before SIGKILL).
    const started = Date.now();
    const stopped = new Promise((resolve) => spawn('docker', ['stop', '-t', '20', NAME]).on('exit', resolve));
    await sleep(1000); // the server is now shutting down with our request still open
    globalThis.finishRequest();

    const res = await response;
    await stopped;
    const elapsed = Date.now() - started;
    const exitCode = Number(docker(['inspect', '-f', '{{.State.ExitCode}}', NAME]));
    const logs = docker(['logs', NAME]);

    check(res.status === 201, `in-flight request completed during shutdown (HTTP ${res.status})`);
    check(logs.includes('SIGTERM received: shutting down'), 'SIGTERM handler ran');
    check(logs.includes('Database connection closed'), 'database pool closed');
    check(exitCode === 0, `container exit code ${exitCode} (0 = clean; 137 = killed; 143 = unhandled SIGTERM)`);
    // ~1 s of this is the deliberate pause above. A lingering keep-alive connection would push it
    // to about 6 s (5 s keep-alive timeout + this pause), which is what this limit catches.
    check(elapsed < 5000, `shut down in ${(elapsed / 1000).toFixed(1)} s (limit 5 s; force-exit fallback is 10 s)`);
}

main()
    .catch((err) => { console.log(`  FAIL  ${err.message}`); results.push(false); })
    .finally(() => {
        try { docker(['rm', '-f', NAME], { stdio: 'ignore' }); } catch { /* already gone */ }
        const ok = results.length > 0 && results.every(Boolean);
        console.log(`\nSIGTERM check: ${ok ? 'passed' : 'FAILED'}`);
        process.exitCode = ok ? 0 : 1;
    });
