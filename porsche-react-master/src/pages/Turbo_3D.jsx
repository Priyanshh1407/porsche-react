import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import TurboViewer3D from '../components/TurboViewer3D';
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
            if (entry.isIntersecting && !hasAnimated.current) {
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
        }, { threshold: 0.5, root: document.getElementById('scroll-container') });
        observer.observe(el);
        return () => observer.disconnect();
    }, [value, delay]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl lg:text-6xl font-black tabular-nums tracking-tight text-white whitespace-nowrap">
                {count}<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{suffix}</span>
            </div>
            <div className="text-[10px] md:text-xs text-amber-100/60 uppercase tracking-[0.25em] mt-3 font-semibold">
                {label}
            </div>
        </div>
    );
}

/* ─── Spec Card ─── */
function SpecCard({ icon, title, desc, delay }) {
    return (
        <div className="reveal w-full rounded-2xl p-5 mb-4 opacity-0 translate-y-10
                        transition-all group cursor-default shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
            style={{
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.9))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                borderLeft: '3px solid rgba(245, 158, 11, 0.5)',
                transitionDuration: '1000ms',
                transitionDelay: delay
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(245, 158, 11, 0.6)';
                e.currentTarget.style.borderLeft = '3px solid rgba(245, 158, 11, 1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.2)';
                e.currentTarget.style.transform = 'scale(1.02) translateX(10px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.borderLeft = '3px solid rgba(245, 158, 11, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'scale(1) translateX(0px)';
            }}>
            <div className="flex items-center gap-4 mb-2">
                <div className="text-xl text-amber-500/50 group-hover:text-amber-400 transition-colors duration-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">{icon}</div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider m-0 group-hover:text-amber-50 transition-colors duration-300">{title}</h4>
            </div>
            <p className="text-amber-100/50 text-xs leading-relaxed font-medium m-0 group-hover:text-amber-100/80 transition-colors duration-300">{desc}</p>
        </div>
    );
}

