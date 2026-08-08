import React, { useEffect, useRef } from 'react';
import { Users, Tv, AlertTriangle, Truck, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getDaysRemaining } from '../../utils/platformHelpers';
import gsap from 'gsap';

export const OverviewCards: React.FC<{ onNavigateTab: (tab: string) => void }> = ({
  onNavigateTab
}) => {
  const { clients, suppliers, freeProfiles } = useData();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeClients = clients.filter((c) => c.status === 'active');
  const totalActiveClients = activeClients.length;

  const totalActiveSubs = activeClients.reduce(
    (acc, c) => acc + c.subscriptions.filter((s) => s.status === 'active').length,
    0
  );

  const upcomingExpirations = activeClients.reduce((acc, c) => {
    const warningSubs = c.subscriptions.filter((s) => {
      const days = getDaysRemaining(s.cutDate);
      return days <= 5;
    });
    return acc + warningSubs.length;
  }, 0);

  const totalSuppliers = suppliers.length;
  const totalFreeProfiles = freeProfiles.reduce((acc, p) => acc + p.quantity, 0);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [totalActiveClients, totalActiveSubs, upcomingExpirations]);

  const cards = [
    {
      title: 'Clientes Activos',
      value: totalActiveClients,
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/5 text-emerald-500',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      tab: 'clients_active'
    },
    {
      title: 'Suscripciones Contratadas',
      value: totalActiveSubs,
      icon: Tv,
      color: 'from-indigo-500/20 to-blue-500/5 text-indigo-500',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      tab: 'clients_active'
    },
    {
      title: 'Vencen en ≤ 5 Días',
      value: upcomingExpirations,
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/5 text-amber-500',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      tab: 'alerts'
    },
    {
      title: 'Proveedores Activos',
      value: totalSuppliers,
      icon: Truck,
      color: 'from-purple-500/20 to-pink-500/5 text-purple-500',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      tab: 'suppliers'
    },
    {
      title: 'Perfiles Libres',
      value: totalFreeProfiles,
      icon: Sparkles,
      color: 'from-sky-500/20 to-cyan-500/5 text-sky-500',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      tab: 'free_profiles'
    }
  ];

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab(card.tab)}
            className={`cursor-pointer p-5 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm hover:border-[#2D2D33] transition-all transform hover:-translate-y-0.5 relative overflow-hidden group`}
          >
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} blur-2xl group-hover:scale-150 transition-transform`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#94949E] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-[#E4E4E7]">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
