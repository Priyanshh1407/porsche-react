// Phase 4: keyboard/drag/swipe navigation stops at the last slide and follows the current data.
import { render, screen, fireEvent } from '@testing-library/react';
import Carousel from './Carousel';
import { carThemes } from '../data/carThemes';

const slides = (n) => Array.from({ length: n }, (_, i) => ({ title: `Slide ${i + 1}`, description: '', image: '' }));
// The "n of total" counter under the slides, read as the user sees it.
// (Its wrapper divs share the same text, so any number of matches counts.)
const expectCounter = (n, total) => expect(screen.queryAllByText((_, el) => el.tagName === 'DIV' && el.textContent === `${n}of${total}`)).not.toHaveLength(0);
const press = (key, times = 1) => { for (let i = 0; i < times; i++) fireEvent.keyDown(window, { key }); };

test('arrow keys never step past the last slide', () => {
    render(<Carousel data={slides(3)} theme={carThemes.home} heading="h" description="d" />);
    press('ArrowRight', 5);
    expectCounter(3, 3); // was "4 of 3": an empty slide past the end
    press('ArrowLeft', 5);
    expectCounter(1, 3);
});

test('a swipe left on the last slide stays on the last slide', () => {
    render(<Carousel data={slides(2)} theme={carThemes.home} heading="h" description="d" />);
    press('ArrowRight');
    const track = screen.getByText('Slide 2'); // touch events bubble to the swipe area
    fireEvent.touchStart(track, { targetTouches: [{ clientX: 300 }] });
    fireEvent.touchMove(track, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchEnd(track);
    expectCounter(2, 2);
});

test('keyboard navigation uses the current slide count after the data changes', () => {
    const { rerender } = render(<Carousel data={slides(2)} theme={carThemes.home} heading="h" description="d" />);
    rerender(<Carousel data={slides(5)} theme={carThemes.home} heading="h" description="d" />);
    press('ArrowRight', 10);
    expectCounter(5, 5);
});