export default function Turbo_3D() {
    const mainRef = useRef(null);

    useLayoutEffect(() => {
        const container = document.getElementById('scroll-container');
        if (!container) return;

        // Native Intersection Observer for bulletproof text reveals
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

    // Prevent default scroll behavior on body since the container handles it
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
                <TurboViewer3D />
            </div>

            {/* ═══ Atmospheric Background — Museum Spotlight ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
                style={{
                    background: `
                         radial-gradient(ellipse 80% 60% at 50% 30%, rgba(245, 158, 11, 0.12) 0%, transparent 55%),
                         radial-gradient(ellipse 100% 80% at 30% 70%, rgba(180, 130, 60, 0.10) 0%, transparent 50%),
                         radial-gradient(ellipse 60% 50% at 80% 50%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
                         linear-gradient(180deg, #0a0804 0%, #120e06 30%, #0d0a04 60%, #050300 100%)
                     `
                }}
            />

            {/* ═══ Thematic SVG Overlay — City Skyline ═══ */}
            <div className="fixed bottom-0 left-0 w-full z-[1] pointer-events-none" style={{ opacity: 0.04 }}>
                <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="xMidYMax meet">
                    <path d="M0 200 V160 H40 V120 H60 V80 H80 V120 H120 V140 H160 V60 H180 V40 H200 V60 H220 V100 H260 V140 H300 V110 H320 V70 H340 V30 H350 V70 H360 V110 H400 V150 H440 V130 H460 V90 H480 V50 H490 V20 H500 V50 H520 V90 H540 V130 H580 V160 H620 V100 H640 V60 H660 V100 H700 V140 H740 V120 H760 V80 H770 V40 H780 V80 H800 V120 H840 V150 H880 V110 H900 V70 H920 V110 H960 V140 H1000 V160 H1040 V90 H1060 V50 H1070 V25 H1080 V50 H1100 V90 H1120 V130 H1160 V150 H1200 V120 H1220 V80 H1240 V120 H1280 V140 H1320 V160 H1360 V130 H1380 V160 H1440 V200 Z" fill="#f59e0b" />
                </svg>
            </div>

            {/* ═══ Scrollable Container (Snap Mandatory) ═══ */}
            <div id="scroll-container" className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">

                {/* ─── HERO ─── */}
                <section id="section-hero" className="h-screen w-full snap-center flex flex-col justify-center items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto max-w-lg opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]">
                            911
                        </p>
                        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] uppercase leading-[0.85] tracking-tight text-white drop-shadow-2xl whitespace-nowrap"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            Turbo S
                        </h1>
                        <div className="w-12 h-[1px] ml-auto mt-8 mb-4" style={{ background: 'linear-gradient(to left, transparent, rgba(45,212,191,0.8), transparent)', boxShadow: '0 0 10px rgba(45,212,191,0.5)' }} />
                        <p className="reveal opacity-0 translate-y-10 text-sm md:text-base text-cyan-50 max-w-lg font-light tracking-wide drop-shadow-md leading-relaxed mt-4">
                            650 PS. Every single day.
                        </p>
                    </div>
                </section>

                {/* ─── ENGINE ─── */}
                <section id="section-powertrain" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">01 · Powertrain</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            T-Hybrid<br />
                            Technology.
                        </h2>
                        <p className="text-amber-50/70 text-sm leading-relaxed mb-8 font-medium">
                            Moves you forward. Without any limits holding you back. The T-Hybrid technology was derived directly from motorsport and combines the emotional sound of a six-cylinder flat engine with the acceleration of a fully electric sports car.
                        </p>
                        <SpecCard
                            icon="🔥"
                            title="Twin-Turbo Excellence"
                            desc="3.8L twin-turbo flat-six delivers 650 PS for devastating performance."
                            delay="0ms"
                        />
                        <SpecCard
                            icon="🏎️"
                            title="Porsche Traction Management"
                            desc="Active all-wheel drive ensuring maximum grip in every driving situation."
                            delay="200ms"
                        />
                        <SpecCard
                            icon="👑"
                            title="Everyday Usability"
                            desc="Hypercar performance wrapped in a luxurious, comfortable grand tourer."
                            delay="400ms"
                        />
                        <div className="flex gap-10 justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">650<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">PS</span></div>
                                <div className="text-[9px] text-amber-100/50 font-bold tracking-[0.3em] uppercase mt-1">Power</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">800<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">Nm</span></div>
                                <div className="text-[9px] text-amber-100/50 font-bold tracking-[0.3em] uppercase mt-1">Torque</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── EVERYDAY GT ─── */}
                <section id="section-drs" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">02 · Everyday GT</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            The supercar<br />you drive <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">daily.</span>
                        </h2>
                        <p className="text-amber-50/70 text-sm leading-relaxed mb-6 font-medium">
                            Porsche Traction Management with active all-wheel drive. Front and rear luggage compartments. 
                            14-way adaptive Sport Seats Plus with memory. Drive 650 PS to the office, the mountains, or the track — 
                            rain or shine, 365 days a year.
                        </p>
                        <div className="flex gap-6 flex-wrap">
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">AWD</div>
                                <div className="text-[8px] text-amber-100/50 font-bold tracking-[0.2em] uppercase mt-1">All-Weather</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">128<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent text-xs ml-1">L</span></div>
                                <div className="text-[8px] text-amber-100/50 font-bold tracking-[0.2em] uppercase mt-1">Front Trunk</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">LED</div>
                                <div className="text-[8px] text-amber-100/50 font-bold tracking-[0.2em] uppercase mt-1">Matrix Lights</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section id="section-stats" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-center px-8 pointer-events-none">
                    <div className="reveal w-full max-w-4xl pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase mb-14 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">03 · Performance</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <AnimatedStat value="650" suffix=" PS" label="Twin-Turbo Flat-Six" delay={0.2} />
                            <AnimatedStat value="2.5" suffix=" s" label="0-100 km/h" delay={0.4} />
                            <AnimatedStat value="330" suffix=" km/h" label="Top Speed" delay={0.6} />
                        </div>

                    </div>
                </section>

                {/* ─── CENTRAL RADIATOR ─── */}
                <section id="section-radiator" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">04 · Transmission</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            8-Speed PDK.<br />
                            <span className="text-cyan-100/40">Lightning fast.</span>
                        </h2>
                        <p className="text-amber-50/70 text-sm leading-relaxed font-medium">
                            The completely re-developed 8-speed Porsche Doppelkupplung (PDK) allows extremely fast gear changes without an interruption in traction – in a matter of milliseconds. Combined with the Sport Chrono Package for dynamic performance.
                        </p>
                    </div>
                </section>

                {/* ─── AIRBRAKE ─── */}
                <section id="section-brakes" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">05 · Braking</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Porsche Ceramic<br />
                            <span className="text-cyan-100/40">Composite Brakes.</span>
                        </h2>
                        <p className="text-amber-50/70 text-sm leading-relaxed mb-8 font-medium">
                            Standard on the Turbo S, the PCCB system features massive ceramic brake discs and aluminum monobloc fixed brake calipers for ultimate stopping power and fade resistance.
                        </p>
                        <div className="flex gap-6">
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">420<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-amber-100/50 font-bold tracking-[0.2em] uppercase mt-1">Front 10-Piston</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">390<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-amber-100/50 font-bold tracking-[0.2em] uppercase mt-1">Rear 4-Piston</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── COCKPIT ─── */}
                <section id="section-cockpit" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-lg pointer-events-auto relative z-10 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">06 · Interior</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Luxury<br />meets performance.
                        </h2>
                        <p className="text-amber-50/70 text-sm leading-relaxed max-w-sm font-medium ml-auto">
                            Uncompromising sportiness combined with high comfort and exclusive feel. Features two-tone leather interior with contrasting stitching and adaptive sports seats Plus (18-way).
                        </p>
                    </div>
                </section>

                {/* ─── VERTICAL SPECS SIDEBAR ─── */}
                <section id="section-specs" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="w-[350px] pointer-events-auto">
                        <p className="reveal text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-right bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent opacity-0 translate-y-10 transition-all duration-1000 delay-[500ms] ease-out">Turbo S Specs</p>
                        <SpecCard delay="700ms" icon="⚙" title="PDK 8-Speed" desc="Double-clutch gearbox. Gear changes in milliseconds without interrupting traction." />
                        <SpecCard delay="900ms" icon="⚡" title="Sport Chrono" desc="Integrated Sport Chrono Package with dynamic transmission mounts." />
                        <SpecCard delay="1100ms" icon="△" title="Active Aero" desc="Pneumatically extendible front spoiler and variable rear wing." />
                        <SpecCard delay="1300ms" icon="◎" title="PCCB Brakes" desc="Ceramic composite brakes for exceptional stopping power." />
                        <SpecCard delay="1500ms" icon="▷" title="Lighting" desc="LED main headlights with matrix technology." />
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section id="section-cta" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-6 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">Starting at INR 3,82,49,000</p>
                        <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tight text-white drop-shadow-xl"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            Build yours.
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                            <button className="text-slate-900 px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             transition-all duration-300 shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] hover:scale-105 rounded-full"
                                style={{ background: 'linear-gradient(135deg, #22d3ee, #10b981)' }}>
                                Configure
                            </button>
                            <Link to="/models/911 turbo s/details" className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full flex items-center justify-center"
                                style={{ border: '2px solid rgba(245, 158, 11, 0.5)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
                                Know More
                            </Link>
                            <button className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full"
                                style={{ border: '2px solid rgba(245, 158, 11, 0.2)', background: 'transparent' }}>
                                Test Drive
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
