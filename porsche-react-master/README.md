# Frontend (porsche-react-master)

Create React App · React 19 · React Router 7 · React Three Fiber · GSAP ScrollTrigger · Tailwind.
Project overview, setup and credits: see the [root README](../README.md).

```bash
npm install
npm start        # http://localhost:3000, proxies /api to http://localhost:5000
npm test         # Jest + React Testing Library
npm run build    # production build in build/
```

`REACT_APP_API_URL` (see `.env.example`) sets the API base URL for a deployed build; leave it unset
locally.

## Layout

- `src/pages/` routes; the five 3D showrooms are `*_3D.jsx` (lazy-loaded)
- `src/components/*Viewer3D.jsx` the 3D scenes; each `SceneChoreography` block is **protected**
- `src/data/models.js` the model registry (slugs, names, old URLs); `data/modelPages.js` maps them to pages
- `src/lib/api.js` fetch wrapper (logs the admin out on 401)
- `public/*.glb` the 3D models (credited on `/credits` and in the root README)

## Tooling (`scripts/`)

| Script | Purpose |
|---|---|
| `check-trajectories.cjs` | Hashes the protected 3D blocks against `docs/trajectory-baseline.json` |
| `capture-stages.cjs --compare` | Screenshots every scroll stage on the GPU and compares with `docs/stage-baseline/` |
| `measure-page-weight.cjs` | Bytes and models per route; `docs/perf-budget.json` holds the budgets |
| `check-bundle.cjs` | No route-only library in `main.js`, and `main.js` within its gzip budget |
| `check-model-structure.mjs` | Proves an optimized GLB has identical nodes, transforms, geometry and bounds |
| `optimize-models.mjs` | Texture-only WebP compression (evaluated, not used for the shipped models) |

Baselines (`--update` / `--update-budget`) are only regenerated deliberately, never to make a
check pass.
