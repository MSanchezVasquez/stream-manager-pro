import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Bell,
  Search,
  Menu,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PlatformIcon } from './common/PlatformIcon';
import { ProfilePopover } from './Auth/ProfilePopover';
import { LogoutConfirmModal } from './Auth/LogoutConfirmModal';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useTranslation } from '../utils/translations';
import { getDaysRemaining } from '../utils/platformHelpers';

import gsap from 'gsap';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleSidebar?: () => void;
}

const STREAMING_PLATFORMS = [
  { id: 'Netflix Premium', label: 'Netflix Premium' },
  { id: 'Disney+ Premium', label: 'Disney+ Premium' },
  { id: 'HBO Max Estándar', label: 'HBO Max Estándar' },
  { id: 'Prime Video', label: 'Prime Video' },
  { id: 'Youtube Premium', label: 'Youtube Premium' },
  { id: 'Paramount Plus', label: 'Paramount Plus' },
  { id: 'Spotify Premium', label: 'Spotify Premium' },
  { id: 'Crunchyroll Fan', label: 'Crunchyroll Fan' },
  { id: 'DGO', label: 'DGO' },
  { id: 'Apple TV', label: 'Apple TV' },
  { id: 'Vix Premium', label: 'Vix Premium' },
  { id: 'Movistar TV', label: 'Movistar TV' },
];

const PLATFORMS_SEQUENCE = [
  ...STREAMING_PLATFORMS,
  ...STREAMING_PLATFORMS,
];

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenSettingsModal,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuthStore();
  const { clients, suppliers } = useDataStore();
  const { t } = useTranslation();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate total alerts (cut-off in <= 5 days or expired) for clients & suppliers
  const alertCount = useMemo(() => {
    const clientCount = clients.reduce((acc, client) => {
      if (client.status !== 'active') return acc;
      const count = client.subscriptions.filter((sub) => {
        if (!sub.cutDate) return false;
        return getDaysRemaining(sub.cutDate) <= 5;
      }).length;
      return acc + count;
    }, 0);

    const supplierCount = suppliers.reduce((acc, supplier) => {
      const count = (supplier.accounts || []).filter((account) => {
        if (!account.expirationDate) return false;
        return getDaysRemaining(account.expirationDate) <= 5;
      }).length;
      return acc + count;
    }, 0);

    return clientCount + supplierCount;
  }, [clients, suppliers]);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
      );
    }
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      if (activeTab !== 'clients_active' && activeTab !== 'clients_inactive') {
        setActiveTab('clients_active');
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      if (activeTab !== 'clients_active' && activeTab !== 'clients_inactive') {
        setActiveTab('clients_active');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#2242cc] text-white shadow-md transition-colors duration-300 select-none">
      {/* Level 1: Main Header Tier (Brand, Nav Buttons, Search & Profile) */}
      <div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Sidebar Floating Toggle Button - ONLY on Tablet & Mobile (Hidden on iPhone SE / small screens <= 414px) */}
            {onToggleSidebar && activeTab !== 'profile' && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="navbar-mobile-menu-btn hidden min-[415px]:flex lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer items-center justify-center shrink-0 border border-white/15"
                title="Abrir menú de navegación"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            )}

            {/* Brand Logo */}
            <div
              ref={logoRef}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0 shrink"
              onClick={() => setActiveTab('dashboard')}
            >
              <AppLogo className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-105 transition-transform shrink-0" />
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

          {/* Right Action Icons & Profile: Searchbar placed next to notifications button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Search Bar (Positioned right next to notifications button) */}
            <div className="hidden md:flex relative w-48 sm:w-60 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/10 text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0 focus:border-none transition-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/70 hover:text-white transition-none cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Expiration Alerts Button with Slow Bounce Badge */}
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl transition-colors border shrink-0 ${
                activeTab === 'alerts'
                  ? 'bg-white text-[#2242cc] border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
              }`}
              title="Alertas de Vencimiento"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.25 h-4.25 px-1 rounded-full bg-amber-400 text-[#2242cc] text-[9px] font-black flex items-center justify-center animate-bounce-slow shadow pointer-events-none">
                  {alertCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Popover */}
            <div className="relative shrink-0 flex items-center justify-center">
              <button
                ref={avatarBtnRef}
                type="button"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border-0 border-none outline-none flex items-center justify-center focus:outline-none cursor-pointer overflow-hidden select-none"
                title="Mi Perfil"
                aria-label="Mi Perfil"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-full h-full rounded-full object-cover block border-0 border-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0 text-white font-black text-xs border-0 border-none">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </button>

              <ProfilePopover
                isOpen={isPopoverOpen}
                onClose={() => setIsPopoverOpen(false)}
                triggerRef={avatarBtnRef}
                onOpenSettings={onOpenSettingsModal}
                onOpenAuthModal={onOpenAuthModal}
                onOpenProfile={() => setActiveTab('profile')}
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/10 text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0 focus:border-none transition-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/70 hover:text-white transition-none cursor-pointer p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Level 2: Platform Showcase Ticker (Aligned with main page content width) */}
      <div className="bg-black/15 py-1.5 overflow-hidden select-none pointer-events-none relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
          {/* Sombras / difuminado en los extremos para entrada y salida suave de los logos */}
          <div className="pointer-events-none absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#1d38ad] to-transparent z-10" />
          <div className="pointer-events-none absolute right-4 sm:right-6 lg:right-8 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#1d38ad] to-transparent z-10" />

          <div
            className="w-full flex items-center overflow-hidden marquee-mask"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 8px, rgba(0, 0, 0, 0.45) 24px, black 56px, black calc(100% - 56px), rgba(0, 0, 0, 0.45) calc(100% - 24px), rgba(0, 0, 0, 0.1) calc(100% - 8px), transparent 100%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 8px, rgba(0, 0, 0, 0.45) 24px, black 56px, black calc(100% - 56px), rgba(0, 0, 0, 0.45) calc(100% - 24px), rgba(0, 0, 0, 0.1) calc(100% - 8px), transparent 100%)',
            }}
          >
            {/* Track 1 */}
            <div className="flex shrink-0 animate-marquee-scroll items-center gap-6 sm:gap-8 pr-6 sm:pr-8 py-0.5">
              {PLATFORMS_SEQUENCE.map((platform, idx) => (
                <div
                  key={`t1-${platform.id}-${idx}`}
                  className="px-2 py-0.5 flex items-center justify-center shrink-0 opacity-85 hover:opacity-100 transition-opacity"
                  title={platform.label}
                >
                  <PlatformIcon
                    platform={platform.label}
                    className="h-5 sm:h-6 w-auto max-w-[48px] shrink-0 object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Track 2 (identical clone for seamless infinite loop without jump) */}
            <div
              aria-hidden="true"
              className="flex shrink-0 animate-marquee-scroll items-center gap-6 sm:gap-8 pr-6 sm:pr-8 py-0.5"
            >
              {PLATFORMS_SEQUENCE.map((platform, idx) => (
                <div
                  key={`t2-${platform.id}-${idx}`}
                  className="px-2 py-0.5 flex items-center justify-center shrink-0 opacity-85 hover:opacity-100 transition-opacity"
                  title={platform.label}
                >
                  <PlatformIcon
                    platform={platform.label}
                    className="h-5 sm:h-6 w-auto max-w-[48px] shrink-0 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
