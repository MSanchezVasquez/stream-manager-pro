import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { StreamingPlatform } from "../../types";
import { ALL_STREAMING_PLATFORMS, getPlatformDisplayName } from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";

interface PlatformSelectProps {
  value: StreamingPlatform;
  onChange: (platform: StreamingPlatform) => void;
  className?: string;
}

const SELECTABLE_PLATFORMS = ALL_STREAMING_PLATFORMS.filter(
  (p) => p !== "Amazon Prime Video",
);

/**
 * Selector de plataforma con ícono + nombre completo siempre visibles.
 * Reemplaza al <option> nativo, donde variantes muy parecidas
 * (p. ej. "Disney+ Premium" y "Disney+ Estándar") quedan una debajo de
 * la otra con letra pequeña y son fáciles de confundir con un clic.
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

  useEffect(() => {
    if (!isOpen) return;

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
    // Pequeño delay para no robar el foco antes de que termine de montarse.
    const t = setTimeout(() => searchInputRef.current?.focus(), 10);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      clearTimeout(t);
    };
  }, [isOpen]);

  const filteredPlatforms = SELECTABLE_PLATFORMS.filter((p) =>
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
        className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium flex items-center justify-between gap-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          <PlatformIcon platform={value} className="w-4 h-4 shrink-0" />
          <span className="truncate">{getPlatformDisplayName(value)}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1.5 w-full min-w-[220px] rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#17171C] shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-[#25252D]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plataforma..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] border border-transparent focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          <ul
            role="listbox"
            className="max-h-64 overflow-y-auto py-1 [scrollbar-width:thin]"
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
