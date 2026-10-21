import React, { useMemo } from 'react';
import {
  Home,
  Users,
  UserX,
  Truck,
  Sparkles,
  BellRing,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

import { useDataStore } from '../store/dataStore';
import { useTranslation } from '../utils/translations';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddClientModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddClientModal,
}) => {
  const { clients, suppliers, freeProfiles } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  const { activeClientsCount, inactiveClientsCount } = useMemo(() => {
    return {
      activeClientsCount: clients.filter((c) => c.status === 'active').length,
      inactiveClientsCount: clients.filter((c) => c.status === 'inactive')
        .length,
    };
  }, [clients]);

  const suppliersCount = useMemo(() => suppliers.length, [suppliers]);

  const freeProfilesCount = useMemo(
    () => freeProfiles.reduce((sum, p) => sum + p.quantity, 0),
    [freeProfiles],
  );

  const menuItems = [
    {
      id: 'dashboard',
      label: resolvedLanguage === 'en' ? 'Overview' : 'Inicio',
      icon: Home,
      badge: null,
    },
    {
      id: 'clients_active',
      label: t('nav.activeClients'),
      icon: Users,
      badge: activeClientsCount,
    },
    {
      id: 'clients_inactive',
      label: t('nav.inactiveClients'),
      icon: UserX,
      badge: inactiveClientsCount,
    },
    {
      id: 'suppliers',
      label: t('nav.suppliers'),
      icon: Truck,
      badge: suppliersCount,
    },
    {
      id: 'free_profiles',
      label: t('nav.freeProfiles'),
      icon: Sparkles,
      badge: freeProfilesCount,
    },
    {
      id: 'alerts',
      label: t('nav.alertsWhatsapp'),
      icon: BellRing,
      badge: null,
    },
    {
      id: 'links',
      label: t('nav.quickLinks'),
      icon: ExternalLink,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:block shrink-0 w-64 xl:w-70">
      <div className="sticky top-20 flex flex-col">
        {/* Navigation Menu Container - WIN Style */}
        <div className="bg-gradient-to-b from-[#FF5500] via-[#FF5000] to-[#E64000] text-white rounded-3xl pt-6 pb-6 pl-2 pr-0 shadow-xl shadow-orange-600/15 relative select-none">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2.5 px-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs shrink-0">
              <AppLogo className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white font-space truncate">
                StreamManager
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-white text-[#FF5500] px-1.5 py-0.5 rounded font-black shadow-xs shrink-0">
                PRO
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="px-3 mb-5">
            <button
              type="button"
              onClick={onOpenAddClientModal}
              className="w-full py-2.5 px-3 rounded-xl bg-white text-[#FF5500] hover:bg-orange-50 active:bg-orange-100 font-bold text-xs shadow-md shadow-black/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <PlusCircle className="w-4 h-4 text-[#FF5500] shrink-0" />
              <span className="truncate">{t('nav.newClientService')}</span>
            </button>
          </div>

          {/* Header Title: MENÚ */}
          <div className="px-5 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/90 font-space">
              MENÚ
            </span>
          </div>

          {/* Navigation Items List with WIN-style curved cutout */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative">
                  {/* Inverted curve fillets when active */}
                  {isActive && (
                    <>
                      {/* Top inverted curve */}
                      <svg
                        className="absolute -top-4 right-0 w-4 h-4 pointer-events-none text-slate-50 dark:text-[#0A0A0C] fill-current z-20"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M16,0 L16,16 L0,16 C8.836556,16 16,8.836556 16,0 Z" />
                      </svg>

                      {/* Bottom inverted curve */}
                      <svg
                        className="absolute -bottom-4 right-0 w-4 h-4 pointer-events-none text-slate-50 dark:text-[#0A0A0C] fill-current z-20"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M16,16 L16,0 L0,0 C8.836556,0 16,7.163444 16,16 Z" />
                      </svg>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-auto flex items-center justify-between py-2.5 transition-all duration-150 cursor-pointer relative z-10 ${
                      isActive
                        ? 'ml-2.5 mr-0 pl-3.5 pr-4 bg-slate-50 dark:bg-[#0A0A0C] text-slate-900 dark:text-white rounded-l-2xl font-bold shadow-xs'
                        : 'mx-2.5 px-3.5 rounded-xl text-white/95 hover:text-white hover:bg-white/10 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#FF5500] dark:text-[#FF6611]'
                            : 'text-white'
                        }`}
                      />
                      <span className="truncate text-xs sm:text-sm">{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 text-[11px] font-black rounded-full shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#FF5500] text-white shadow-xs'
                            : 'bg-white/20 text-white backdrop-blur-xs'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
