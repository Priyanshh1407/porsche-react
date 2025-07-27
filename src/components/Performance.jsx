import React from 'react';
import RollingNumberInView from './RollingNumberInView';

const Performance = ({ data, theme, image }) => {

    return (
        <section className={`bg-transparent text-white min-h-[400px] flex items-center justify-center p-4 pb-20`}>
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
                                className={`group hover:transform hover:-translate-y-1 transition-all duration-300 p-6 rounded-xl ${theme.cardBg} ${theme.cardBorder} border backdrop-blur-sm hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20`}
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
                                    <span className={`text-2xl font-light bg-gradient-to-r ${spec.color || theme.gradient} bg-clip-text text-transparent`}>
                                        {spec.unit}
                                    </span>
                                </div>
                                <p className={`${theme.textSecondary} text-sm uppercase tracking-wide font-medium`}>
                                    {spec.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Car image */}
                <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-2xl">
                        <div className="aspect-[4/3] rounded-2xl backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                            {/* Subtle grid pattern with theme colors */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div key={i} className={`border ${theme.cardBorder}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Car image */}
                            <div className="relative z-10 text-center">
                                <img src={image} alt='Porsche Cayenne' className="max-w-full h-auto filter drop-shadow-lg" />
                            </div>

                            {/* Theme-based highlight effects */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent`}></div>
                            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent`}></div>
                        </div>

                        {/* Theme-based floating elements */}
                        <div className={`absolute -top-4 -right-4 w-8 h-8 bg-emerald-400/20 rounded-full blur-sm animate-pulse`}></div>
                        <div className={`absolute -bottom-6 -left-6 w-12 h-12 bg-emerald-500/20 rounded-full blur-sm animate-pulse`} style={{animationDelay: '1s'}}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Performance;