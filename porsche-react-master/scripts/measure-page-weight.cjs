#!/usr/bin/env node
/*
 * Measures what a browser downloads per route (PERF-01 baseline and later the CI budget).
 *
 * Serves the production build (or uses --base for a deployed site), loads each route in
 * headless Chrome until the network is idle, and sums Chrome's own transferred-byte counts.
 *
 *   npm run build && node scripts/measure-page-weight.cjs
 *   node scripts/measure-page-weight.cjs --base https://your-site.example   # deployed site
 *   options: --build <dir> (default: build)   --json (machine-readable output)
 *            --update-budget   rewrite docs/perf-budget.json from this run (+10% headroom).
 *                              Only with the developer's approval, like the trajectory baseline.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// UPG-04: every route a visitor can open. Non-3D routes first: they must download no GLB at all.
const SHOWROOMS = ['911-gt3-rs', 'taycan', 'cayenne', '911-turbo-s', '918-spyder'];
const ROUTES = [
    '/', '/contact', '/about', '/models', '/services', '/experience', '/configurator', '/credits', '/admin/login',
    ...['911-gt2-rs', 'carrera-gt', '718-cayman-gt4-rs', '718-boxster-s', 'macan-gts', 'panamera'].map((s) => `/models/${s}`),
    ...SHOWROOMS.map((s) => `/models/${s}/details`),
    ...SHOWROOMS.map((s) => `/models/${s}`),
];
const BUDGET_FILE = path.resolve(__dirname, '..', 'docs', 'perf-budget.json');
const HEADROOM = 0.10;
// The heaviest page (GT3 RS, ~70 MB) reaches network idle locally in seconds. A route that doesn't
// is retried once on a fresh page: a single stalled file transfer (seen once in Phase 6: one
// request never finished) shouldn't fail the gate, while a real problem such as constant polling
// fails both attempts.
const IDLE_TIMEOUT_MS = 120000;
const ATTEMPTS = 2;
const DEFERRED_START_MS = 6000; // > the preload's 5 s requestIdleCallback timeout (src/lib/preloadShowrooms.js)

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : args[i + 1]; };
const buildDir = path.resolve(__dirname, '..', opt('--build', 'build'));
const remoteBase = opt('--base', null);
const asJson = args.includes('--json');
const mb = (bytes) => +(bytes / 1048576).toFixed(1);
// Files a page asked for that don't exist in the build. The server answers them with index.html
// (like an SPA host would), so the browser gets HTML instead of e.g. a manifest: a silent bug.
const missingFiles = new Set();

function serve(port) {
    if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
        console.error(`No build found at ${buildDir}. Run "npm run build" first.`);
        process.exit(2);
    }
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let file = path.join(buildDir, decodeURIComponent(req.url.split('?')[0]));
            if (!file.startsWith(buildDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
                if (path.extname(req.url.split('?')[0])) missingFiles.add(req.url.split('?')[0]);
                file = path.join(buildDir, 'index.html');
            }
            fs.createReadStream(file).pipe(res);
        }).listen(port, () => resolve(server));
    });
}

async function measureOnce(browser, base, route) {
    missingFiles.clear();
    const page = await browser.newPage();
    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    const urls = {};
    const glbs = {};
    let total = 0;
    let firstParty = 0; // served by this app; third-party = fonts, image CDNs (can vary per load)
    const pending = new Set();
    cdp.on('Network.requestWillBeSent', (e) => { urls[e.requestId] = e.request.url; pending.add(e.requestId); });
    cdp.on('Network.loadingFailed', (e) => pending.delete(e.requestId));
    cdp.on('Network.loadingFinished', (e) => {
        pending.delete(e.requestId);
        total += e.encodedDataLength;
        if ((urls[e.requestId] || '').startsWith(base)) firstParty += e.encodedDataLength;
        const url = urls[e.requestId] || '';
        if (url.endsWith('.glb')) glbs[decodeURIComponent(url.split('/').pop())] = mb(e.encodedDataLength);
    });
    let note = '';
    try {
        await page.goto(base + encodeURI(route), { waitUntil: 'networkidle0', timeout: IDLE_TIMEOUT_MS });
        // Downloads deferred until the browser is idle (the background model preload on Home and All
        // Models) start after the first quiet moment, up to 5 s later (its requestIdleCallback
        // timeout). Wait past that, then for a longer quiet period, so a deferred download is always
        // counted instead of racing the measurement.
        await new Promise((r) => setTimeout(r, DEFERRED_START_MS));
        await page.waitForNetworkIdle({ idleTime: 1500, timeout: IDLE_TIMEOUT_MS });
    } catch (err) {
        const stuck = [...pending].map((id) => (urls[id] || '?').replace(base, '')).slice(0, 5);
        note = `did not reach network idle: ${err.message.split('\n')[0]}; still pending: ${stuck.join(', ') || 'none tracked'}`;
    }
    await page.close();
    return { route, totalBytes: total, totalMB: mb(total), firstPartyBytes: firstParty, thirdPartyBytes: total - firstParty, glbCount: Object.keys(glbs).length, glbs, missing: [...missingFiles], note };
}

async function measure(browser, base, route) {
    const failedAttempts = [];
    for (let attempt = 1; ; attempt++) {
        const result = await measureOnce(browser, base, route);
        if (!result.note) return failedAttempts.length ? { ...result, retriedAfter: failedAttempts } : result;
        failedAttempts.push(result.note);
        if (attempt === ATTEMPTS) return { ...result, note: `${ATTEMPTS} attempts failed: ${failedAttempts.join(' | ')}` };
    }
}

(async () => {
    let server = null;
    let base = remoteBase;
    if (!base) {
        const port = 4700 + Math.floor(Math.random() * 80);
        server = await serve(port);
        base = `http://localhost:${port}`;
    }
    const browser = await puppeteer.launch({ headless: 'new' });
    const results = [];
    try {
        for (const route of ROUTES) results.push(await measure(browser, base, route));
    } finally {
        await browser.close();
        if (server) server.close();
    }

    const jsDir = path.join(buildDir, 'static', 'js');
    const mainJs = !remoteBase && fs.existsSync(jsDir) ? fs.readdirSync(jsDir).find((f) => /^main\..*\.js$/.test(f)) : null;

    if (args.includes('--update-budget')) {
        const failed = results.filter((r) => r.note);
        if (failed.length) { console.error(`Not writing a budget: ${failed.map((r) => r.route).join(', ')} did not finish loading.`); process.exit(1); }
        const zlib = require('zlib');
        const mainGzipKB = +(zlib.gzipSync(fs.readFileSync(path.join(jsDir, mainJs)), { level: 9 }).length / 1024).toFixed(1);
        const ceil01 = (x) => Math.ceil(x * 10) / 10;
        const budget = {
            _about: 'UPG-04 page-weight budget, enforced by npm run verify:full. Ceilings = measured FIRST-PARTY bytes + 10% '
                + '(third-party bytes such as random placeholder photos vary per load and are reported, not budgeted), '
                + 'from a local production build (uncompressed). Regenerate only with developer approval: '
                + 'node scripts/measure-page-weight.cjs --update-budget',
            measuredOn: new Date().toISOString().slice(0, 10),
            headroom: HEADROOM,
            mainJsGzipKB: { measured: mainGzipKB, max: ceil01(mainGzipKB * (1 + HEADROOM)) },
            routes: Object.fromEntries(results.map((r) => [r.route, {
                measuredMB: +(r.firstPartyBytes / 1048576).toFixed(2),
                maxMB: ceil01((r.firstPartyBytes / 1048576) * (1 + HEADROOM)),
                thirdPartyMB: +(r.thirdPartyBytes / 1048576).toFixed(2),
                models: r.glbCount,
            }])),
        };
        fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(budget, null, 2)}\n`);
        console.log(`Budget written: ${results.length} routes, main.js ${budget.mainJsGzipKB.max} kB gz -> ${path.relative(process.cwd(), BUDGET_FILE)}`);
        return;
    }

    if (asJson) {
        console.log(JSON.stringify({ base, results, mainJs }, null, 2));
        return;
    }
    console.log(`Page weight (${remoteBase ? base : 'local production build'}):`);
    for (const r of results) {
        console.log(`  ${r.route.padEnd(22)} ${String(r.totalMB).padStart(7)} MB   GLBs: ${r.glbCount}${r.note ? `   (${r.note})` : ''}`);
        for (const [name, size] of Object.entries(r.glbs)) console.log(`      ${size} MB  ${name}`);
        for (const file of r.missing) console.log(`      MISSING FILE: ${file} (answered with index.html)`);
    }
    if (mainJs) console.log(`  main bundle file: static/js/${mainJs} (gzipped size: see "npm run build" output)`);
})();
