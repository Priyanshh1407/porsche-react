import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Runs `onIn` when a showroom's signature section reaches mid-screen and `onOut` when it leaves,
// in both scroll directions. Same hand-over points as the choreography's section triggers
// (start 'top 50%', end 'bottom 50%'). The trigger is killed on unmount.
export default function useSignatureSection(sectionSelector, { onIn, onOut }) {
    const handlers = useRef({ onIn, onOut });
    handlers.current = { onIn, onOut };

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const trigger = ScrollTrigger.create({
            trigger: sectionSelector,
            scroller: '#scroll-container',
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => handlers.current.onIn(),
            onEnterBack: () => handlers.current.onIn(),
            onLeave: () => handlers.current.onOut(),
            onLeaveBack: () => handlers.current.onOut(),
        });
        return () => trigger.kill();
    }, [sectionSelector]);
}
