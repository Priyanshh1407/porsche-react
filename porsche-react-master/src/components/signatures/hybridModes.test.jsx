// 918 Spyder signature: the drive-mode cycle and the chips that follow it.
import { act, render, screen } from '@testing-library/react';
import { createModeCycle, SPYDER_MODES, MODE_EVENT } from './hybridModes';
import HybridModeChips from './HybridModeChips';

// A manual scheduler: run() fires the pending step, so timing is deterministic.
const manualTimers = () => {
    let pending = null;
    return { schedule: (fn) => { pending = fn; return 1; }, cancel: () => { pending = null; }, run: () => { const fn = pending; pending = null; if (fn) fn(); }, has: () => pending !== null };
};

test('cycles E-Power -> Hybrid -> Race and loops, applying each colour', () => {
    const t = manualTimers();
    const applied = [];
    const cycle = createModeCycle({ apply: (m) => applied.push(m.id), schedule: t.schedule, cancel: t.cancel });
    cycle.start();
    t.run(); t.run(); t.run();
    expect(applied).toEqual(['e-power', 'hybrid', 'race', 'e-power']);
    expect(cycle.isRunning()).toBe(true);
});

test('stop() ends it and announces "no mode"; it also stops by itself once the section is gone', () => {
    const t = manualTimers();
    const events = [];
    const listener = (e) => events.push(e.detail);
    window.addEventListener(MODE_EVENT, listener);
    let alive = true;
    const cycle = createModeCycle({ apply: () => {}, isAlive: () => alive, schedule: t.schedule, cancel: t.cancel });
    cycle.start();
    cycle.stop();
    expect(cycle.isRunning()).toBe(false);
    expect(t.has()).toBe(false);
    expect(events).toEqual(['e-power', null]);

    cycle.start();
    alive = false;
    t.run();
    expect(cycle.isRunning()).toBe(false);
    window.removeEventListener(MODE_EVENT, listener);
});

test('the chip of the active mode is marked current', () => {
    render(<HybridModeChips />);
    expect(screen.getAllByRole('listitem')).toHaveLength(SPYDER_MODES.length);
    act(() => { window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: 'race' })); });
    expect(screen.getByRole('listitem', { current: true })).toHaveTextContent('Race');
    act(() => { window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: null })); });
    expect(screen.queryAllByRole('listitem').filter((li) => li.getAttribute('aria-current'))).toHaveLength(0);
});
