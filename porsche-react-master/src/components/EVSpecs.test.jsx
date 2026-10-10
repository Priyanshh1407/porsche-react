// Phase 4: the battery fill still animates to 90%, and its timers stop when the section unmounts.
import { act, render, screen } from '@testing-library/react';
import EVSpecs from './EVSpecs';
import { carThemes } from '../data/carThemes';

// An IntersectionObserver that reports the card as visible as soon as it is observed.
class VisibleObserver {
    constructor(callback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
}

let realObserver;
beforeEach(() => {
    realObserver = window.IntersectionObserver;
    window.IntersectionObserver = VisibleObserver;
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
    window.IntersectionObserver = realObserver;
});

test('the battery fills to 90% once the card is visible', () => {
    render(<EVSpecs theme={carThemes.home} />);
    act(() => { jest.advanceTimersByTime(550 + 900 + 100); });
    expect(screen.getByText('Battery: 90% charged')).toBeInTheDocument();
});

test('unmounting mid-animation leaves no timers running', () => {
    const { unmount } = render(<EVSpecs theme={carThemes.home} />);
    act(() => { jest.advanceTimersByTime(600); }); // delay done, interval mid-fill
    unmount();
    expect(jest.getTimerCount()).toBe(0);
});

test('unmounting before the fill starts cancels the delayed start', () => {
    const { unmount } = render(<EVSpecs theme={carThemes.home} />);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
});
