import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import gsap from "gsap";
import { useSettingsStore } from "../../store/settingsStore";

interface DatePickerProps {
  /** Fecha en formato "DD/MM/YYYY" (o "DD/MM/YY"), igual que el resto de la app. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Clases adicionales para el texto del valor mostrado (ej. resaltar
   * en ámbar una fecha de corte), sin afectar el color del placeholder. */
  valueClassName?: string;
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
 * Selector de fecha con panel de calendario visual, animado con GSAP
 * (mismo estilo que PlatformSelect). Reemplaza a los <input type="text">
 * de fecha en formato libre, para no depender de que el usuario escriba
 * el formato correcto a mano.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
  valueClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDate(value);
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setViewDate(selectedDate || new Date());

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.95, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(1.6)" },
      );
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium flex items-center justify-between gap-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
          <span
            className={
              value ? valueClassName : "text-slate-400 dark:text-[#5A5A64]"
            }
          >
            {value || placeholder}
          </span>
        </span>
        {value && (
          <span
            role="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-red-500 p-0.5 shrink-0 cursor-pointer"
            title="Limpiar fecha"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{ transformOrigin: "top" }}
          className="absolute z-30 mt-1.5 w-72 rounded-2xl border border-slate-200 dark:border-[#2D2D33] bg-white/95 dark:bg-[#17171C]/95 backdrop-blur-md shadow-2xl overflow-hidden p-3"
        >
          {/* Header: navegación de mes */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-[#E4E4E7]">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
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
                  className={`aspect-square rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold"
                      : isToday
                        ? "border border-indigo-400 text-indigo-600 dark:text-indigo-400"
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
              className="text-[11px] font-semibold text-slate-500 dark:text-[#94949E] hover:text-red-500 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
