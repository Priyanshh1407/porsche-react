import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Background preloading of the 3D models on the two pages people open showrooms from (developer
// decision, 2026-10-11). Opening the GT3 RS after 20 s on home took 7.1-7.6 s when the original
// code preloaded every model on every page, and 12.1-15.1 s without any preload. This brings the
// fast path back on Home and All Models only; every other page stays light.
//
// It loads into the same cache the showrooms read (drei's useGLTF.preload, keyed by URL), so a
// showroom finds its model already there. The 3D viewers are not changed: these paths are copies,
// and a test fails if they ever differ from the viewers' own useGLTF(...) paths.
export const SHOWROOM_MODELS = [
    '/2024_manthey_racing_porsche_911_gt3_rs.glb',
    '/porsche_911_turbo_s.glb',
    '/2025_porsche_taycan_turbo_gt_weissach_package.glb',
    '/2022_porsche_cayenne_turbo_gt.glb',
    '/porsche-918-spyder-2015/source/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb',
];
export const PRELOAD_ROUTES = ['/', '/models'];

let started = false;

/** ~130 MB is too much to fetch speculatively on a metered or slow connection. */
function connectionAllows() {
    const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined;
    if (!connection) return true;
    if (connection.saveData) return false;
    return !['slow-2g', '2g', '3g'].includes(connection.effectiveType);
}

/** Resolves once the page has loaded and the browser is idle, so the page itself comes first. */
function whenIdle() {
    return new Promise((resolve) => {
        const idle = () => (window.requestIdleCallback
            ? window.requestIdleCallback(() => resolve(), { timeout: 5000 })
            : setTimeout(resolve, 1500));
        if (document.readyState === 'complete') idle();
        else window.addEventListener('load', idle, { once: true });
    });
}

export async function preloadShowroomModels() {
    if (started || !connectionAllows()) return;
    started = true;
    await whenIdle();
    // drei (and three.js) live in the 3D chunk; importing it here keeps them out of main.js.
    const { useGLTF } = await import('@react-three/drei');
    // useGLTF.preload starts a load and returns immediately, so all five download in parallel (as the
    // original code did). A failure is cached for that URL; the showroom then shows its own error.
    for (const url of SHOWROOM_MODELS) useGLTF.preload(url);
}

/** Tests only: forget that the preload already ran. */
export function resetShowroomPreloadForTests() {
    started = false;
}

/** Mounted once in App: starts the preload on Home and All Models. Renders nothing. */
export function ShowroomPreloader() {
    const { pathname } = useLocation();
    useEffect(() => {
        if (PRELOAD_ROUTES.includes(pathname)) preloadShowroomModels();
    }, [pathname]);
    return null;
}
