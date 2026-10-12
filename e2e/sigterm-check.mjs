#!/usr/bin/env node
/*
 * Verifies the backend's graceful shutdown (ERR-02) with a REAL SIGTERM:
 *
 *   1. start the server, wait until it is listening
 *   2. begin a request and send only half of its body, so it is genuinely in flight
 *   3. send SIGTERM, then finish sending the body
 *   4. expect: the in-flight request still gets its response, the logs show the shutdown
 *      sequence, and the process exits with code 0 (not killed, not an unhandled SIGTERM)
 *   An admin live-event stream (Phase 9) is open throughout: it never ends by itself, so shutdown
 *   must end it, or the server would wait for the 10 s force-exit.
 *
 * Where it runs (Docker is optional):
 *   - Docker running: in a Linux container (node:22-alpine) on the test-db's Docker network, installed
 *     like a production deploy (runtime dependencies only, no .env);
 *   - otherwise on Linux/macOS: natively, as a child process, against DATABASE_URL_TEST;
 *   - otherwise (Windows without Docker): skipped, exit code 3. Windows has no real SIGTERM.
 *   Force one with --mode docker|native.
 */
import { execFileSync, spawn, spawnSync } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKEND = path.join(ROOT, 'porsche-backend');
export const SKIPPED = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ENV = {
    NODE_ENV: 'production', PORT: '5000',
    JWT_SECRET: 'sigterm-check-secret-0123456789abcdef0123',
    ADMIN_EMAIL: 'admin@sigterm.local', ADMIN_PASSWORD: 'sigterm-check', EMAIL_PASS: '',
};

const dockerAvailable = () => spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { stdio: 'ignore' }).status === 0;

/** The backend in a Linux container on the test-db's Docker network. */
function dockerRunner() {
    const NAME = 'porsche-sigterm-check';
    const docker = (args, opts = {}) => execFileSync('docker', args, { encoding: 'utf8', ...opts }).trim();
    const remove = () => { try { docker(['rm', '-f', NAME], { stdio: 'ignore' }); } catch { /* not there */ } };
    return {
        label: 'Linux container',
        async start() {
            remove();
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
            console.log('starting backend in node:22-alpine (first run downloads the image and installs packages)...');
            const env = { ...ENV, DATABASE_URL: 'postgresql://porsche_test:porsche_test@test-db:5432/porsche_test' };
            docker(['run', '-d', '--name', NAME, '--network', 'porsche_default', '-p', '127.0.0.1::5000',
                '-v', `${BACKEND.replace(/\\/g, '/')}:/src:ro`, '-v', 'porsche-sigterm-node-modules:/app/node_modules',
                ...Object.entries(env).flatMap(([k, v]) => ['-e', `${k}=${v}`]),
                'node:22-alpine', 'sh', '-c', startScript]);
            const deadline = Date.now() + 240000;
            while (!this.logs().includes('Server running on port')) {
                if (Date.now() > deadline) throw new Error(`server did not start:\n${this.logs()}`);
                if (docker(['inspect', '-f', '{{.State.Running}}', NAME]) !== 'true') throw new Error(`container exited:\n${this.logs()}`);
                await sleep(1000);
            }
            console.log(`kernel: ${docker(['exec', NAME, 'uname', '-sr'])}`);
            return Number(docker(['port', NAME, '5000/tcp']).split(':').pop());
        },
        // docker stop sends SIGTERM and waits up to 20 s before SIGKILL.
        sigterm: () => new Promise((resolve) => spawn('docker', ['stop', '-t', '20', NAME]).on('exit', resolve)),
        logs: () => docker(['logs', NAME], { stdio: ['ignore', 'pipe', 'pipe'] }),
        exitCode: () => Number(docker(['inspect', '-f', '{{.State.ExitCode}}', NAME])),
        cleanup: remove,
    };
}

/** The backend as a child process on this machine (Linux/macOS: a real SIGTERM). */
function nativeRunner() {
    let child;
    let output = '';
    let exited;
    return {
        label: `native ${process.platform} process`,
        async start() {
            if (!process.env.DATABASE_URL_TEST) throw new Error('native mode needs DATABASE_URL_TEST (npm run verify sets it)');
            child = spawn(process.execPath, ['server.js'], {
                cwd: BACKEND,
                env: { PATH: process.env.PATH, ...ENV, PORT: '0', DATABASE_URL: process.env.DATABASE_URL_TEST },
            });
            exited = new Promise((resolve) => child.on('exit', (code, signal) => resolve(code ?? (signal ? 128 : 1))));
            const collect = (d) => { output += d; };
            child.stdout.on('data', collect);
            child.stderr.on('data', collect);
            const deadline = Date.now() + 30000;
            let m;
            while (!(m = output.match(/Server running on port:(\d+)/))) {
                if (Date.now() > deadline || child.exitCode !== null) throw new Error(`server did not start:\n${output}`);
                await sleep(200);
            }
            return Number(m[1]);
        },
        sigterm: async () => { child.kill('SIGTERM'); await exited; },
        logs: () => output,
        exitCode: () => child.exitCode ?? child.signalCode, // e.g. 'SIGTERM' if the signal was not handled
        cleanup: () => { if (child && child.exitCode === null) child.kill('SIGKILL'); },
    };
}

