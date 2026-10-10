# Performance baseline (before any fix)

Measured **2026-10-08** on branch `phase-0-safety-net` (commit of Phase 0), production build served
locally, headless Chrome, bytes = Chrome's own `encodedDataLength` per request (what actually went
over the wire). Reproduce with:

```bash
npm run build
node scripts/measure-page-weight.cjs
```

## Bytes downloaded per route

| Route | Total | GLB models requested | Should a GLB load here? |
|---|---|---|---|
| `/` (home) | **135.9 MB** | 5 / 5 | No |
| `/contact` | **131.7 MB** | 5 / 5 | No |
| `/about` | **132.0 MB** | 5 / 5 | No |
| `/models` | **131.5 MB** | 5 / 5 | No |
| `/models/911 GT3 RS` | **133.2 MB** | 5 / 5 | Only the GT3 RS (65.9 MB) |

## The five models (identical on every route)

| File | Size |
|---|---|
| `2024_manthey_racing_porsche_911_gt3_rs.glb` | 65.9 MB |
| `porsche_911_turbo_s.glb` | 18.4 MB |
| `2022_porsche_cayenne_turbo_gt.glb` | 17.4 MB |
| `porsche-918-spyder-2015/source/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb` | 14.0 MB |
| `2025_porsche_taycan_turbo_gt_weissach_package.glb` | 13.3 MB |
| **Total** | **129.0 MB** |

## JavaScript bundle

| File | Gzipped (from `npm run build`) |
|---|---|
| `static/js/main.f7e645c3.js` (single chunk, no code splitting) | **670.05 kB** |

## Why (audit PERF-01)
Each viewer calls `useGLTF.preload(...)` at module scope, and every 3D page is statically
imported by `App.js` / `data/index.js`. So loading the app evaluates all five viewer modules and
starts all five downloads, whatever the route.

## Targets
- Phase 1 (lazy routes, no module-scope preload): non-3D routes **< 5 MB**, 0 GLBs.
- Phase 5 (texture-only compression, choreography untouched): before/after table appended below.

## After Phase 1 (2026-10-09, commit 2f6e1ba): PERF-01 quick part

Change: the five module-scope `useGLTF.preload(...)` calls are commented out, and the five 3D
showrooms are `React.lazy` chunks. Same build/serve/measure method as above.

| Route | Before | After | GLBs before → after |
|---|---|---|---|
| `/` (home) | 135.9 MB | **5.6 MB** | 5 → 0 |
| `/contact` | 131.7 MB | **1.3 MB** | 5 → 0 |
| `/about` | 132.0 MB | **1.6 MB** | 5 → 0 |
| `/models` | 131.5 MB | **1.2 MB** | 5 → 0 |
| `/models/911-gt3-rs` (was `/models/911 GT3 RS`) | 133.2 MB | **70.1 MB** | 5 → 1 (its own, 65.9 MB) |

| JavaScript | Before | After |
|---|---|---|
| `main` chunk, gzipped (`npm run build`) | 670.05 kB | **308.23 kB** (−357.94 kB) |
| Largest new lazy chunk (3D runtime), gzipped | n/a | 311.64 kB, loaded only by 3D showrooms |

Notes:
- **Home misses the Phase 1 target (< 5 MB) at 5.6 MB.** It loads no models; the weight is two
  hero photos (`hero2.jpg` 1.91 MB, `hero3.jpg` 1.05 MB). PERF-04: accepted as-is by the developer;
  the home page is not to be changed further.
- The local measuring server does not compress, so JS counts uncompressed (main ≈ 1.09 MB on the
  wire here vs ≈ 308 kB gzipped from a real host). Real-world numbers will be somewhat lower.
- The 3D showroom stage screenshots are unchanged (44/44 match the Phase 0 baseline).

## After Phase 5 (2026-10-10): PERF-02 + missing files; GT3 RS texture swap evaluated, not adopted

Same build/serve/measure method. "Before" = end of Phase 4 (`verify:full` on `phase-4-architecture`).

