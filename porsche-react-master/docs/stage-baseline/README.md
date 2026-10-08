# Stage baseline (3D trajectory screenshots)

One PNG per scroll stage (`#section-*`) of each 3D showroom, captured from the production build
on **2026-10-08** (Phase 0, branch `phase-0-safety-net`). These pictures are the reference for
"the cars land exactly where they used to".

The hand-tuned choreography must never change (see the global rule in `UPGRADE_PLAN.md`).
Two guards protect it:

| Guard | Catches | Command |
|---|---|---|
| `scripts/check-trajectories.cjs` | any code change in the protected blocks, pages, layout CSS or GLB files | `node scripts/check-trajectories.cjs` |
| `scripts/capture-stages.cjs` | anything that moves a car on screen, even if no protected code changed (library upgrades, CSS, layout) | `npm run build && node scripts/capture-stages.cjs --compare` |

## How a capture works
1. Serve `build/`, open each 3D route in headless Chrome at 1280×720 on the **GPU**.
2. Wait for the network to go idle and the `LOADING n%` loader to stay gone for 3 consecutive seconds
   (it blinks off between assets).
3. Scroll `#scroll-container` to each section in order, like a user.
4. Screenshot only once the picture has **settled**: two consecutive frames (1 s apart) differ in
   < 0.2% of pixels, **and** the page rendered ≥ 10 new frames in between (a harness-injected
   `requestAnimationFrame` counter), **and** no loader is visible.
   - A fixed wait is not reliable: with slow frames GSAP's lag smoothing advances tweens ~33 ms per
     frame, so a fixed timeout captured cars mid-move (found during Phase 0).
   - "Two identical screenshots" alone is not reliable either: while the 66 MB GT3 RS model is
     decoded the main thread freezes, so a frozen "LOADING 99%" screen looked settled and became a
     baseline frame (found during Phase 0). The frame counter rules that out.

## Comparison threshold (calibrated, not guessed)
A pixel counts as different when any RGB channel differs by more than 20. A stage fails above 0.10%.

| Measurement (GT3 RS, 9 stages) | Pixels differing |
|---|---|
| Two GPU captures of the same build (pure noise), worst stage | 0.005% |
| **Fail threshold** | **0.10%** |
| Same image shifted by 1 px | 2.96–3.66% |
| Same image shifted by 2 px | 4.87–5.52% |

**Cayenne exception:** its `<Sparkles>` particles never stop moving, so run-to-run noise reaches
0.10%. Its limit is **0.40%** (4× noise). The weakest 1 px shift across its 9 stages still differs
by 1.26% (≈3× the limit), so a one-pixel drift is still caught.

## Rules
- Baselines are **per renderer and machine**. This one is GPU on the developer's Windows laptop.
  CI (Phase 3) uses `--software` and needs its own baseline; never compare across them.
- Regenerate (`--update`) **only** with the developer's explicit approval, e.g. after a deliberate,
  approved visual change. Never regenerate to make a failing comparison pass.
- The route URLs live in the `CARS` list at the top of the script. When BUG-03 changes the URLs,
  update them there; the screenshots must still match.
