// Loaded automatically by react-scripts before every test file.
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// React Router v7 needs these, and jsdom (Jest 27) does not provide them.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Browser APIs jsdom lacks: GSAP ScrollTrigger needs matchMedia at import time, the 3D pages
// use IntersectionObserver for text reveals, and recharts uses ResizeObserver.
window.matchMedia = window.matchMedia || ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
}));

class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
}
window.IntersectionObserver = window.IntersectionObserver || NoopObserver;
window.ResizeObserver = window.ResizeObserver || NoopObserver;

/*
 * WebGL stubs. jsdom has no WebGL, and these packages ship ES-module-only builds that CRA's
 * Jest does not transform. Unit tests cover routing, forms and data; the real 3D rendering is
 * verified by scripts/capture-stages.cjs in a real browser.
 *
 * Every named export becomes a component that renders nothing (or a hook returning inert data),
 * so the app's 3D files load unchanged.
 */
jest.mock('@react-three/fiber', () => {
    const React = require('react');
    return {
        __esModule: true,
        Canvas: () => React.createElement('div', { 'data-testid': 'r3f-canvas' }),
        useThree: () => ({ camera: { position: {} }, gl: {}, scene: {}, size: { width: 0, height: 0 } }),
        useFrame: () => {},
        useLoader: () => ({}),
        extend: () => {},
    };
});

jest.mock('@react-three/drei', () => {
    const stub = () => null;
    const useGLTF = () => ({ scene: { traverse: () => {}, getObjectByName: () => null }, nodes: {}, materials: {} });
    useGLTF.preload = () => {};
    const named = { useGLTF, useProgress: () => ({ progress: 100, active: false }) };
    return new Proxy({ __esModule: true }, {
        get: (target, key) => (key in target ? target[key] : key in named ? named[key] : stub),
    });
});

jest.mock('@react-three/postprocessing', () =>
    new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key] : () => null) })
);

jest.mock('postprocessing', () =>
    new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key] : new Proxy({}, { get: () => 0 })) })
);

// jsdom does not implement scrolling; pages call window.scrollTo on mount.
window.scrollTo = () => {};

// TEST-02/TEST-01: a test that finishes without asserting anything fails (no vacuous passes).
beforeEach(() => {
    expect.hasAssertions();
});
