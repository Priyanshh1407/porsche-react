import { useCallback, useEffect, useRef, useState } from 'react';

// 718 Boxster signature ("countryside"): the roof going down, as a short sequence that plays when the
// section scrolls into view (replayable), and the kind of roads it is for. Replaces a second carousel.
const TICK_MS = 100;

/** Which stage of the roof sequence an elapsed time falls in. */
export function stageAt(stages, elapsed) {
    let current = stages[0];
    for (const stage of stages) if (elapsed >= stage.at) current = stage;
    return current;
}

export default function BoxsterOpenTop({ data, theme }) {
    const { roofSeconds, maxSpeedKmh, stages, image, imageAlt, routes, routesImage } = data;
    const [elapsed, setElapsed] = useState(0);
    const [playing, setPlaying] = useState(false);
    const sectionRef = useRef(null);
    const played = useRef(false);

    const play = useCallback(() => {
        const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setElapsed(roofSeconds); setPlaying(false); return; }
        setElapsed(0);
        setPlaying(true);
    }, [roofSeconds]);

    useEffect(() => {
        if (!playing) return undefined;
        const id = setInterval(() => {
            setElapsed((t) => {
                const next = Math.min(roofSeconds, +(t + TICK_MS / 1000).toFixed(1));
                if (next >= roofSeconds) setPlaying(false);
                return next;
            });
        }, TICK_MS);
        return () => clearInterval(id);
    }, [playing, roofSeconds]);

    // Play once when the section first comes into view.
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry && entry.isIntersecting && !played.current) { played.current = true; play(); }
        }, { threshold: 0.4 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [play]);

    const progress = elapsed / roofSeconds;
    const stage = stageAt(stages, elapsed);
    const open = elapsed >= roofSeconds;

    return (
        <section ref={sectionRef} className="w-full px-6 md:px-12 lg:px-20 py-20" aria-labelledby="boxster-open-top">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <p className={`text-xs font-bold tracking-[0.35em] uppercase mb-4 ${theme.textAccent}`}>Signature · Open Top</p>
                    <h2 id="boxster-open-top" className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                        Roof down in<br />
                        <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>{roofSeconds} seconds.</span>
                    </h2>
                    <p className="text-slate-300 leading-relaxed mb-8 max-w-lg">
                        The fully automatic soft top folds away in {roofSeconds} seconds, even on the move at up to {maxSpeedKmh} km/h.
                        One button between a closed coupé and open sky.
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-6 max-w-lg">
                        <div className="flex items-baseline justify-between mb-3">
                            <span className="text-white font-semibold" aria-live="polite">{open ? 'Roof down. Enjoy the sky.' : stage.label}</span>
                            <span className={`font-mono text-2xl font-black ${theme.text}`}>{elapsed.toFixed(1)} s</span>
                        </div>
                        <div
                            className="h-2 rounded-full bg-white/10 overflow-hidden"
                            role="progressbar"
                            aria-label="Roof opening"
                            aria-valuemin={0}
                            aria-valuemax={roofSeconds}
                            aria-valuenow={elapsed}
                        >
                            <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-[width] duration-100 ease-linear`} style={{ width: `${progress * 100}%` }} />
                        </div>
                        <ol className="flex justify-between mt-3 text-[10px] uppercase tracking-[0.2em]">
                            {stages.map((s) => (
                                <li key={s.label} className={elapsed >= s.at ? 'text-white' : 'text-white/30'}>{s.short}</li>
                            ))}
                        </ol>
                        <button
                            type="button"
                            onClick={play}
                            disabled={playing}
                            className={`mt-5 px-5 py-2 rounded-full text-sm font-semibold border border-white/20 text-white transition-colors ${theme.hoverBg} disabled:opacity-40`}
                        >
                            {playing ? 'Opening…' : 'Open the roof again'}
                        </button>
                    </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                    <img src={image} alt={imageAlt} className="absolute inset-0 w-full h-full object-cover" />
                    {/* The scene "opens up" as the roof goes down: from a closed, dim feel to warm open sky. */}
                    <div className="absolute inset-0 bg-slate-950 transition-opacity duration-300" style={{ opacity: 0.55 * (1 - progress) }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-transparent to-sky-400/20 transition-opacity duration-300" style={{ opacity: progress }} />
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto mt-16 rounded-3xl overflow-hidden p-8 md:p-10">
                {routesImage && (
                    <>
                        <img src={routesImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
                    </>
                )}
                <h3 className="relative text-2xl font-bold text-white mb-6">Top-down roads</h3>
                <ul className="relative grid md:grid-cols-3 gap-6">
                    {routes.map((route) => (
                        <li key={route.title} className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm p-6">
                            <p className={`text-xs font-bold uppercase tracking-[0.25em] mb-2 ${theme.textAccent}`}>{route.tag}</p>
                            <p className="text-white text-lg font-semibold mb-2">{route.title}</p>
                            <p className="text-slate-400 text-sm leading-relaxed">{route.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