function pickMode() {
    const i = process.argv.indexOf('--mode');
    if (i !== -1) return process.argv[i + 1];
    if (dockerAvailable()) return 'docker';
    return process.platform === 'win32' ? 'skip' : 'native';
}

async function check(runner) {
    const results = [];
    const ok = (pass, msg) => { results.push(pass); console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${msg}`); };
    try {
        const port = await runner.start();
        console.log(`server listening on port ${port} (${runner.label})`);

        // An open live-event stream (SSE), as an admin dashboard would hold.
        const post = (urlPath, payload, headers = {}) => fetch(`http://127.0.0.1:${port}${urlPath}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload),
        }).then((r) => r.json());
        const { token } = await post('/api/admin/login', { email: ENV.ADMIN_EMAIL, password: ENV.ADMIN_PASSWORD });
        const { ticket } = await post('/api/admin/events/ticket', {}, { Authorization: `Bearer ${token}` });
        const stream = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/api/admin/events?ticket=${ticket}`, (res) => {
                const s = { status: res.statusCode, ended: new Promise((done) => { res.on('end', () => done(true)); res.on('error', () => done(false)); res.on('close', () => done(false)); }) };
                res.resume();
                resolve(s);
            }).on('error', reject);
        });
        ok(stream.status === 200, `live-event stream open (HTTP ${stream.status})`);

        // A request that is genuinely in flight: send headers + half the JSON body, then pause.
        const body = JSON.stringify({
            firstName: 'Graceful', lastName: 'Shutdown', email: `sigterm-${Date.now()}@example.com`,
            phone: '5550142', inquiryType: 'Sales', message: 'Submitted while the server was shutting down.',
        });
        const half = Math.floor(body.length / 2);
        let finish;
        // Never rejects: a dropped connection is a result to report ("HTTP error ECONNRESET"), and it
        // can happen before this promise is awaited.
        const response = new Promise((resolve) => {
            const req = http.request({ host: '127.0.0.1', port, path: '/api/contact/submit', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
                let data = '';
                res.on('data', (d) => { data += d; });
                res.on('end', () => resolve({ status: res.statusCode, data }));
            });
            req.on('error', (err) => resolve({ status: `error ${err.code || err.message}`, data: '' }));
            req.write(body.slice(0, half));
            finish = () => req.end(body.slice(half));
        });
        await sleep(500);

        const started = Date.now();
        const stopped = runner.sigterm();
        await sleep(1000); // the server is now shutting down with our request still open
        finish();

        const res = await response;
        await stopped;
        const elapsed = Date.now() - started;
        const logs = runner.logs();
        const exitCode = runner.exitCode();

        ok(res.status === 201, `in-flight request completed during shutdown (HTTP ${res.status})`);
        ok(await stream.ended, 'live-event stream ended cleanly by the server');
        ok(logs.includes('SIGTERM received: shutting down'), 'SIGTERM handler ran');
        ok(logs.includes('Database connection closed'), 'database pool closed');
        ok(exitCode === 0, `exit code ${exitCode} (0 = clean; 137 = killed; 143 = unhandled SIGTERM)`);
        // ~1 s of this is the deliberate pause above. A lingering keep-alive connection would push it
        // to about 6 s (5 s keep-alive timeout + this pause), which is what this limit catches.
        ok(elapsed < 5000, `shut down in ${(elapsed / 1000).toFixed(1)} s (limit 5 s; force-exit fallback is 10 s)`);
    } catch (err) {
        ok(false, err.message);
    } finally {
        runner.cleanup();
    }
    return results.length > 0 && results.every(Boolean);
}

const mode = pickMode();
if (mode === 'skip') {
    console.log('SIGTERM check: skipped (Windows has no real SIGTERM and Docker is not running; it runs in a Linux container when Docker is available, and natively on Linux/macOS)');
    process.exitCode = SKIPPED;
} else {
    const passed = await check(mode === 'docker' ? dockerRunner() : nativeRunner());
    console.log(`\nSIGTERM check (${mode}): ${passed ? 'passed' : 'FAILED'}`);
    process.exitCode = passed ? 0 : 1;
}
