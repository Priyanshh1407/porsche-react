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
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Non-3D routes first: they should download no GLB at all.
const ROUTES = ['/', '/contact', '/about', '/models', '/models/911-gt3-rs'];
const IDLE_TIMEOUT_MS = 300000;

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

async function measure(browser, base, route) {
    missingFiles.clear();
    const page = await browser.newPage();
    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    const urls = {};
    const glbs = {};
    let total = 0;
    cdp.on('Network.requestWillBeSent', (e) => { urls[e.requestId] = e.request.url; });
    cdp.on('Network.loadingFinished', (e) => {
        total += e.encodedDataLength;
        const url = urls[e.requestId] || '';
        if (url.endsWith('.glb')) glbs[decodeURIComponent(url.split('/').pop())] = mb(e.encodedDataLength);
    });
    let note = '';
    try {
        await page.goto(base + encodeURI(route), { waitUntil: 'networkidle0', timeout: IDLE_TIMEOUT_MS });
    } catch (err) {
        note = `did not reach network idle: ${err.message.split('\n')[0]}`;
    }
    await page.close();
    return { route, totalMB: mb(total), glbCount: Object.keys(glbs).length, glbs, missing: [...missingFiles], note };
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
