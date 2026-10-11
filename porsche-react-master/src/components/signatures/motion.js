// Visitors who ask their system for less motion get a still, representative frame of each looping
// signature effect (and the stage-screenshot pipeline asks for reduced motion, so stages settle).
export function prefersReducedMotion() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
