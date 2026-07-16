import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import SpyderViewer3D from '../components/SpyderViewer3D';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated Counter ─── */
function AnimatedStat({ value, suffix = '', label, delay = 0 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!hasAnimated.current) {
                    hasAnimated.current = true;
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: parseFloat(value),
                        duration: 2.5,
                        delay,
                        ease: 'power2.out',
                        onUpdate: () => setCount(Math.round(obj.val))
                    });
                }
            } else {
                hasAnimated.current = false;
                setCount(0);
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [value, delay]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-6xl font-black tabular-nums tracking-tight text-white">
                {count}<span style={{ color: 'var(--theme-color)', filter: 'drop-shadow(0 0 5px var(--theme-color))' }} className="transition-colors duration-1000">{suffix}</span>
            </div>
            <div className="text-[10px] md:text-xs text-lime-100/60 uppercase tracking-[0.25em] mt-3 font-semibold">
                {label}
            </div>
        </div>
    );
}

export default function Spyder_918_3D() {
    const mainRef = useRef(null);

    useLayoutEffect(() => {
        const container = document.getElementById('scroll-container');
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const revealEls = entry.target.querySelectorAll('.reveal');
                revealEls.forEach(revealEl => {
                    if (entry.isIntersecting) {
                        revealEl.classList.remove('opacity-0', 'translate-y-10');
                        revealEl.classList.add('opacity-100', 'translate-y-0');
                    } else {
                        revealEl.classList.add('opacity-0', 'translate-y-10');
                        revealEl.classList.remove('opacity-100', 'translate-y-0');
                    }
                });
            });
        }, { threshold: 0.5, root: container });

        const sections = document.querySelectorAll('section');
        sections.forEach(s => observer.observe(s));

        return () => {
            sections.forEach(s => observer.unobserve(s));
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    return (
        <div ref={mainRef} className="relative text-white h-screen w-full" style={{ background: 'transparent', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>

            {/* ═══ Back Button ═══ */}
            <Link to="/" className="fixed top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:scale-105"
                style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Home
            </Link>

            {/* ═══ 3D Canvas ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-0">
                <SpyderViewer3D />
            </div>

            {/* ═══ Atmospheric Background — Acid Forest ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
                style={{
                    background: `
                         radial-gradient(ellipse 100% 70% at 50% 80%, rgba(34, 80, 10, 0.25) 0%, transparent 55%),
                         radial-gradient(ellipse 80% 60% at 30% 40%, rgba(163, 230, 53, 0.08) 0%, transparent 50%),
                         radial-gradient(ellipse 60% 50% at 80% 60%, rgba(74, 120, 20, 0.12) 0%, transparent 50%),
                         linear-gradient(175deg, #020a00 0%, #0a1500 30%, #050d00 60%, #010400 100%)
                     `
                }}
            />

            {/* ═══ Thematic SVG Overlay — Starburst / Open Sky Rays ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none flex items-center justify-center" style={{ opacity: 0.035 }}>
                <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[90%] h-[90%] max-w-[800px]">
                    {/* Radiating light rays from center */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                        <line key={i} x1="400" y1="400" x2={400 + 400 * Math.cos(angle * Math.PI / 180)} y2={400 + 400 * Math.sin(angle * Math.PI / 180)} stroke="#a3e635" strokeWidth={i % 3 === 0 ? "2" : "0.8"} />
                    ))}
                    <circle cx="400" cy="400" r="8" fill="#a3e635" />
                    <circle cx="400" cy="400" r="25" stroke="#a3e635" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            {/* ═══ Scrollable Container (Snap Mandatory) ═══ */}
            <div id="scroll-container" className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">

                {/* ─── HERO ─── */}
                <section id="section-hero" className="h-screen w-full snap-center flex flex-col justify-center items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto max-w-lg opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)', filter: 'drop-shadow(0 0 5px var(--theme-color))' }}>
                            Porsche 918 Spyder
                        </p>
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] uppercase leading-[0.85] tracking-tight text-white drop-shadow-2xl"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            918 Spyder
                        </h1>
                        <div className="w-12 h-[1px] ml-auto mt-8 mb-4" style={{ background: 'linear-gradient(to left, transparent, rgba(163,230,53,0.8), transparent)', boxShadow: '0 0 10px rgba(163,230,53,0.5)' }} />
                        <p className="text-sm md:text-base leading-relaxed font-medium transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.8 }}>
                            918 made. 0 compromises.
                        </p>
                    </div>
                </section>

                {/* ─── POWERTRAIN ─── */}
                <section id="section-powertrain" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>01 · Powertrain</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Top-Exit Exhausts.<br />
                            <span className="transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>V8 + E-Motors.</span>
                        </h2>
                        <p className="text-lime-50/70 text-sm leading-relaxed mb-8 font-medium">
                            A 4.6L naturally aspirated V8 paired with two electric motors delivers a combined 887 hp and 1280 Nm of torque. The iconic top pipes keep the engine bay cool and lower the center of gravity.
                        </p>
                        <div className="flex gap-10 justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">887<span style={{ color: 'var(--theme-color)', filter: 'drop-shadow(0 0 5px var(--theme-color))' }} className="text-sm ml-1 transition-colors duration-1000">hp</span></div>
                                <div className="text-[9px] font-bold tracking-[0.3em] uppercase mt-1 transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Total Power</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">1280<span style={{ color: 'var(--theme-color)', filter: 'drop-shadow(0 0 5px var(--theme-color))' }} className="text-sm ml-1 transition-colors duration-1000">Nm</span></div>
                                <div className="text-[9px] font-bold tracking-[0.3em] uppercase mt-1 transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Torque</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── HYBRID PIONEER ─── */}
                <section id="section-eperformance" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>02 · The Hybrid Pioneer</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Before anyone<br />
                            <span className="transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>believed.</span>
                        </h2>
                        <p className="text-lime-50/70 text-sm leading-relaxed mb-6 font-medium">
                            In 2013, Porsche proved that hybrid doesn't mean slow. A 4.6L V8 screaming at 9,150 RPM,
                            coupled with two electric motors — one on each axle. This was the car that silenced every critic
                            and forced Ferrari and McLaren to follow.
                        </p>
                        <div className="pl-5 border-l-2 transition-colors duration-1000" style={{ borderColor: 'var(--theme-color)', opacity: 0.6, boxShadow: '-2px 0 10px var(--theme-color)' }}>
                            <p className="text-lime-100/60 text-xs italic leading-relaxed font-semibold">
                                Part of the "Holy Trinity" — alongside the LaFerrari and McLaren P1.
                                The 918 held the Nürburgring production car record at 6:57.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── AERODYNAMICS ─── */}
                <section id="section-aero" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>03 · Active Aerodynamics</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Massive Downforce.<br />
                            <span className="transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Adaptive Wing.</span>
                        </h2>
                        <p className="text-lime-50/70 text-sm leading-relaxed mb-6 font-medium">
                            Porsche Active Aerodynamics (PAA) adjusts the massive rear wing and underbody diffuser flaps through three different modes, balancing drag for top speed and downforce for the track.
                        </p>
                    </div>
                </section>

                {/* ─── OPEN SKY ─── */}
                <section id="section-roof" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>04 · Open Sky</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Remove the roof.<br />
                            <span className="transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Feel 340 km/h.</span>
                        </h2>
                        <p className="text-lime-50/70 text-sm leading-relaxed mb-6 font-medium">
                            Two carbon-fiber Targa panels lift out and stow in the front trunk. At 340 km/h with the roof open,
                            you're not just driving — you're wearing the wind. The V8 wail bounces off tunnels, fills valleys,
                            and turns every mountain pass into a private concert.
                        </p>
                        <div className="flex gap-6 justify-end flex-wrap">
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 backdrop-blur-md transition-colors duration-1000" style={{ border: '1px solid var(--theme-color)', opacity: 0.8 }}>
                                <div className="text-lg font-black text-white">340<span className="text-xs ml-1 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>km/h</span></div>
                                <div className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1 transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Open Top Speed</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 backdrop-blur-md transition-colors duration-1000" style={{ border: '1px solid var(--theme-color)', opacity: 0.8 }}>
                                <div className="text-lg font-black text-white">918</div>
                                <div className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1 transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Units Ever Made</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── CHASSIS ─── */}
                <section id="section-chassis" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 transition-colors duration-1000" style={{ color: 'var(--theme-color)' }}>05 · Lightweighting</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Carbon Monocoque.<br />
                            <span className="transition-colors duration-1000" style={{ color: 'var(--theme-color)', opacity: 0.6 }}>Weissach Ready.</span>
                        </h2>
                        <p className="text-lime-50/70 text-sm leading-relaxed mb-6 font-medium">
                            Built around a carbon-fiber reinforced plastic (CFRP) monocoque, the 918 achieves incredible torsional rigidity while keeping weight to an absolute minimum.
                        </p>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section id="section-stats" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-center px-8 pointer-events-none">
                    <div className="reveal w-full max-w-4xl pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase mb-14 bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">06 · Telemetry</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            <AnimatedStat value="887" suffix="hp" label="Total Power" delay={0} />
                            <AnimatedStat value="1280" suffix="Nm" label="Max Torque" delay={0.1} />
                            <AnimatedStat value="2" suffix=".6s" label="0–100 km/h" delay={0.2} />
                            <AnimatedStat value="340" suffix="" label="Top Speed km/h" delay={0.3} />
                        </div>
                        <div className="w-full h-[1px] mt-14" style={{ background: 'linear-gradient(to right, transparent, rgba(163,230,53,0.3), transparent)' }} />
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section id="section-cta" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] tracking-[0.4em] font-bold uppercase mb-6 transition-colors duration-1000" style={{ color: 'var(--theme-color)', filter: 'drop-shadow(0 0 5px var(--theme-color))' }}>Hypercar Legacy</p>
                        <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tight text-white drop-shadow-xl"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            Build yours.
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                            <button className="text-slate-900 px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             transition-all duration-1000 hover:scale-105 rounded-full"
                                style={{ backgroundColor: 'var(--theme-color)', boxShadow: '0 0 20px var(--theme-color)' }}>
                                Configure
                            </button>
                            <Link to="/models/918%20spyder/details" className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:scale-105 rounded-full flex items-center justify-center transition-all duration-1000"
                                style={{ border: '2px solid var(--theme-color)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
                                Know More
                            </Link>
                            <button className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:scale-105 rounded-full transition-all duration-1000"
                                style={{ border: '2px solid var(--theme-color)', opacity: 0.6, background: 'transparent' }}>
                                Test Drive
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
