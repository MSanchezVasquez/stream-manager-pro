import React, { useEffect, useRef } from 'react';
import { Users, Tv, AlertTriangle, Truck, Sparkles, Coins, Wallet } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { getDaysRemaining } from '../../utils/platformHelpers';
import { useTranslation } from '../../utils/translations';
import gsap from 'gsap';

export const OverviewCards: React.FC<{
  onNavigateTab: (tab: string) => void;
}> = ({ onNavigateTab }) => {
  const { t } = useTranslation();
  const { clients, suppliers, freeProfiles } = useDataStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeClients = clients.filter((c) => c.status === 'active');
  const totalActiveClients = activeClients.length;

  const totalActiveSubs = activeClients.reduce(
    (acc, c) =>
      acc + c.subscriptions.filter((s) => s.status === 'active').length,
    0,
  );

  const totalMonthlyRevenue = activeClients.reduce(
    (acc, c) =>
      acc +
      c.subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : 0), 0),
    0,
  );

  const totalSupplierExpenses = suppliers.reduce((acc, s) => {
    return (
      acc +
      (s.accounts || []).reduce((accSum, a) => {
        if (a.status !== 'expired' && typeof a.cost === 'number' && a.cost > 0) {
          return accSum + a.cost;
        }
        return accSum;
      }, 0)
    );
  }, 0);

  const netProfit = totalMonthlyRevenue - totalSupplierExpenses;
  const profitMargin =
    totalMonthlyRevenue > 0
      ? Math.round((netProfit / totalMonthlyRevenue) * 100)
      : 0;

  const upcomingExpirations = activeClients.reduce((acc, c) => {
    const warningSubs = c.subscriptions.filter((s) => {
      const days = getDaysRemaining(s.cutDate);
      return days <= 5;
    });
    return acc + warningSubs.length;
  }, 0);

  const totalSuppliers = suppliers.length;
  const totalFreeProfiles = freeProfiles.reduce(
    (acc, p) => acc + p.quantity,
    0,
  );

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      );
    }
  }, [
    totalActiveClients,
    totalActiveSubs,
    upcomingExpirations,
    totalMonthlyRevenue,
    totalSupplierExpenses,
    netProfit,
  ]);

  const cards = [
    {
      title: t('dash.netProfit'),
      value: `S/ ${netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      badge: `${profitMargin}% margen`,
      icon: Wallet,
      color: 'from-emerald-500/25 to-teal-500/10 text-emerald-500',
      borderColor: 'border-emerald-500/40 ring-1 ring-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      tab: 'dashboard',
      isPrice: true,
      priceColor: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
    },
    {
      title: t('dash.monthlyRevenueTitle'),
      value: `S/ ${totalMonthlyRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Coins,
      color: 'from-blue-500/20 to-indigo-500/5 text-blue-500',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      tab: 'clients_active',
      isPrice: true,
      priceColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('dash.supplierExpenses'),
      value: `S/ ${totalSupplierExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Truck,
      color: 'from-purple-500/20 to-pink-500/5 text-purple-500',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      tab: 'suppliers',
      isPrice: true,
      priceColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t('dash.activeClientsTitle'),
      value: totalActiveClients,
      icon: Users,
      color: 'from-cyan-500/20 to-blue-500/5 text-cyan-500',
      borderColor: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      tab: 'clients_active',
    },
    {
      title: t('dash.activeSubsTitle'),
      value: totalActiveSubs,
      icon: Tv,
      color: 'from-indigo-500/20 to-purple-500/5 text-indigo-500',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      tab: 'clients_active',
    },
    {
      title: t('dash.upcomingExpirationsTitle'),
      value: upcomingExpirations,
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/5 text-amber-500',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      tab: 'alerts',
    },
    {
      title: t('dash.freeProfilesTitle'),
      value: totalFreeProfiles,
      icon: Sparkles,
      color: 'from-sky-500/20 to-cyan-500/5 text-sky-500',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      tab: 'free_profiles',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3.5 mb-6 sm:mb-8"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab(card.tab)}
            className="cursor-pointer p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm hover:border-[#2D2D33] transition-all transform hover:-translate-y-0.5 relative overflow-hidden group flex flex-col justify-between"
          >
            <div
              className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-linear-to-br ${card.color} blur-2xl group-hover:scale-150 transition-transform`}
            />
            <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-[#94949E] uppercase tracking-wider font-space line-clamp-2 leading-tight">
                {card.title}
              </span>
              <div
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div
                className={`font-bold font-cascadia truncate ${
                  card.isPrice
                    ? `text-sm sm:text-base ${card.priceColor || 'text-slate-900 dark:text-white'}`
                    : 'text-xl sm:text-2xl text-slate-900 dark:text-[#E4E4E7]'
                }`}
                title={String(card.value)}
              >
                {card.value}
              </div>

              {'badge' in card && card.badge && (
                <div className="pt-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold font-cascadia px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
                    {card.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
