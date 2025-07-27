import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Calendar, Trophy, Users, Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';

const Home = () => {
    const [activeHero, setActiveHero] = useState(0);
    const selectedTheme = carThemes.home;

    const heroSlides = [
        {
            title: "911 Turbo S",
            subtitle: "Unleash Excellence",
            description: "640 PS. 0-100 km/h in 2.7 seconds. Pure adrenaline.",
            image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&h=1080&fit=crop&q=80",
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80", // Added this line
            cta: "Discover 911"
        },
        {
            title: "Cayenne Turbo GT",
            subtitle: "Performance Redefined",
            description: "The fastest SUV on the Nürburgring. 631 PS of pure dominance.",
            image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=1920&h=1080&fit=crop&q=80",
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80", // Added this line
            cta: "Explore Cayenne"
        },
        {
            title: "Taycan Turbo S",
            subtitle: "Electric Soul",
            description: "761 PS of instant electric performance. The future is now.",
            image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1920&h=1080&fit=crop&q=80",
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80", // Added this line
            cta: "Go Electric"
        }
    ];

    const models = [
        {
            name: "911",
            description: "Iconic sports car with rear engine: 2 doors, 2+2 seats.",
            fuel: "Gasoline",
            image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/911.b68f913.svg",// Added this line
        },
        {
            name: "718",
            description: "Precise mid-engine sports car: 2 doors, 2 seats.",
            fuel: "Gasoline",
            image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/718.493a9e3.svg", // Added this line
        },
        {
            name: "Cayenne",
            description: "Performance SUV with versatile luxury: 4 doors, 5 seats.",
            fuel: "Hybrid Available",
            image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/cayenne.2556201.svg", // Added this line
        },
        {
            name: "Macan",
            description: "Compact sports SUV with agile handling: 4 doors, 5 seats.",
            fuel: "Electric Available",
            image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/macan.a1844f4.svg", // Added this line
        },
        {
            name: "Panamera",
            description: "Executive sedan with sports car soul: 4 doors, 4+1 seats.",
            fuel: "Hybrid Available",
            image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/panamera.6dae809.svg" // Added this line
        },
        {
            name: "Taycan",
            description: "Pure electric performance sedan: 4 doors, 4+1 seats.",
            fuel: "Electric",
            image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&h=400&fit=crop&q=80",
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/taycan.df444c6.svg" // Added this line
        }
    ];

    const motorsportAchievements = [
        { year: "2023", title: "Le Mans Victory", description: "963 LMDh dominates endurance racing" },
        { year: "2022", title: "Formula E Championship", description: "Taycan powers electric racing success" },
        { year: "2021", title: "GT3 Cup", description: "Global one-make series excellence" },
        { year: "1970-1998", title: "Le Mans Legend", description: "19 overall victories at Circuit de la Sarthe" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHero((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Navbar theme={selectedTheme}/>
            {/* Hero Section with Slideshow */}
            <section className="relative h-screen">
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === activeHero ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </div>
                ))}

                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-8 w-full">
                        <div className="max-w-2xl">
                            <div className="mb-4">
                                <span className="text-red-500 text-sm font-medium tracking-wider uppercase animate-fade-in">
                                    {heroSlides[activeHero].subtitle}
                                </span>
                            </div>
                            <h1 className="text-7xl font-light mb-6 animate-slide-up">
                                {heroSlides[activeHero].title}
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 animate-fade-in-delay">
                                {heroSlides[activeHero].description}
                            </p>
                            <div className="flex gap-4">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2">
                                    {heroSlides[activeHero].cta} <ChevronRight className="w-4 h-4" />
                                </button>
                                <button className="border border-white/30 hover:border-white text-white px-8 py-3 rounded-full transition-all duration-300 hover:bg-white hover:text-black">
                                    Configure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Navigation Dots */}
                <div className="absolute bottom-8 left-8 flex gap-3">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveHero(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeHero ? 'bg-red-500 w-8' : 'bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Model Lineup */}
            <section className="py-24 bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-light mb-6">Our Models</h2>
                        <p className="text-gray-400 text-xl">Discover your perfect Porsche</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {models.map((model, index) => (
                            <div
                                key={model.name}
                                className="group cursor-pointer"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="relative h-96 overflow-hidden">
                                        <img
                                            src={model.image}
                                            alt={model.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                        {/* Model Logo Overlay - Centered */}
                                        <div className="absolute inset-0 flex items-start justify-center">
                                            <img
                                                src={model.logo}
                                                alt={model.name + " logo"}
                                                className="h-14 w-20 object-contain filter brightness-0 invert opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Fuel Type Badge - Bottom Left */}
                                        <div className="absolute bottom-20 left-6">
                                            <span className="bg-gray-700/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded border border-white/30">
                                                {model.fuel}
                                            </span>
                                        </div>

                                        {/* Description - Bottom Left */}
                                        <div className="absolute bottom-6 left-6 right-16">
                                            <p className="text-white text-lg font-light leading-relaxed">
                                                {model.description}
                                            </p>
                                        </div>

                                        {/* Arrow - Bottom Right */}
                                        <div className="absolute bottom-6 right-6">
                                            <div className="transition-all duration-300 group-hover:translate-x-1">
                                                <ChevronRight className="w-8 h-8 text-white stroke-[1.5]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Motorsport Legacy */}
            <section className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80&opacity=20"
                        alt="Racing"
                        className="w-full h-full object-cover opacity-10"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-light mb-6">Motorsport DNA</h2>
                        <p className="text-gray-400 text-xl max-w-3xl mx-auto">
                            Racing is in our blood. Every innovation on the track finds its way to the street,
                            creating the ultimate driving machines.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {motorsportAchievements.map((achievement, index) => (
                            <div
                                key={achievement.year}
                                className="group cursor-pointer"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="bg-black/50 rounded-lg p-6 transition-all duration-300 hover:bg-black/70 border border-gray-700/50 hover:border-red-500/50 backdrop-blur-sm">
                                    <div className="text-red-500 text-2xl font-light mb-3 group-hover:scale-110 transition-transform">
                                        {achievement.year}
                                    </div>
                                    <h3 className="text-xl font-medium mb-3 group-hover:text-red-400 transition-colors">
                                        {achievement.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {achievement.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
                            <Trophy className="w-4 h-4" />
                            Explore Racing Heritage
                        </button>
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section className="py-24 bg-black relative">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-5xl font-light">The Porsche Experience</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Owning a Porsche is more than driving a car—it's joining a legacy of excellence,
                                innovation, and pure passion for performance. Every detail is crafted with precision,
                                every drive delivers an emotional connection that transcends mere transportation.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-300">Personalized configuration options</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-300">Exclusive owner events and experiences</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-300">Track days and driving courses</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-300">Comprehensive warranty and service</span>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105">
                                    Schedule Test Drive
                                </button>
                                <button className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-full transition-all duration-300">
                                    Find Dealer
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80"
                                alt="Porsche Experience"
                                className="w-full rounded-lg shadow-2xl"
                            />
                            <div className="absolute -top-8 -left-8 w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                                <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.1s both;
        }

        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
      `}</style>
      <Footer theme={selectedTheme}/>
        </div>
    );
};

export default Home;