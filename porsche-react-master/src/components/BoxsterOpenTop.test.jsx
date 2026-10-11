// 718 Boxster signature: the roof sequence plays through its stages, can be replayed, and respects
// reduced motion.
import { act, fireEvent, render, screen } from '@testing-library/react';
import BoxsterOpenTop, { stageAt } from './BoxsterOpenTop';
import { carThemes } from '../data/carThemes';
import { cayman_boxster } from '../data';

const renderIt = () => render(<BoxsterOpenTop data={cayman_boxster.openTop} theme={carThemes.boxsterS} />);

afterEach(() => jest.useRealTimers());

test('stageAt picks the latest stage that has started', () => {
    const stages = cayman_boxster.openTop.stages;
    expect(stageAt(stages, 0).short).toBe('Unlatch');
    expect(stageAt(stages, 3).short).toBe('Fold');
    expect(stageAt(stages, 8.9).short).toBe('Stow');
});

test('opening the roof runs to 9.0 s through every stage, then can be replayed', () => {
    jest.useFakeTimers();
    renderIt();
    expect(screen.getByRole('heading', { name: /Roof down in 9 seconds/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open the roof again' }));
    expect(screen.getByRole('button', { name: 'Opening…' })).toBeDisabled();

    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Folding the roof…')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(7000); });
    expect(screen.getByText('Roof down. Enjoy the sky.')).toBeInTheDocument();
    expect(screen.getByText('9.0 s')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Roof opening' })).toHaveAttribute('aria-valuenow', '9');

    fireEvent.click(screen.getByRole('button', { name: 'Open the roof again' }));
    expect(screen.getByText('0.0 s')).toBeInTheDocument();
});

test('with reduced motion it shows the open roof straight away', () => {
    const original = window.matchMedia;
    window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    try {
        renderIt();
        fireEvent.click(screen.getByRole('button', { name: 'Open the roof again' }));
        expect(screen.getByText('Roof down. Enjoy the sky.')).toBeInTheDocument();
    } finally {
        window.matchMedia = original;
    }
});

test('lists the three top-down roads', () => {
    renderIt();
    for (const title of ['Golden-hour coast roads', 'Alpine passes', 'Empty country lanes']) expect(screen.getByText(title)).toBeInTheDocument();
});
