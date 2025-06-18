import React from 'react';
import RollingNumberInView from './RollingNumberInView';
import performance from "../assets/gt3rs/performance .png";

const Performance = ({ data, theme, image }) => {

    return (
        <section className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-8">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Performance specs */}
                <div className="space-y-12">
                    <div className="relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.gradient} rounded-full`}></div>
                        <div className="pl-8">
                            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-6 text-white">
                                Performance Stats
                            </h1>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {data.map((spec, index) => (
                            <div
                                key={index}
                                className="group hover:transform hover:-translate-y-1 transition-all duration-300 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/40"
                            >
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-6xl font-light text-white">
                                        <RollingNumberInView
                                            target={parseFloat(spec.value)}
                                            decimals={spec.value.includes('.') ? 1 : 0}
                                            interval={60}
                                            baseDelay={400 + index * 200}
                                            stagger={120}
                                            jitter={150}
                                            threshold={0.2}
                                            triggerOnce={true}
                                        />
                                    </span>
                                    <span className={`text-2xl font-light bg-gradient-to-r ${spec.color} bg-clip-text text-transparent`}>
                                        {spec.unit}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm uppercase tracking-wide font-medium">
                                    {spec.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Car image placeholder */}
                <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-2xl">
                        {/* Car silhouette/placeholder */}
                        <div className="aspect-[4/3] rounded-2xl backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                            {/* Subtle grid pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div key={i} className="border border-slate-500/20"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Car icon */}
                            <div className="relative z-10 text-center">
                                <img src={image} alt='Porsche 911 GT3 RS front side' />
                            </div>

                            {/* Subtle highlight effects */}
                            {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div> */}
                        </div>

                        {/* Floating elements */}
                        {/* <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-orange-500/20 rounded-full blur-sm"></div> */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Performance;