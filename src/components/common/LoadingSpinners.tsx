import React from 'react';

// 1. Circular / Ring Spinner (inspired by respinner Circular)
export const CircularSpinner: React.FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}> = ({ size = 24, strokeWidth = 3, className = '' }) => {
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
}> = ({ size = 8, className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
      <span
        style={{ width: size, height: size, animationDelay: '0.15s' }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
      <span
        style={{ width: size, height: size, animationDelay: '0.3s' }}
        className="rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
      />
    </div>
  );
};

// 3. Ripple Radar Spinner (Radar circles expanding)
export const RippleSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = '' }) => {
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
}> = ({ height = 24, className = '' }) => {
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
}> = ({ size = 32, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid grid-cols-3 gap-1 ${className}`}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${(i % 3) * 0.15 + Math.floor(i / 3) * 0.1}s` }}
          className="bg-indigo-600 dark:bg-indigo-400 rounded-sm animate-pulse"
        />
      ))}
    </div>
  );
};

// 6. Section Loading Spinner Card
export const SectionLoading: React.FC<{
  message?: string;
  variant?: 'circular' | 'beat' | 'ripple' | 'wave' | 'grid';
  height?: string;
}> = ({
  message = 'Cargando datos...',
  variant = 'circular',
  height = 'py-16'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${height} text-center animate-fade-in`}>
      <div className="mb-4">
        {variant === 'circular' && <CircularSpinner size={36} strokeWidth={3.5} />}
        {variant === 'beat' && <BeatSpinner size={10} />}
        {variant === 'ripple' && <RippleSpinner size={48} />}
        {variant === 'wave' && <WaveSpinner height={30} />}
        {variant === 'grid' && <GridSpinner size={36} />}
      </div>
      <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-[#94949E] uppercase">
        {message}
      </p>
    </div>
  );
};

// 7. Fullscreen App Splash / Loading Overlay
export const FullScreenAppLoader: React.FC<{ message?: string }> = ({
  message = 'Iniciando StreamManager Pro...'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-brightness-[0.75] backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 relative overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-5 relative">
          <RippleSpinner size={40} className="text-white" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7] tracking-tight mb-1">
          StreamManager <span className="text-indigo-500 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">PRO</span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-[#94949E] font-medium mb-6 text-center">
          {message}
        </p>

        <BeatSpinner size={8} />
      </div>
    </div>
  );
};
