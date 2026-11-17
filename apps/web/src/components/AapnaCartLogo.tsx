import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const AapnaCartLogo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconDimensions = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Figma Green Rounded Square Icon with Bag & Orange Dot Handle */}
      <div
        className={`${iconDimensions[size]} bg-gradient-to-br from-[#236e44] to-[#164d2d] flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Bag Body */}
          <rect
            x="4"
            y="8"
            width="16"
            height="13"
            rx="3"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Bag Handle */}
          <path
            d="M8 8V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V8"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Orange Accent Dot Handle Tag */}
          <circle cx="12" cy="5" r="1.5" fill="#f97316" />
        </svg>
      </div>

      {showText && (
        <div className={`font-extrabold tracking-tight ${textSizes[size]} leading-none`}>
          <span className="text-[#1b5e39]">Aapna</span>
          <span className="text-[#f97316]">Cart</span>
        </div>
      )}
    </div>
  );
};
