import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import {
  X,
  ChevronDown,
  Check,
  CalendarDays,
  Languages,
  Palette,
} from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useSettingsStore, WeekStart } from "../../store/settingsStore";
import { LANGUAGES } from "../../utils/languages";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT = "#374df5";

function RadioRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 text-left text-sm text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26] rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
    >
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: ACCENT }}
      >
        {selected && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
        )}
      </div>
      <span className={selected ? "font-semibold" : "font-normal"}>
        {label}
      </span>
    </button>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#25252D] bg-slate-50 dark:bg-[#181820] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { themeMode, setThemeMode } = useThemeStore();
  const {
    language,
    autoDetectLanguage,
    weekStartsOn,
    setLanguage,
    setAutoDetectLanguage,
    setWeekStartsOn,
  } = useSettingsStore();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowLangDropdown(false);

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" },
      );
    }
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: "back.out(1.5)" },
      );
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLang =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Fondo sólido oscuro, SIN blur (a diferencia de los otros modales de la app) */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/80"
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] rounded-3xl shadow-2xl scrollbar-thin"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#25252D] bg-white/95 dark:bg-[#141418]/95 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Ajustes
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid de tarjetas de ajustes */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Idioma */}
          <SettingsCard icon={Languages} title="Idioma">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangDropdown((o) => !o)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-[#2D2D33] text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold w-6 shrink-0">
                    {currentLang.shortCode}
                  </span>
                  <span>{currentLang.name}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showLangDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showLangDropdown && (
                <div className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] shadow-xl scrollbar-thin">
                  {LANGUAGES.map((lang) => {
                    const isSelected = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : "text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-bold w-6 shrink-0">
                            {lang.shortCode}
                          </span>
                          <span>{lang.name}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setAutoDetectLanguage(!autoDetectLanguage)}
              className={`mt-3 w-full py-1.5 px-3.5 rounded-full border text-xs font-medium text-center transition-all cursor-pointer ${
                autoDetectLanguage
                  ? "text-[#374df5] dark:text-[#6d84ff]"
                  : "border-slate-300 dark:border-[#2D2D35] text-slate-600 dark:text-[#94949E]"
              }`}
              style={autoDetectLanguage ? { borderColor: ACCENT } : undefined}
            >
              Detecta automáticamente el idioma
            </button>
          </SettingsCard>

          {/* Tema */}
          <SettingsCard icon={Palette} title="Tema">
            <RadioRow
              label="Sistema"
              selected={themeMode === "system"}
              onClick={() => setThemeMode("system")}
            />
            <RadioRow
              label="Claro"
              selected={themeMode === "light"}
              onClick={() => setThemeMode("light")}
            />
            <RadioRow
              label="Oscuro"
              selected={themeMode === "dark"}
              onClick={() => setThemeMode("dark")}
            />
          </SettingsCard>

          {/* Primer día de la semana */}
          <SettingsCard icon={CalendarDays} title="Primer Día de la Semana">
            <RadioRow
              label="Lunes"
              selected={weekStartsOn === "monday"}
              onClick={() => setWeekStartsOn("monday" as WeekStart)}
            />
            <RadioRow
              label="Domingo"
              selected={weekStartsOn === "sunday"}
              onClick={() => setWeekStartsOn("sunday" as WeekStart)}
            />
            <p className="mt-2 text-[11px] text-slate-500 dark:text-[#94949E] leading-relaxed">
              Afecta cómo se muestra el calendario en los selectores de fecha
              (contratación, corte, expiración).
            </p>
          </SettingsCard>
        </div>
      </div>
    </div>,
    document.body,
  );
};
