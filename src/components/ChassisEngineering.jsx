import React from "react";
import { Activity, AlignCenter, Settings, Users, Star } from "lucide-react";

export default function ChassisEngineering({ theme }) {
  return (
    <section className="w-full py-8 px-6">
      <h2 className={`text-3xl font-bold mb-4 ${theme.text}`}>Chassis Engineering</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-3 p-4 bg-purple-900/40 rounded-lg border border-purple-500">
          <AlignCenter size={28} className="text-purple-400" />
          <span className="font-medium">Mid-Engine Layout</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-purple-900/40 rounded-lg border border-purple-500">
          <Settings size={28} className="text-purple-400" />
          <span className="font-medium">Passive Suspension Tuned for Feedback</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-purple-900/40 rounded-lg border border-purple-500">
          <AlignCenter size={28} className="text-purple-400" />
          <span className="font-medium">50:50 Weight Balance</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-purple-900/40 rounded-lg border border-purple-500">
          <Users size={28} className="text-purple-400" />
          <span className="font-medium">GT4 Clubsport DNA</span>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-purple-900/40 rounded-lg border border-purple-500">
        <Star size={28} className="text-purple-400" />
        <span className="font-medium">Driver Testimonials</span>
      </div>
      <p className={`mt-6 text-base ${theme.textSecondary}`}>The 718 Cayman GT4 is engineered for ultimate precision, with a chassis that delivers perfect balance and pure driver feedback.</p>
    </section>
  );
} 