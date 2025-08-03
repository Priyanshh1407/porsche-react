import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Play, Calendar, Trophy, Crown, Target, Zap, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';
import logo918 from "../assets/home/918_logo.png";
import logo_carrera from "../assets/home/carrera_logo.png";
import hero1 from "../assets/home/hero1.jpeg";
import hero2 from "../assets/home/hero2.jpg";
import hero3 from "../assets/home/hero3.jpg";
import turbo911 from "../assets/home/911.webp";
import cayman718 from "../assets/home/718.avif";
import panamera from "../assets/home/panamera.avif";
import taycan from "../assets/home/taycan.avif";
import macan from "../assets/home/macan.avif";
import cayenne from "../assets/home/cayenne.avif";
import carreraGT from "../assets/home/carreraGT.jpg";
import spyder_918 from '../assets/home/Spyder918.webp';
import PorscheExperience from "../assets/home/PorscheExperience.avif";
import Motorsport from "../assets/home/Motorsport.jpg";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [activeHero, setActiveHero] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const selectedTheme = carThemes.home;
    const navigate = useNavigate();

    const heroSlides = [
        {
            title: "911 GT3 RS",
            subtitle: "Track-Bred Perfection",
            description: "518 PS. 0-100 km/h in 3.2 seconds. Pure racing DNA unleashed.",
            image: hero1,
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80",
            cta: "Experience GT3 RS",
            route: "/models/911 GT3 RS"
        },
        {
            title: "718 Cayman GT4 RS",
            subtitle: "Mid-Engine Mastery",
            description: "500 PS naturally aspirated fury. The ultimate driver's machine.",
            image: hero2,
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80",
            cta: "Drive GT4 RS",
            route: "/models/718 Cayman GT4"
        },
        {
            title: "Taycan",
            subtitle: "Electric Excellence",
            description: "402 PS of instant electric performance. Pure electric driving pleasure.",
            image: hero3,
            logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=100&fit=crop&q=80",
            cta: "Go Electric",
            route: "/models/Taycan"
        }
    ];

    const models = [
        {
            name: "Carrera GT",
            description: "Mid-engine supercar legend: 2 doors, 2 seats, 605 PS V10.",
            fuel: "Gasoline",
            image: carreraGT,
            logo: logo_carrera,
        },
        {
            name: "918 Spyder",
            description: "Hybrid hypercar masterpiece: 2 doors, 2 seats, 887 PS hybrid.",
            fuel: "Hybrid",
            image: spyder_918,
            logo: logo918,
        },
        {
            name: "911",
            description: "Iconic sports car with rear engine: 2 doors, 2+2 seats.",
            fuel: "Gasoline",
            image: turbo911,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/911.b68f913.svg",
            route: "/models/911 GT3 RS"
        },
        {
            name: "718",
            description: "Precise mid-engine sports car: 2 doors, 2 seats.",
            fuel: "Gasoline",
            image: cayman718,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/718.493a9e3.svg",
        },
        {
            name: "Cayenne",
            description: "Performance SUV with versatile luxury: 4 doors, 5 seats.",
            fuel: "Hybrid",
            image: cayenne,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/cayenne.2556201.svg",
        },
        {
            name: "Macan",
            description: "Compact sports SUV with agile handling: 4 doors, 5 seats.",
            fuel: "Electric",
            image: macan,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/macan.a1844f4.svg",
        },
        {
            name: "Panamera",
            description: "Executive sedan with sports car soul: 4 doors, 4+1 seats.",
            fuel: "Hybrid",
            image: panamera,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/panamera.6dae809.svg"
        },
        {
            name: "Taycan",
            description: "Pure electric performance sedan: 4 doors, 4+1 seats.",
            fuel: "Electric",
            image: taycan,
            logo: "https://cdn.ui.porsche.com/porsche-design-system/model-signatures/taycan.df444c6.svg"
        }
    ];

    const motorsportAchievements = [
        { year: "2023", title: "Le Mans Victory", description: "963 LMDh dominates endurance racing" },
        { year: "2022", title: "Formula E Championship", description: "Taycan powers electric racing success" },
        { year: "2021", title: "GT3 Cup", description: "Global one-make series excellence" },
        { year: "1970-1998", title: "Le Mans Legend", description: "19 overall victories at Circuit de la Sarthe" }
    ];

    const modelVariants = {
        "911": ["GT3 RS", "Turbo S", "GT2 RS"],
        "718": ["GT4 RS", "Boxster S"],
    };

    const modelRoutes = {
        "Carrera GT": "/models/Carrera GT",
        "918 Spyder": "/models/918 Spyder",
        "Cayenne": "/models/Cayenne",
        "Macan": "/models/Macan GTS",
        "Panamera": "/models/Panamera",
        "Taycan": "/models/Taycan",
        "GT3 RS": "/models/911 GT3 RS",
        "Turbo S": "/models/911 Turbo S",
        "GT2 RS": "/models/911 GT2 RS",
        "GT4 RS": "/models/718 Cayman GT4",
        "Boxster S": "/models/718 Boxster S"
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHero((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        if (activeDropdown !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeDropdown]);

    const [isLegacyOpen, setIsLegacyOpen] = useState(false);

    const legacyDetails = [
        {
            icon: Crown,
            category: "Formula 1 Dominance",
            achievements: [
                "15 Constructors' Championships",
                "240+ Grand Prix victories",
                "Over 500 podium finishes",
                "Legendary drivers: Schumacher, Hamilton, Vettel"
            ]
        },
        {
            icon: Target,
            category: "Engineering Excellence",
            achievements: [
                "Advanced aerodynamics development",
                "Hybrid power unit technology",
                "Carbon fiber innovations",
                "Precision manufacturing processes"
            ]
        },
        {
            icon: Zap,
            category: "Technology Transfer",
            achievements: [
                "KERS energy recovery systems",
                "Advanced suspension technology",
                "Lightweight materials",
                "Electronic stability systems"
            ]
        },
        {
            icon: Award,
            category: "Racing Heritage",
            achievements: [
                "Le Mans 24 Hours victories",
                "DTM Championship success",
                "Formula E innovations",
                "Historic racing preservation"
            ]
        }
    ];

    const milestones = [
        { year: "1954", event: "First Formula 1 Championship", description: "Beginning of motorsport dominance" },
        { year: "1988", event: "McLaren Partnership", description: "Most successful F1 partnership in history" },
        { year: "2010", event: "Hybrid Technology", description: "Pioneered road-relevant racing tech" },
        { year: "2024", event: "Future Vision", description: "Leading sustainable motorsport" }
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Navbar theme={selectedTheme} />
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
                                <button onClick={() => navigate(heroSlides[activeHero].route)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2">
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
                            <div key={model.name} className="relative">
                                <div
                                    className="group cursor-pointer"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => {
                                        if (!modelVariants[model.name] && modelRoutes[model.name]) {
                                            navigate(modelRoutes[model.name]);
                                        }
                                    }}
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

                                            {/* Arrow with proper click handler */}
                                            <div
                                                className="absolute bottom-6 right-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (modelVariants[model.name]) {
                                                        setActiveDropdown(activeDropdown === index ? null : index);
                                                    } else if (modelRoutes[model.name]) {
                                                        navigate(modelRoutes[model.name]);
                                                    }
                                                }}
                                            >
                                                <div className={`transition-all duration-300 ${activeDropdown === index
                                                    ? 'rotate-90 translate-x-0'
                                                    : 'group-hover:translate-x-1'
                                                    }`}>
                                                    <ChevronRight className="w-8 h-8 text-white stroke-[1.5]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropdown positioned correctly */}
                                {activeDropdown === index && modelVariants[model.name] && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-2xl animate-slide-down">
                                        <div className="p-4">
                                            <h4 className="text-white font-medium mb-3">Choose {model.name} Model:</h4>
                                            <div className="space-y-2">
                                                {modelVariants[model.name]?.map((variant, variantIndex) => (
                                                    <button
                                                        key={variant}
                                                        onClick={() => {
                                                            const route = modelRoutes[variant];
                                                            console.log(`Navigate to: ${route}`);
                                                            navigate(route);
                                                        }} 
                                                        className="w-full text-left px-4 py-3 text-white hover:bg-red-600/20 rounded-md transition-all duration-200 hover:translate-x-1 flex items-center justify-between group"
                                                    >
                                                        <span>{variant}</span>
                                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Motorsport Legacy */}
            <section className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={Motorsport}
                        alt="Racing"
                        className="w-full h-full object-cover opacity-50"
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

                    {/* Legacy Details Toggle Button */}
                    <div className="text-center mt-16">
                        <button
                            onClick={() => setIsLegacyOpen(!isLegacyOpen)}
                            className="group bg-gradient-to-r from-red-600/20 to-red-500/10 hover:from-red-600/30 hover:to-red-500/20 
               border border-red-500/30 hover:border-red-500/50 rounded-lg p-4 transition-all duration-300 
               backdrop-blur-sm hover:backdrop-blur-md flex items-center gap-3 mx-auto"
                        >
                            <Trophy className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
                            <span className="text-lg font-medium text-white group-hover:text-red-100 transition-colors">
                                Discover Our Complete Racing Legacy
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-red-500 transition-all duration-300 ${isLegacyOpen ? 'rotate-180 text-red-400' : 'group-hover:text-red-400'
                                    }`}
                            />
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isLegacyOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="mt-6 bg-black/40 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                                {/* Timeline Section */}
                                <div className="p-6 border-b border-gray-700/50">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Calendar className="w-5 h-5 text-red-500" />
                                        <h3 className="text-xl font-semibold text-white">Historic Milestones</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {milestones.map((milestone, index) => (
                                            <div key={milestone.year} className="relative group">
                                                <div className="bg-gradient-to-br from-red-600/10 to-red-500/5 rounded-lg p-4 
                            border border-red-500/20 hover:border-red-500/40 transition-all duration-300
                            hover:bg-gradient-to-br hover:from-red-600/20 hover:to-red-500/10">
                                                    <div className="text-red-500 text-lg font-bold mb-2">{milestone.year}</div>
                                                    <h4 className="text-white font-medium mb-2 text-sm">{milestone.event}</h4>
                                                    <p className="text-gray-400 text-xs">{milestone.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legacy Categories */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-6">Racing Excellence Categories</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {legacyDetails.map((category, index) => {
                                            const IconComponent = category.icon;
                                            return (
                                                <div key={category.category} className="group">
                                                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 
                              border border-gray-600/30 hover:border-red-500/30 transition-all duration-300
                              hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors">
                                                                <IconComponent className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
                                                            </div>
                                                            <h4 className="text-white font-semibold group-hover:text-red-100 transition-colors">
                                                                {category.category}
                                                            </h4>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {category.achievements.map((achievement, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm group-hover:text-gray-200 transition-colors">
                                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-red-400 transition-colors"></div>
                                                                    {achievement}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Performance Stats */}
                                <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-red-600/5 to-transparent">
                                    <h3 className="text-xl font-semibold text-white mb-6">Performance Statistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { stat: "70+", label: "Years Racing" },
                                            { stat: "240+", label: "F1 Victories" },
                                            { stat: "500+", label: "Podium Finishes" },
                                            { stat: "15", label: "Championships" }
                                        ].map((item, index) => (
                                            <div key={item.label} className="text-center group">
                                                <div className="text-2xl font-bold text-red-500 group-hover:text-red-400 transition-colors">
                                                    {item.stat}
                                                </div>
                                                <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                                                    {item.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                <button 
                                    onClick={() => navigate('/contact')} 
                                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
                                >
                                    Schedule Test Drive
                                </button>
                                <button className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-full transition-all duration-300">
                                    Find Dealer
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src={PorscheExperience}
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
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }

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
            <Footer theme={selectedTheme} />
        </div>
    );
};

export default Home;