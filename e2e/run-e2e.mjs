#!/usr/bin/env node
/*
 * End-to-end tests: production build + real backend + Docker test database, driven in headless
 * Chrome (Puppeteer). Each test is independent and tags its data with a unique run id, which is
 * deleted afterwards.
 *
 * Uses DATABASE_URL_TEST (set by `npm run verify`). Run on its own without it, it starts its own
 * test database (porsche-backend/scripts/test-db.mjs: the Docker test-db if running, else embedded
 * PostgreSQL), applies the migrations and stops it again. Docker is optional.
 *   node e2e/run-e2e.mjs
 *
 * The frontend build is rebuilt automatically when any file in src/ is newer than it.
 * 3D models are not served (404) to keep the run fast; the showrooms then show their photo
 * fallback (ERR-01), which is all these tests need.
 */
import { spawn, spawnSync } from 'child_process';
import { createRequire } from 'module';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = path.join(ROOT, 'porsche-react-master');
const BACKEND = path.join(ROOT, 'porsche-backend');
const BUILD = path.join(FRONTEND, 'build');
const puppeteer = require(path.join(FRONTEND, 'node_modules', 'puppeteer'));

const RUN_ID = `e2e${Date.now()}`;
const ADMIN = { email: 'admin@e2e.local', password: 'e2e-admin-password' };
const BACKEND_ENV = {
    PATH: process.env.PATH, SystemRoot: process.env.SystemRoot,
    NODE_ENV: 'development', PORT: '0',
    DATABASE_URL: '', // set in main() from DATABASE_URL_TEST or an own test database
    JWT_SECRET: 'e2e-only-jwt-secret-0123456789abcdef0123',
    ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: ADMIN.password,
    EMAIL_PASS: '', // demo mode: no real email
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- setup helpers
function newestMtime(dir) {
    let newest = 0;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        newest = Math.max(newest, e.isDirectory() ? newestMtime(p) : fs.statSync(p).mtimeMs);
    }
    return newest;
}

function ensureBuild() {
    const index = path.join(BUILD, 'index.html');
    const stale = !fs.existsSync(index)
        || newestMtime(path.join(FRONTEND, 'src')) > fs.statSync(index).mtimeMs
        || fs.statSync(path.join(FRONTEND, 'package.json')).mtimeMs > fs.statSync(index).mtimeMs;
    if (!stale) return console.log('frontend build is up to date');
    console.log('frontend build is stale: running npm run build ...');
    const r = spawnSync('npm', ['run', 'build'], { cwd: FRONTEND, shell: true, encoding: 'utf8', env: { ...process.env, CI: '' } });
    if (r.status !== 0) throw new Error(`frontend build failed:\n${(r.stdout + r.stderr).slice(-2000)}`);
}

function startBackend() {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['server.js'], { cwd: BACKEND, env: BACKEND_ENV });
        const log = [];
        const onData = (d) => {
            log.push(d.toString());
            const m = log.join('').match(/Server running on port:(\d+)/);
            if (m) resolve({ child, port: Number(m[1]), log });
        };
        child.stdout.on('data', onData);
        child.stderr.on('data', onData);
        child.on('exit', (code) => reject(new Error(`backend exited (${code}) before starting:\n${log.join('')}`)));
        setTimeout(() => reject(new Error(`backend did not start in 30 s:\n${log.join('')}`)), 30000);
    });
}

// Static production build + /api proxy (what a host's reverse proxy does in production).
function startWeb(apiPort) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            if (req.url.startsWith('/api/')) {
                const upstream = http.request({ host: '127.0.0.1', port: apiPort, path: req.url, method: req.method, headers: req.headers }, (r) => {
                    res.writeHead(r.statusCode, r.headers);
                    r.pipe(res);
                });
                upstream.on('error', () => { res.statusCode = 502; res.end(); });
                req.pipe(upstream);
                return;
            }
            let f = path.join(BUILD, decodeURIComponent(req.url.split('?')[0]));
            if (f.endsWith('.glb')) { res.statusCode = 404; return res.end(); }
            if (!f.startsWith(BUILD) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(BUILD, 'index.html');
            fs.createReadStream(f).pipe(res);
        }).listen(0, '127.0.0.1', () => resolve(server));
    });
}

