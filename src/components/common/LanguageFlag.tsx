import React, { useState } from "react";

interface FlagProps {
  size?: number;
  className?: string;
}

export const SpainFlag: React.FC<FlagProps> = ({ size = 22, className = "" }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = [
    "/flags/es.webp",
    "/flags/flag.webp",
    "/flags/es.svg",
    "https://hatscripts.github.io/circle-flags/flags/es.svg",
  ];

  return (
    <img
      src={sources[srcIndex]}
      onError={() => {
        if (srcIndex < sources.length - 1) {
          setSrcIndex((prev) => prev + 1);
        }
      }}
      width={size}
      height={size}
      alt="Español"
      className={`shrink-0 rounded-full object-cover shadow-xs border border-black/10 dark:border-white/15 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="lazy"
    />
  );
};

export const USFlag: React.FC<FlagProps> = ({ size = 22, className = "" }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = [
    "/flags/us.webp",
    "/flags/flag (1).webp",
    "/flags/flag_1.webp",
    "/flags/us.svg",
    "https://hatscripts.github.io/circle-flags/flags/us.svg",
  ];

  return (
    <img
      src={sources[srcIndex]}
      onError={() => {
        if (srcIndex < sources.length - 1) {
          setSrcIndex((prev) => prev + 1);
        }
      }}
      width={size}
      height={size}
      alt="English (US)"
      className={`shrink-0 rounded-full object-cover shadow-xs border border-black/10 dark:border-white/15 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="lazy"
    />
  );
};

export const LanguageFlag: React.FC<{
  code: "es" | "en" | string;
  size?: number;
  className?: string;
}> = ({ code, size = 22, className = "" }) => {
  if (code === "es") {
    return <SpainFlag size={size} className={className} />;
  }
  return <USFlag size={size} className={className} />;
};
