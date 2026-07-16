import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { carThemes } from '../data/carThemes';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Star,
    MapPin,
    Clock,
    Users,
    Calendar,
    Car,
    Globe,
    Trophy,
    Building,
} from 'lucide-react';

// Enhanced CSS for animations and card styling - Replace your customStyles constant with this
const customStyles = `
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-800 {
  animation-delay: 800ms;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Glass Card Styles */
.glass-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(0, 0, 0, 0.1) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.glass-card:hover {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.08) 50%, 
    rgba(239, 68, 68, 0.05) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(239, 68, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-8px) scale(1.02);
}

.premium-card {
  background: linear-gradient(145deg, 
    rgba(26, 26, 26, 0.95) 0%,
    rgba(15, 15, 15, 0.98) 50%,
    rgba(0, 0, 0, 0.95) 100%
  );
  border: 1px solid rgba(51, 51, 51, 0.5);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.premium-card:hover {
  background: linear-gradient(145deg, 
    rgba(42, 42, 42, 0.95) 0%,
    rgba(26, 26, 26, 0.98) 50%,
    rgba(15, 15, 15, 0.95) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-shimmer {
  position: relative;
  overflow: hidden;
}

.card-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.card-shimmer:hover::before {
  opacity: 1;
}

/* Enable horizontal mouse scroll */
.horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  scroll-behavior: smooth;
  position: relative;
  padding-bottom: 8px;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
  height: 8px;
}

.horizontal-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.6));
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transition: all 0.3s ease;
}

.horizontal-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, rgba(239, 68, 68, 1), rgba(239, 68, 68, 0.8));
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
  transform: scaleY(1.2);
}

.horizontal-scroll::-webkit-scrollbar-thumb:active {
  background: linear-gradient(90deg, rgba(239, 68, 68, 1), rgba(220, 38, 38, 0.9));
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6);
}

/* Show scrollbar only when actively scrolling */
.horizontal-scroll:active::-webkit-scrollbar {
  display: block;
}
`;


