import React, { useState } from "react";
import { Calendar, Trophy, TrendingUp, Users, Star, Award, Zap, Settings, Crown, Target } from "lucide-react";
import legacy from "../assets/carreragt/legacy.jpg"

const TimelineCard = ({ item, theme, index }) => {
  const {
    primary = "orange-400",
    text = "text-white",
    textSecondary = "text-gray-400",
    border = "border-gray-700",
  } = theme;

  const getIconForType = (type) => {
    switch (type.toLowerCase()) {
      case 'motorsport dna':
        return <Zap className="w-6 h-6" />;
      case 'production':
        return <Settings className="w-6 h-6" />;
      case 'exclusive':
        return <Crown className="w-6 h-6" />;
      case 'legacy':
        return <Award className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getTagColor = (type) => {
    switch (type.toLowerCase()) {
      case 'motorsport dna':
        return 'bg-orange-500';
      case 'production':
        return 'bg-red-500';
      case 'exclusive':
        return 'bg-orange-600';
      case 'legacy':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`${border} border rounded-xl p-6 bg-gray-900/70 backdrop-blur-sm transform transition-all duration-500 ease-out hover:bg-gray-900/80 hover:border-orange-500/50 group relative overflow-hidden`}
      style={{ 
        animationDelay: `${index * 150}ms`,
        animation: 'slideInFromLeft 0.8s ease-out forwards'
      }}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/25">
          <div className="text-white transition-transform duration-300 group-hover:scale-105">
            {getIconForType(item.type)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`${text} font-bold text-lg transition-all duration-300`}>
              {item.year}
            </span>
            <span className={`${getTagColor(item.type)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide transition-all duration-300`}>
              {item.type}
            </span>
          </div>
          <h3 className={`${text} text-xl font-bold transition-all duration-300 group-hover:text-orange-300`}>
            {item.title}
          </h3>
        </div>
      </div>
      <p className={`${textSecondary} leading-relaxed transition-all duration-300`}>
        {item.description}
      </p>
    </div>
  );
};

const ValueSection = ({ valueData, theme }) => {
  const {
    text = "text-white",
    textSecondary = "text-gray-400",
    border = "border-gray-700",
  } = theme;

  return (
    <div 
      className={`${border} border rounded-xl p-6 bg-gray-900/70 backdrop-blur-sm transform transition-all duration-500 hover:bg-gray-900/80 hover:border-orange-500/50 group relative overflow-hidden`}
      style={{ 
        animation: 'slideInFromRight 0.8s ease-out forwards',
        animationDelay: '600ms'
      }}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="text-orange-400 transition-transform duration-300 group-hover:scale-110">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className={`${text} text-xl font-bold transition-all duration-300`}>
          Collector's Dream
        </h3>
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center transition-all duration-300">
          <span className={`${textSecondary} text-sm font-medium`}>
            Current Value
          </span>
          <span className="text-orange-400 text-2xl font-bold transition-all duration-300">
            ${valueData.currentValue}
          </span>
        </div>
        
        <div className="flex justify-between items-center transition-all duration-300">
          <span className={`${textSecondary} text-sm font-medium`}>
            Value Appreciation
          </span>
          <span className="text-green-400 text-xl font-bold transition-all duration-300">
            +{valueData.appreciation}
          </span>
        </div>
        
        <div className="flex justify-between items-center transition-all duration-300">
          <span className={`${textSecondary} text-sm font-medium`}>
            Market Status
          </span>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-lg font-bold">
              {valueData.marketStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Elegant progress indicator */}
      <div className="mt-6 relative z-10">
        <div className="relative">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1500 ease-out" 
              style={{ 
                width: '0%',
                animation: 'progressFill 2s ease-out 1s forwards'
              }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-2 block opacity-75">Market Performance Excellence</span>
        </div>
      </div>
    </div>
  );
};

export default function LegacySection({ 
  theme, 
  timelineData = [], 
  valueData = null,
  title = "Racing Heritage",
  subtitle = "Born from decades of motorsport excellence, the Carrera GT represents the pinnacle of Porsche's racing DNA"
}) {
   // Default data if none provided
  const defaultTimelineData = [
    {
      year: "1999",
      type: "MOTORSPORT DNA", 
      title: "Racing Genesis",
      description: "Born from the cancelled LMP1-98 racing program, the Carrera GT project began as a pure racing concept that would become a road-going legend."
    },
    {
      year: "2003",
      type: "PRODUCTION",
      title: "Production Debut", 
      description: "After years of development, the Carrera GT made its production debut with a naturally aspirated V10 engine derived from Porsche's Formula 1 program."
    },
    {
      year: "2004-2007",
      type: "EXCLUSIVE",
      title: "Limited Production",
      description: "Only 1,270 units were ever produced, making each Carrera GT an incredibly rare and sought-after masterpiece of automotive engineering."
    },
    {
      year: "2007", 
      type: "LEGACY",
      title: "End of Era",
      description: "Production ended, cementing the Carrera GT's status as one of the last naturally aspirated supercars and a true collector's dream."
    }
  ];

  const defaultValueData = {
    currentValue: "1.5M+",
    appreciation: "400%",
    marketStatus: "Blue Chip"
  };

  const dataToUse = timelineData.length > 0 ? timelineData : defaultTimelineData;
  const valueToUse = valueData || defaultValueData;

  // Collapsible state
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInTitle {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 92%;
          }
        }
        
        @keyframes subtleGlow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
          }
        }
        .timeline-collapse {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s;
        }
        .timeline-expand {
          max-height: 1200px;
          opacity: 1;
          transition: max-height 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.4s;
        }
      `}</style>
      
      <section className="relative w-full py-16 px-6 bg-transparent">
        {/* Subtle blurred Carrera GT background image */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img src={legacy} />
        </div>
        {/* Subtle background elements for Singer-inspired heritage look */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <div className="absolute top-24 left-12 w-80 h-80 bg-gradient-to-br from-orange-400/30 to-amber-300/10 rounded-full blur-3xl" />
          <div className="absolute bottom-24 right-24 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-orange-400/10 rounded-full blur-2xl" />
        </div>
        <div className={`relative z-10 max-w-4xl mx-auto ${theme.cardBg} backdrop-blur-md rounded-2xl p-10 shadow-2xl ${theme.cardBorder}`}
          style={{ background: 'rgba(30,20,10,0.7)' }}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${theme.text}`}>Legacy & Heritage</h2>
          <div className="space-y-8 mb-8">
            <div className="flex items-center gap-4">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg" />
              <span className={`text-lg font-semibold ${theme.text}`}>V10 engine developed for F1</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg" />
              <span className={`text-lg font-semibold ${theme.text}`}>Manual-only, no stability control</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg" />
              <span className={`text-lg font-semibold ${theme.text}`}>Iconic wooden shifter</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg" />
              <span className={`text-lg font-semibold ${theme.text}`}>Valued at over $1M+</span>
            </div>
          </div>
          <p className={`mb-12 text-base ${theme.textSecondary}`}>The Carrera GT is a symbol of analog purity and motorsport heritage, blending timeless design with raw performance. Revered by collectors and enthusiasts, it stands as a testament to Porsche’s engineering artistry and legacy.</p>

          {/* Toggle button for Racing History */}
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold mb-6 transition-colors duration-200 border ${theme.buttonOutline} ${theme.hoverBg}`}
            onClick={() => setShowTimeline((v) => !v)}
            aria-expanded={showTimeline}
          >
            {showTimeline ? (
              <>
                <span>Hide Racing History</span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 12l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </>
            ) : (
              <>
                <span>Show Racing History</span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </>
            )}
          </button>

          {/* Timeline Cards (collapsible) */}
          <div className={showTimeline ? "timeline-expand" : "timeline-collapse"}>
            <div className="space-y-6 mb-8">
              {dataToUse.map((item, index) => (
                <TimelineCard key={index} item={item} theme={theme} index={index} />
              ))}
            </div>
          </div>

          {/* Value Section (previous info) */}
          {valueData !== false && (
            <ValueSection valueData={valueToUse} theme={theme} />
          )}
        </div>
      </section>
    </>
  );
}