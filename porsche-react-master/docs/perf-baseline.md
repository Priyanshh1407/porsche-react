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
  hero photos (`hero2.jpg` 1.91 MB, `hero3.jpg` 1.05 MB). Logged as PERF-04 for Phase 5.
- The local measuring server does not compress, so JS counts uncompressed (main ≈ 1.09 MB on the
  wire here vs ≈ 308 kB gzipped from a real host). Real-world numbers will be somewhat lower.
- The 3D showroom stage screenshots are unchanged (44/44 match the Phase 0 baseline).
