#!/usr/bin/env node
/*
 * Local verification pipeline (Phase 3). There is deliberately no hosted CI for this project:
 * this one command is what "the build is green" means.
 *
 *   npm run verify        quick (~5 min): guard, backend tests, frontend tests, dependency audit, E2E
 *   npm run verify:full   full (~13 min): + fresh production build, page-weight budget,
 *                         44 3D stage screenshots, SIGTERM shutdown in a Linux container
 *
 * Needs Docker running. Starts the throwaway test database and stops it again at the end.
 * Every gate runs (no fail-fast) so one report shows everything; the exit code is non-zero if
 * any gate failed. Each gate's full output is saved under .verify-logs/.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = path.join(ROOT, 'porsche-react-master');
const BACKEND = path.join(ROOT, 'porsche-backend');
const LOGS = path.join(ROOT, '.verify-logs');
const FULL = process.argv.includes('--full');

// Runtime advisories that come only from the Prisma CLI's own tooling (not code the server runs).
// Anything else at high/critical severity fails the audit gate. See UPGRADE_PLAN.md, SEC-05.
const PRISMA_TOOLING = new Set(['prisma', '@prisma/config', '@prisma/dev', 'deepmerge-ts', 'mysql2',
    'hono', '@hono/node-server', 'valibot', 'fast-uri']);

// UPG-04: page-weight budget per route (measured first-party bytes + 10%) and the model count each
// route may load, from porsche-react-master/docs/perf-budget.json. Third-party bytes (fonts, image
// CDNs; /services loads random placeholder photos) vary per load, so they are reported, not budgeted. The main.js limit is checked in the build
// gate (check-bundle.cjs).
const BUDGET_FILE = path.join(FRONTEND, 'docs', 'perf-budget.json');

fs.mkdirSync(LOGS, { recursive: true });

function run(cmd, args, { cwd = ROOT, env = {}, shell = false } = {}) {
    const r = spawnSync(cmd, args, {
        cwd, shell, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, ...env },
    });
    return { code: r.status ?? 1, out: `${r.stdout || ''}${r.stderr || ''}${r.error ? `\n${r.error.message}` : ''}` };
}

const node = (args, opts) => run(process.execPath, args, opts);
const npx = (args, opts) => run('npx', args, { shell: true, ...opts });
const npm = (args, opts) => run('npm', args, { shell: true, ...opts });

const results = [];
function gate(name, fn) {
    process.stdout.write(`- ${name} ... `);
    const started = Date.now();
    let ok = false;
    let detail = '';
    let out = '';
    try {
        ({ ok, detail = '', out = '' } = fn());
    } catch (err) {
        out = String(err.stack || err);
        detail = err.message;
    }
    const secs = (Date.now() - started) / 1000;
    const logFile = path.join(LOGS, `${results.length + 1}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.log`);
    fs.writeFileSync(logFile, out);
    results.push({ name, ok, secs, detail, logFile, out });
    console.log(`${ok ? 'PASS' : 'FAIL'} (${secs.toFixed(0)} s)${detail ? `  ${detail}` : ''}`);
}

const lastLine = (text, re) => (text.split('\n').filter((l) => re.test(l)).pop() || '').trim();

// ------------------------------------------------------------------ gates
console.log(`Verification pipeline: ${FULL ? 'FULL' : 'quick'}\n`);

const dockerOk = run('docker', ['info', '--format', '{{.ServerVersion}}']).code === 0;
if (!dockerOk) {
    console.log('Docker is not running. Start Docker Desktop and run again.');
    process.exit(1);
}
const dbUp = run('docker', ['compose', '-f', 'docker-compose.yml', 'up', '-d', '--wait', 'test-db']);
if (dbUp.code !== 0) {
    console.log(`Could not start the test database:\n${dbUp.out}`);
    process.exit(1);
}

try {
    gate('3D trajectory guard', () => {
        const r = node([path.join(FRONTEND, 'scripts', 'check-trajectories.cjs')]);
        return { ok: r.code === 0, out: r.out, detail: lastLine(r.out, /Trajectory guard|CHANGED|MISSING/) };
    });

    gate('backend tests', () => {
        const r = node(['--experimental-vm-modules', 'node_modules/jest/bin/jest.js'], { cwd: BACKEND });
        return { ok: r.code === 0, out: r.out, detail: lastLine(r.out, /^Tests:/) };
    });

    gate('frontend tests', () => {
        const r = npx(['react-scripts', 'test', '--watchAll=false'], { cwd: FRONTEND, env: { CI: 'true' } });
        return { ok: r.code === 0, out: r.out, detail: lastLine(r.out, /^Tests:/) };
    });

    gate('backend dependency audit (runtime)', () => {
        const r = npm(['audit', '--omit=dev', '--json'], { cwd: BACKEND });
        const vulns = JSON.parse(r.out.slice(r.out.indexOf('{'))).vulnerabilities || {};
        const blocking = Object.entries(vulns)
            .filter(([name, v]) => ['high', 'critical'].includes(v.severity) && !PRISMA_TOOLING.has(name))
            .map(([name, v]) => `${name} (${v.severity})`);
        const tooling = Object.keys(vulns).filter((n) => PRISMA_TOOLING.has(n)).length;
        return {
            ok: blocking.length === 0, out: r.out,
            detail: blocking.length ? `blocking: ${blocking.join(', ')}` : `no blocking advisories (${tooling} allow-listed Prisma CLI tooling)`,
        };
    });

    if (FULL) {
        gate('production build (fresh)', () => {
            fs.rmSync(path.join(FRONTEND, 'build'), { recursive: true, force: true });
            // Not CI=true: CRA would turn existing lint warnings (some in protected 3D files) into errors.
            const r = npm(['run', 'build'], { cwd: FRONTEND, env: { CI: '' } });
            if (r.code !== 0) return { ok: false, out: r.out, detail: 'build failed' };
            // PERF-02: route-only libraries (recharts, three, postprocessing) must stay out of main.js.
            const c = node([path.join(FRONTEND, 'scripts', 'check-bundle.cjs')]);
            return { ok: c.code === 0, out: `${r.out}\n${c.out}`, detail: `${lastLine(r.out, /main\.[0-9a-f]+\.js/)}; ${lastLine(c.out, /^(OK|FAIL)/)}` };
        });
    }

    gate('end-to-end (browser)', () => {
        const r = node([path.join(ROOT, 'e2e', 'run-e2e.mjs')]);
        return { ok: r.code === 0, out: r.out, detail: lastLine(r.out, /^E2E:/) };
    });

    if (FULL) {
        gate('page-weight budget', () => {
            const r = node([path.join(FRONTEND, 'scripts', 'measure-page-weight.cjs'), '--json']);
            const { results: routes } = JSON.parse(r.out.slice(r.out.indexOf('{')));
            const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8')).routes;
            const problems = [];
            for (const route of routes) {
                const limit = budget[route.route];
                if (!limit) { problems.push(`${route.route} has no budget`); continue; }
                const mbUsed = route.firstPartyBytes / 1048576;
                if (route.note) problems.push(`${route.route}: ${route.note}`);
                if (mbUsed > limit.maxMB) problems.push(`${route.route} ${mbUsed.toFixed(2)} MB > budget ${limit.maxMB} MB`);
                if (route.glbCount !== limit.models) problems.push(`${route.route} loads ${route.glbCount} model(s), budget allows ${limit.models}`);
                // A file the page links but the build lacks (e.g. manifest.json, favicon.ico) gets index.html back.
                for (const file of route.missing || []) problems.push(`${route.route} requests missing ${file}`);
            }
            for (const name of Object.keys(budget)) if (!routes.some((x) => x.route === name)) problems.push(`budget route ${name} was not measured`);
            const largestShare = Math.max(...routes.map((x) => x.firstPartyBytes / 1048576 / budget[x.route].maxMB));
            const thirdParty = routes.reduce((n, x) => Math.max(n, x.thirdPartyBytes), 0) / 1048576;
            // A route that only loaded on its second attempt passes, but is named so a recurring stall gets noticed.
            const retried = routes.filter((x) => x.retriedAfter).map((x) => x.route);
            const summary = `${routes.length} routes within budget (closest: ${(largestShare * 100).toFixed(0)}% of its ceiling); model counts as budgeted; third-party max ${thirdParty.toFixed(2)} MB (not budgeted)`
                + (retried.length ? `; needed a retry: ${retried.join(', ')}` : '');
            return { ok: problems.length === 0, out: r.out, detail: problems.length ? problems.join('; ') : summary };
        });

        gate('3D stage screenshots (44)', () => {
            const r = node([path.join(FRONTEND, 'scripts', 'capture-stages.cjs'), '--compare']);
            const drift = r.out.split('\n').filter((l) => /DRIFT|MISSING|NEW\/RENAMED|ERROR/.test(l)).length;
            return { ok: r.code === 0, out: r.out, detail: r.code === 0 ? 'all stages match the baseline' : `${drift} stage problem(s)` };
        });

        gate('SIGTERM shutdown (Linux container)', () => {
            const r = node([path.join(ROOT, 'e2e', 'sigterm-check.mjs')]);
            return { ok: r.code === 0, out: r.out, detail: lastLine(r.out, /shut down in|FAIL/) };
        });
    }
} finally {
    run('docker', ['compose', '-f', 'docker-compose.yml', 'down']);
}

// ------------------------------------------------------------------ report
const failed = results.filter((r) => !r.ok);
const total = results.reduce((s, r) => s + r.secs, 0);
console.log(`\n${'Gate'.padEnd(38)} Result  Time`);
for (const r of results) console.log(`${r.name.padEnd(38)} ${r.ok ? 'PASS  ' : 'FAIL  '}  ${r.secs.toFixed(0).padStart(4)} s`);
console.log(`\n${failed.length ? `FAILED: ${failed.length} of ${results.length} gates` : `ALL ${results.length} GATES PASSED`} in ${(total / 60).toFixed(1)} min. Logs: .verify-logs/`);
for (const f of failed) {
    console.log(`\n--- ${f.name} (last 25 lines of ${path.relative(ROOT, f.logFile)}):`);
    console.log(f.out.trim().split('\n').slice(-25).join('\n'));
}
process.exitCode = failed.length ? 1 : 0;
