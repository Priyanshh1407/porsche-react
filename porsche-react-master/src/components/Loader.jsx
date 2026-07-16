import React from 'react';
import { Zap, Settings, Gauge } from 'lucide-react';

const Loader = ({ 
  color = "from-red-500 via-orange-500 to-yellow-500", 
  message = "Loading...",
  size = "md",
  variant = "full" // "full", "inline", "minimal"
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center space-x-3">
        <div className={`${sizeClasses[size]} relative`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-full animate-ping opacity-30`}></div>
          <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-full animate-pulse`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-1/2 h-1/2 text-white animate-pulse" />
          </div>
        </div>
        <span className={`${textSizes[size]} text-white font-medium`}>{message}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center space-x-4 py-8">
        <div className="relative">
          {/* Rotating outer ring */}
          <div className={`${sizeClasses[size]} border-4 border-gray-800 rounded-full animate-spin`}>
            <div className={`absolute inset-0 border-4 border-transparent border-t-transparent bg-gradient-to-r ${color} rounded-full animate-spin`}
                 style={{ 
                   background: `conic-gradient(from 0deg, transparent, transparent, var(--tw-gradient-stops))`,
                   maskImage: 'linear-gradient(0deg, transparent 50%, black 50%)'
                 }}></div>
          </div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings className="w-1/3 h-1/3 text-white animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>
        
        <div className="text-center">
          <div className={`${textSizes[size]} font-bold text-white mb-1`}>{message}</div>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-gradient-to-r ${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full screen variant
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5`}></div>
        
        {/* Racing stripes */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute h-px bg-gradient-to-r ${color} opacity-20 animate-pulse`}
            style={{
              top: `${i * 8}%`,
              left: '-100%',
              width: '200%',
              transform: 'rotate(-45deg)',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '2s'
            }}
          ></div>
        ))}
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center">
        {/* Logo/Icon area */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Outer rotating ring */}
            <div className="w-24 h-24 border-4 border-gray-800 rounded-full animate-spin">
              <div className={`absolute inset-0 border-4 border-transparent border-t-4 bg-gradient-to-r ${color} rounded-full animate-spin`}
                   style={{ borderTopColor: 'transparent' }}></div>
            </div>
            
            {/* Middle pulsing ring */}
            <div className={`absolute inset-2 border-2 border-gradient-to-r ${color} rounded-full animate-pulse opacity-60`}></div>
            
            {/* Inner icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-8 h-8 bg-gradient-to-r ${color} rounded-full flex items-center justify-center animate-pulse`}>
                <Zap className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 bg-gradient-to-r ${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
          
          {/* Performance indicators */}
          <div className="flex justify-center space-x-8 mt-8">
            <div className="text-center">
              <Gauge className={`w-6 h-6 mx-auto text-transparent bg-gradient-to-r ${color} bg-clip-text animate-pulse`} />
              <div className="text-xs text-gray-400 mt-1">PERFORMANCE</div>
            </div>
            <div className="text-center">
              <Settings className={`w-6 h-6 mx-auto text-transparent bg-gradient-to-r ${color} bg-clip-text animate-spin`} />
              <div className="text-xs text-gray-400 mt-1">ENGINEERING</div>
            </div>
            <div className="text-center">
              <Zap className={`w-6 h-6 mx-auto text-transparent bg-gradient-to-r ${color} bg-clip-text animate-pulse`} />
              <div className="text-xs text-gray-400 mt-1">PRECISION</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;