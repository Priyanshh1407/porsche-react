#!/usr/bin/env node
/*
 * Stage screenshots for the 3D showrooms.
 *
 * Complements check-trajectories.cjs: the hash guard catches code changes, this catches
 * anything that moves the cars on screen (CSS, layout, model files, library upgrades).
 *
 * It serves a production build, opens each 3D page, scrolls the #scroll-container one
 * #section-* at a time (like a user), waits for the GSAP tweens to settle and screenshots
 * every stage.
 *
 *   npm run build
 *   node scripts/capture-stages.cjs --update     # write docs/stage-baseline/ (Phase 0, or with approval)
 *   node scripts/capture-stages.cjs --compare    # compare against the baseline (exit 1 on drift)
 *   options: --build <dir> (default: build)   --only <car>   --out <dir> (where --compare writes its captures)
 *            --software (SwiftShader instead of the GPU; for CI, needs its own baseline)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Route URLs may change (BUG-03 moves to slugs); update the URL here, never the pages.
// maxDiffRatio overrides the default threshold for cars with always-moving effects: Cayenne's
// <Sparkles> particles never stop, measured noise up to 0.10%, so its limit is 0.4% (4x its noise; a 1px
// shift still differs by >= 1.26%, ~3x the limit).
const CARS = [
    { id: 'gt3rs', url: '/models/911-gt3-rs' },
    { id: 'taycan', url: '/models/taycan' },
    { id: 'cayenne', url: '/models/cayenne', maxDiffRatio: 0.004 },
    { id: 'turbo', url: '/models/911-turbo-s' },
    { id: 'spyder', url: '/models/918-spyder' },
];
const VIEWPORT = { width: 1280, height: 720 };
// A stage is captured only once the picture stops changing (all GSAP tweens and CSS reveals
// finished). A fixed wait is not enough: when frames are slow, GSAP's lag smoothing advances
// tweens only ~33ms per frame, so a fixed timeout can capture a car mid-move.
const MIN_WAIT_MS = 2500;     // longest tween is 2.5s
const SETTLE_POLL_MS = 1000;
const SETTLE_RATIO = 0.002;   // consecutive frames differing in <0.2% of pixels = settled
const SETTLE_MAX_MS = 60000;
const MODEL_TIMEOUT_MS = 240000;
// Per-pixel channel delta above which a pixel counts as different, and the share of such
// pixels that fails a stage. Calibrated in Phase 0: two GPU captures of the same build differ in at
// most 0.005% of pixels at delta 20, so 0.1% leaves ~20x headroom (see docs/stage-baseline/README.md).
const PIXEL_DELTA = 20;
const MAX_DIFF_RATIO = 0.001;

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : args[i + 1]; };
const mode = args.includes('--update') ? 'update' : args.includes('--compare') ? 'compare' : null;
if (!mode) { console.error('Pass --update or --compare'); process.exit(2); }
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.resolve(projectRoot, opt('--build', 'build'));
const baselineDir = path.join(projectRoot, 'docs', 'stage-baseline');
const outDir = mode === 'update' ? baselineDir : path.resolve(opt('--out', path.join(projectRoot, 'stage-captures')));
const only = opt('--only', null);
// Default: the machine's GPU (fast, so animations run at real speed). --software uses SwiftShader
// for machines without a GPU (CI). Baselines are per renderer: never compare across them.
const software = args.includes('--software');

if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    console.error(`No build found at ${buildDir}. Run "npm run build" first.`);
    process.exit(2);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.json': 'application/json' };

function serve(port) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let file = path.join(buildDir, decodeURIComponent(req.url.split('?')[0]));
            if (!file.startsWith(buildDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(buildDir, 'index.html');
            res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
            fs.createReadStream(file).pipe(res);
        }).listen(port, () => resolve(server));
    });
}

// Counts rendered frames. Injected by this harness only (the app is not modified). A frozen main
// thread (e.g. while a large GLB is decoded) produces identical screenshots that would otherwise
// look "settled": found in Phase 0 when a baseline captured the "LOADING 99%" screen.
const FRAME_COUNTER = () => {
    window.__stageFrames = 0;
    const tick = () => { window.__stageFrames++; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
};
const MIN_FRAMES_BETWEEN_SHOTS = 10;
const frames = (page) => page.evaluate(() => window.__stageFrames || 0);
const loaderVisible = (page) => page.evaluate(() => document.body.innerText.includes('LOADING'));

// Screenshot repeatedly until two consecutive frames match while the page is demonstrably
// rendering and no loader is visible; returns the settled PNG buffer.
async function settledScreenshot(page, differ, label) {
    await new Promise((r) => setTimeout(r, MIN_WAIT_MS));
    let prev = await page.screenshot();
    let prevFrames = await frames(page);
    const deadline = Date.now() + SETTLE_MAX_MS;
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, SETTLE_POLL_MS));
        const next = await page.screenshot();
        const nextFrames = await frames(page);
        const live = nextFrames - prevFrames >= MIN_FRAMES_BETWEEN_SHOTS;
        const { ratio } = await diffBuffers(differ, prev, next);
        if (live && ratio < SETTLE_RATIO && !(await loaderVisible(page))) return next;
        prev = next;
        prevFrames = nextFrames;
    }
    throw new Error(`${label}: picture never settled within ${SETTLE_MAX_MS / 1000}s`);
}

// The loader can blink off between assets (model, then environment map), so require it to stay
// gone for several consecutive checks.
async function waitForModelLoaded(page, label) {
    const deadline = Date.now() + MODEL_TIMEOUT_MS;
    let clearChecks = 0;
    while (Date.now() < deadline) {
        clearChecks = (await loaderVisible(page)) ? 0 : clearChecks + 1;
        if (clearChecks >= 3) return;
        await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`${label}: model still loading after ${MODEL_TIMEOUT_MS / 1000}s`);
}

async function captureCar(browser, differ, base, car) {
    const page = await browser.newPage();

    // Looping signature effects (Taycan pulse, Cayenne dust, 918 mode cycle) never stand still; with

    // reduced motion they show one representative frame, so every stage settles deterministically.

    // Nothing else on the site reacts to this setting.

    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport(VIEWPORT);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.evaluateOnNewDocument(FRAME_COUNTER);
    await page.goto(base + encodeURI(car.url), { waitUntil: 'domcontentloaded' });

    // The viewer shows "LOADING n%" until the GLB is parsed; wait for it to disappear for good.
    await page.waitForSelector('#scroll-container', { timeout: 60000 });
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: MODEL_TIMEOUT_MS });
    await waitForModelLoaded(page, car.id);
    if (errors.length) throw new Error(`${car.id}: page error: ${errors[0]}`);

    const sections = await page.$$eval('#scroll-container section[id^="section-"]', (els) => els.map((e) => e.id));
    if (!sections.length) throw new Error(`${car.id}: no #section-* elements found`);

    fs.mkdirSync(path.join(outDir, car.id), { recursive: true });
    const files = [];
    for (let i = 0; i < sections.length; i++) {
        // Scroll exactly as a user lands on each snap point, one section at a time.
        await page.evaluate((id) => {
            const c = document.getElementById('scroll-container');
            c.scrollTo({ top: document.getElementById(id).offsetTop, behavior: 'instant' });
        }, sections[i]);
        const name = `${String(i).padStart(2, '0')}-${sections[i]}.png`;
        fs.writeFileSync(path.join(outDir, car.id, name), await settledScreenshot(page, differ, `${car.id}/${name}`));
        files.push(name);
    }
    await page.close();
    return files;
}

// Pixel comparison runs inside a browser page so no extra image library is needed.
async function diffBuffers(differ, bufA, bufB) {
    const toUrl = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
    return differ.evaluate(async (ua, ub, delta) => {
        const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
        const [ia, ib] = await Promise.all([load(ua), load(ub)]);
        if (ia.width !== ib.width || ia.height !== ib.height) return { ratio: 1, sizeMismatch: true };
        const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, c.width, c.height).data; };
        const da = px(ia), db = px(ib);
        let diff = 0;
        for (let i = 0; i < da.length; i += 4) {
            if (Math.abs(da[i] - db[i]) > delta || Math.abs(da[i + 1] - db[i + 1]) > delta || Math.abs(da[i + 2] - db[i + 2]) > delta) diff++;
        }
        return { ratio: diff / (da.length / 4) };
    }, toUrl(bufA), toUrl(bufB), PIXEL_DELTA);
}

(async () => {
    const port = 4790 + Math.floor(Math.random() * 100);
    const server = await serve(port);
    const gpuArgs = software
        ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
        : ['--ignore-gpu-blocklist', '--enable-gpu'];
    const browser = await puppeteer.launch({ headless: 'new', args: gpuArgs });
    const differ = await browser.newPage();
    console.log(`Renderer: ${software ? 'software (SwiftShader)' : 'GPU'}`);
    let failed = false;
    try {
        for (const car of CARS.filter((c) => !only || c.id === only)) {
            const t0 = Date.now();
            const files = await captureCar(browser, differ, `http://localhost:${port}`, car);
            console.log(`${car.id}: captured ${files.length} stages in ${Math.round((Date.now() - t0) / 1000)}s`);
            if (mode !== 'compare') continue;
            for (const f of files) {
                const base = path.join(baselineDir, car.id, f);
                if (!fs.existsSync(base)) { console.error(`  NEW/RENAMED stage (no baseline): ${car.id}/${f}`); failed = true; continue; }
                const { ratio, sizeMismatch } = await diffBuffers(differ, fs.readFileSync(base), fs.readFileSync(path.join(outDir, car.id, f)));
                const ok = !sizeMismatch && ratio <= (car.maxDiffRatio ?? MAX_DIFF_RATIO);
                if (!ok) failed = true;
                console.log(`  ${ok ? 'ok  ' : 'DRIFT'} ${f}  ${(ratio * 100).toFixed(2)}% pixels differ`);
            }
            const baseFiles = fs.existsSync(path.join(baselineDir, car.id)) ? fs.readdirSync(path.join(baselineDir, car.id)).filter((f) => f.endsWith('.png')) : [];
            for (const f of baseFiles) if (!files.includes(f)) { console.error(`  MISSING stage: ${car.id}/${f}`); failed = true; }
        }
    } catch (err) {
        console.error(`CAPTURE ERROR: ${err.message}`);
        failed = true;
    } finally {
        await browser.close();
        server.close();
    }
    if (mode === 'compare') console.log(failed ? 'STAGE COMPARISON FAILED: the cars do not land where they used to.' : 'Stage comparison OK.');
    process.exit(failed ? 1 : 0);
})();
