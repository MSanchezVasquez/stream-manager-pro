import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import gsap from "gsap";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  dotColor?: string;
  badge?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps<T = string> {
  value?: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  position?: "bottom" | "top";
}

/**
 * CustomSelect reutilizable con el mismo diseño visual, animaciones GSAP
 * y refinamiento que PlatformSelect:
 * - Trigger con bordes redondeados (rounded-xl), borde slate y foco indigo
 * - Chevron animado con rotación suave (GSAP)
 * - Menú flotante con backdrop blur, bordes redondeados (rounded-2xl) y sombra profunda
 * - Indicadores visuales de selección (background sutil indigo + icono de verificación)
 * - Soporte para iconos, dot indicators de estado y buscador integrado
 */
export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  icon,
  searchable,
  searchPlaceholder = "Buscar...",
  disabled = false,
  size = "md",
  position = "bottom",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  // Determinar si activar buscador automáticamente si hay muchas opciones
  const shouldShowSearch =
    searchable !== undefined ? searchable : options.length > 7;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.96, y: position === "top" ? 8 : -8 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "back.out(1.6)",
        },
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
    const t = setTimeout(() => searchInputRef.current?.focus(), 15);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      clearTimeout(t);
    };
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen && chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 0,
        duration: 0.18,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const filteredOptions = query.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(query.trim().toLowerCase()) ||
        (opt.description &&
          opt.description.toLowerCase().includes(query.trim().toLowerCase())),
      )
    : options;

  const handleSelect = (optVal: T) => {
    onChange(optVal);
    setIsOpen(false);
    setQuery("");
  };

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-30" : "z-10"} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full rounded-xl border transition-colors flex items-center justify-between gap-2 cursor-pointer select-none outline-none focus:outline-none focus:ring-0 ${
          isSmall ? "px-3 py-1.5 text-xs" : "p-2.5 text-xs"
        } ${
          isOpen
            ? "border-indigo-500 dark:border-indigo-500 bg-white dark:bg-[#0F0F12]"
            : "border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] hover:border-indigo-400 dark:hover:border-indigo-500"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-[#141418]"
            : ""
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0 text-left">
          {selectedOption?.icon ? (
            <span className="shrink-0 flex items-center">
              {selectedOption.icon}
            </span>
          ) : selectedOption?.dotColor ? (
            <span
              className={`w-2 h-2 rounded-full ${selectedOption.dotColor} shrink-0 ring-2 ring-white/50 dark:ring-black/50`}
            />
          ) : icon ? (
            <span className="shrink-0 flex items-center text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          ) : null}

          <span
            className={`truncate font-medium ${
              selectedOption
                ? "text-slate-900 dark:text-[#E4E4E7]"
                : "text-slate-400 dark:text-[#71717A]"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          ref={chevronRef}
          className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none"
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{
            transformOrigin: position === "top" ? "bottom" : "top",
          }}
          className={`absolute ${
            position === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } left-0 z-40 w-full min-w-[200px] rounded-2xl border border-slate-200 dark:border-[#2D2D33] bg-white/95 dark:bg-[#17171C]/95 backdrop-blur-md shadow-2xl overflow-hidden ${menuClassName}`}
        >
          {shouldShowSearch && (
            <div className="p-2 border-b border-slate-100 dark:border-[#25252D]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-2 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] border border-transparent focus:border-indigo-400 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <ul
            role="listbox"
            className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#3a3a44_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#3a3a44] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4a4a56]"
          >
            {filteredOptions.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400 text-center">
                Sin resultados
              </li>
            )}
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={String(opt.value)} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-700 dark:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1F1F26]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon ? (
                        <span className="shrink-0 flex items-center">
                          {opt.icon}
                        </span>
                      ) : opt.dotColor ? (
                        <span
                          className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0 ring-2 ring-white/40 dark:ring-black/40`}
                        />
                      ) : null}

                      <div className="truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.description && (
                          <p className="text-[10px] text-slate-400 dark:text-[#8E8E98] truncate">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && <span>{opt.badge}</span>}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
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
