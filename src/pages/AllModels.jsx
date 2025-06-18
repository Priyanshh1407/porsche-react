import React, { useState, useEffect } from 'react';
import { Zap, Gauge, Trophy, ChevronRight, Timer, Target, Flame, Settings, Filter } from 'lucide-react';

const AllModels = () => {
  const [activeModel, setActiveModel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Track', 'Performance', 'Sports', 'Electric', 'SUV', 'Luxury', 'Convertible', 'Hypercar', 'Classic'];

  const models = [
    {
      id: 1,
      name: "911 GT3 RS",
      tagline: "Track-Bred Beast",
      power: "518 HP",
      torque: "465 Nm",
      acceleration: "3.2s",
      topSpeed: "296 km/h",
      price: "$223,800",
      image: "🏎️",
      color: "from-red-500 via-orange-500 to-yellow-500",
      category: "Track",
      description: "Pure racing DNA meets street legal engineering. The GT3 RS delivers uncompromising track performance with every component optimized for speed.",
      features: ["Naturally Aspirated Flat-6", "Rear-Axle Steering", "PASM Dampers", "Ceramic Brakes"]
    },
    {
      id: 2,
      name: "918 Spyder",
      tagline: "Hybrid Hypercar",
      power: "887 HP",
      torque: "1280 Nm",
      acceleration: "2.6s",
      topSpeed: "345 km/h",
      price: "$845,000",
      image: "⚡",
      color: "from-purple-500 via-pink-500 to-red-500",
      category: "Hypercar",
      description: "Revolutionary hybrid technology meets motorsport heritage. The 918 Spyder redefines what's possible in automotive engineering.",
      features: ["V8 + Electric Motors", "All-Wheel Drive", "Carbon Fiber Body", "Active Aerodynamics"]
    },
    {
      id: 3,
      name: "911 Turbo S",
      tagline: "Turbocharged Terror",
      power: "650 HP",
      torque: "800 Nm",
      acceleration: "2.7s",
      topSpeed: "330 km/h",
      price: "$207,000",
      image: "💨",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      category: "Performance",
      description: "Twin-turbo fury unleashed. The Turbo S combines devastating power with everyday usability in the ultimate grand tourer.",
      features: ["Twin-Turbo Flat-6", "PDK Transmission", "Sport Chrono", "Dynamic Boost"]
    },
    {
      id: 4,
      name: "Carrera GT",
      tagline: "Racing Legend",
      power: "612 HP",
      torque: "590 Nm",
      acceleration: "3.9s",
      topSpeed: "330 km/h",
      price: "$448,000",
      image: "🏁",
      color: "from-gray-400 via-gray-500 to-gray-600",
      category: "Classic",
      description: "The purest expression of racing technology in road car form. A naturally aspirated V10 masterpiece that redefined supercars.",
      features: ["V10 Engine", "Carbon Fiber Monocoque", "Ceramic Clutch", "Push-Rod Suspension"]
    },
    {
      id: 5,
      name: "911 Carrera S",
      tagline: "Pure Sports Car",
      power: "450 HP",
      torque: "530 Nm",
      acceleration: "3.7s",
      topSpeed: "308 km/h",
      price: "$118,000",
      image: "🚗",
      color: "from-green-500 via-emerald-500 to-teal-500",
      category: "Sports",
      description: "The perfect balance of performance and everyday usability. The Carrera S embodies the essence of the 911 with modern refinement.",
      features: ["Twin-Turbo Flat-6", "Rear-Wheel Drive", "Sport Plus Mode", "Active Suspension"]
    },
    {
      id: 6,
      name: "Taycan Turbo S",
      tagline: "Electric Soul",
      power: "761 HP",
      torque: "1050 Nm",
      acceleration: "2.8s",
      topSpeed: "260 km/h",
      price: "$185,000",
      image: "⚡",
      color: "from-indigo-500 via-purple-500 to-pink-500",
      category: "Electric",
      description: "Zero emissions, maximum emotions. The Taycan proves that electric vehicles can deliver soul-stirring performance with Porsche DNA.",
      features: ["Dual Electric Motors", "800V Architecture", "All-Wheel Drive", "Air Suspension"]
    },
    {
      id: 7,
      name: "Cayenne Turbo GT",
      tagline: "SUV Supercar",
      power: "631 HP",
      torque: "850 Nm",
      acceleration: "3.3s",
      topSpeed: "300 km/h",
      price: "$182,000",
      image: "🚙",
      color: "from-orange-500 via-red-500 to-pink-500",
      category: "SUV",
      description: "When practicality meets performance. The Cayenne Turbo GT defies physics with supercar acceleration in an SUV package.",
      features: ["Twin-Turbo V8", "Sport Exhaust", "PDCC Chassis", "All-Terrain Capability"]
    },
    {
      id: 8,
      name: "Panamera Turbo S",
      tagline: "Grand Tourer",
      power: "630 HP",
      torque: "820 Nm",
      acceleration: "3.1s",
      topSpeed: "315 km/h",
      price: "$204,000",
      image: "🏆",
      color: "from-yellow-500 via-orange-500 to-red-500",
      category: "Luxury",
      description: "Four doors, infinite possibilities. The Panamera Turbo S combines luxury sedan comfort with supercar performance.",
      features: ["Twin-Turbo V8", "4-Door Design", "Air Suspension", "Sport Turismo"]
    },
    {
      id: 9,
      name: "718 Cayman GT4",
      tagline: "Mid-Engine Marvel",
      power: "420 HP",
      torque: "420 Nm",
      acceleration: "4.4s",
      topSpeed: "304 km/h",
      price: "$101,000",
      image: "🎯",
      color: "from-lime-500 via-green-500 to-emerald-500",
      category: "Sports",
      description: "Perfect balance achieved. The Cayman GT4 delivers pure driving pleasure with its mid-engine layout and track-focused setup.",
      features: ["Naturally Aspirated Flat-6", "Manual Transmission", "PASM Suspension", "Sport Bucket Seats"]
    },
    {
      id: 10,
      name: "911 GT2 RS",
      tagline: "Widow Maker",
      power: "700 HP",
      torque: "750 Nm",
      acceleration: "2.8s",
      topSpeed: "340 km/h",
      price: "$293,000",
      image: "💀",
      color: "from-red-600 via-red-500 to-orange-500",
      category: "Track",
      description: "The most powerful 911 ever built. The GT2 RS is a rear-wheel drive missile that demands respect and rewards skill.",
      features: ["Twin-Turbo Flat-6", "Rear-Wheel Drive", "Roll Cage", "Magnesium Wheels"]
    },
    {
      id: 11,
      name: "Macan GTS",
      tagline: "Compact Rocket",
      power: "380 HP",
      torque: "520 Nm",
      acceleration: "5.0s",
      topSpeed: "272 km/h",
      price: "$69,000",
      image: "🎪",
      color: "from-slate-500 via-gray-500 to-zinc-500",
      category: "SUV",
      description: "Small but mighty. The Macan GTS proves that size doesn't matter when you have the heart of a sports car.",
      features: ["Twin-Turbo V6", "All-Wheel Drive", "Sport Exhaust", "Adaptive Dampers"]
    },
    {
      id: 12,
      name: "718 Boxster S",
      tagline: "Open-Air Thrills",
      power: "350 HP",
      torque: "420 Nm",
      acceleration: "4.4s",
      topSpeed: "285 km/h",
      price: "$73,000",
      image: "🌊",
      color: "from-sky-500 via-blue-500 to-indigo-500",
      category: "Convertible",
      description: "Pure freedom on four wheels. The Boxster S combines the joy of open-top driving with precise handling and turbocharged power.",
      features: ["Turbo Flat-4", "Convertible Soft Top", "Mid-Engine Layout", "PDK Transmission"]
    }
  ];

  const filteredModels = selectedCategory === 'All' 
    ? models 
    : models.filter(model => model.category === selectedCategory);


  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveModel((prev) => (prev + 1) % filteredModels.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredModels.length]);

  const handleModelSelect = (index) => {
    if (index !== activeModel) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveModel(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const currentModel = filteredModels[activeModel] || models[0];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setActiveModel(0);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${currentModel.color} opacity-10 transition-all duration-1000`}></div>
        
        {/* Racing stripes animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute h-px bg-gradient-to-r ${currentModel.color} opacity-20 animate-pulse`}
              style={{
                top: `${i * 5}%`,
                left: '-100%',
                width: '200%',
                transform: 'rotate(-45deg)',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '3s'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentModel.color} flex items-center justify-center`}>
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  PORSCHE COLLECTION
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-mono">LIVE SPECS</span>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${currentModel.color} text-black`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Model Info */}
            <div className={`space-y-8 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-6xl">{currentModel.image}</div>
                  <div>
                    <h2 className="text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                      {currentModel.name}
                    </h2>
                    <p className={`text-xl font-medium bg-gradient-to-r ${currentModel.color} bg-clip-text text-transparent`}>
                      {currentModel.tagline}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentModel.description}
                </p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <Settings className={`w-6 h-6 text-transparent bg-gradient-to-r ${currentModel.color} bg-clip-text`} />
                    <span className="text-gray-400 text-sm uppercase tracking-wide">Power</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{currentModel.power}</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <Gauge className={`w-6 h-6 text-transparent bg-gradient-to-r ${currentModel.color} bg-clip-text`} />
                    <span className="text-gray-400 text-sm uppercase tracking-wide">0-100 km/h</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{currentModel.acceleration}</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className={`w-6 h-6 text-transparent bg-gradient-to-r ${currentModel.color} bg-clip-text`} />
                    <span className="text-gray-400 text-sm uppercase tracking-wide">Top Speed</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{currentModel.topSpeed}</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <Trophy className={`w-6 h-6 text-transparent bg-gradient-to-r ${currentModel.color} bg-clip-text`} />
                    <span className="text-gray-400 text-sm uppercase tracking-wide">Price</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{currentModel.price}</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Target className={`w-5 h-5 text-transparent bg-gradient-to-r ${currentModel.color} bg-clip-text`} />
                  <span>Key Features</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {currentModel.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-300">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentModel.color}`}></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button className={`group bg-gradient-to-r ${currentModel.color} hover:shadow-2xl hover:shadow-current/25 text-black font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2`}>
                <span>CONFIGURE NOW</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Column - Model Selector */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Select Model</h3>
                <div className="text-sm text-gray-400">
                  {filteredModels.length} of {models.length} models
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredModels.map((model, index) => (
                  <div
                    key={model.id}
                    onClick={() => handleModelSelect(index)}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                      index === activeModel
                        ? `border-transparent bg-gradient-to-r ${model.color} shadow-2xl shadow-current/25`
                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{model.image}</div>
                        <div>
                          <h4 className={`font-bold text-lg ${index === activeModel ? 'text-black' : 'text-white'}`}>
                            {model.name}
                          </h4>
                          <p className={`text-sm ${index === activeModel ? 'text-black/80' : 'text-gray-400'}`}>
                            {model.tagline}
                          </p>
                          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                            index === activeModel ? 'bg-black/20 text-black' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {model.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${index === activeModel ? 'text-black' : 'text-white'}`}>
                          {model.power}
                        </div>
                        <div className={`text-sm ${index === activeModel ? 'text-black/80' : 'text-gray-400'}`}>
                          {model.acceleration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex justify-center space-x-2">
            {filteredModels.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeModel
                    ? `w-12 bg-gradient-to-r ${currentModel.color}`
                    : 'w-3 bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, ${currentModel.color.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')});
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, ${currentModel.color.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')});
        }
      `}</style>
    </div>
  );
};

export default AllModels;