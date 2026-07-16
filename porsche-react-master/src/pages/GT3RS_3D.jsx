import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import ModelViewer3D from '../components/ModelViewer3D';
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
            <div className="text-4xl md:text-6xl font-black tabular-nums tracking-tight text-white">
                {count}<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{suffix}</span>
            </div>
            <div className="text-[10px] md:text-xs text-orange-100/60 uppercase tracking-[0.25em] mt-3 font-semibold">
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
                border: '1px solid rgba(255,107,0, 0.1)',
                borderLeft: '3px solid rgba(255,107,0, 0.5)',
                transitionDuration: '1000ms',
                transitionDelay: delay
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(255,107,0, 0.6)';
                e.currentTarget.style.borderLeft = '3px solid rgba(255,107,0, 1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,107,0, 0.2)';
                e.currentTarget.style.transform = 'scale(1.02) translateX(10px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,107,0, 0.1)';
                e.currentTarget.style.borderLeft = '3px solid rgba(255,107,0, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'scale(1) translateX(0px)';
            }}>
            <div className="flex items-center gap-4 mb-2">
                <div className="text-xl text-orange-500/50 group-hover:text-orange-400 transition-colors duration-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">{icon}</div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider m-0 group-hover:text-orange-50 transition-colors duration-300">{title}</h4>
            </div>
            <p className="text-orange-100/50 text-xs leading-relaxed font-medium m-0 group-hover:text-orange-100/80 transition-colors duration-300">{desc}</p>
        </div>
    );
}