const Experience = () => {
    const selectedTheme = carThemes.home;
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const experienceCenters = [
        {
            name: "Porsche Experience Center Hockenheimring",
            location: "Baden-Württemberg, Germany",
            description: "Embedded in the legendary Grand Prix circuit with handling tracks, off-road course, and dynamic areas.",
            features: ["Handling Circuit", "Off-Road Course", "Kick Plate", "Dynamic Area"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.9",
            duration: "Full Day",
            capacity: "12 people"
        },
        {
            name: "Porsche Experience Center Leipzig",
            location: "Saxony, Germany",
            description: "Home to unique driving experiences with a 3.7km circuit and various challenging modules.",
            features: ["Main Circuit", "Handling Course", "Off-Road Track", "Drift Circle"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.8",
            duration: "Half Day",
            capacity: "8 people"
        },
        {
            name: "Porsche Experience Center Le Mans",
            location: "Sarthe, France",
            description: "Located at the iconic Circuit de la Sarthe, offering authentic motorsport atmosphere.",
            features: ["2.2km Circuit", "Handling Track", "Wet Circle", "Ice Hill"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.7",
            duration: "Full Day",
            capacity: "10 people"
        },
        {
            name: "Porsche Experience Center Silverstone",
            location: "Northamptonshire, UK",
            description: "Set within the legendary Silverstone Circuit, home of British Grand Prix.",
            features: ["Handling Circuit", "Kick Plate", "Ice Hill", "Wet Circle"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.8",
            duration: "Full Day",
            capacity: "12 people"
        },
        {
            name: "Porsche Experience Center Atlanta",
            location: "Georgia, USA",
            description: "Features a 1.6-mile Driver Development Track and comprehensive training modules.",
            features: ["Development Track", "Handling Module", "Off-Road Course", "Kick Plate"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.9",
            duration: "Full Day",
            capacity: "15 people"
        },
        {
            name: "Porsche Experience Center Los Angeles",
            location: "California, USA",
            description: "State-of-the-art facility with innovative track design and premium amenities.",
            features: ["Main Track", "Handling Circuit", "Low Friction Circle", "Off-Road"],
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
            rating: "4.8",
            duration: "Half Day",
            capacity: "10 people"
        }
    ];

    const museums = [
        {
            name: "Porsche Museum Stuttgart",
            location: "Stuttgart, Germany",
            description: "The heart of Porsche heritage featuring over 80 vehicles across 5,600 square meters.",
            highlights: ["Historic Race Cars", "Production Vehicles", "Concept Studies", "Interactive Exhibits"],
            founded: "2009",
            visitors: "500K+ annually",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80"
        },
        {
            name: "Porsche Experience Center Leipzig Museum",
            location: "Leipzig, Germany",
            description: "Showcasing the evolution of Porsche sports cars and motorsport history.",
            highlights: ["Assembly Line Tours", "Historic Vehicles", "Motorsport Gallery", "Vintage Collection"],
            founded: "2002",
            visitors: "300K+ annually",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80"
        },
        {
            name: "Porsche Museum at Weissach",
            location: "Weissach, Germany",
            description: "Development center museum featuring prototype vehicles and engineering innovations.",
            highlights: ["Prototype Vehicles", "Engineering History", "Test Vehicle Collection", "R&D Exhibits"],
            founded: "1971",
            visitors: "Limited access",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80"
        },
        {
            name: "Porsche Heritage Collection",
            location: "Various Locations",
            description: "Traveling exhibitions and permanent displays at select dealerships worldwide.",
            highlights: ["Traveling Exhibits", "Historical Documentation", "Rare Models", "Heritage Stories"],
            founded: "Multiple",
            visitors: "Global audience",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80"
        }
    ];

    const attractions = [
        {
            name: "Porsche Driving Experience",
            type: "Driving Programs",
            locations: "Multiple worldwide",
            description: "Professional driving instruction on world-class circuits and scenic routes.",
            icon: <Car className="w-8 h-8" />
        },
        {
            name: "Porsche Travel Club",
            type: "Tours & Events",
            locations: "Global destinations",
            description: "Exclusive travel experiences combining luxury destinations with Porsche driving.",
            icon: <Globe className="w-8 h-8" />
        },
        {
            name: "Porsche Track Days",
            type: "Track Experience",
            locations: "Famous circuits worldwide",
            description: "Access to legendary racing circuits for authentic motorsport experiences.",
            icon: <Trophy className="w-8 h-8" />
        },
        {
            name: "Porsche Delivery Centers",
            type: "Factory Tours",
            locations: "Stuttgart, Leipzig, Atlanta",
            description: "Behind-the-scenes look at Porsche manufacturing and vehicle delivery experiences.",
            icon: <Building className="w-8 h-8" />
        }
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            <div className="min-h-screen bg-black text-white">
                <Navbar theme={selectedTheme} />

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear hover:scale-105"
                        style={{
                            backgroundImage: `url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80)`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
                        {/* <div className={`absolute inset-0 bg-gradient-to-r ${selectedTheme.gradient}/20`} /> */}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-4 text-center">
                        <div className="max-w-5xl mx-auto">
                            <button
                                onClick={handleBack}
                                className={`flex items-center gap-2 ${selectedTheme.navText} ${selectedTheme.navHover} transition-all duration-300 mb-12 mx-auto group hover:gap-3 hover:px-4 hover:py-2 hover:bg-white/10 hover:backdrop-blur-sm rounded-full`}
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                                <span className="group-hover:font-semibold transition-all duration-300">Back to Home</span>
                            </button>

                            <div className="mb-8">
                                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none animate-fade-in-up">
                                    <span className="inline-block hover:scale-105 transition-transform duration-500 cursor-pointer">Porsche</span>
                                    <span className={`${selectedTheme.text} block hover:scale-105 transition-transform duration-500 cursor-pointer animate-fade-in-up animation-delay-200`}>Experience</span>
                                </h1>

                                <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 hover:text-white transition-colors duration-300">
                                    Feel the fascination of Porsche. Experience legendary performance,
                                    visit world-class museums, and discover driving excellence without owning one.
                                </p>
                            </div>



                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-800">
                                <div className="text-center group cursor-pointer">
                                    <div className={`text-3xl font-bold ${selectedTheme.text} mb-2 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300`}>15+</div>
                                    <div className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors duration-300">Experience Centers</div>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className={`text-3xl font-bold ${selectedTheme.text} mb-2 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300`}>70+</div>
                                    <div className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors duration-300">Countries</div>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className={`text-3xl font-bold ${selectedTheme.text} mb-2 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300`}>1M+</div>
                                    <div className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors duration-300">Visitors Annually</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experience Centers Section */}
                <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
                    <div className="container mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-8 animate-fade-in-up">
                                <span className="inline-block hover:scale-105 transition-transform duration-500 cursor-pointer">Experience Centers</span>
                                <span className={`${selectedTheme.text} block hover:scale-105 transition-transform duration-500 cursor-pointer`}>Worldwide</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 hover:text-gray-200 transition-colors duration-300">
                                15 Porsche Experience Centers globally offer the opportunity to experience
                                the fascination of Porsche at first hand. Unique worlds of experience fulfil lifelong dreams.
                            </p>
                        </div>

                        {/* Horizontal Scroll for Experience Centers */}
                        <div className="horizontal-scroll pb-6">
                            <div className="flex gap-6 w-max">
                                {experienceCenters.map((center, index) => (
                                    <div key={index} className="w-[600px] flex-shrink-0">
                                        <Card className="glass-card premium-card card-shimmer group transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 h-full transform hover:-translate-y-3 hover:scale-[1.02] rounded-2xl overflow-hidden">
                                            <div className="aspect-video overflow-hidden relative">
                                                <img
                                                    src={center.image}
                                                    alt={center.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-red-500/0 group-hover:to-red-500/20 transition-all duration-700" />
                                            </div>

                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-white text-xl group-hover:text-2xl transition-all duration-300">
                                                    {center.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mb-4 text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                                                    <MapPin className="w-4 h-4 group-hover:w-5 group-hover:h-5 transition-all duration-300" />
                                                    {center.location}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <p className="text-gray-400 mb-6 group-hover:text-gray-200 transition-colors duration-300">{center.description}</p>

                                                <div className="mb-8">
                                                    <h4 className="font-semibold mb-3 text-white group-hover:text-gray-100 transition-colors duration-300">Features:</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {center.features.map((feature, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300 hover:scale-105 cursor-pointer">
                                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-300"></div>
                                                                <span className="hover:font-semibold transition-all duration-200">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white group/btn transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                                                    <Calendar className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                                                    <span>Plan Visit</span>
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Museums Section */}
                <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
                    <div className="container mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-8 animate-fade-in-up">
                                <span className="inline-block hover:scale-105 transition-transform duration-500 cursor-pointer">Porsche</span>
                                <span className={`${selectedTheme.text} block hover:scale-105 transition-transform duration-500 cursor-pointer`}>Museums</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 hover:text-gray-200 transition-colors duration-300">
                                Immerse yourself in decades of automotive excellence, innovation, and racing heritage
                                at world-renowned Porsche museums and collections.
                            </p>
                        </div>

                        {/* Carousel for Museums */}
                        {/* Horizontal Scroll for Museums */}
                        <div className="horizontal-scroll pb-6 mb-20">
                            <div className="flex gap-6 w-max">
                                {museums.map((museum, index) => (
                                    <div key={index} className="w-[600px] flex-shrink-0">
                                        <Card className="glass-card premium-card card-shimmer group transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 h-full transform hover:-translate-y-3 hover:scale-[1.02] rounded-2xl overflow-hidden">                                           <div className="aspect-video overflow-hidden relative">
                                            <img
                                                src={museum.image}
                                                alt={museum.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-red-500/0 group-hover:to-red-500/20 transition-all duration-700" />
                                            <div className="absolute bottom-4 right-4 transform translate-y-2 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-300">
                                                <div className={`${selectedTheme.text} font-bold text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full`}>Est. {museum.founded}</div>
                                            </div>
                                        </div>

                                            <CardHeader className="pb-4">
                                                <CardTitle className={`group-hover:${selectedTheme.textSecondary} transition-all duration-300 text-white text-xl group-hover:text-2xl`}>
                                                    {museum.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mb-4 text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                                                    <MapPin className="w-4 h-4 group-hover:w-5 group-hover:h-5 transition-all duration-300" />
                                                    {museum.location}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <p className="text-gray-400 mb-6 group-hover:text-gray-200 transition-colors duration-300">{museum.description}</p>

                                                <div className="mb-8">
                                                    <h4 className="font-semibold mb-3 text-white group-hover:text-gray-100 transition-colors duration-300">Highlights:</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {museum.highlights.map((highlight, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300 hover:scale-105 cursor-pointer">
                                                                <div className={`w-1.5 h-1.5 ${selectedTheme.bg} rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-300`}></div>
                                                                <span className="hover:font-semibold transition-all duration-200">{highlight}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button className={`w-full ${selectedTheme.bg} hover:${selectedTheme.bgSecondary} text-white group/btn transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300`}>
                                                    <Calendar className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                                                    <span>Plan Visit</span>
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                            {/* <CarouselPrevious className={`${selectedTheme.border} ${selectedTheme.text} hover:${selectedTheme.bg} hover:text-white transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300`} />
                            <CarouselNext className={`${selectedTheme.border} ${selectedTheme.text} hover:${selectedTheme.bg} hover:text-white transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300`} /> */}
                        </div>

                        {/* Global Attractions */}
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 animate-fade-in-up">
                                <span className="inline-block hover:scale-105 transition-transform duration-500 cursor-pointer">Global</span>
                                <span className={`${selectedTheme.text} hover:scale-105 transition-transform duration-500 cursor-pointer`}> Attractions</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 hover:text-gray-200 transition-colors duration-300">
                                Beyond museums and experience centers, discover unique Porsche attractions
                                and experiences available around the world.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {attractions.map((attraction, index) => (
                                <Card key={index} className="text-center glass-card card-shimmer group transition-all duration-500 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 hover:-translate-y-3 cursor-pointer animate-fade-in-up rounded-2xl border border-white/10 hover:border-red-500/30">                                  <CardHeader className="pb-2">
                                    <div className={`${selectedTheme.text} mb-4 flex justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        {attraction.icon}
                                    </div>
                                    <CardTitle className={`text-lg group-hover:${selectedTheme.textSecondary} transition-all duration-300 text-white group-hover:text-xl`}>
                                        {attraction.name}
                                    </CardTitle>
                                    <CardDescription className={`${selectedTheme.text} font-semibold group-hover:text-white transition-colors duration-300`}>
                                        {attraction.type}
                                    </CardDescription>
                                </CardHeader>

                                    <CardContent className="relative z-10">
                                        <div className="mb-4">
                                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedTheme.bg} text-white mb-3 group-hover:scale-105 transition-all duration-300`}>
                                                {attraction.locations}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-300 mb-6 leading-relaxed group-hover:text-white transition-colors duration-300 min-h-[3rem]">
                                            {attraction.description}
                                        </p>

                                        <div className="flex gap-2">
                                            <Button variant="outline" className={`flex-1 border-2 border-white/20 ${selectedTheme.text} hover:${selectedTheme.bg} hover:text-white hover:border-red-500 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300 backdrop-blur-sm bg-white/5 group/btn`}>
                                                <span>Explore</span>
                                                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300" />
                                            </Button>
                                            <Button size="sm" className={`${selectedTheme.bg} hover:${selectedTheme.bgSecondary} text-white px-3 group/btn2 hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300`}>
                                                <Globe className="w-4 h-4 group-hover/btn2:rotate-12 transition-transform duration-300" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <Footer theme={selectedTheme} />
            </div>
        </>
    );
};

export default Experience;