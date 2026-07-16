import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import CayenneViewer3D from '../components/CayenneViewer3D';
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
            <div className="text-4xl md:text-6xl font-black tabular-nums tracking-tight text-white whitespace-nowrap">
                {count}<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{suffix}</span>
            </div>
            <div className="text-[10px] md:text-xs text-slate-100/60 uppercase tracking-[0.25em] mt-3 font-semibold">
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
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderLeft: '3px solid rgba(148, 163, 184, 0.5)',
                transitionDuration: '1000ms',
                transitionDelay: delay
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.6)';
                e.currentTarget.style.borderLeft = '3px solid rgba(148, 163, 184, 1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(148, 163, 184, 0.2)';
                e.currentTarget.style.transform = 'scale(1.02) translateX(10px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.borderLeft = '3px solid rgba(148, 163, 184, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'scale(1) translateX(0px)';
            }}>
            <div className="flex items-center gap-4 mb-2">
                <div className="text-xl text-slate-400/50 group-hover:text-slate-300 transition-colors duration-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">{icon}</div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider m-0 group-hover:text-slate-50 transition-colors duration-300">{title}</h4>
            </div>
            <p className="text-slate-100/50 text-xs leading-relaxed font-medium m-0 group-hover:text-slate-100/80 transition-colors duration-300">{desc}</p>
        </div>
    );
}

