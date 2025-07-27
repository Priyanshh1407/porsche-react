import React, { useState } from "react";
import { Smartphone, MapPin, Users, Camera, Volume2, ChevronDown, ChevronUp, Settings } from "lucide-react";

const features = [
  { icon: <MapPin size={28} className="text-pink-400" />, label: "Fits Tight Urban Streets" },
  { icon: <Camera size={28} className="text-blue-400" />, label: "Surround-view Camera System" },
  { icon: <Volume2 size={28} className="text-purple-400" />, label: "Sound Insulation" },
  { icon: <Smartphone size={28} className="text-cyan-400" />, label: "Porsche Connect Infotainment Tech" },
  { icon: <Users size={28} className="text-green-400" />, label: "Lifestyle: Café Hopping, Active Weekends" },
];

const moreFeatures = [
  { icon: <Settings size={20} className="text-pink-400" />, label: "Parking Assist" },
  { icon: <Volume2 size={20} className="text-purple-400" />, label: "Enhanced Sound Insulation" },
  { icon: <Smartphone size={20} className="text-cyan-400" />, label: "Advanced Infotainment" },
  { icon: <Smartphone size={20} className="text-green-400" />, label: "Wireless Charging" },
];

export default function CityDriveFocus() {
  const [showMore, setShowMore] = useState(false);
  return (
    <section className="w-full py-12 px-0 relative overflow-hidden">
      {/* Cityscape/blurred lights background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'linear-gradient(120deg, rgba(30,27,38,0.95) 60%, rgba(236,72,153,0.18) 100%)',
        backgroundImage: `url('https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px) brightness(0.7)',
        opacity: 0.45
      }} />
      {/* Floating city accent */}
      <svg className="absolute top-6 right-10 w-32 h-16 z-10 opacity-60" viewBox="0 0 128 32" fill="none">
        <rect x="0" y="20" width="16" height="12" rx="2" fill="#f472b6" />
        <rect x="18" y="12" width="12" height="20" rx="2" fill="#a78bfa" />
        <rect x="32" y="16" width="8" height="16" rx="2" fill="#38bdf8" />
        <rect x="42" y="8" width="10" height="24" rx="2" fill="#fbbf24" />
        <rect x="54" y="18" width="6" height="14" rx="2" fill="#f472b6" />
        <rect x="62" y="14" width="8" height="18" rx="2" fill="#a78bfa" />
        <rect x="72" y="20" width="12" height="12" rx="2" fill="#38bdf8" />
        <rect x="86" y="10" width="10" height="22" rx="2" fill="#fbbf24" />
        <rect x="98" y="16" width="8" height="16" rx="2" fill="#f472b6" />
        <rect x="108" y="12" width="12" height="20" rx="2" fill="#a78bfa" />
      </svg>
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white z-20 relative drop-shadow-lg">City Drive & Lifestyle</h2>
      {/* Feature cards, animated entrance, horizontal scroll on mobile */}
      <div className="relative z-20 w-full">
        {/* Desktop: grid with 3 on first row, 2 centered on second row */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {features.slice(0, 3).map((f, i) => (
            <div
              key={f.label}
              className="flex flex-col items-center justify-center min-w-[220px] bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-400/30 animate-city-card"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              {f.icon}
              <span className="font-semibold text-lg text-white mt-3 text-center drop-shadow-sm">{f.label}</span>
            </div>
          ))}
        </div>
        <div className="hidden md:flex flex-row justify-center gap-8 mt-6">
          {features.slice(3).map((f, i) => (
            <div
              key={f.label}
              className="flex flex-col items-center justify-center min-w-[220px] bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-400/30 animate-city-card"
              style={{ animationDelay: `${0.5 + i * 0.12}s` }}
            >
              {f.icon}
              <span className="font-semibold text-lg text-white mt-3 text-center drop-shadow-sm">{f.label}</span>
            </div>
          ))}
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex flex-row gap-6 overflow-x-auto pb-4">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex flex-col items-center justify-center min-w-[220px] bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-400/30 animate-city-card"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              {f.icon}
              <span className="font-semibold text-lg text-white mt-3 text-center drop-shadow-sm">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Expandable more features panel */}
      <div className="relative z-20 flex flex-col items-center mt-6">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-pink-700/80 text-white font-semibold shadow hover:bg-pink-600 transition mb-2"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
        >
          {showMore ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {showMore ? "Hide Urban Features" : "Show Urban Features"}
        </button>
        <div
          className={`transition-all duration-500 overflow-hidden w-full ${showMore ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-row gap-6 justify-center items-center mt-2 w-full">
            {moreFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-pink-400/20 shadow">
                {f.icon}
                <span className="text-white text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-base text-pink-100 z-20 relative max-w-2xl mx-auto text-center drop-shadow">The Macan GTS is the perfect blend of Porsche performance and city practicality—agile, connected, and ready for any lifestyle.</p>
      {/* Card entrance animation */}
      <style>{`
        .animate-city-card {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          animation: city-card-in 0.7s cubic-bezier(.7,1.6,.3,1) forwards;
        }
        @keyframes city-card-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          70% { opacity: 1; transform: translateY(-8px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  );
} 