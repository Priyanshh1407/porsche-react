import React, { useEffect, useState } from "react";
import { Timer, ArrowDown, Gauge, Zap, TrendingUp, Activity } from "lucide-react";

function RollingNumber({ target, decimals = 0, duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smoother finish
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * easeProgress;
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
  const stats = [
    { icon: Timer, val: 6.82, text: "MIN", label: "Nürburgring Lap", sub: "6:49.3", dec: 2 },
    { icon: ArrowDown, val: 860, text: "KG", label: "Max Downforce", sub: "@ 285 km/h", dec: 0 },
    { icon: Activity, val: 9000, text: "RPM", label: "Redline", sub: "4.0L Flat-6", dec: 0 },
    { icon: Zap, val: 3.2, text: "S", label: "0–100 km/h", sub: "Launch Control", dec: 1 },
    { icon: TrendingUp, val: 296, text: "KM/H", label: "Top Speed", sub: "205 mph", dec: 0 },
    { icon: Gauge, val: 518, text: "HP", label: "Max Power", sub: "4.0L Flat-6", dec: 0 }
  ];

  return (
    <section className="w-full py-24 px-4 md:px-8 bg-transparent relative overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-orange-900/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-orange-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Track Telemetry</h2>
            <div className="w-12 h-[1px] bg-orange-500/50 mx-auto shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:p-10 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
          {stats.map((stat, i) => (
            <div key={i} className={`flex flex-col items-center justify-center p-4 relative group ${i !== stats.length - 1 ? 'lg:border-r lg:border-white/5' : ''}`}>
              <stat.icon size={28} className="text-orange-500/80 mb-6 group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]" />
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg group-hover:text-yellow-50 transition-colors" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
                  <RollingNumber target={stat.val} decimals={stat.dec} />
                </span>
                <span className="text-sm font-bold text-orange-500/70">{stat.text}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 text-center">{stat.label}</span>
              <span className="text-[9px] text-gray-500/70 uppercase tracking-wider mt-1 text-center font-semibold">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
