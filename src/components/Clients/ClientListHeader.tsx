import React, { useRef, useState, useEffect } from "react";
import {
  ShieldCheck,
  UserX,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    // Initial check and after DOM layout settles
    updateScrollState();
    const timeout = setTimeout(updateScrollState, 50);

    const el = scrollRef.current;
    if (!el) return () => clearTimeout(timeout);

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [platformOptions]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Difuminado suave estilo navbar marquee según el estado de desplazamiento
  const getMaskStyle = (): React.CSSProperties => {
    if (canScrollLeft && canScrollRight) {
      const mask =
        "linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 48px), transparent 100%)";
      return {
        WebkitMaskImage: mask,
        maskImage: mask,
      };
    }
    if (canScrollRight) {
      const mask =
        "linear-gradient(to right, black 0%, black calc(100% - 48px), transparent 100%)";
      return {
        WebkitMaskImage: mask,
        maskImage: mask,
      };
    }
    if (canScrollLeft) {
      const mask =
        "linear-gradient(to right, transparent 0%, black 28px, black 100%)";
      return {
        WebkitMaskImage: mask,
        maskImage: mask,
      };
    }
    return {};
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm space-y-3.5">
      {/* Top Row: Title, Counter & Add Client Action */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
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

        <button
          onClick={onAddClient}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Cliente</span>
        </button>
      </div>

      {/* Platform Filter Buttons - With marquee-like fade masks and smooth horizontal navigation */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#1F1F23] flex items-center gap-2 min-w-0 relative">
        <span className="text-xs font-semibold text-slate-500 dark:text-[#94949E] mr-1 flex items-center gap-1.5 shrink-0 select-none">
          <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          Plataforma:
        </span>

        {/* Scroll Left Button if needed */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-180)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#1A1A1E] hover:bg-slate-200 dark:hover:bg-[#25252E] text-slate-600 dark:text-slate-300 shrink-0 transition-colors shadow-xs cursor-pointer"
            title="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container with Difuminado Fade Mask */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          style={getMaskStyle()}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 min-w-0 flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 scroll-smooth"
        >
          {platformOptions.map((plat) => (
            <button
              key={plat}
              onClick={() => onSelectPlatform(plat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                platformFilter === plat
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] hover:bg-slate-200 dark:hover:bg-[#25252E] hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-[#2D2D33]"
              }`}
            >
              {plat !== "Todos" && (
                <PlatformIcon platform={plat} className="w-3.5 h-3.5" />
              )}
              <span>{plat}</span>
            </button>
          ))}
        </div>

        {/* Scroll Right Button if needed */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(180)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#1A1A1E] hover:bg-slate-200 dark:hover:bg-[#25252E] text-slate-600 dark:text-slate-300 shrink-0 transition-colors shadow-xs cursor-pointer"
            title="Desplazar a la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