export default function GT3RS_3D() {
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
                <ModelViewer3D />
            </div>

            {/* ═══ Atmospheric Background — Track Heat ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
                style={{
                    background: `
                         radial-gradient(ellipse 120% 80% at 30% 70%, rgba(180, 60, 0, 0.25) 0%, transparent 55%),
                         radial-gradient(ellipse 100% 60% at 70% 30%, rgba(255, 107, 0, 0.12) 0%, transparent 50%),
                         radial-gradient(ellipse 80% 100% at 50% 100%, rgba(120, 30, 0, 0.20) 0%, transparent 60%),
                         linear-gradient(175deg, #0a0500 0%, #1a0800 30%, #0d0200 60%, #050100 100%)
                     `
                }}
            />

            {/* ═══ Thematic SVG Overlay — Nürburgring Track Layout ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none flex items-center justify-start pl-[5%]" style={{ opacity: 0.04 }}>
                <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-auto max-h-[80vh]">
                    <path d="M 120 450 C 100 400, 80 350, 90 300 C 100 250, 130 220, 160 200 C 190 180, 210 160, 200 130 C 190 100, 170 80, 180 55 C 190 30, 230 20, 270 30 C 310 40, 340 70, 370 80 C 400 90, 420 75, 450 60 C 480 45, 510 40, 540 55 C 570 70, 580 100, 590 130 C 600 160, 620 180, 650 190 C 680 200, 710 195, 730 210 C 750 225, 755 260, 740 290 C 725 320, 700 340, 690 370 C 680 400, 690 430, 680 460 C 670 490, 640 510, 610 520 C 580 530, 550 525, 520 530 C 490 535, 470 545, 440 540 C 410 535, 390 520, 360 510 C 330 500, 300 500, 270 505 C 240 510, 210 520, 180 510 C 150 500, 140 480, 120 450 Z" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" />
                    {/* Start/Finish marker */}
                    <circle cx="120" cy="450" r="6" fill="#ff6b00" />
                    <text x="130" y="475" fill="#ff6b00" fontSize="11" fontFamily="system-ui" fontWeight="700" letterSpacing="0.15em">START / FINISH</text>
                </svg>
            </div>

            {/* ═══ Scrollable Container (Snap Mandatory) ═══ */}
            <div id="scroll-container" className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">

                {/* ─── HERO ─── */}
                <section id="section-hero" className="h-screen w-full snap-center flex flex-col justify-center items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto max-w-lg opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]">
                            Porsche 911 GT3 RS · 992
                        </p>
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] uppercase leading-[0.85] tracking-tight text-white drop-shadow-2xl"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            GT3 RS
                        </h1>
                        <div className="w-12 h-[1px] ml-auto mt-8 mb-4" style={{ background: 'linear-gradient(to left, transparent, rgba(45,212,191,0.8), transparent)', boxShadow: '0 0 10px rgba(45,212,191,0.5)' }} />
                        <p className="text-orange-50/70 text-sm md:text-base leading-relaxed font-medium">
                            Born on the Nürburgring. Legal on the road. Barely.
                        </p>
                    </div>
                </section>

                {/* ─── ENGINE ─── */}
                <section id="section-powertrain" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">01 · Powertrain</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            4.0L Flat-Six.<br />
                            <span className="text-cyan-100/40">No turbos.</span>
                        </h2>
                        <p className="text-orange-50/70 text-sm leading-relaxed mb-8 font-medium">
                            Derived from the Le Mans-winning 911 RSR, this naturally aspirated engine
                            screams to 9,000 RPM. 518 horsepower with zero lag.
                        </p>
                        <div className="flex gap-10 justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">518<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">hp</span></div>
                                <div className="text-[9px] text-orange-100/50 font-bold tracking-[0.3em] uppercase mt-1">Power</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">9,000<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">rpm</span></div>
                                <div className="text-[9px] text-orange-100/50 font-bold tracking-[0.3em] uppercase mt-1">Redline</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── DRS ─── */}
                <section id="section-drs" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">02 · Active Aerodynamics</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            First production Porsche<br />with <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">DRS.</span>
                        </h2>
                        <p className="text-orange-50/70 text-sm leading-relaxed mb-6 font-medium">
                            At the push of a button, the two-part rear wing flattens to cut drag on straights.
                            Under braking, it snaps to maximum attack — an airbrake that supplements carbon-ceramic discs.
                            Adjustments happen in milliseconds.
                        </p>
                        <div className="pl-5 border-l-2 border-cyan-500/50" style={{ boxShadow: '-2px 0 10px rgba(255,107,0, 0.2)' }}>
                            <p className="text-orange-100/60 text-xs italic leading-relaxed font-semibold">
                                "860 kg of downforce at 285 km/h — the weight of a Smart car
                                pushing you into the tarmac."
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section id="section-stats" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-center px-8 pointer-events-none">
                    <div className="reveal w-full max-w-4xl pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase mb-14 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">03 · Performance</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            <AnimatedStat value="518" suffix="hp" label="Power" delay={0} />
                            <AnimatedStat value="860" suffix="kg" label="Downforce" delay={0.1} />
                            <AnimatedStat value="3" suffix=".2s" label="0–100 km/h" delay={0.2} />
                            <AnimatedStat value="296" suffix="" label="Top Speed km/h" delay={0.3} />
                        </div>
                        <div className="w-full h-[1px] mt-14" style={{ background: 'linear-gradient(to right, transparent, rgba(45,212,191,0.3), transparent)' }} />
                    </div>
                </section>

                {/* ─── CENTRAL RADIATOR ─── */}
                <section id="section-radiator" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">04 · Cooling</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Central Radiator.<br />
                            <span className="text-cyan-100/40">No trunk.</span>
                        </h2>
                        <p className="text-orange-50/70 text-sm leading-relaxed font-medium">
                            Where the luggage compartment used to be sits a massive angled radiator —
                            borrowed from the 911 RSR. The freed-up sides now channel air through
                            sculpted sideblades and active aero elements.
                        </p>
                    </div>
                </section>

                {/* ─── AIRBRAKE ─── */}
                <section id="section-brakes" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">05 · Braking</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            The wing becomes<br />
                            <span className="text-cyan-100/40">a brake.</span>
                        </h2>
                        <p className="text-orange-50/70 text-sm leading-relaxed mb-8 font-medium">
                            During emergency braking, front and rear wing elements snap to maximum angle of attack.
                            Aerodynamic drag supplements the carbon-ceramic brakes at speeds where friction alone isn't enough.
                        </p>
                        <div className="flex gap-6">
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-orange-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">410<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-orange-100/50 font-bold tracking-[0.2em] uppercase mt-1">Front Rotors</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(45,212,191,0.1)] bg-slate-900/50 border border-orange-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">390<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent text-xs ml-1 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">mm</span></div>
                                <div className="text-[8px] text-orange-100/50 font-bold tracking-[0.2em] uppercase mt-1">Rear Rotors</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── COCKPIT ─── */}
                <section id="section-cockpit" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-lg pointer-events-auto relative z-10 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-orange-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">06 · Cockpit</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Race-spec<br />steering wheel.
                        </h2>
                        <p className="text-orange-50/70 text-sm leading-relaxed max-w-sm font-medium ml-auto">
                            Compression, rebound, differential — all adjustable from the wheel,
                            mid-corner. Derived from the 911 GT3 Cup.
                        </p>
                    </div>
                </section>

                {/* ─── VERTICAL SPECS SIDEBAR ─── */}
                <section id="section-specs" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="w-[350px] pointer-events-auto">
                        <p className="reveal text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-right bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent opacity-0 translate-y-10 transition-all duration-1000 delay-[500ms] ease-out">Race Specs</p>
                        <SpecCard delay="700ms" icon="⚙" title="PDK 7-Speed" desc="Double-clutch gearbox with motorsport shift logic. Gear changes in milliseconds." />
                        <SpecCard delay="900ms" icon="◊" title="1,450 kg" desc="CFRP doors, roof, bonnet, and front wings. Every gram was interrogated." />
                        <SpecCard delay="1100ms" icon="△" title="Teardrop Links" desc="Suspension links with aerodynamic profiles that generate downforce." />
                        <SpecCard delay="1300ms" icon="○" title="Central Radiator" desc="Where the trunk was, now sits a radiator from Le Mans." />
                        <SpecCard delay="1500ms" icon="▷" title="Active Sideblades" desc="Continuously adjustable elements manage wheel-arch pressure." />
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
                            <Link to="/models/gt3rs/details" className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full flex items-center justify-center"
                                style={{ border: '2px solid rgba(255,107,0, 0.5)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
                                Know More
                            </Link>
                            <button className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full"
                                style={{ border: '2px solid rgba(255,107,0, 0.2)', background: 'transparent' }}>
                                Test Drive
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
