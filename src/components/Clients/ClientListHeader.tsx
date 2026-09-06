import React from "react";
import { ShieldCheck, UserX, Filter, Plus } from "lucide-react";
import { PlatformIcon } from "../common/PlatformIcon";

interface ClientListHeaderProps {
  statusFilter: "active" | "inactive";
  clientCount: number;
  platformFilter: string;
  onSelectPlatform: (platform: string) => void;
  platformOptions: string[];
  onAddClient: () => void;
}

export const ClientListHeader: React.FC<ClientListHeaderProps> = ({
  statusFilter,
  clientCount,
  platformFilter,
  onSelectPlatform,
  platformOptions,
  onAddClient,
}) => {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 min-w-0">
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={`p-2.5 rounded-xl ${
            statusFilter === "active"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-500/10 text-slate-500"
          }`}
        >
          {statusFilter === "active" ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <UserX className="w-5 h-5" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7] font-space tracking-tight">
            {statusFilter === "active"
              ? "Clientes Activos"
              : "Clientes No Activos / Cancelados"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            Mostrando{" "}
            <span className="font-cascadia font-bold text-slate-700 dark:text-slate-300">
              {clientCount}
            </span>{" "}
            cliente(s)
          </p>
        </div>
      </div>

      {/* Filters & Add Client Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0 flex-1 justify-end">
        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 min-w-0 flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Filter className="w-3.5 h-3.5 text-[#94949E] shrink-0 mr-1" />
          {platformOptions.map((plat) => (
            <button
              key={plat}
              onClick={() => onSelectPlatform(plat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                platformFilter === plat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] hover:bg-slate-200 border border-transparent dark:border-[#2D2D33]"
              }`}
            >
              {plat !== "Todos" && (
                <PlatformIcon platform={plat} className="w-3.5 h-3.5" />
              )}
              <span>{plat}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onAddClient}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Cliente</span>
        </button>
      </div>
    </div>
  );
};
