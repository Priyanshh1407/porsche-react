import React from 'react';
import { Wind, Sun, Car } from 'lucide-react';

const Convertible = ({ theme }) => {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-10 shadow-xl border ${theme.border} ${theme.bgSecondary} text-white max-w-4xl mx-auto`}
    >
      <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${theme.text}`}>
        Pure Open-Top Freedom
      </h2>

      <p className={`text-base sm:text-lg mb-6 ${theme.textSecondary}`}>
        The Porsche Boxster S is more than just a sports car — it's an open invitation to experience every curve of the road with the wind in your hair and the sky above. 
        Its fully automatic soft-top folds away in just 9 seconds, even at speeds up to 50 km/h.
      </p>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Wind className={`w-6 h-6 ${theme.text}`} />
          <span className={theme.textAccent}>Convertible Soft-Top</span>
        </div>
        <div className="flex items-center gap-3">
          <Sun className={`w-6 h-6 ${theme.text}`} />
          <span className={theme.textAccent}>Top-down Driving Experience</span>
        </div>
        <div className="flex items-center gap-3">
          <Car className={`w-6 h-6 ${theme.text}`} />
          <span className={theme.textAccent}>Mid-Engine Balance</span>
        </div>
      </div>
    </div>
  );
};

export default Convertible;