| Route | Phase 4 | Phase 5 | Why |
|---|---|---|---|
| `/` (home) | 5.6 MB | **5.2 MB** | admin charts (recharts) left `main.js`; Home.jsx untouched |
| `/contact` | 1.3 MB | **0.9 MB** | same |
| `/about` | 1.6 MB | **1.2 MB** | same |
| `/models` | 1.2 MB | **0.8 MB** | same |
| `/models/911-gt3-rs` | 70.1 MB | **69.7 MB** | same (GLB unchanged, 65.9 MB) |

| JavaScript | Phase 4 | Phase 5 |
|---|---|---|
| `main` chunk, gzipped (`npm run build`) | 307.57 kB | **197.22 kB** (−110.35 kB, −36%) |
| recharts chunk, gzipped | inside `main` | 109.1 kB, loaded only on `/admin/dashboard` |

`scripts/check-bundle.cjs` (in `verify:full`) fails if recharts, three or postprocessing lands in
`main.js` again.

**Missing files:** every page requested `/manifest.json` and `/favicon.ico`, which didn't exist; the
host answered with `index.html`. Now 0 on every route; `measure-page-weight` reports any such file
and the `verify:full` budget gate fails on it.

### GT3 RS texture-only compression: measured, then rejected by the developer

| | PNG (deployed) | WebP candidate |
|---|---|---|
| Textures inside the GLB | 34.0 MB | 14.7 MB (colour maps lossy q85, normal maps lossless, no resize) |
| GLB file | 65.9 MB | 46.6 MB (−29%) |
| `/models/911-gt3-rs` page | 69.7 MB | 50.4 MB |
| Structure (`check-model-structure`) | n/a | identical: 549 nodes, matrices, geometry bytes, bounding box |
| Stage screenshots vs Phase 0 baseline | match | all 9 match at the strict 0.1% limit (max 0.03%) |

The developer chose to keep the PNG model; the WebP file was deleted. `scripts/optimize-models.mjs`
and `scripts/check-model-structure.mjs` stay in the repo, so the candidate can be regenerated
(`node scripts/optimize-models.mjs`, ~2.5 min) and re-verified at any time. The largest remaining
image is the leather normal map (8.9 MB PNG, 7.6 MB as lossless WebP).

### Measured for reference, not pursued (developer decisions)
- **Lossless HTTP compression** (brotli q11) of the five GLBs: 129.0 → 71.9 MB, byte-identical after
  decoding. Not pursued: hosting is undecided.
- **Unused files in `public/`** (~32 MB: 918 zip, duplicate textures, `screenshots/`, `logo512.png`)
  are deployed but never requested. Kept by decision.
- **Time-to-first-frame on throttled Fast 4G** was planned to quantify the GT3 RS swap; with the
  swap rejected and no GLB changed, it was not measured.

## Phase 6 (2026-10-10): budgets enforced (UPG-04)

`docs/perf-budget.json` holds a ceiling for each of the 24 routes (measured size + 10%), the
number of 3D models each may load (showrooms 1, everything else 0), and `main.js` at most
211.9 kB gzipped (measured 192.6 kB). `npm run verify:full` enforces all of it. Run-to-run noise:
at most 1.38% (`/services`), so the headroom is about 7x the noise.

Proof, in a throwaway worktree (the real code was never changed):
- a 1 MB photo added to the contact page → `page-weight budget FAIL: /contact 1.97 MB > budget
  1.1 MB`, while all 8 other gates passed;
- ~60 kB of extra JavaScript imported eagerly → `FAIL: main bundle 254.2 kB gz > budget 211.9 kB`.
  Home grew only to 5.26 MB (ceiling 5.8 MB): **no route budget notices a JS regression of
  this size**, so the separate `main.js` budget is necessary. (A first attempt used only the
  string's `.length`; the minifier folded it to a constant and the bundle didn't grow at all.)

Heaviest non-3D pages, now locked in by the budget rather than fixed (PERF-05, for the developer
to decide): `/models/macan-gts` 13.3 MB (one 9.7 MB carousel JPEG), `/models/911-turbo-s/details`
11.7 MB, `/models/carrera-gt` 10.2 MB, `/models/918-spyder/details` 8.7 MB,
`/models/taycan/details` 7.8 MB.
