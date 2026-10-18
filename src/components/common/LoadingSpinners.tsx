import React from "react";

import { AppLogo } from "../AppLogo";
export const CircularSpinner: React.FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}> = ({ size = 24, strokeWidth = 3, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={`animate-spin text-indigo-600 dark:text-indigo-400 ${className}`}
      fill="none"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="90 150"
        className="opacity-90"
      />
    </svg>
  );
};

// 2. Beat Dots Spinner (3 pulsing/beating dots)
export const BeatSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 8, className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
      <span
        style={{ width: size, height: size, animationDelay: "0.15s" }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
      <span
        style={{ width: size, height: size, animationDelay: "0.3s" }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
    </div>
  );
};

// 3. Ripple Radar Spinner (Radar circles expanding)
export const RippleSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = "" }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/60 animate-ping" />
      <div className="absolute inset-2 rounded-full border-2 border-indigo-400/40 animate-pulse" />
      <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
    </div>
  );
};

// 4. Wave Bar Spinner (Equalizer soundwave)
export const WaveSpinner: React.FC<{
  height?: number;
  className?: string;
}> = ({ height = 24, className = "" }) => {
  return (
    <div
      style={{ height }}
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      {[0, 0.15, 0.3, 0.45, 0.6].map((delay, idx) => (
        <span
          key={idx}
          style={{ animationDelay: `${delay}s` }}
          className="w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full h-full animate-[pulse_0.8s_ease-in-out_infinite] opacity-80"
        />
      ))}
    </div>
  );
};

// 5. Grid Dots Spinner (3x3 grid fade)
export const GridSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 32, className = "" }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid grid-cols-3 gap-1 ${className}`}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            animationDelay: `${(i % 3) * 0.15 + Math.floor(i / 3) * 0.1}s`,
          }}
          className="bg-indigo-600 dark:bg-indigo-400 rounded-sm animate-pulse"
        />
      ))}
    </div>
  );
};

// 6. Section Loading Spinner Card
export const SectionLoading: React.FC<{
  message?: string;
  variant?: "circular" | "beat" | "ripple" | "wave" | "grid";
  height?: string;
}> = ({
  message = "Cargando datos...",
  variant = "circular",
  height = "py-16",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${height} text-center animate-fade-in`}
    >
      <div className="mb-4">
        {variant === "circular" && (
          <CircularSpinner size={36} strokeWidth={3.5} />
        )}
        {variant === "beat" && <BeatSpinner size={10} />}
        {variant === "ripple" && <RippleSpinner size={48} />}
        {variant === "wave" && <WaveSpinner height={30} />}
        {variant === "grid" && <GridSpinner size={36} />}
      </div>
      <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-[#94949E] uppercase">
        {message}
      </p>
    </div>
  );
};

// 7. Fullscreen App Splash / Loading Overlay (Sin fondo / transparente con animación de carga de íconos circulares)
export const FullScreenAppLoader: React.FC<{ message?: string }> = ({
  message = "Iniciando StreamManager Pro...",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in pointer-events-none select-none">
      <div className="flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto">
        {/* Ícono circular con animación de carga circular */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 relative z-10">
            <AppLogo className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2.5 flex items-center justify-center pointer-events-none">
            <CircularSpinner size={82} strokeWidth={2.5} className="text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#E4E4E7] tracking-tight mb-1 flex items-center gap-1.5 justify-center">
          StreamManager{" "}
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            PRO
          </span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-[#94949E] font-medium mb-4 text-center">
          {message}
        </p>

        {/* Indicador de carga circular */}
        <div className="flex items-center justify-center">
          <CircularSpinner size={24} strokeWidth={3} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    </div>
  );
};

