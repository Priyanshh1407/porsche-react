import React, { useEffect, useState, useRef } from "react";
import { Flag, Gauge, Timer, ArrowDown } from "lucide-react";

// Rolling number component
function RollingNumberInView({ target, decimals = 0, interval = 40, baseDelay = 200, stagger = 80, jitter = 80 }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const delay = baseDelay + Math.random() * jitter;
    const timer = setTimeout(() => {
      let current = 0;
      const increment = target / (1000 / interval);
      
      const animate = () => {
        current += increment;
        if (current >= target) {
          setDisplayValue(target);
        } else {
          setDisplayValue(current);
          requestAnimationFrame(animate);
        }
      };
      animate();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [target, decimals, interval, baseDelay, stagger, jitter]);
  
  return <span>{displayValue.toFixed(decimals)}</span>;
}

export default function WarningBanner() {
  const [showSpec, setShowSpec] = useState(false);
  const [specsInView, setSpecsInView] = useState(false);
  const specsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpec(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!specsRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSpecsInView(true);
        });
      },
      { threshold: 0.2 }
    );
    
    observer.observe(specsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full font-mono">
      {/* Main Performance Banner */}
      <div className="relative flex items-center gap-8 p-7 my-8 rounded-xl border-l-8 border-red-600 shadow-2xl overflow-hidden w-full bg-transparent">
        {/* Racing stripe */}
        <div className="absolute left-0 top-0 h-full w-2 bg-[linear-gradient(135deg,#fff_25%,#e11d48_25%,#e11d48_50%,#fff_50%,#fff_75%,#e11d48_75%,#e11d48_100%)] bg-[length:8px_32px] opacity-90 rounded-l-xl z-10" />
        
        {/* Icon section */}
        <div className="relative flex flex-col items-center justify-center z-20 bg-black bg-opacity-80 px-4 py-6 rounded-lg min-w-16">
          <Flag size={28} className="text-white mb-2 opacity-90" />
          <Gauge size={22} className="text-red-400 opacity-90" />
        </div>
        
        {/* Main content */}
        <div className="z-20 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-white bg-red-700 px-3 py-1 rounded border border-white border-opacity-20">
              Track Use Only
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-red-400 bg-white bg-opacity-10 px-2 py-1 rounded border border-red-400 border-opacity-30">
              GT2 RS
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white uppercase tracking-wide mb-1">
            Extreme Performance Zone
          </h3>
          <div className="text-sm text-gray-200 font-medium tracking-wide">
            Not for the faint of heart. Motorsport legend.
          </div>
        </div>
        
        {/* Caution tag */}
        <div className="absolute top-3 right-6 z-30 transform -rotate-12">
          <span className="bg-yellow-400 text-black font-bold text-xs px-4 py-1 rounded shadow uppercase tracking-widest border border-yellow-700 border-opacity-40">
            Caution
          </span>
        </div>
        
        {/* Carbon fiber and dark mosaic overlay, more prominent */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png'), url('https://www.transparenttextures.com/patterns/dark-mosaic.png')",
          backgroundRepeat: 'repeat, repeat',
          backgroundSize: 'auto, auto',
          opacity: 0.35
        }} />
      </div>

      {/* Specifications Row */}
      <div ref={specsRef} className="w-full flex justify-center mt-6">
        {specsInView && (
          <div className="flex flex-row gap-12 rounded-2xl px-12 py-8 shadow-2xl border-2 border-red-700 border-opacity-60 bg-black bg-opacity-20 backdrop-blur-sm items-end justify-center">
            
            {/* 0-100 km/h */}
            <div className="flex flex-col items-center justify-end min-w-32 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="h-9 mb-2"></div>
              <span className="text-4xl font-extrabold text-red-400 mb-1">
                <RollingNumberInView target={2.7} decimals={1} interval={40} baseDelay={200} />
              </span>
              <span className="text-base text-gray-300 uppercase tracking-wider font-semibold mt-1">0–100 km/h</span>
            </div>

            {/* Top Speed */}
            <div className="flex flex-col items-center justify-end min-w-32 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="h-9 mb-2"></div>
              <span className="text-4xl font-extrabold text-yellow-400 mb-1">340</span>
              <span className="text-base text-gray-300 uppercase tracking-wider font-semibold mt-1">KM/H</span>
              <span className="text-xs text-gray-400 mt-1">Top Speed</span>
            </div>

            {/* Lap Time */}
            <div className="flex flex-col items-center justify-end min-w-32 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-center mb-2 h-9">
                <Timer size={32} className="text-blue-400" />
              </div>
              <span className="text-4xl font-extrabold text-blue-300 mb-1">6:47.3</span>
              <span className="text-base text-gray-300 uppercase tracking-wider font-semibold mt-1">Nürburgring</span>
            </div>

            {/* RPM with Tachometer Arc */}
            <div className="flex flex-col items-center justify-end min-w-32 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center justify-center mb-2 h-9 w-16">
                <svg width="64" height="36" viewBox="0 0 64 36" className="tach-svg">
                  <defs>
                    <linearGradient id="tach-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fff200" stopOpacity="0.7" />
                      <stop offset="60%" stopColor="#ff9800" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M8 32 A24 24 0 0 1 56 32" 
                    stroke="url(#tach-gradient)" 
                    strokeWidth="6" 
                    fill="none" 
                    className="tach-arc"
                  />
                </svg>
              </div>
              <span className="text-4xl font-extrabold text-red-500 mb-1">7,200</span>
              <span className="text-base text-gray-300 uppercase tracking-wider font-semibold mt-1">RPM</span>
            </div>

            {/* Downforce */}
            <div className="flex flex-col items-center justify-end min-w-32 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
              <div className="flex items-center justify-center mb-2 h-9">
                <ArrowDown size={32} className="text-green-400" />
              </div>
              <span className="text-4xl font-extrabold text-green-300 mb-1">350</span>
              <span className="text-base text-gray-300 uppercase tracking-wider font-semibold mt-1">KG Downforce</span>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
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

        @keyframes tach-draw {
          from {
            stroke-dashoffset: 110;
            opacity: 0.5;
            transform: scale(0.8);
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .tach-arc {
          stroke-dasharray: 110;
          stroke-dashoffset: 110;
          animation: tach-draw 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards;
          filter: drop-shadow(0 2px 8px rgba(225, 29, 72, 0.5));
        }

        .tach-svg {
          filter: drop-shadow(0 0 10px rgba(225, 29, 72, 0.3));
        }
      `}</style>
    </div>
  );
}