#!/usr/bin/env node
/*
 * PERF-02 guard: the entry bundle (main.*.js), which every visitor downloads, must not contain
 * libraries that only some routes need. UPG-04: and it must stay under the gzipped size limit in
 * docs/perf-budget.json. Prints every JS chunk with its gzipped size.
 *
 *   npm run build && node scripts/check-bundle.cjs        (exit 1 if a library leaked into main)
 *   options: --build <dir> (default: build)   --json
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Strings each library emits and nothing else in this app does.
const ROUTE_ONLY = {
    recharts: 'recharts-wrapper',            // admin dashboard charts
    three: 'WebGLRenderer',                  // 3D showrooms
    postprocessing: 'EffectComposer',        // 3D showrooms
};

const args = process.argv.slice(2);
const i = args.indexOf('--build');
const jsDir = path.join(path.resolve(__dirname, '..', i === -1 ? 'build' : args[i + 1]), 'static', 'js');
if (!fs.existsSync(jsDir)) {
    console.error(`No build at ${jsDir}. Run "npm run build" first.`);
    process.exit(2);
}

const chunks = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).map((file) => {
    const src = fs.readFileSync(path.join(jsDir, file));
    const text = src.toString('utf8');
    return {
        file,
        main: /^main\.[0-9a-f]+\.js$/.test(file),
        gzipKB: +(zlib.gzipSync(src, { level: 9 }).length / 1024).toFixed(1),
        libs: Object.keys(ROUTE_ONLY).filter((lib) => text.includes(ROUTE_ONLY[lib])),
    };
}).sort((a, b) => b.gzipKB - a.gzipKB);

const main = chunks.find((c) => c.main);
const leaked = main ? main.libs : [];
const budgetFile = path.resolve(__dirname, '..', 'docs', 'perf-budget.json');
const maxKB = fs.existsSync(budgetFile) ? JSON.parse(fs.readFileSync(budgetFile, 'utf8')).mainJsGzipKB.max : null;
const overBudget = maxKB !== null && main.gzipKB > maxKB;
const ok = leaked.length === 0 && !overBudget;

if (args.includes('--json')) {
    console.log(JSON.stringify({ ok, mainGzipKB: main && main.gzipKB, maxKB, leaked, chunks }, null, 2));
} else {
    for (const c of chunks) console.log(`${String(c.gzipKB).padStart(7)} kB gz  ${c.file.padEnd(28)} ${c.libs.join(', ')}`);
    const problems = [];
    if (leaked.length) problems.push(`main bundle contains route-only libraries: ${leaked.join(', ')}`);
    if (overBudget) problems.push(`main bundle ${main.gzipKB} kB gz > budget ${maxKB} kB`);
    console.log(problems.length
        ? `FAIL: ${problems.join('; ')}`
        : `OK: main bundle ${main.gzipKB} kB gz${maxKB !== null ? ` (budget ${maxKB} kB)` : ''}, no route-only library`);
}
process.exit(ok ? 0 : 1);
