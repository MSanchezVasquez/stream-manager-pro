import React from "react";

interface IndeterminateProgressBarProps {
  active: boolean;
  className?: string;
}

export const IndeterminateProgressBar: React.FC<IndeterminateProgressBarProps> = ({
  active,
  className = "",
}) => {
  return (
    <div
      role="progressbar"
      aria-label="Cargando contenido o cambiando de estado"
      aria-hidden={!active}
      className={`w-full h-[2.5px] relative overflow-hidden rounded-full transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${className}`}
    >
      {/* Background Track */}
      <div className="w-full h-full bg-slate-200/80 dark:bg-[#1E1E26] rounded-full relative overflow-hidden">
        {/* Primary Runner */}
        <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-indeterminate-bar-1" />
        {/* Secondary Runner */}
        <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 shadow-[0_0_8px_rgba(168,85,247,0.5)] animate-indeterminate-bar-2" />
      </div>
    </div>
  );
};
