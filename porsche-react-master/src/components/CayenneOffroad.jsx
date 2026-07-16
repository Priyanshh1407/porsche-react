import React, { useRef, useEffect, useState } from "react";
import { Mountain, Settings, ArrowUp, Users, MapPin, Shield, Sliders } from "lucide-react";
import offroad from "../assets/cayenne/offroad.jpeg"

export default function CayenneOffroad({ theme }) {
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) setInView(true);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={ref}
      className={`relative w-full flex flex-col md:flex-row items-stretch overflow-hidden ${theme.bgPattern} min-h-0`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* Left: Full-bleed Cayenne Offroad Image, no gray area, no fixed height */}
      <div className="relative md:w-1/2 w-full flex items-stretch justify-stretch min-h-0">
        <img
          src={offroad}
          alt="Cayenne Offroad"
          className={`w-full h-full object-cover transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          style={{ minHeight: 0, minWidth: '100%', aspectRatio: '16/10', display: 'block' }}
        />
        {/* Subtle metallic/diamond-plate overlay, optional */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-plate.png')] opacity-10 pointer-events-none" />
      </div>
      {/* Right: Info Panel with vertical padding only here */}
      <div className="relative md:w-1/2 w-full flex flex-col justify-center px-8 py-8 md:py-12 z-10 min-h-0">
        {/* Badge */}
        <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold bg-stone-800/80 text-emerald-200 border border-stone-700 mb-4 shadow-md backdrop-blur-md tracking-widest uppercase animate-fade-in-up delay-100">
          Offroad Capability
        </span>
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-emerald-100 leading-tight drop-shadow-lg animate-fade-in-up delay-200">
          Rugged. Refined. Ready.
        </h2>
        {/* Description */}
        <p className="max-w-xl text-lg mb-8 text-emerald-200/90 leading-relaxed animate-fade-in-up delay-300">
          The Cayenne is engineered for adventure. Defender-inspired off-road tech, luxury comfort, and Porsche performance—conquer any terrain in style.
        </p>
        {/* Offroad Features - Defender style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-stone-900/80 rounded-xl p-6 border-l-4 border-emerald-400/80 shadow-lg flex flex-col gap-3 animate-slide-in-left delay-400">
            <div className="flex items-center gap-3 mb-2">
              <Mountain size={28} className="text-emerald-400" />
              <span className="font-bold text-emerald-200 text-lg">Terrain Modes</span>
            </div>
            <ul className="text-emerald-100/90 text-sm space-y-1 pl-2">
              <li className="flex items-center gap-2"><MapPin size={18} className="text-emerald-300" /> Rock, Sand, Mud, Snow</li>
              <li className="flex items-center gap-2"><Sliders size={18} className="text-emerald-300" /> Customizable Drive Profiles</li>
            </ul>
          </div>
          <div className="bg-stone-900/80 rounded-xl p-6 border-l-4 border-yellow-300/80 shadow-lg flex flex-col gap-3 animate-slide-in-right delay-500">
            <div className="flex items-center gap-3 mb-2">
              <Settings size={28} className="text-yellow-300" />
              <span className="font-bold text-yellow-100 text-lg">Smart Systems</span>
            </div>
            <ul className="text-yellow-50/90 text-sm space-y-1 pl-2">
              <li className="flex items-center gap-2"><ArrowUp size={18} className="text-yellow-200" /> Adjustable Air Suspension</li>
              <li className="flex items-center gap-2"><Shield size={18} className="text-yellow-200" /> Locking Differentials</li>
              <li className="flex items-center gap-2"><Users size={18} className="text-yellow-200" /> AWD Modes</li>
            </ul>
          </div>
        </div>
        {/* Performance Stats - Defender style */}
        <div className="flex flex-wrap gap-6 mb-8 animate-fade-in-up delay-600">
          <div className="flex flex-col items-center bg-gradient-to-br from-emerald-400/20 to-stone-900/80 rounded-xl px-6 py-4 border-2 border-emerald-400 shadow-lg min-w-[120px] animate-fade-in-up delay-700">
            <span className="text-2xl font-bold text-emerald-300 drop-shadow">270mm</span>
            <span className="text-xs text-emerald-100/80 mt-1">Ground Clearance</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-br from-yellow-200/20 to-stone-900/80 rounded-xl px-6 py-4 border-2 border-yellow-300 shadow-lg min-w-[120px] animate-fade-in-up delay-800">
            <span className="text-2xl font-bold text-yellow-200 drop-shadow">540mm</span>
            <span className="text-xs text-yellow-100/80 mt-1">Wading Depth</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-br from-emerald-200/20 to-stone-900/80 rounded-xl px-6 py-4 border-2 border-emerald-200 shadow-lg min-w-[120px] animate-fade-in-up delay-900">
            <span className="text-2xl font-bold text-emerald-200 drop-shadow">25.7°</span>
            <span className="text-xs text-emerald-100/80 mt-1">Approach Angle</span>
          </div>
        </div>
      </div>
      {/* Subtle metallic/diamond-plate overlay on right */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diamond-plate.png')] opacity-10 z-0" />
      {/* Custom keyframes for premium fade/slide animation */}
      <style>{`
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(.4,2,.3,1) both; }
        @keyframes slide-in-left { 0% { opacity: 0; transform: translateX(-40px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-left { animation: slide-in-left 0.7s cubic-bezier(.4,2,.3,1) both; }
        @keyframes slide-in-right { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.7s cubic-bezier(.4,2,.3,1) both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }
      `}</style>
    </section>
  );
}