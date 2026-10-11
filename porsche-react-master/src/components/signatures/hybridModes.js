// 918 Spyder signature ("hybrid"): the three drive modes the section cycles through. The colours are
// applied with the showroom's own animateLightColor, so the car's lights and the page's accent colour
// (--theme-color) shift together.
export const SPYDER_MODES = [
    { id: 'e-power', label: 'E-Power', color: '#38bdf8', note: 'Electric only, silent' },
    { id: 'hybrid', label: 'Hybrid', color: '#a3e635', note: 'Engine and motors together' },
    { id: 'race', label: 'Race', color: '#fb923c', note: 'Everything, all at once' },
];
export const MODE_EVENT = 'spyder-hybrid-mode';
export const MODE_SECONDS = 2.2;

/**
 * Steps through `modes` every `seconds` while started: apply(mode) recolours the scene, and a
 * MODE_EVENT is dispatched for the page. stop() ends it; it also stops by itself if `isAlive()`
 * turns false (e.g. the showroom was left without a scroll event).
 */
export function createModeCycle({ modes = SPYDER_MODES, seconds = MODE_SECONDS, apply, isAlive = () => true, schedule = setTimeout, cancel = clearTimeout, reduced = false }) {
    let resting = false;
    let timer = null;
    let index = 0;
    const show = () => {
        if (!isAlive()) { stop(); return; } // eslint-disable-line no-use-before-define
        const mode = modes[index % modes.length];
        apply(mode);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: mode.id }));
        index += 1;
        timer = schedule(show, seconds * 1000);
    };
    function stop() {
        resting = false;
        if (timer !== null) cancel(timer);
        timer = null;
        index = 0;
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: null }));
    }
    const rest = () => {
        // Reduced motion: no cycling; settle on Hybrid, the mode that defines the car.
        const mode = modes.find((m) => m.id === 'hybrid') || modes[0];
        resting = true;
        apply(mode);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: mode.id }));
    };
    return {
        start: () => { if (reduced) { rest(); return; } if (timer === null) show(); },
        stop,
        isRunning: () => timer !== null || resting,
    };
}
