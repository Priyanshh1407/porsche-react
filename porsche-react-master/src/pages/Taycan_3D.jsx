import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import TaycanViewer3D from '../components/TaycanViewer3D';
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
        <div ref={ref} className="text-center flex flex-col items-center">
            <div className="flex items-baseline justify-center whitespace-nowrap">
                <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tight text-white">{count}</span>
                <span className="text-3xl md:text-5xl ml-2 font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{suffix}</span>
            </div>
            <div className="text-[10px] md:text-xs text-cyan-100/60 uppercase tracking-[0.25em] mt-3 font-semibold text-center w-full max-w-[200px] leading-relaxed">
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
                border: '1px solid rgba(45, 212, 191, 0.1)',
                borderLeft: '3px solid rgba(45, 212, 191, 0.5)',
                transitionDuration: '1000ms',
                transitionDelay: delay
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(45, 212, 191, 0.6)';
                e.currentTarget.style.borderLeft = '3px solid rgba(45, 212, 191, 1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(45, 212, 191, 0.2)';
                e.currentTarget.style.transform = 'scale(1.02) translateX(10px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(45, 212, 191, 0.1)';
                e.currentTarget.style.borderLeft = '3px solid rgba(45, 212, 191, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.8)';
                e.currentTarget.style.transform = 'scale(1) translateX(0px)';
            }}>
            <div className="flex items-center gap-4 mb-2">
                <div className="text-xl text-cyan-500/50 group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">{icon}</div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider m-0 group-hover:text-cyan-50 transition-colors duration-300">{title}</h4>
            </div>
            <p className="text-cyan-100/50 text-xs leading-relaxed font-medium m-0 group-hover:text-cyan-100/80 transition-colors duration-300">{desc}</p>
        </div>
    );
}

