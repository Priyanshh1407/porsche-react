import React, { useEffect, useState } from "react";
import { BatteryCharging, Zap, Settings, Car, Gauge, Activity } from "lucide-react";
import hybridTechLeft from "../assets/918 spyder/hybridTechLeft.avif";
import hybridTechRight from "../assets/918 spyder/hybridTechRight.jpg";


// Performance data cockpit view
function CockpitDisplay({ theme }) {
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRpm(prev => Math.min(8700, prev + Math.random() * 200));
      setSpeed(prev => Math.min(340, prev + Math.random() * 10));
    }, 150);
    
    setTimeout(() => clearInterval(interval), 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`${theme.cardBg} rounded-3xl p-6 backdrop-blur-sm border-2 border-yellow-500/30 shadow-2xl`}>
      <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-wider">Performance Cockpit</h3>
      
      <div className="grid grid-cols-2 gap-8">
        {/* RPM Gauge */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg width="128" height="128" className="transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="#ff6b00" 
                strokeWidth="8" 
                fill="transparent"
                strokeDasharray={`${(rpm/8700) * 351.86} 351.86`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Gauge size={24} className="text-orange-400 mb-1" />
              <span className="text-lg font-black text-white">{Math.round(rpm)}</span>
              <span className="text-xs text-orange-300 font-bold">RPM</span>
            </div>
          </div>
          <div className="text-orange-400 font-bold text-sm">RED LINE: 8,700</div>
        </div>
        
        {/* Speed Gauge */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg width="128" height="128" className="transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="#3b82f6" 
                strokeWidth="8" 
                fill="transparent"
                strokeDasharray={`${(speed/340) * 351.86} 351.86`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Activity size={24} className="text-blue-400 mb-1" />
              <span className="text-lg font-black text-white">{Math.round(speed)}</span>
              <span className="text-xs text-blue-300 font-bold">KM/H</span>
            </div>
          </div>
          <div className="text-blue-400 font-bold text-sm">TOP: 340 KM/H</div>
        </div>
      </div>
      
      {/* Performance metrics bar */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-3 rounded-xl">
          <div className="text-2xl font-black text-orange-400">887</div>
          <div className="text-xs text-orange-300 font-bold uppercase">HP TOTAL</div>
        </div>
        <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-3 rounded-xl">
          <div className="text-2xl font-black text-purple-400">1,280</div>
          <div className="text-xs text-purple-300 font-bold uppercase">NM TORQUE</div>
        </div>
        <div className="bg-gradient-to-b from-green-500/20 to-transparent p-3 rounded-xl">
          <div className="text-2xl font-black text-green-400">2.6</div>
          <div className="text-xs text-green-300 font-bold uppercase">0-100 S</div>
        </div>
      </div>
    </div>
  );
}

export default function HybridTech({ theme }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Use split images if provided, else fallback to single image or default
  const leftImg = hybridTechLeft ;
  const rightImg = hybridTechRight;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const specifications = [
    {
      icon: <Settings size={32} className="text-orange-400" />,
      label: "V8 Engine",
      value: "608",
      unit: "HP",
      description: "4.6L Naturally Aspirated",
      color: "text-orange-400",
      delay: "0.1s"
    },
    {
      icon: <Zap size={32} className="text-blue-400" />,
      label: "Electric Motors",
      value: "279",
      unit: "HP",
      description: "Dual Motor System",
      color: "text-blue-400",
      delay: "0.2s"
    },
    {
      icon: <Activity size={32} className="text-purple-400" />,
      label: "Combined Power",
      value: "887",
      unit: "HP",
      description: "Hybrid AWD System",
      color: "text-purple-400",
      delay: "0.3s"
    },
    {
      icon: <Car size={32} className="text-green-400" />,
      label: "Acceleration",
      value: "2.6",
      unit: "S",
      description: "0-100 km/h Launch",
      color: "text-green-400",
      delay: "0.4s"
    }
  ];

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-start bg-black overflow-hidden"
      style={{
        backgroundImage: `url(${leftImg}), url(${rightImg})`,
        backgroundSize: '50% 100%, 50% 100%',
        backgroundPosition: 'left top, right top',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Enhanced overlay with performance theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-blue-900/20 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16">
          {/* Main content */}
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-7xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                918 SPYDER
              </h1>
              <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 uppercase tracking-wider">
                HYBRID HYPERCAR
              </div>
              <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-lg leading-relaxed max-w-3xl mx-auto">
                Revolutionary hybrid powertrain combining a high-revving V8 with dual electric motors. 
                Experience the pinnacle of automotive engineering where raw power meets electric precision.
              </p>
            </div>

            {/* Performance specs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {(showAllSpecs ? specifications : specifications.slice(0, 2)).map((spec, index) => (
                <div
                  key={spec.label}
                  className={`group bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:border-yellow-400 hover:border-opacity-50 transition-all duration-500 hover:bg-opacity-15 hover:scale-105 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: spec.delay, minHeight: '150px' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${spec.color} group-hover:scale-110 transition-transform duration-300`}>
                      {spec.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{spec.value}</span>
                        <span className="text-lg font-medium text-gray-300">{spec.unit}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">{spec.label}</h3>
                  <p className="text-xs text-gray-400">{spec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance visualization section */}
        <div className="flex justify-center mb-16">
          <div className="max-w-2xl w-full">
            <CockpitDisplay theme={theme} />
          </div>
        </div>

        {/* Bottom info section */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-3xl p-8 border-2 border-white/10 text-center max-w-5xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">
              Revolutionary Hybrid Architecture
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              The 918 Spyder's tri-motor hybrid system delivers instant torque, all-wheel drive capability, 
              and emissions-free electric driving. This is the ultimate expression of Porsche's racing DNA 
              combined with sustainable technology.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-4 rounded-xl">
                <div className="text-3xl font-black text-orange-400 mb-2">8,700</div>
                <div className="text-sm text-orange-300 font-bold uppercase">RPM Redline</div>
              </div>
              <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-4 rounded-xl">
                <div className="text-3xl font-black text-blue-400 mb-2">25</div>
                <div className="text-sm text-blue-300 font-bold uppercase">KM E-Range</div>
              </div>
              <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-4 rounded-xl">
                <div className="text-3xl font-black text-purple-400 mb-2">3.2</div>
                <div className="text-sm text-purple-300 font-bold uppercase">L/100km</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </section>
  );
}