import { useEffect, useState } from 'react';
import { SPYDER_MODES, MODE_EVENT } from './hybridModes';

// The three drive-mode chips in the 918 Spyder's Hybrid Modes section. The active one lights up in its
// colour, following the mode cycle the 3D scene runs (MODE_EVENT).
export default function HybridModeChips() {
    const [active, setActive] = useState(null);
    useEffect(() => {
        const onMode = (e) => setActive(e.detail);
        window.addEventListener(MODE_EVENT, onMode);
        return () => window.removeEventListener(MODE_EVENT, onMode);
    }, []);

    return (
        <ul className="flex gap-3" aria-label="Drive modes">
            {SPYDER_MODES.map((mode) => {
                const on = active === mode.id;
                return (
                    <li
                        key={mode.id}
                        aria-current={on ? 'true' : undefined}
                        className="rounded-xl px-4 py-3 border backdrop-blur-md transition-all duration-[1200ms]"
                        style={{
                            borderColor: on ? mode.color : 'rgba(255,255,255,0.12)',
                            background: on ? `${mode.color}22` : 'rgba(15,23,42,0.5)',
                            boxShadow: on ? `0 0 24px ${mode.color}55` : 'none',
                        }}
                    >
                        <div className="text-sm font-black tracking-wide" style={{ color: on ? mode.color : '#ffffff' }}>{mode.label}</div>
                        <div className="text-[9px] font-bold tracking-[0.15em] uppercase mt-1 text-white/50">{mode.note}</div>
                    </li>
                );
            })}
        </ul>
    );
}
