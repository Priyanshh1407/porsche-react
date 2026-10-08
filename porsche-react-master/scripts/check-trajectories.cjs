#!/usr/bin/env node
/*
 * Trajectory guard.
 *
 * The 3D scroll choreography is hand-tuned: changing a single coordinate,
 * duration, easing, trigger start or section height breaks the sequence.
 * This script hashes every protected block and compares it with the
 * committed baseline (docs/trajectory-baseline.json).
 *
 *   node scripts/check-trajectories.cjs            # verify (exit 1 on any change)
 *   node scripts/check-trajectories.cjs --update   # rewrite baseline (only with the developer's approval)
 *   node scripts/check-trajectories.cjs --root <dir>  # check another copy of the project (used for self-tests)
 *
 * Protected (see UPGRADE_PLAN.md "Global rule"):
 *   - viewers: the SceneChoreography block, the full-size wrapper <div>, the <Canvas ...> opening tag,
 *     and the <EffectComposer> block (or its absence)
 *   - 3D pages: the whole file (helpers like AnimatedStat/SpecCard affect section heights)
 *   - the GLB files the viewers load
 *   - global layout inputs: index.css, App.css, tailwind.config.js
 * Deliberately NOT protected: the Loader, the Suspense wrapper and the module-scope
 * useGLTF.preload line, which Phases 1 and 4 are allowed to change.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const update = args.includes('--update');
const rootIdx = args.indexOf('--root');
const root = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : path.resolve(__dirname, '..');
const baselinePath = path.resolve(__dirname, '..', 'docs', 'trajectory-baseline.json');

const VIEWERS = ['ModelViewer3D', 'TaycanViewer3D', 'CayenneViewer3D', 'TurboViewer3D', 'SpyderViewer3D'];
const PAGES = ['GT3RS_3D', 'Taycan_3D', 'Cayenne_3D', 'Turbo_3D', 'Spyder_918_3D'];
const LAYOUT_GLOBALS = ['src/index.css', 'src/App.css', 'tailwind.config.js'];

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
// Normalise line endings only, so a Git autocrlf flip is not reported as a change.
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');

function sliceBetween(src, startMarker, endMarker, label) {
    const start = src.indexOf(startMarker);
    if (start === -1) throw new Error(`${label}: start marker not found: ${startMarker}`);
    const end = src.indexOf(endMarker, start + startMarker.length);
    if (end === -1) throw new Error(`${label}: end marker not found: ${endMarker}`);
    return src.slice(start, end + endMarker.length);
}

function collect() {
    const blocks = {};
    const glbs = new Set();

    for (const name of VIEWERS) {
        const rel = `src/components/${name}.jsx`;
        const src = read(rel);
        // SceneChoreography runs from its declaration to the "};" that closes it,
        // which is the last "};" before the default export.
        const choreoStart = src.indexOf('const SceneChoreography');
        const exportStart = src.indexOf('export default function');
        if (choreoStart === -1 || exportStart === -1) throw new Error(`${rel}: SceneChoreography or default export not found`);
        const choreoEnd = src.lastIndexOf('};', exportStart);
        blocks[`${rel}#SceneChoreography`] = src.slice(choreoStart, choreoEnd + 2);
        const exportPart = src.slice(exportStart);
        blocks[`${rel}#WrapperDiv`] = sliceBetween(exportPart, '<div', '>', rel);
        blocks[`${rel}#CanvasProps`] = sliceBetween(exportPart, '<Canvas', '>', rel);
        // Only some cars use post-processing; record absence too, so adding/removing it is caught.
        blocks[`${rel}#EffectComposer`] = exportPart.includes('<EffectComposer')
            ? sliceBetween(exportPart, '<EffectComposer', '</EffectComposer>', rel)
            : '<<no EffectComposer>>';
        for (const m of blocks[`${rel}#SceneChoreography`].matchAll(/useGLTF\(\s*'([^']+\.glb)'\s*\)/g)) glbs.add(m[1]);
    }

    for (const name of PAGES) {
        const rel = `src/pages/${name}.jsx`;
        blocks[rel] = read(rel);
    }

    for (const rel of LAYOUT_GLOBALS) blocks[rel] = read(rel);

    const hashes = {};
    for (const [key, text] of Object.entries(blocks)) hashes[key] = sha(text);
    for (const glb of [...glbs].sort()) {
        const rel = path.join('public', glb);
        hashes[`public${glb}`] = sha(fs.readFileSync(path.join(root, rel)));
    }
    return hashes;
}

let current;
try {
    current = collect();
} catch (err) {
    console.error(`TRAJECTORY GUARD ERROR: ${err.message}`);
    console.error('A protected block could not be located. Its structure was changed; treat this as a trajectory change.');
    process.exit(1);
}

if (update) {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, JSON.stringify(current, null, 2) + '\n');
    console.log(`Baseline written: ${Object.keys(current).length} protected items -> ${path.relative(process.cwd(), baselinePath)}`);
    process.exit(0);
}

if (!fs.existsSync(baselinePath)) {
    console.error('No baseline found. Create it once with --update (Phase 0 only).');
    process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const problems = [];
for (const key of Object.keys(baseline)) {
    if (!(key in current)) problems.push(`MISSING  ${key}`);
    else if (current[key] !== baseline[key]) problems.push(`CHANGED  ${key}`);
}
for (const key of Object.keys(current)) {
    if (!(key in baseline)) problems.push(`NEW      ${key}`);
}

if (problems.length) {
    console.error('TRAJECTORY GUARD FAILED: protected 3D choreography/layout/models changed:');
    problems.forEach((p) => console.error(`  ${p}`));
    console.error('Revert these changes, or get explicit approval from the developer before updating the baseline.');
    process.exit(1);
}
console.log(`Trajectory guard OK: ${Object.keys(baseline).length} protected items unchanged.`);
