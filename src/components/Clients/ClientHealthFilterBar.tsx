import React from "react";
import { Activity } from "lucide-react";

interface ClientHealthFilterBarProps {
  healthFilter: "all" | "healthy" | "warning" | "expired";
  onSelectFilter: (filter: "all" | "healthy" | "warning" | "expired") => void;
  totalInPlatformFilter: number;
  healthStats: {
    healthy: number;
    warning: number;
    expired: number;
  };
}

export const ClientHealthFilterBar: React.FC<ClientHealthFilterBarProps> = ({
  healthFilter,
  onSelectFilter,
  totalInPlatformFilter,
  healthStats,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-[#15151A] border border-slate-200/80 dark:border-[#22222A]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 dark:text-[#94949E] mr-1 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          Salud de Cuenta:
        </span>

        {/* Todos */}
        <button
          onClick={() => onSelectFilter("all")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            healthFilter === "all"
              ? "bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#353542]"
              : "text-slate-600 dark:text-[#94949E] hover:bg-slate-200/60 dark:hover:bg-[#1E1E26]"
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] font-cascadia px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
            {totalInPlatformFilter}
          </span>
        </button>

        {/* Al día */}
        <button
          onClick={() => onSelectFilter("healthy")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            healthFilter === "healthy"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-500/30"
              : "text-slate-600 dark:text-[#94949E] hover:bg-emerald-500/10 hover:text-emerald-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Al día</span>
          <span className="text-[10px] font-cascadia px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            {healthStats.healthy}
          </span>
        </button>

        {/* Por vencer */}
        <button
          onClick={() => onSelectFilter("warning")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            healthFilter === "warning"
              ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 shadow-xs border border-amber-500/30"
              : "text-slate-600 dark:text-[#94949E] hover:bg-amber-500/10 hover:text-amber-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Por vencer (≤5d)</span>
          <span className="text-[10px] font-cascadia px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
            {healthStats.warning}
          </span>
        </button>

        {/* Vencidos */}
        <button
          onClick={() => onSelectFilter("expired")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            healthFilter === "expired"
              ? "bg-red-500/15 text-red-700 dark:text-red-300 shadow-xs border border-red-500/30"
              : "text-slate-600 dark:text-[#94949E] hover:bg-red-500/10 hover:text-red-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Vencidos</span>
          <span className="text-[10px] font-cascadia px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-700 dark:text-red-300">
            {healthStats.expired}
          </span>
        </button>
      </div>

      {healthFilter !== "all" && (
        <button
          onClick={() => onSelectFilter("all")}
          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
        >
          Restablecer filtro de salud
        </button>
      )}
    </div>
  );
};