// ---------------------------------------------------------------- tiny test runner
const results = [];
async function test(name, fn) {
    const started = Date.now();
    try {
        await fn();
        results.push({ name, ok: true, ms: Date.now() - started });
        console.log(`  ok    ${name}`);
    } catch (err) {
        results.push({ name, ok: false, ms: Date.now() - started, err });
        console.log(`  FAIL  ${name}\n        ${String(err.message).split('\n').join('\n        ')}`);
    }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

// ---------------------------------------------------------------- tests
async function ownTestDb() {
    const { ensureTestDb } = await import(pathToFileURL(path.join(BACKEND, 'scripts', 'test-db.mjs')).href);
    const db = await ensureTestDb({ log: console.log });
    const env = { ...process.env, DATABASE_URL: db.url };
    const r = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: BACKEND, shell: true, encoding: 'utf8', env });
    if (r.status !== 0) { await db.stop(); throw new Error(`migrating the test database failed:
${(r.stdout + r.stderr).slice(-1500)}`); }
    return db;
}

async function main() {
    const ownDb = process.env.DATABASE_URL_TEST ? null : await ownTestDb();
    BACKEND_ENV.DATABASE_URL = process.env.DATABASE_URL_TEST || ownDb.url;
    try {
        await runAll();
    } finally {
        if (ownDb) await ownDb.stop();
    }
}

