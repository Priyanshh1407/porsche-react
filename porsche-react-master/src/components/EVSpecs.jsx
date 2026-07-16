import React, { useState, useEffect, useRef } from "react";
import { Zap, Clock, Thermometer, BatteryCharging, Settings, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import Evspecs from "../assets/taycan/Evspecs.jpeg";

export default function EVSpecs({ theme, image }) {
  const [showMore, setShowMore] = useState(false);
  const [flash, setFlash] = useState(false);
  const [batteryPercent, setBatteryPercent] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const batteryTarget = 90;
  const batteryAnimDuration = 900; // ms
  const batteryAnimSteps = 30;
  const batteryStep = batteryTarget / batteryAnimSteps;
  const batteryInterval = batteryAnimDuration / batteryAnimSteps;
  const hasAnimated = useRef(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // Animate in only once when card enters viewport
    if (!hasAnimated.current) {
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setAnimateIn(true);
            setTimeout(() => {
              let percent = 0;
              const interval = setInterval(() => {
                percent += batteryStep;
                setBatteryPercent(Math.min(percent, batteryTarget));
                if (percent >= batteryTarget) clearInterval(interval);
              }, batteryInterval);
            }, 550);
            hasAnimated.current = true;
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      if (cardRef.current) observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section className="relative w-full py-12 px-6 bg-transparent min-h-[600px]">
      {/* Prominent background image with overlay */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
        <img src={Evspecs} alt="EV Specs" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <style>{`
        .ev-speed-btn {
          position: relative;
          background: transparent;
          border: 1.5px solid #22d3ee;
          color: #67e8f9;
          font-weight: 600;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          overflow: hidden;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ev-speed-btn:focus {
          outline: none;
          border-color: #06b6d4;
        }
        .ev-speed-btn .ev-speed-underline {
          position: absolute;
          left: 0; bottom: 0; height: 2.5px; width: 100%;
          background: linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .ev-speed-btn:hover .ev-speed-underline,
        .ev-speed-btn:focus .ev-speed-underline {
          transform: scaleX(1);
        }
        .ev-speed-btn .ev-speed-flash {
          position: absolute;
          left: 0; top: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, #67e8f9 0%, #22d3ee 100%);
          opacity: 0;
          pointer-events: none;
        }
        .ev-speed-btn.ev-flash .ev-speed-flash {
          animation: evFlash 0.35s linear;
        }
        @keyframes evFlash {
          0% { opacity: 0.7; }
          60% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        .ev-animate-in {
          animation: evSlideInFast 0.55s cubic-bezier(0.7,0,0.7,1) 0s both;
        }
        @keyframes evSlideInFast {
          0% { opacity: 0; transform: translateX(80px) scale(0.98); }
          80% { opacity: 1; transform: translateX(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .ev-battery-bar {
          transition: width 0.9s cubic-bezier(0.7,0,0.7,1);
          background: linear-gradient(90deg, #22d3ee 80%, #06b6d4 100%);
          box-shadow: 0 0 8px #22d3ee88;
        }
      `}</style>
      <div ref={cardRef} className={`relative z-10 max-w-4xl mx-auto backdrop-blur-md rounded-2xl p-10 shadow-2xl ${theme.cardBorder} ${animateIn ? 'ev-animate-in' : ''}`}
        style={{ background: 'rgba(20,30,50,0.7)' }}>
        <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${theme.text}`}>Electric Performance Specs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`flex items-center gap-3 p-6 rounded-lg ${theme.cardBorder} bg-white/10`}>
            <Zap size={28} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>0–100 km/h in 2.4s (Turbo S)</span>
          </div>
          <div className={`flex items-center gap-3 p-6 rounded-lg ${theme.cardBorder} bg-white/10`}>
            <BatteryCharging size={28} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>500km+ Range (WLTP)</span>
          </div>
          <div className={`flex items-center gap-3 p-6 rounded-lg ${theme.cardBorder} bg-white/10`}>
            <Clock size={28} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>270kW Charging: 5–80% in 22min</span>
          </div>
          <div className={`flex items-center gap-3 p-6 rounded-lg ${theme.cardBorder} bg-white/10`}>
            <Thermometer size={28} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>Intelligent Thermal Battery Management</span>
          </div>
        </div>
        {/* Digital battery bar with animation */}
        <div className="w-full bg-white/10 rounded-full h-6 mt-10 overflow-hidden border border-cyan-400/30">
          <div className="ev-battery-bar h-6 rounded-full" style={{ width: `${batteryPercent}%`, background: 'linear-gradient(90deg, #22d3ee 80%, #06b6d4 100%), #67e8f9' }} />
        </div>
        <div className={`text-xs mt-2 text-center ${theme.text}`}>Battery: {Math.round(batteryPercent)}% charged</div>
        {/* Toggle button for more details */}
        <button
          className={`ev-speed-btn flex items-center gap-2 px-6 py-2 rounded mt-8 mb-2 relative ${flash ? 'ev-flash' : ''}`}
          onClick={() => {
            setShowMore((v) => !v);
            setFlash(true);
            setTimeout(() => setFlash(false), 350);
          }}
          aria-expanded={showMore}
        >
          {showMore ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {showMore ? "Hide Tech Details" : "Show Tech Details"}
          <span className="ev-speed-underline" />
          <span className="ev-speed-flash" />
        </button>
        {showMore && (
          <div className="mt-2 p-6 rounded-xl bg-gray-900/60 border border-cyan-700">
            <ul className="space-y-2 text-gray-200">
              <li className="flex items-center gap-2"><Settings size={20} /> Drive Modes: Range, Sport, Turbo</li>
              <li className="flex items-center gap-2"><Zap size={20} /> Regenerative Braking</li>
              <li className="flex items-center gap-2"><Monitor size={20} /> Digital Cockpit & Infotainment</li>
            </ul>
          </div>
        )}
        <p className={`mt-6 text-base ${theme.textSecondary}`}>Taycan sets the benchmark for electric sports cars with rapid charging, long range, and Porsche driving dynamics—all with zero emissions.</p>
      </div>
    </section>
  );
} 