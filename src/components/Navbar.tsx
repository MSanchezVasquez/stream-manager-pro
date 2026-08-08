import React, { useRef, useEffect, useState } from "react";
import {
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Bell,
  Search,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { ProfilePopover } from "./Auth/ProfilePopover";
import { LogoutConfirmModal } from "./Auth/LogoutConfirmModal";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import gsap from "gsap";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { clients } = useData();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  const logoRef = useRef<HTMLDivElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate total alerts (cut-off in <= 5 days or expired)
  const alertCount = clients.reduce((acc, client) => {
    if (client.status !== "active") return acc;
    const count = client.subscriptions.filter((sub) => {
      if (!sub.cutDate) return false;
      const parts = sub.cutDate.split("/");
      if (parts.length === 3) {
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        const target = new Date(
          year,
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
        const diff = Math.ceil(
          (target.getTime() - Date.now()) / (1000 * 3600 * 24),
        );
        return diff <= 5;
      }
      return false;
    }).length;
    return acc + count;
  }, 0);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      );
    }
  }, []);

  const handleThemeToggle = () => {
    if (themeBtnRef.current) {
      gsap.to(themeBtnRef.current, {
        rotate: theme === "dark" ? 180 : 0,
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    }
    toggleTheme();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-[#1F1F23] bg-white/80 dark:bg-[#0F0F12]/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          ref={logoRef}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab("dashboard")}
        >
          <div className="flex items-center justify-center shrink-0">
            <AppLogo className="w-8 h-8 text-slate-800 dark:text-[#E4E4E7]" />
          </div>
          <div>
            <h1 className="font-bold text-2xl leading-none tracking-tight text-slate-900 dark:text-[#E4E4E7] flex items-center gap-2">
              StreamManager
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
            <input
              type="text"
              placeholder="Buscar por cliente, correo o servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] placeholder-slate-400 dark:placeholder-[#94949E] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions & Controls */}
        <div className="flex items-center gap-2">
          {/* Expiration Alerts Trigger */}
          <button
            onClick={() => setActiveTab("alerts")}
            className={`relative p-2 rounded-xl border transition-all ${
              activeTab === "alerts"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                : "border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1A1A1E]"
            }`}
            title="Alertas de Vencimiento"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {alertCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            ref={themeBtnRef}
            onClick={handleThemeToggle}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
            title={
              theme === "dark"
                ? "Cambiar a Modo Claro"
                : "Cambiar a Modo Oscuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Profile Avatar / Auth Status */}
          <div className="relative shrink-0 flex items-center justify-center">
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center focus:outline-none cursor-pointer overflow-hidden transition-transform"
              title="Mi Perfil"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Perfil"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#1A1A20] border border-slate-200 dark:border-[#2D2D35] flex items-center justify-center overflow-hidden shrink-0">
                  {user ? (
                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </span>
                  ) : (
                    <svg
                      viewBox="0 0 100 100"
                      className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="currentColor"
                        fillOpacity="0.15"
                      />
                      <path d="M50 20 C42 20 38 28 42 36 C34 38 32 46 38 52 C32 58 36 68 46 68 C40 76 52 82 60 76 C68 70 66 58 60 52 C66 46 64 36 56 34 C60 26 56 20 50 20 Z" />
                      <circle cx="46" cy="32" r="3" fill="currentColor" />
                    </svg>
                  )}
                </div>
              )}
            </button>

            {/* Profile Popover Menu */}
            <ProfilePopover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
              onOpenSettings={onOpenAuthModal}
              onOpenAuthModal={onOpenAuthModal}
              onOpenProfile={() => setActiveTab("profile")}
              onRequestLogout={() => {
                setIsPopoverOpen(false);
                setIsLogoutModalOpen(true);
              }}
            />
          </div>

          <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleConfirmLogout}
          />
        </div>
      </div>
    </header>
  );
};
