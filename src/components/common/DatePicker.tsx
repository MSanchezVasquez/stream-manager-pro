import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import gsap from "gsap";
import { useSettingsStore } from "../../store/settingsStore";

export interface DatePickerProps {
  /** Fecha en formato "DD/MM/YYYY" (o "DD/MM/YY"), igual que el resto de la app. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Clases adicionales para el texto del valor mostrado (ej. resaltar
   * en ámbar una fecha de corte), sin afectar el color del placeholder. */
  valueClassName?: string;
  /** Posición preferida: 'auto' (por defecto) calcula dinámicamente si abrir arriba o abajo según el espacio disponible */
  placement?: "auto" | "top" | "bottom";
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const WEEKDAY_LABELS_MONDAY = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const WEEKDAY_LABELS_SUNDAY = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Acepta "DD/MM/YYYY" o "DD/MM/YY" (años de 2 dígitos se asumen 20XX). */
function parseDate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (!day || !month || !year) return null;
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Genera una grilla de 42 días (6 semanas), iniciando en el día configurado por el usuario. */
function buildCalendarGrid(
  year: number,
  month: number,
  weekStartsOn: "monday" | "sunday",
): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const jsWeekday = firstOfMonth.getDay(); // 0 = Domingo ... 6 = Sábado
  const startWeekday =
    weekStartsOn === "monday" ? (jsWeekday + 6) % 7 : jsWeekday;
  const gridStart = new Date(year, month, 1 - startWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

/**
 * Selector de fecha con panel de calendario visual rendered vía createPortal
 * con posicionamiento inteligente (se abre hacia arriba si no cabe abajo)
 * y clamping para nunca salirse de la pantalla ni quedar tapado por footers.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
  valueClassName = "",
  placement = "auto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDate(value);
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  }>({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const calculatePosition = () => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const CALENDAR_HEIGHT = 325;
    const CALENDAR_WIDTH = 288;
    const PADDING = 8;

    // Si el botón quedó completamente fuera de la vista al scrollear
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return null;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let computedPlacement: "top" | "bottom" = "bottom";
    if (placement === "top") {
      computedPlacement = "top";
    } else if (placement === "bottom") {
      computedPlacement = "bottom";
    } else {
      // Auto: si no cabe abajo (< 330px) y hay más espacio arriba, abrir arriba
      if (spaceBelow < CALENDAR_HEIGHT && spaceAbove > spaceBelow) {
        computedPlacement = "top";
      } else {
        computedPlacement = "bottom";
      }
    }

    let top =
      computedPlacement === "top"
        ? rect.top - CALENDAR_HEIGHT - 6
        : rect.bottom + 6;

    // Asegurar que siempre se mantenga dentro de los límites verticales visibles
    if (top < PADDING) {
      top = PADDING;
    } else if (top + CALENDAR_HEIGHT > window.innerHeight - PADDING) {
      top = Math.max(PADDING, window.innerHeight - CALENDAR_HEIGHT - PADDING);
    }

    // Asegurar que se mantenga dentro de los límites horizontales visibles
    let left = rect.left;
    if (left + CALENDAR_WIDTH > window.innerWidth - PADDING) {
      left = Math.max(PADDING, rect.right - CALENDAR_WIDTH);
    }
    if (left < PADDING) {
      left = PADDING;
    }

    return { top, left, placement: computedPlacement };
  };

  const handleToggle = () => {
    if (!isOpen) {
      const pos = calculatePosition();
      if (pos) setCoords(pos);
      setViewDate(parseDate(value) || new Date());
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      const pos = calculatePosition();
      if (pos) {
        setCoords(pos);
      } else {
        setIsOpen(false);
      }
    };

    handleUpdate();

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: coords.placement === "top" ? 8 : -8,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "back.out(1.6)",
        },
      );
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", handleUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleUpdate, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleUpdate, { capture: true });
      window.removeEventListener("resize", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, placement]);

  const grid = buildCalendarGrid(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    weekStartsOn,
  );
  const weekdayLabels =
    weekStartsOn === "monday" ? WEEKDAY_LABELS_MONDAY : WEEKDAY_LABELS_SUNDAY;
  const today = new Date();

  const goToPrevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleSelectDay = (day: Date) => {
    onChange(formatDate(day));
    setIsOpen(false);
  };

  const handleToday = () => {
    onChange(formatDate(today));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium flex items-center justify-between gap-2.5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          <Calendar className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
          <span
            className={`truncate tracking-wide ${
              value ? valueClassName : "text-slate-400 dark:text-[#5A5A64]"
            }`}
          >
            {value || placeholder}
          </span>
        </div>
        {value && (
          <span
            role="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 p-1 rounded-md shrink-0 cursor-pointer ml-auto transition-colors"
            title="Limpiar fecha"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transformOrigin:
                coords.placement === "top" ? "bottom center" : "top center",
            }}
            className="z-[9999] w-72 rounded-2xl border border-slate-200 dark:border-[#2D2D33] bg-white/98 dark:bg-[#17171C]/98 backdrop-blur-md shadow-2xl overflow-hidden p-3 select-none"
          >
            {/* Header: navegación de mes */}
            <div className="flex items-center justify-between mb-2 px-1">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg text-slate-500 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-[#E4E4E7]">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg text-slate-500 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-0.5 mb-1 px-1">
              {weekdayLabels.map((wd) => (
                <span
                  key={wd}
                  className="text-center text-[10px] font-bold text-slate-400 dark:text-[#6C6C78] py-1"
                >
                  {wd}
                </span>
              ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-0.5 px-1">
              {grid.map((day, i) => {
                const inCurrentMonth = day.getMonth() === viewDate.getMonth();
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`aspect-square rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isToday
                          ? "border border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : inCurrentMonth
                            ? "text-slate-700 dark:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1F1F26]"
                            : "text-slate-300 dark:text-[#3A3A44] hover:bg-slate-50 dark:hover:bg-[#1A1A1E]"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer: accesos rápidos */}
            <div className="flex items-center justify-between mt-2 pt-2 px-1 border-t border-slate-100 dark:border-[#25252D]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-[11px] font-semibold text-slate-500 dark:text-[#94949E] hover:text-red-500 transition-colors cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Hoy
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
