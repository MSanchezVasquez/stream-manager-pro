import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Sun,
  Moon,
  Bell,
  Search,
  Sparkles,
  Zap,
  Star,
  Menu,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { PlatformIcon } from "./common/PlatformIcon";
import { ProfilePopover } from "./Auth/ProfilePopover";
import { LogoutConfirmModal } from "./Auth/LogoutConfirmModal";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import gsap from "gsap";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onToggleSidebar?: () => void;
}

const STREAMING_PLATFORMS = [
  { id: "Netflix", label: "Netflix" },
  { id: "Disney+", label: "Disney+" },
  { id: "HBO Max", label: "HBO Max" },
  { id: "Prime Video", label: "Prime Video" },
  { id: "Spotify", label: "Spotify" },
  { id: "Paramount+", label: "Paramount+" },
  { id: "Crunchyroll", label: "Crunchyroll" },
  { id: "YouTube Premium", label: "YouTube Premium" },
  { id: "Apple TV", label: "Apple TV" },
  { id: "Star+", label: "Star+" },
  { id: "Vix", label: "Vix" },
  { id: "IPTV", label: "IPTV" },
];

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onToggleSidebar,
}) => {
  const { themeMode: theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { clients, freeProfiles } = useDataStore();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate total alerts (cut-off in <= 5 days or expired)
  const alertCount = useMemo(() => {
    return clients.reduce((acc, client) => {
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
  }, [clients]);

  const activeClientsCount = useMemo(
    () => clients.filter((c) => c.status === "active").length,
    [clients],
  );

  const freeProfilesCount = useMemo(
    () => freeProfiles.reduce((sum, p) => sum + p.quantity, 0),
    [freeProfiles],
  );

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      if (activeTab !== "clients_active" && activeTab !== "clients_inactive") {
        setActiveTab("clients_active");
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      if (activeTab !== "clients_active" && activeTab !== "clients_inactive") {
        setActiveTab("clients_active");
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#2242cc] text-white shadow-md transition-colors duration-300 select-none">
      {/* Level 1: Main Header Tier (Brand, Nav Buttons, Search & Profile) */}
      <div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Sidebar Floating Toggle Button - ONLY on Tablet & Mobile, NEVER on laptop */}
            {onToggleSidebar && activeTab !== "profile" && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer flex items-center justify-center shrink-0 border border-white/15"
                title="Abrir menú de navegación"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            )}

            {/* Brand Logo */}
            <div
              ref={logoRef}
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group min-w-0 shrink"
              onClick={() => setActiveTab("dashboard")}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <AppLogo className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="font-extrabold text-base sm:text-2xl tracking-tight text-white leading-none whitespace-nowrap">
                  Stream<span className="hidden sm:inline">Manager</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider bg-white text-[#2242cc] px-1 sm:px-1.5 py-0.5 rounded font-black shadow-sm shrink-0">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Sofascore-style Pill Search Bar (Desktop / Tablet md+) */}
          <div className="hidden md:flex flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-2 sm:mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar cliente, correo o cuenta..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-14 py-2 text-xs rounded-full border border-white/20 bg-white/15 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:bg-white/25 focus:border-white transition-all shadow-inner"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/80 hover:text-white"
                >
                  ✕
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-white/80 bg-white/15 rounded border border-white/25 pointer-events-none">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          {/* Right Action Icons & Profile (Guaranteed 100% visible on all mobile screens) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Expiration Alerts Button with Bounce Badge */}
            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={`relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all border shrink-0 ${
                activeTab === "alerts"
                  ? "bg-white text-[#2242cc] border-white shadow-sm"
                  : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
              }`}
              title="Alertas de Vencimiento"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-400 text-[#2242cc] text-[9px] font-black flex items-center justify-center animate-bounce shadow">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              ref={themeBtnRef}
              type="button"
              onClick={handleThemeToggle}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all shrink-0 cursor-pointer"
              title={
                theme === "dark"
                  ? "Cambiar a Modo Claro"
                  : "Cambiar a Modo Oscuro"
              }
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </button>

            {/* User Profile Avatar with Popover */}
            <div className="relative shrink-0 flex items-center justify-center">
              <button
                ref={avatarBtnRef}
                type="button"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border-2 border-white/40 hover:border-white flex items-center justify-center focus:outline-none cursor-pointer overflow-hidden transition-all hover:scale-105 shadow-sm"
                title="Mi Perfil"
                aria-label="Mi Perfil"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0 text-white font-black text-xs">
                    {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </button>

              <ProfilePopover
                isOpen={isPopoverOpen}
                onClose={() => setIsPopoverOpen(false)}
                triggerRef={avatarBtnRef}
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

        {/* Level 1.5: Dedicated Mobile Search Bar (Only visible on screens < md, full width, clear & visible) */}
        <div className="md:hidden px-3 sm:px-4 pb-2.5 pt-0 max-w-7xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente, correo o cuenta..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-full border border-white/25 bg-white/15 backdrop-blur-sm text-white placeholder:text-white/75 focus:outline-none focus:bg-white/25 focus:border-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Level 2: Platform Showcase Ticker (Purely visual decorative horizontal animation, only icons) */}
      <div className="bg-black/15 py-1.5 px-4 sm:px-6 lg:px-8 overflow-hidden select-none pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-0">
          {/* Marquee Track with Horizontal Sliding Animation & respective platform icons */}
          <div className="relative flex-1 min-w-0 overflow-hidden marquee-mask">
            <div className="animate-marquee-scroll flex items-center gap-4 sm:gap-6 py-0.5">
              {/* Set 1 */}
              {STREAMING_PLATFORMS.map((platform) => (
                <div
                  key={`p1-${platform.id}`}
                  className="px-2 py-0.5 flex items-center justify-center shrink-0 cursor-default opacity-85 hover:opacity-100 transition-opacity"
                  title={platform.label}
                >
                  <PlatformIcon
                    platform={platform.label}
                    className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                  />
                </div>
              ))}

              {/* Set 2 (for seamless infinite loop) */}
              {STREAMING_PLATFORMS.map((platform) => (
                <div
                  key={`p2-${platform.id}`}
                  className="px-2 py-0.5 flex items-center justify-center shrink-0 cursor-default opacity-85 hover:opacity-100 transition-opacity"
                  title={platform.label}
                >
                  <PlatformIcon
                    platform={platform.label}
                    className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Highlights & Shortcuts (Desktop only) */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-white/90 shrink-0 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Vencimientos ({alertCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("clients_active")}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-emerald-300" />
              <span>{activeClientsCount} Activos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("free_profiles")}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{freeProfilesCount} Perfiles Libres</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
