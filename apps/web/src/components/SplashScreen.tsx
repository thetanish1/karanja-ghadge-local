import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2400,
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out slightly before duration ends
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(durationMs - 400, 1000));

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer transition-opacity duration-500 overflow-hidden select-none font-sans ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 35%, #1e6b3f 0%, #175733 50%, #114226 100%)',
      }}
    >
      {/* Decorative Subtle Geometric Curved Lines from Figma */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        viewBox="0 0 400 850"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Top subtle contour circles */}
        <circle cx="200" cy="50" r="280" stroke="#a3e6b7" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="200" cy="50" r="380" stroke="#a3e6b7" strokeWidth="0.75" strokeOpacity="0.25" />

        {/* Bottom subtle contour circles */}
        <circle cx="420" cy="880" r="320" stroke="#a3e6b7" strokeWidth="1" strokeOpacity="0.35" />
        <circle cx="420" cy="880" r="440" stroke="#a3e6b7" strokeWidth="0.75" strokeOpacity="0.2" />
      </svg>

      {/* Center Brand Identity Container with subtle entrance animation */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo & Wordmark Horizontal Row */}
        <div className="flex items-center gap-3">
          
          {/* Frosted Glass Icon Container */}
          <div className="w-12 h-12 rounded-[16px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Shopping Bag Outline */}
              <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
              <path
                d="M8 8V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V8"
                stroke="currentColor"
                strokeLinecap="round"
              />
              {/* Vibrant Orange Dot */}
              <circle cx="12" cy="5" r="1.5" fill="#f97316" stroke="none" />
            </svg>
          </div>

          {/* Wordmark: Aapna in crisp white, Cart in vibrant orange */}
          <div className="text-[32px] sm:text-[36px] font-extrabold tracking-tight leading-none">
            <span className="text-white">Aapna</span>
            <span className="text-[#f97316]">Cart</span>
          </div>
        </div>

        {/* Tagline from Figma: Your Town. Your Shops. Your Cart. */}
        <p className="mt-3.5 text-xs sm:text-[13px] font-medium tracking-wide text-white/85 text-center">
          Your Town. Your Shops. Your Cart.
        </p>

        {/* Subtle pulsate hint on bottom */}
        <div className="mt-12 flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-[10px] text-white/70 font-medium tracking-wider uppercase">Loading</span>
        </div>

      </div>

      {/* Tap anywhere to continue hint */}
      <div className="absolute bottom-6 text-[10px] text-white/40 tracking-wider">
        Tap to skip
      </div>
    </div>
  );
};
