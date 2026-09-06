import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Sun,
  Moon,
  Bell,
  Search,
  Sparkles,
  Tv,
  Film,
  Zap,
  Star,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
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
}

const STREAMING_PLATFORMS = [
  { id: "all", label: "Todas" },
  { id: "Netflix", label: "Netflix" },
  { id: "Disney+", label: "Disney+" },
  { id: "Max", label: "Max" },
  { id: "Prime Video", label: "Prime Video" },
  { id: "Spotify", label: "Spotify" },
  { id: "Paramount+", label: "Paramount+" },
  { id: "Crunchyroll", label: "Crunchyroll" },
  { id: "YouTube", label: "YouTube" },
  { id: "IPTV", label: "IPTV" },
];

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
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

  const handlePlatformClick = (platformId: string) => {
    if (platformId === "all") {
      setSearchQuery("");
      return;
    }
    if (searchQuery.toLowerCase() === platformId.toLowerCase()) {
      setSearchQuery("");
    } else {
      setSearchQuery(platformId);
      if (activeTab !== "clients_active" && activeTab !== "clients_inactive") {
        setActiveTab("clients_active");
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#2242cc] text-white shadow-md transition-colors duration-300 select-none">
      {/* Level 1: Main Header Tier (Brand, Nav Buttons, Search & Profile) */}
      <div className="border-b border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div
            ref={logoRef}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <AppLogo className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
                StreamManager
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-white text-[#2242cc] px-1.5 py-0.5 rounded font-black shadow-sm">
                PRO
              </span>
            </div>
          </div>

          {/* Sofascore-style Pill Search Bar */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar cliente, correo o cuenta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Expiration Alerts Button with Bounce Badge */}
            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={`relative p-2 rounded-xl transition-all border ${
                activeTab === "alerts"
                  ? "bg-white text-[#2242cc] border-white shadow-sm"
                  : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
              }`}
              title="Alertas de Vencimiento"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-[#2242cc] text-[10px] font-black flex items-center justify-center animate-bounce shadow">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              ref={themeBtnRef}
              type="button"
              onClick={handleThemeToggle}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              title={
                theme === "dark"
                  ? "Cambiar a Modo Claro"
                  : "Cambiar a Modo Oscuro"
              }
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
                className="relative w-9 h-9 shrink-0 rounded-full border-2 border-white/40 hover:border-white flex items-center justify-center focus:outline-none cursor-pointer overflow-hidden transition-all hover:scale-105 shadow-sm"
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
      </div>

      {/* Level 2: Category & Platform Filters Sub-bar (Sofascore Sports Bar Style) */}
      <div className="bg-black/10 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Platform Pills (Horizontal scrolling) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {STREAMING_PLATFORMS.map((platform) => {
              const isSelected =
                platform.id === "all"
                  ? searchQuery === ""
                  : searchQuery.toLowerCase() === platform.id.toLowerCase();

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformClick(platform.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-white text-[#2242cc] font-black shadow-sm"
                      : "text-white/85 hover:text-white hover:bg-white/15 font-semibold"
                  }`}
                >
                  {platform.id === "all" ? (
                    <Film className="w-3.5 h-3.5" />
                  ) : (
                    <Tv className="w-3 h-3" />
                  )}
                  <span>{platform.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Highlights & Shortcuts (Sofascore style) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-white/90 shrink-0">
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
