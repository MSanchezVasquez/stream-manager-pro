import React, { useMemo } from 'react';
import {
  LayoutDashboard,
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
      label: resolvedLanguage === 'en' ? 'Overview' : 'Resumen General',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'clients_active',
      label: t('nav.activeClients'),
      icon: Users,
      badge: activeClientsCount,
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'clients_inactive',
      label: t('nav.inactiveClients'),
      icon: UserX,
      badge: inactiveClientsCount,
      badgeColor: 'bg-slate-100 text-slate-600 dark:bg-[#25252D] dark:text-slate-400',
    },
    {
      id: 'suppliers',
      label: t('nav.suppliers'),
      icon: Truck,
      badge: suppliersCount,
      badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      id: 'free_profiles',
      label: t('nav.freeProfiles'),
      icon: Sparkles,
      badge: freeProfilesCount,
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'alerts',
      label: t('nav.alertsWhatsapp'),
      icon: BellRing,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'links',
      label: t('nav.quickLinks'),
      icon: ExternalLink,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside className="hidden lg:block shrink-0 w-64 xl:w-70">
      <div className="sticky top-20 flex flex-col space-y-4">
        {/* Header & Primary Action Button */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94949E] px-1 block mb-2 font-space">
            {resolvedLanguage === 'en' ? 'NAVIGATION MENU' : 'MENÚ DE NAVEGACIÓN'}
          </span>
          <button
            type="button"
            onClick={onOpenAddClientModal}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>{t('nav.newClientService')}</span>
          </button>
        </div>

        {/* Navigation Menu Card */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-xs">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/80 dark:border-indigo-500/20 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
