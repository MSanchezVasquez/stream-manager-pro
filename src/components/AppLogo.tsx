import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-6 h-6', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* TV Monitor Outer Frame */}
      <rect x="15" y="10" width="75" height="52" rx="4" />
      {/* Inner Screen Line */}
      <rect x="20" y="15" width="65" height="42" rx="2" strokeWidth="2.5" opacity="0.6" />

      {/* TV Stand Leg */}
      <path d="M 68 62 L 78 72 L 86 72" strokeWidth="3.8" />

      {/* Wi-Fi Streaming Signal inside TV */}
      <path d="M 40 28 A 15 15 0 0 1 65 28" strokeWidth="3.5" />
      <path d="M 45 34 A 10 10 0 0 1 60 34" strokeWidth="3.5" />
      <path d="M 50 40 A 5 5 0 0 1 55 40" strokeWidth="3.5" />

      {/* Popcorn Fluff Top */}
      <path
        d="M 8 50 C 5 44 10 36 18 38 C 22 30 32 32 36 38 C 42 36 46 42 44 50 Z"
        fill="none"
        strokeWidth="3.8"
      />

      {/* Popcorn Bucket Body */}
      <path d="M 8 50 L 14 86 C 14 88 16 89 18 89 L 36 89 C 38 89 40 88 40 86 L 43 50" strokeWidth="3.8" />

      {/* Popcorn Bucket Vertical Stripes */}
      <path d="M 17 50 L 21 89" strokeWidth="2.8" />
      <path d="M 25 50 L 27 89" strokeWidth="2.8" />
      <path d="M 34 50 L 33 89" strokeWidth="2.8" />

      {/* Smartphone in Foreground */}
      <rect x="35" y="62" width="19" height="31" rx="3.5" fill="none" strokeWidth="3.8" />
      {/* Phone Screen Line */}
      <line x1="40" y1="67" x2="49" y2="67" strokeWidth="2.5" />
      <line x1="41" y1="88" x2="48" y2="88" strokeWidth="2.5" />
    </svg>
  );
};
