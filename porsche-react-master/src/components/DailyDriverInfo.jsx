import React from "react";
import { Car, Wifi, Thermometer, Music, Tv2, Settings, ArrowUp } from "lucide-react";
import interior from "../assets/turboS/interior.webp"

export default function DailyDriverInfo({ theme }) {
  return (
    <section
      className="relative w-full py-16 px-6 flex flex-col items-center bg-transparent"
    >
      {/* Hero Image */}
      <div className="w-full max-w-3xl h-64 rounded-2xl overflow-hidden shadow-xl mb-10 relative">
        <img
          src={interior}
          alt="Porsche 911 Turbo S Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div
        className={`relative z-10 max-w-4xl mx-auto ${theme.cardBg} backdrop-blur-md rounded-2xl p-10 shadow-2xl ${theme.cardBorder}`}
      >
        <h2
          className={`text-4xl font-bold mb-8 tracking-tight ${theme.text}`}
          style={{ fontFamily: "sans-serif" }}
        >
          Everyday Supercar Comfort
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`flex items-center gap-4 p-6 rounded-xl ${theme.cardBorder} ${theme.cardBg} shadow-sm`}>
            <Car size={32} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>AWD with Porsche Traction Management</span>
          </div>
          <div className={`flex items-center gap-4 p-6 rounded-xl ${theme.cardBorder} ${theme.cardBg} shadow-sm`}>
            <ArrowUp size={32} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>Launch Control, 0–100 km/h in 2.6s</span>
          </div>
          <div className={`flex items-center gap-4 p-6 rounded-xl ${theme.cardBorder} ${theme.cardBg} shadow-sm`}>
            <Thermometer size={32} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>Heated, Ventilated, Massaging Seats</span>
          </div>
          <div className={`flex items-center gap-4 p-6 rounded-xl ${theme.cardBorder} ${theme.cardBg} shadow-sm`}>
            <Music size={32} className={theme.text} />
            <span className={`font-medium text-lg ${theme.text}`}>BOSE®/Burmester® Premium Sound</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-12 mt-8">
          <div className="flex flex-col items-center">
            <Tv2 size={36} className={theme.text} />
            <span className={`text-2xl font-bold ${theme.text}`}>Porsche Connect</span>
            <span className={`text-xs ${theme.text}`}>Apple CarPlay, Navigation, Apps</span>
          </div>
          <div className="flex flex-col items-center">
            <Settings size={36} className={theme.text} />
            <span className={`text-2xl font-bold ${theme.text}`}>Adaptive Suspension</span>
            <span className={`text-xs ${theme.text}`}>Comfort & Sport Modes</span>
          </div>
        </div>
      </div>
    </section>
  );
} 