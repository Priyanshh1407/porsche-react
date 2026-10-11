// The signature trigger hands over at the same mid-screen points as the choreography, in both
// directions, and is removed on unmount.
import { renderHook } from '@testing-library/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useSignatureSection from './useSignatureSection';

test('creates a mid-screen trigger that runs onIn/onOut in both directions and is killed on unmount', () => {
    const kill = jest.fn();
    let config;
    jest.spyOn(ScrollTrigger, 'create').mockImplementation((c) => { config = c; return { kill }; });
    const onIn = jest.fn();
    const onOut = jest.fn();
    const { unmount } = renderHook(() => useSignatureSection('#section-x', { onIn, onOut }));

    expect(config).toEqual(expect.objectContaining({ trigger: '#section-x', scroller: '#scroll-container', start: 'top 50%', end: 'bottom 50%' }));
    config.onEnter(); config.onEnterBack();
    expect(onIn).toHaveBeenCalledTimes(2);
    config.onLeave(); config.onLeaveBack();
    expect(onOut).toHaveBeenCalledTimes(2);

    unmount();
    expect(kill).toHaveBeenCalled();
});
