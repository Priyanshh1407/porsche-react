import React from 'react';
import { Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';

const About = () => {
    const selectedTheme = carThemes.home;

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar theme={selectedTheme} />
            
            <div className="relative h-96 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=600&fit=crop&q=80"
                    alt="Porsche Heritage"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-8">
                        <h1 className="text-6xl font-light mb-4 animate-fade-in">About Porsche</h1>
                        <p className="text-xl text-gray-300 animate-fade-in-delay">Engineering dreams since 1931</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-light">Our Legacy</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Since Ferdinand Porsche founded our company in 1931, we have been driven by one unwavering mission:
                            to build extraordinary sports cars that deliver pure driving pleasure. From the legendary 356 to today's
                            revolutionary Taycan, we continue to push the boundaries of automotive engineering.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Our commitment to innovation, performance, and craftsmanship has made Porsche synonymous with
                            automotive excellence. Every vehicle we create embodies the perfect balance of tradition and innovation,
                            heritage and future-forward thinking.
                        </p>
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div className="text-center">
                                <div className="text-3xl font-light text-red-500 mb-2">90+</div>
                                <div className="text-gray-400">Years of Excellence</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-light text-red-500 mb-2">19</div>
                                <div className="text-gray-400">Le Mans Victories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-light text-red-500 mb-2">1M+</div>
                                <div className="text-gray-400">Cars Delivered</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80"
                            alt="Porsche Factory"
                            className="w-full rounded-lg shadow-2xl"
                        />
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-600 rounded-full flex items-center justify-center">
                            <Trophy className="w-16 h-16 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                
                .animate-fade-in-delay {
                    animation: fade-in 1s ease-out 0.3s both;
                }
            `}</style>

            <Footer theme={selectedTheme} />
        </div>
    );
};

export default About;