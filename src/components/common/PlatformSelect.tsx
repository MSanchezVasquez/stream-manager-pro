import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import gsap from "gsap";
import { StreamingPlatform } from "../../types";
import {
  ALL_STREAMING_PLATFORMS,
  getPlatformDisplayName,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "./PlatformIcon";

interface PlatformSelectProps {
  value: StreamingPlatform;
  onChange: (platform: StreamingPlatform) => void;
  className?: string;
}

/**
 * Selector de plataforma con ícono + nombre completo siempre visibles,
 * buscador y panel animado con GSAP (consistente con el resto de
 * paneles flotantes de la app, como ProfilePopover). Reemplaza al
 * <select> nativo del navegador en todos los formularios que eligen
 * una plataforma de streaming (Clientes, Proveedores, Perfiles Libres).
 */
export const PlatformSelect: React.FC<PlatformSelectProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Animación de entrada del panel: escala + fade, mismo estilo
    // (back.out) usado en ProfilePopover y los modales de la app.
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.95, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(1.6)" },
      );
    }
    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 180,
        duration: 0.2,
        ease: "power2.out",
      });
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    const t = setTimeout(() => searchInputRef.current?.focus(), 10);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      clearTimeout(t);
    };
  }, [isOpen]);

  // Restaura la rotación del chevron cuando se cierra el panel
  useEffect(() => {
    if (!isOpen && chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 0,
        duration: 0.18,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const filteredPlatforms = ALL_STREAMING_PLATFORMS.filter((p) =>
    p.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const handleSelect = (platform: StreamingPlatform) => {
    onChange(platform);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium flex items-center justify-between gap-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          <PlatformIcon platform={value} className="w-4 h-4 shrink-0" />
          <span className="truncate">{getPlatformDisplayName(value)}</span>
        </span>
        <ChevronDown
          ref={chevronRef}
          className="w-3.5 h-3.5 text-slate-400 shrink-0"
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{ transformOrigin: "top" }}
          className="absolute z-30 mt-1.5 w-full min-w-60 rounded-2xl border border-slate-200 dark:border-[#2D2D33] bg-white/95 dark:bg-[#17171C]/95 backdrop-blur-md shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-slate-100 dark:border-[#25252D]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plataforma..."
                className="w-full pl-8 pr-2 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] border border-transparent focus:border-indigo-400 outline-none transition-colors"
              />
            </div>
          </div>

          <ul
            role="listbox"
            className="max-h-64 overflow-y-auto py-1.5 scrollbar-thin [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#3a3a44_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a44] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4a4a56]"
          >
            {filteredPlatforms.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400 text-center">
                Sin resultados
              </li>
            )}
            {filteredPlatforms.map((platform) => {
              const isSelected = platform === value;
              return (
                <li key={platform} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(platform)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-700 dark:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1F1F26]"
                    }`}
                  >
                    <PlatformIcon
                      platform={platform}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="truncate">{platform}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
