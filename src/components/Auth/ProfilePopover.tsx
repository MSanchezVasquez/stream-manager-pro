import React, { useRef, useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
  LogIn,
  User,
  Check,
  Star,
  Calendar,
  Award,
  ShieldCheck,
  Tv,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import gsap from "gsap";

import { LogoutConfirmModal } from "./LogoutConfirmModal";

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onRequestLogout?: () => void;
  onOpenAuthModal?: () => void;
  onOpenProfile?: () => void;
  /** Ref del botón que abre/cierra el popover (ej. el avatar en el Navbar).
   * Se usa para que el listener de "clic afuera" no lo cierre y lo vuelva
   * a abrir en el mismo clic. */
  triggerRef?: React.RefObject<HTMLElement>;
}

const LANGUAGES = [
  { code: "es", shortCode: "ES", name: "Español" },
  { code: "es-LATAM", shortCode: "MX", name: "Español (Latinoamérica)" },
  { code: "en-US", shortCode: "US", name: "English (US)" },
  { code: "en-UK", shortCode: "GB", name: "English (UK)" },
  { code: "ar", shortCode: "SA", name: "العَرَبِيةُ" },
  { code: "az", shortCode: "AZ", name: "Azərbaycan" },
  { code: "bn", shortCode: "BD", name: "বাংলা" },
  { code: "cs", shortCode: "CS", name: "Český" },
  { code: "da", shortCode: "DA", name: "Dansk" },
  { code: "de", shortCode: "DE", name: "Deutsch" },
  { code: "el", shortCode: "GR", name: "Ελληνικά" },
  { code: "fr", shortCode: "FR", name: "Français" },
  { code: "hi", shortCode: "HI", name: "Hindī" },
  { code: "hr", shortCode: "HR", name: "Hrvatski" },
  { code: "hu", shortCode: "HU", name: "Magyar" },
  { code: "it", shortCode: "IT", name: "Italiano" },
  { code: "ja", shortCode: "JP", name: "日本語" },
  { code: "ko", shortCode: "KR", name: "한국어" },
  { code: "nl", shortCode: "NL", name: "Nederlands" },
  { code: "pl", shortCode: "PL", name: "Polski" },
  { code: "pt", shortCode: "PT", name: "Português" },
  { code: "ru", shortCode: "RU", name: "Русский" },
  { code: "tr", shortCode: "TR", name: "Türkçe" },
  { code: "zh", shortCode: "ZH", name: "中文" },
];

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onRequestLogout,
  onOpenAuthModal,
  onOpenProfile,
  triggerRef,
}) => {
  const { user, logout } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();

  const [selectedLangCode, setSelectedLangCode] = useState<string>("es");
  const [autoDetectLang, setAutoDetectLang] = useState<boolean>(true);
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && popoverRef.current) {
      gsap.fromTo(
        popoverRef.current,
        { opacity: 0, scale: 0.92, y: -12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "back.out(1.5)" },
      );
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsidePopover = popoverRef.current?.contains(target);
      const clickedOnTrigger = triggerRef?.current?.contains(target);

      // Si el clic fue dentro del popover o sobre el botón que lo abre/cierra,
      // dejamos que el propio onClick del botón maneje el toggle y NO cerramos
      // aquí (evita que se cierre y se vuelva a abrir en el mismo clic).
      if (!clickedInsidePopover && !clickedOnTrigger) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !user) return null;

  const handleStartLogin = () => {
    onClose();
    if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split("@")[0];
    return "Usuario Streaming";
  };

  return (
    <div
      ref={popoverRef}
      style={{ transformOrigin: "top right" }}
      className="absolute right-0 top-full mt-3 w-80 sm:w-88 z-50 bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl shadow-2xl overflow-hidden transition-colors duration-200"
    >
      <button
        onClick={() => {
          if (onOpenProfile) onOpenProfile();
          onClose();
        }}
        className="w-full text-left hover:cursor-pointer px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1F1F26] transition-colors border-b border-slate-100 dark:border-[#25252D]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-indigo-500/10 flex items-center justify-center shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="truncate">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight">
              {getUserDisplayName()}
            </h4>
            <p
              className="text-xs font-medium mt-0.5 flex items-center gap-1 text-[#374df5]"
              style={{ color: "#374df5" }}
            >
              Perfil
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-[#80808C] shrink-0" />
      </button>

      {/* 2. Idioma Section */}
      <div className="py-3 border-b border-slate-100 dark:border-[#25252D]">
        <label className="block px-5 text-xs font-bold text-slate-900 dark:text-white mb-1">
          Idioma
        </label>

        <div>
          {(() => {
            const currentLang =
              LANGUAGES.find((l) => l.code === selectedLangCode) ||
              LANGUAGES[0];
            return (
              <>
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className={`hover:cursor-pointer w-full px-5 py-2 text-slate-900 dark:text-white text-sm font-normal flex items-center justify-between transition-colors ${
                    showLangDropdown
                      ? "bg-indigo-100/80 dark:bg-[#202038]"
                      : "hover:bg-slate-50 dark:hover:bg-[#1F1F26]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white w-6 shrink-0">
                      {currentLang.shortCode}
                    </span>
                    <span className="text-sm font-normal text-slate-900 dark:text-white">
                      {currentLang.name}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-900 dark:text-white fill-current shrink-0 transition-transform ${showLangDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showLangDropdown && (
                  <div className="max-h-56 overflow-y-auto py-1 bg-white dark:bg-[#16161C] border-y border-slate-100 dark:border-[#25252D] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {LANGUAGES.map((lang) => {
                      const isSelected = selectedLangCode === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLangCode(lang.code);
                            setShowLangDropdown(false);
                          }}
                          className={`w-full px-5 py-2 text-sm flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-indigo-100/80 dark:bg-[#202038] text-slate-900 dark:text-white font-medium"
                              : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F1F26]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-900 dark:text-white w-6 shrink-0">
                              {lang.shortCode}
                            </span>
                            <span className="text-sm font-normal">
                              {lang.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <div className="px-5 pt-2 ">
          <button
            onClick={() => setAutoDetectLang(!autoDetectLang)}
            className={`hover:cursor-pointer w-full py-1.5 px-3.5 rounded-full border text-xs font-medium text-center transition-all ${
              autoDetectLang
                ? "border-[#374df5] text-[#374df5] dark:border-indigo-400 dark:text-[#374df5] bg-transparent"
                : "border-slate-300 dark:border-[#2D2D35] text-slate-600 dark:text-[#94949E] bg-transparent"
            }`}
          >
            Detecta automáticamente el idioma
          </button>
        </div>
      </div>

      {/* 3. Tema Section */}
      <div className="py-3 border-b border-slate-100 dark:border-[#25252D]">
        <label className="block px-5 text-xs font-bold text-slate-900 dark:text-white mb-1">
          Tema
        </label>

        {/* Sistema */}
        <button
          onClick={() => setThemeMode("system")}
          className={`w-full flex items-center gap-3.5 px-5 py-2 text-sm text-slate-900 dark:text-white transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1F1F26] ${
            themeMode === "system" ? "font-medium" : "font-normal"
          }`}
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#374df5] flex items-center justify-center shrink-0">
            {themeMode === "system" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#374df5]" />
            )}
          </div>
          <span>Sistema</span>
        </button>

        {/* Claro */}
        <button
          onClick={() => setThemeMode("light")}
          className={`w-full flex items-center gap-3.5 px-5 py-2 text-sm text-slate-900 dark:text-white transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1F1F26] ${
            themeMode === "light" ? "font-medium" : "font-normal"
          }`}
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#374df5] flex items-center justify-center shrink-0">
            {themeMode === "light" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#374df5]" />
            )}
          </div>
          <span>Claro</span>
        </button>

        {/* Oscuro */}
        <button
          onClick={() => setThemeMode("dark")}
          className={`w-full flex items-center gap-3.5 px-5 py-2 text-sm text-slate-900 dark:text-white transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1F1F26] ${
            themeMode === "dark" ? "font-medium" : "font-normal"
          }`}
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#374df5] flex items-center justify-center shrink-0">
            {themeMode === "dark" && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#374df5]" />
            )}
          </div>
          <span>Oscuro</span>
        </button>
      </div>

      {/* 4. Options & Logout Section */}
      <div className="py-0">
        <button
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            onClose();
          }}
          className="hover:cursor-pointer w-full flex items-center gap-3.5 px-5 py-3 text-sm font-normal text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F1F26] transition-colors border-b border-slate-100 dark:border-[#25252D]"
        >
          <Settings className="w-5 h-5 text-slate-900 dark:text-white shrink-0" />
          <span>Todos los ajustes</span>
        </button>

        {user && (
          <>
            <button
              onClick={() => {
                onClose();
                if (onRequestLogout) {
                  onRequestLogout();
                } else {
                  setShowLogoutConfirm(true);
                }
              }}
              className="hover:cursor-pointer w-full flex items-center gap-3.5 px-5 py-3 text-sm font-normal text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F1F26] transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-red-500 font-medium">Cerrar sesión</span>
            </button>

            {!onRequestLogout && (
              <LogoutConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                  onClose();
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