async function runAll() {
    ensureBuild();
    const backend = await startBackend();
    const web = await startWeb(backend.port);
    const base = `http://127.0.0.1:${web.address().port}`;
    const api = (p, opts = {}) => fetch(`http://127.0.0.1:${backend.port}${p}`, opts);
    const browser = await puppeteer.launch({ headless: 'new' });
    console.log(`E2E run ${RUN_ID}: backend :${backend.port}, web ${base}`);

    const newPage = async (viewport = { width: 1280, height: 800 }) => {
        const page = await browser.newPage();
        await page.setViewport(viewport);
        return page;
    };
    const pathOf = (page) => decodeURIComponent(new URL(page.url()).pathname);
    const waitForText = (page, text, timeout = 8000) =>
        page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, text);
    const login = async (page, password) => {
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', ADMIN.email);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');
    };

    try {
        await test('contact form: accented Latin name, landline, untouched optional dropdowns -> 201 (BUG-01, VAL-02)', async () => {
            const page = await newPage();
            await page.goto(`${base}/contact`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('input[name="firstName"]');
            await page.type('input[name="firstName"]', 'José');
            await page.type('input[name="lastName"]', 'Müller');
            await page.type('input[name="email"]', `${RUN_ID}-form@example.com`);
            await page.type('input[name="phone"]', '+49 711 9110');
            await page.select('select[name="inquiryType"]', 'Sales');
            await page.type('textarea[name="message"]', 'I would like to test drive a 911 next month.');
            const [res] = await Promise.all([
                page.waitForResponse((r) => r.url().endsWith('/api/contact/submit')),
                page.click('button[type="submit"]'),
            ]);
            const sent = JSON.parse(res.request().postData());
            assert(res.status() === 201, `expected 201, got ${res.status()}`);
            assert(!('modelInterest' in sent) && !('preferredContactTime' in sent), 'blank optional fields were sent');
            await waitForText(page, 'sent successfully');
            await page.close();
        });

        await test('contact form: a non-Latin name is rejected with the reason shown under the field', async () => {
            const page = await newPage();
            await page.goto(`${base}/contact`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('input[name="firstName"]');
            await page.type('input[name="firstName"]', '李');
            await page.type('input[name="lastName"]', '明华');
            await page.type('input[name="email"]', `${RUN_ID}-rejected@example.com`);
            await page.type('input[name="phone"]', '5551234567');
            await page.select('select[name="inquiryType"]', 'Sales');
            await page.type('textarea[name="message"]', 'This submission must be rejected.');
            const [res] = await Promise.all([
                page.waitForResponse((r) => r.url().endsWith('/api/contact/submit')),
                page.click('button[type="submit"]'),
            ]);
            assert(res.status() === 400, `expected 400, got ${res.status()}`);
            await waitForText(page, 'Latin letters');
            await page.close();
        });

        await test('every model link in the navbar opens its page (BUG-03)', async () => {
            const page = await newPage({ width: 390, height: 844 }); // the per-model list is in the mobile menu
            await page.goto(`${base}/contact`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('nav');
            const openModelsMenu = async () => {
                await page.click('nav button[aria-label="Open menu"]'); // accessible label added in Phase 4
                await page.waitForFunction(() => [...document.querySelectorAll('nav button')].some((b) => b.textContent.trim() === 'Models'));
                await page.evaluate(() => [...document.querySelectorAll('nav button')].find((b) => b.textContent.trim() === 'Models').click());
                await sleep(300);
            };
            await openModelsMenu();
            // The expanded Models block: category headings (h4) followed by one button per model.
            const MODEL_BUTTONS = 'nav h4 ~ button';
            const modelNames = await page.$$eval(MODEL_BUTTONS, (els) => els.map((b) => b.textContent.trim()));
            assert(modelNames.length === 11, `expected 11 model links, found ${modelNames.length}: ${modelNames.join(', ')}`);
            for (const name of modelNames) {
                await page.goto(`${base}/contact`, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('nav');
                await openModelsMenu();
                await page.$$eval(MODEL_BUTTONS, (els, n) => els.find((b) => b.textContent.trim() === n).click(), name);
                await page.waitForFunction(() => location.pathname.startsWith('/models/'), { timeout: 5000 });
                await sleep(800);
                const text = await page.evaluate(() => document.body.innerText);
                assert(!text.includes('Model Not Found') && !text.includes('Page not found'), `"${name}" -> 404 at ${pathOf(page)}`);
                assert(/^\/models\/[a-z0-9-]+$/.test(pathOf(page)), `"${name}" -> non-canonical URL ${pathOf(page)}`);
            }
            await page.close();
        });

        await test('an unknown URL shows the not-found page (BUG-08)', async () => {
            const page = await newPage();
            await page.goto(`${base}/this-page-does-not-exist`, { waitUntil: 'domcontentloaded' });
            await waitForText(page, 'Page not found');
            await page.close();
        });

        await test('logged out, /admin/dashboard redirects to the login page (ARCH-01)', async () => {
            const page = await newPage();
            await page.goto(`${base}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
            await page.waitForFunction(() => location.pathname === '/admin/login', { timeout: 5000 });
            await page.close();
        });

        await test("a wrong password shows the API's message (SEC-01, ARCH-01)", async () => {
            const page = await newPage();
            await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' });
            await login(page, 'wrong-password');
            await waitForText(page, 'Invalid credentials');
            assert(pathOf(page) === '/admin/login', 'should stay on the login page');
            await page.close();
        });

        await test('admin: login -> server-side search finds a new lead -> set "qualified" -> logout (BUG-05, BUG-07, ARCH-01)', async () => {
            // Own fixture: a lead created through the public API.
            const email = `${RUN_ID}-admin@example.com`;
            const created = await api('/api/contact/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName: 'Søren', lastName: 'Ågård', email, phone: '+45 3312 3456', inquiryType: 'Test_Drive', message: 'E2E admin flow fixture lead.' }),
            });
            assert(created.status === 201, `fixture lead: expected 201, got ${created.status}`);

            const page = await newPage();
            await page.goto(`${base}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
            await page.waitForFunction(() => location.pathname === '/admin/login');
            await login(page, ADMIN.password);
            await page.waitForFunction(() => location.pathname === '/admin/dashboard', { timeout: 8000 });

            await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Contacts'));
            await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Contacts').click());
            await page.waitForSelector('input[placeholder="Search contacts..."]');
            const [searchRes] = await Promise.all([
                page.waitForResponse((r) => r.url().includes('/api/admin/contacts?') && r.url().includes(`q=${encodeURIComponent(email)}`)),
                page.type('input[placeholder="Search contacts..."]', email),
            ]);
            const found = await searchRes.json();
            assert(found.data.length === 1 && found.data[0].email === email, `search should find exactly the new lead, got ${found.pagination?.total}`);

            await page.waitForSelector('select[aria-label="Status for Søren Ågård"]');
            const [putRes] = await Promise.all([
                page.waitForResponse((r) => r.request().method() === 'PUT'),
                page.select('select[aria-label="Status for Søren Ågård"]', 'qualified'),
            ]);
            assert(putRes.status() === 200 && (await putRes.json()).data.status === 'qualified', `status update failed: ${putRes.status()}`);

            await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Logout').click());
            await page.waitForFunction(() => location.pathname === '/admin/login', { timeout: 5000 });
            assert(await page.evaluate(() => localStorage.getItem('adminToken')) === null, 'token still stored after logout');
            await page.close();
        });
    } finally {
        // Clean up this run's leads through the admin API (exercises DELETE too).
        try {
            const tokenRes = await api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ADMIN) });
            const { token } = await tokenRes.json();
            const auth = { Authorization: `Bearer ${token}` };
            const list = await (await api(`/api/admin/contacts?limit=100&q=${RUN_ID}`, { headers: auth })).json();
            for (const c of list.data || []) await api(`/api/admin/contacts/${c.id}`, { method: 'DELETE', headers: auth });
            console.log(`cleaned up ${list.data?.length || 0} test lead(s)`);
        } catch (err) {
            console.log(`cleanup failed: ${err.message}`);
        }
        await browser.close();
        web.close();
        backend.child.kill();
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\nE2E: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length) {
        console.log('--- backend log (last 40 lines):');
        console.log(backend.log.join('').split('\n').slice(-40).join('\n'));
    }
    process.exitCode = failed.length ? 1 : 0;
}

main().catch((err) => {
    console.error(`E2E setup failed: ${err.message}`);
    process.exitCode = 1;
});