export default function Cayenne_3D() {
    const mainRef = useRef(null);
    const interiorPhotoRef = useRef(null);

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
                <CayenneViewer3D />
            </div>

            {/* ═══ Atmospheric Background — Sunset Warmth ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
                style={{
                    background: `
                         radial-gradient(ellipse 100% 80% at 50% 90%, rgba(180, 80, 30, 0.25) 0%, transparent 60%),
                         radial-gradient(ellipse 80% 60% at 20% 50%, rgba(210, 110, 40, 0.15) 0%, transparent 55%),
                         radial-gradient(ellipse 60% 40% at 80% 30%, rgba(250, 160, 60, 0.10) 0%, transparent 50%),
                         linear-gradient(180deg, #1f0b02 0%, #291206 35%, #1a0802 65%, #0f0401 100%)
                     `
                }}
            />

            {/* ═══ Thematic SVG Overlay — Mountain Range ═══ */}
            <div className="fixed bottom-0 left-0 w-full z-[1] pointer-events-none" style={{ opacity: 0.05 }}>
                <svg viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="xMidYMax meet">
                    <path d="M0 300 L0 220 L80 180 L140 200 L200 120 L260 160 L320 80 L380 130 L440 60 L500 110 L540 40 L580 90 L640 50 L700 100 L750 30 L800 80 L860 55 L920 110 L980 70 L1040 130 L1100 90 L1140 140 L1200 100 L1260 160 L1320 120 L1380 180 L1440 150 L1440 300 Z" fill="#b45309" />
                    <path d="M0 300 L0 250 L120 210 L200 230 L300 170 L380 200 L460 140 L540 180 L620 120 L700 160 L780 100 L860 150 L940 110 L1020 170 L1100 130 L1180 190 L1260 150 L1340 200 L1440 180 L1440 300 Z" fill="#78350f" opacity="0.6" />
                </svg>
            </div>

            {/* ═══ Scrollable Container (Snap Mandatory) ═══ */}
            <div id="scroll-container" className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">

                {/* ─── HERO ─── */}
                <section id="section-hero" className="h-screen w-full snap-center flex flex-col justify-center items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto max-w-lg opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]">
                            Cayenne Turbo GT
                        </p>
                        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] uppercase leading-[0.85] tracking-tight text-white drop-shadow-2xl whitespace-nowrap"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            Turbo GT
                        </h1>
                        <div className="w-12 h-[1px] ml-auto mt-8 mb-4" style={{ background: 'linear-gradient(to left, transparent, rgba(45,212,191,0.8), transparent)', boxShadow: '0 0 10px rgba(45,212,191,0.5)' }} />
                        <p className="reveal opacity-0 translate-y-10 text-sm md:text-base text-cyan-50 max-w-lg font-light tracking-wide drop-shadow-md leading-relaxed mt-4">
                            School run at 8. Nürburgring at 9.
                        </p>
                    </div>
                </section>

                {/* ─── ENGINE ─── */}
                <section id="section-powertrain" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">01 · Powertrain</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            4.0L V8.<br />
                            <span className="text-cyan-100/40">Twin-Turbo.</span>
                        </h2>
                        <p className="text-slate-50/70 text-sm leading-relaxed mb-8 font-medium">
                            The heart of a supercar in the body of an SUV. Extensively re-engineered internal components deliver blistering acceleration and a top track speed of 300 km/h.
                        </p>
                        <div className="flex gap-10 justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">640<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">hp</span></div>
                                <div className="text-[9px] text-slate-100/50 font-bold tracking-[0.3em] uppercase mt-1">Power</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">850<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">Nm</span></div>
                                <div className="text-[9px] text-slate-100/50 font-bold tracking-[0.3em] uppercase mt-1">Torque</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── COCKPIT ─── */}
                <section id="section-cockpit" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-lg pointer-events-auto relative z-10 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-slate-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">02 · Cockpit</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Race-Tex<br />environment.
                        </h2>
                        <p className="text-slate-50/70 text-sm leading-relaxed max-w-sm font-medium ml-auto">
                            The cabin is focused heavily on performance. Alcantara Race-Tex materials cover the interior, while the standard Sport Chrono package puts the mode switch right on the GT steering wheel.
                        </p>
                    </div>
                </section>

                {/* ─── EXHAUST ─── */}
                <section id="section-radiator" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">03 · Exhaust System</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Titanium<br />
                            <span className="text-cyan-100/40">Sports Exhaust.</span>
                        </h2>
                        <p className="text-slate-50/70 text-sm leading-relaxed font-medium">
                            A bespoke, center-exit titanium exhaust system specifically designed for the Turbo GT. It saves significant weight and delivers an unfiltered, highly emotional V8 soundtrack.
                        </p>
                    </div>
                </section>

                {/* ─── BRAKES ─── */}
                <section id="section-brakes" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">04 · Braking</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Track-level<br />
                            <span className="text-cyan-100/40">stopping power.</span>
                        </h2>
                        <p className="text-slate-50/70 text-sm leading-relaxed mb-8 font-medium">
                            Equipped with standard Porsche Ceramic Composite Brakes (PCCB). Designed to consistently tame the immense momentum of a super-SUV, providing fade-free braking lap after lap.
                        </p>
                        <div className="flex gap-6">
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-slate-400/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">440<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-slate-100/50 font-bold tracking-[0.2em] uppercase mt-1">Front PCCB Rotors</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-slate-400/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">410<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-slate-100/50 font-bold tracking-[0.2em] uppercase mt-1">Rear PCCB Rotors</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FAMILY & SPORT ─── */}
                <section id="section-family" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">05 · Family & Sport</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Five seats.<br />
                            <span className="text-cyan-100/40">Nürburgring record.</span>
                        </h2>
                        <p className="text-slate-50/70 text-sm leading-relaxed mb-6 font-medium">
                            7:38.9 around the Nordschleife — the fastest SUV lap ever recorded.
                            Then fold down the rear seats, load 770 litres of luggage, and drive the family to the Alps.
                            Panoramic roof. Bose® Surround Sound. Heated rear seats. This is a Porsche that carries everything.
                        </p>
                        <div className="flex gap-6 flex-wrap">
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-slate-400/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">7:38<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent text-xs ml-1">.9</span></div>
                                <div className="text-[8px] text-slate-100/50 font-bold tracking-[0.2em] uppercase mt-1">Nürburgring SUV Record</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-slate-400/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">770<span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent text-xs ml-1">L</span></div>
                                <div className="text-[8px] text-slate-100/50 font-bold tracking-[0.2em] uppercase mt-1">Cargo Volume</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-slate-400/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">5</div>
                                <div className="text-[8px] text-slate-100/50 font-bold tracking-[0.2em] uppercase mt-1">Full-Size Seats</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section id="section-stats" className="h-screen w-full snap-center flex flex-col justify-start pt-[8vh] items-center px-8 pointer-events-none">
                    <div className="reveal w-full max-w-4xl pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase mb-14 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">06 · Performance</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <AnimatedStat value="640" suffix=" hp" label="Biturbo V8 Engine" delay={0.2} />
                            <AnimatedStat value="3.3" suffix=" s" label="0-100 km/h" delay={0.4} />
                            <AnimatedStat value="300" suffix=" km/h" label="Top Speed" delay={0.6} />
                        </div>
                    </div>
                </section>

                {/* ─── VERTICAL SPECS SIDEBAR ─── */}
                <section id="section-specs" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="w-[350px] pointer-events-auto">
                        <p className="reveal text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-right bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent opacity-0 translate-y-10 transition-all duration-1000 delay-[500ms] ease-out">07 · GT Specifics</p>
                        <SpecCard delay="700ms" icon="🏔️" title="Carbon Roof" desc="Lightweight carbon-fiber roof lowers the center of gravity." />
                        <SpecCard delay="900ms" icon="🏁" title="22-inch GT Wheels" desc="Neodymium-finished GT Design wheels with Pirelli P Zero Corsa tires." />
                        <SpecCard delay="1100ms" icon="💨" title="Carbon Diffuser" desc="Exclusive rear diffuser made entirely of exposed carbon fiber." />
                        <SpecCard delay="1300ms" icon="⚙" title="Torque Vectoring Plus" desc="Electronically controlled rear differential lock for maximum agility." />
                        <SpecCard delay="1500ms" icon="🛞" title="Rear-Axle Steering" desc="Standard rear-axle steering provides supercar-level turn-in." />
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section id="section-cta" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-6 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">Starting at $223,800</p>
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
                            <Link to="/models/cayenne/details" className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full flex items-center justify-center"
                                style={{ border: '2px solid rgba(148, 163, 184, 0.5)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
                                Know More
                            </Link>
                            <button className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full"
                                style={{ border: '2px solid rgba(148, 163, 184, 0.2)', background: 'transparent' }}>
                                Test Drive
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