export default function Taycan_3D() {
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
                <TaycanViewer3D />
            </div>

            {/* ═══ Atmospheric Background — Electric Storm ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
                style={{
                    background: `
                         radial-gradient(ellipse 100% 70% at 40% 80%, rgba(139, 92, 246, 0.20) 0%, transparent 55%),
                         radial-gradient(ellipse 80% 50% at 70% 40%, rgba(45, 212, 191, 0.12) 0%, transparent 50%),
                         radial-gradient(ellipse 120% 60% at 60% 100%, rgba(88, 28, 135, 0.25) 0%, transparent 55%),
                         linear-gradient(170deg, #030712 0%, #0c0520 30%, #050215 60%, #020617 100%)
                     `
                }}
            />

            {/* ═══ Thematic SVG Overlay — EKG Flatline (Silent Killer) ═══ */}
            <div className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none flex items-center" style={{ opacity: 0.05 }}>
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="xMidYMid meet">
                    <path d="M0 50 H400 L420 50 L430 20 L440 80 L450 10 L460 90 L470 50 H600 L610 50 L615 35 L620 65 L625 50 H900 L920 50 L930 15 L940 85 L950 5 L960 95 L970 50 H1200 L1210 50 L1215 40 L1220 60 L1225 50 H1440" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
                </svg>
            </div>

            {/* ═══ Scrollable Container (Snap Mandatory) ═══ */}
            <div id="scroll-container" className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">

                {/* ─── HERO ─── */}
                <section id="section-hero" className="h-screen w-full snap-center flex flex-col justify-center items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal pointer-events-auto max-w-lg opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-cyan-400 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]">
                            Taycan Turbo GT
                        </p>
                        <h1 className="text-5xl md:text-7xl lg:text-[7rem] leading-[0.85] tracking-tight text-white drop-shadow-2xl"
                            style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                            <span className="lowercase tracking-normal mr-3">turbo</span><span className="uppercase">GT</span>
                        </h1>
                        <div className="w-12 h-[1px] ml-auto mt-8 mb-4" style={{ background: 'linear-gradient(to left, transparent, rgba(45,212,191,0.8), transparent)', boxShadow: '0 0 10px rgba(45,212,191,0.5)' }} />
                        <p className="text-cyan-50/70 text-sm md:text-base leading-relaxed font-medium">
                            0 emissions. 0–100 in 2.2s. Zero compromise.
                        </p>
                    </div>
                </section>

                {/* ─── INSTANT TORQUE ─── */}
                <section id="section-powertrain" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">01 · Instant Torque</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            No revs.<br />
                            <span className="text-cyan-100/40">No warning.</span>
                        </h2>
                        <p className="text-cyan-50/70 text-sm leading-relaxed mb-8 font-medium">
                            1,340 Nm of torque. All of it. Instantly. No turbo lag, no gear changes, no engine note to warn them. 
                            You hear nothing. The world behind you becomes a blur. This is what silent violence feels like.
                        </p>
                        <div className="flex gap-10 justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">1,108<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">PS</span></div>
                                <div className="text-[9px] text-cyan-100/50 font-bold tracking-[0.3em] uppercase mt-1">Silent Power</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">1,340<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] text-sm ml-1">Nm</span></div>
                                <div className="text-[9px] text-cyan-100/50 font-bold tracking-[0.3em] uppercase mt-1">Instant Torque</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── DRS ─── */}
                <section id="section-drs" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">02 · Weissach Package</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Stripped for the<br /><span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">track.</span>
                        </h2>
                        <p className="text-cyan-50/70 text-sm leading-relaxed mb-6 font-medium">
                            Removing the rear seats saves 70 kg. The fixed carbon-fibre rear wing delivers up to 220 kg of downforce, optimizing aerodynamics and shaving seconds off your lap time.
                        </p>
                        <div className="pl-5 border-l-2 border-cyan-500/50" style={{ boxShadow: '-2px 0 10px rgba(45, 212, 191, 0.2)' }}>
                            <p className="text-cyan-100/60 text-xs italic leading-relaxed font-semibold">
                                "The Taycan Turbo GT with Weissach Package is the fastest electric series-production car at the Nürburgring Nordschleife."
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section id="section-stats" className="h-screen w-full snap-center flex flex-col justify-start pt-[15vh] items-center px-8 pointer-events-none">
                    <div className="reveal w-full max-w-4xl pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase mb-14 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">03 · Performance</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl mx-auto">
                            <AnimatedStat value="1108" suffix="PS" label="Max Power with Launch Control" delay={0.2} />
                            <AnimatedStat value="2.2" suffix="s" label="0-100 km/h" delay={0.4} />
                            <AnimatedStat value="305" suffix="km/h" label="Top Speed" delay={0.6} />
                        </div>
                    </div>
                </section>

                {/* ─── CHARGING & RANGE ─── */}
                <section id="section-radiator" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md text-right pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">04 · Charging & Range</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                            <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">800V.</span><br />
                            <span className="text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">22 minutes.</span>
                        </h2>
                        <p className="text-cyan-50/90 text-sm leading-relaxed mb-6 font-medium bg-black/40 p-5 rounded-2xl backdrop-blur-sm border border-cyan-500/20 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
                            The 800-volt architecture charges from 10% to 80% in just 22 minutes at 320 kW DC. 
                            Up to 630 km of range (WLTP) means you can drive across countries, not just around tracks. 
                            Plug in. Coffee. Go.
                        </p>
                        <div className="flex gap-6 justify-end flex-wrap">
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-cyan-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">800<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-xs ml-1">V</span></div>
                                <div className="text-[8px] text-cyan-100/50 font-bold tracking-[0.2em] uppercase mt-1">Architecture</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-cyan-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">320<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-xs ml-1">kW</span></div>
                                <div className="text-[8px] text-cyan-100/50 font-bold tracking-[0.2em] uppercase mt-1">Peak Charging</div>
                            </div>
                            <div className="rounded-xl px-5 py-3 bg-slate-900/50 border border-cyan-500/20 backdrop-blur-md">
                                <div className="text-lg font-black text-white">630<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-xs ml-1">km</span></div>
                                <div className="text-[8px] text-cyan-100/50 font-bold tracking-[0.2em] uppercase mt-1">WLTP Range</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── LAUNCH CONTROL ─── */}
                <section id="section-brakes" className="h-screen w-full snap-center flex flex-col justify-center items-start px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-md pointer-events-auto opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">05 · Launch Control</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Hold the brake.<br />
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">Floor it.</span>
                        </h2>
                        <p className="text-cyan-50/70 text-sm leading-relaxed mb-8 font-medium">
                            Left foot on the brake. Right foot buried. The system pre-loads 1,340 Nm across all four wheels. 
                            Release the brake and 2.2 seconds later you're at 100 km/h. No wheelspin. No drama. 
                            Just physics obeying electricity.
                        </p>
                        <div className="pl-5 border-l-2 border-purple-500/50" style={{ boxShadow: '-2px 0 10px rgba(139, 92, 246, 0.2)' }}>
                            <p className="text-cyan-100/60 text-xs italic leading-relaxed font-semibold">
                                "The silence makes it violent. You don't hear it coming — you only see it leaving."
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── COCKPIT ─── */}
                <section id="section-cockpit" className="h-screen w-full snap-center flex flex-col justify-start pt-12 md:pt-16 items-end text-right px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="reveal max-w-lg pointer-events-auto relative z-10 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 translate-y-10 transition-all duration-[1500ms] delay-[800ms] ease-out">
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">06 · Cockpit</p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tight text-white">
                            Focused<br />interior.
                        </h2>
                        <p className="text-cyan-50/70 text-sm leading-relaxed max-w-sm font-medium ml-auto">
                            Full bucket seats in Race-Tex and carbon weave. No rear seats in the Weissach Package. A digital cockpit designed purely for high-speed engagement.
                        </p>
                    </div>
                </section>

                {/* ─── VERTICAL SPECS SIDEBAR ─── */}
                <section id="section-specs" className="h-screen w-full snap-center flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 pointer-events-none">
                    <div className="w-[350px] pointer-events-auto">
                        <p className="reveal text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-right bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent opacity-0 translate-y-10 transition-all duration-1000 delay-[500ms] ease-out">Turbo GT Specs</p>
                        <SpecCard delay="700ms" icon="⚡" title="815 kW Pulse Inverter" desc="More efficient silicon carbide (SiC) semiconductors deliver extreme power to the rear motor." />
                        <SpecCard delay="900ms" icon="⚖" title="-75 kg Weight" desc="Lighter than a Taycan Turbo S thanks to extensive carbon fibre and removal of rear seats." />
                        <SpecCard delay="1100ms" icon="🛡" title="Carbon Aeroblades" desc="Exclusive front spoiler with aeroblades and fixed rear wing for maximum downforce." />
                        <SpecCard delay="1300ms" icon="🎯" title="Attack Mode" desc="120 kW boost activated instantly via the right steering wheel paddle." />
                        <SpecCard delay="1500ms" icon="🛑" title="PCCB Brakes" desc="Lightweight Porsche Ceramic Composite Brakes with exclusive Victory Gold calipers." />
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
                            <Link to="/models/taycan/details" className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full flex items-center justify-center"
                                style={{ border: '2px solid rgba(45, 212, 191, 0.5)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
                                Know More
                            </Link>
                            <button className="text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em]
                                             hover:text-cyan-400 transition-all duration-300 hover:scale-105 rounded-full"
                                style={{ border: '2px solid rgba(45, 212, 191, 0.2)', background: 'transparent' }}>
                                Test Drive
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
