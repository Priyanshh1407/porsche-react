import React, { useEffect, useState } from "react";
import { Timer, ArrowDown, Gauge, Zap, TrendingUp } from "lucide-react";

function RollingNumber({ target, decimals = 0, duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (target - start) * progress;
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(target);
    }
    requestAnimationFrame(animate);
    return () => setValue(target);
  }, [target, duration]);
  return <span>{value.toFixed(decimals)}</span>;
}

export default function TrackStats() {
  return (
    <section className="w-full py-12 px-0" style={{ background: 'transparent' }}>
      <div className="relative w-full flex flex-col items-center justify-center py-10 px-2 md:px-8" style={{ minHeight: 340 }}>
        {/* Carbon fiber + dark mosaic background */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png'), url('https://www.transparenttextures.com/patterns/dark-mosaic.png')",
          backgroundRepeat: 'repeat, repeat',
          backgroundSize: 'auto, auto',
          opacity: 0.35
        }} />
        {/* SVG racing line accent */}
        <svg className="absolute top-0 left-0 w-full h-16 opacity-60 z-10" viewBox="0 0 1200 64" fill="none">
          <path d="M0 32 Q300 0 600 32 T1200 32" stroke="#fde047" strokeWidth="4" fill="none" />
          <path d="M0 56 Q300 24 600 56 T1200 56" stroke="#38bdf8" strokeWidth="2" fill="none" />
        </svg>
        {/* Telemetry cards with racing/overtaking animation */}
        <div className="relative z-20 w-full flex flex-row flex-wrap justify-center gap-8 md:gap-12">
          {/* Lap Time */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-yellow-400 min-w-[160px] racing-card" style={{ animationDelay: '0.1s', '--race-y': '-32px', '--race-rot': '-7deg' }}>
            <Timer size={36} className="text-yellow-300 mb-2" />
            <span className="text-3xl font-extrabold text-yellow-200 mb-1"><RollingNumber target={6.82} decimals={2} /> <span className="text-lg">MIN</span></span>
            <span className="text-xs text-yellow-100 uppercase tracking-wider">Nürburgring Lap</span>
            <span className="text-xs text-yellow-100 mt-1">6:49.3</span>
          </div>
          {/* Downforce */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-blue-400 min-w-[160px] racing-card" style={{ animationDelay: '0.2s', '--race-y': '18px', '--race-rot': '5deg' }}>
            <ArrowDown size={36} className="text-blue-300 mb-2" />
            <span className="text-3xl font-extrabold text-blue-200 mb-1"><RollingNumber target={860} /> <span className="text-lg">KG</span></span>
            <span className="text-xs text-blue-100 uppercase tracking-wider">Max Downforce</span>
            <span className="text-xs text-blue-100 mt-1">@ 285 km/h</span>
          </div>
          {/* Redline */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-red-400 min-w-[160px] racing-card" style={{ animationDelay: '0.3s', '--race-y': '-22px', '--race-rot': '8deg' }}>
            <Gauge size={36} className="text-red-300 mb-2" />
            <span className="text-3xl font-extrabold text-red-200 mb-1"><RollingNumber target={9000} /> <span className="text-lg">RPM</span></span>
            <span className="text-xs text-red-100 uppercase tracking-wider">Redline</span>
            <span className="text-xs text-red-100 mt-1">4.0L Flat-6</span>
          </div>
          {/* 0-100 km/h */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-green-400 min-w-[160px] racing-card" style={{ animationDelay: '0.4s', '--race-y': '28px', '--race-rot': '-6deg' }}>
            <Zap size={36} className="text-green-300 mb-2" />
            <span className="text-3xl font-extrabold text-green-200 mb-1"><RollingNumber target={3.2} decimals={1} /> <span className="text-lg">S</span></span>
            <span className="text-xs text-green-100 uppercase tracking-wider">0–100 km/h</span>
            <span className="text-xs text-green-100 mt-1">Launch Control</span>
          </div>
          {/* Top Speed */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-orange-400 min-w-[160px] racing-card" style={{ animationDelay: '0.5s', '--race-y': '-18px', '--race-rot': '4deg' }}>
            <TrendingUp size={36} className="text-orange-300 mb-2" />
            <span className="text-3xl font-extrabold text-orange-200 mb-1"><RollingNumber target={296} /> <span className="text-lg">KM/H</span></span>
            <span className="text-xs text-orange-100 uppercase tracking-wider">Top Speed</span>
            <span className="text-xs text-orange-100 mt-1">205 mph</span>
          </div>
          {/* Power */}
          <div className="flex flex-col items-center bg-black/70 rounded-2xl px-8 py-6 shadow-lg border-2 border-pink-400 min-w-[160px] racing-card" style={{ animationDelay: '0.6s', '--race-y': '12px', '--race-rot': '-8deg' }}>
            <Gauge size={36} className="text-pink-300 mb-2" />
            <span className="text-3xl font-extrabold text-pink-200 mb-1"><RollingNumber target={518} /> <span className="text-lg">HP</span></span>
            <span className="text-xs text-pink-100 uppercase tracking-wider">Max Power</span>
            <span className="text-xs text-pink-100 mt-1">4.0L Flat-6</span>
          </div>
        </div>
        {/* Racing card animation with overtaking effect */}
        <style>{`
          .racing-card {
            opacity: 0;
            transform: translateX(-120px) translateY(var(--race-y,0)) rotate(var(--race-rot,0));
            animation: racing-card-in 0.8s cubic-bezier(.7,1.6,.3,1) forwards;
          }
          @keyframes racing-card-in {
            0% { opacity: 0; transform: translateX(-120px) translateY(var(--race-y,0)) rotate(var(--race-rot,0)); }
            70% { opacity: 1; transform: translateX(12px) translateY(0) rotate(0deg) scale(1.04); }
            100% { opacity: 1; transform: translateX(0) translateY(0) rotate(0deg) scale(1); }
          }
        `}</style>
      </div>
    </section>
  );
} 

