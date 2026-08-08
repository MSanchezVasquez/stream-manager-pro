import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCutDateStatus, getDaysRemaining, getPlatformConfig, getPlatformBadgeProps } from '../../utils/platformHelpers';
import { PlatformIcon } from '../common/PlatformIcon';
import { AlertCircle, Calendar, MessageSquare, ShieldAlert, Tv, Search } from 'lucide-react';
import { WhatsAppModal } from '../WhatsAppModal';
import { ClientSubscription } from '../../types';

export const ExpirationAlerts: React.FC = () => {
  const { clients } = useData();
  const [filter, setFilter] = useState<'all' | 'warning' | 'expired'>('all');
  const [search, setSearch] = useState('');

  // Selected subscription for WhatsApp
  const [selectedSub, setSelectedSub] = useState<{
    sub: ClientSubscription;
    phone?: string;
  } | null>(null);

  // Flatten active subscriptions with client data
  const allAlertItems: {
    clientName: string;
    clientId: string;
    phone?: string;
    sub: ClientSubscription;
    days: number;
  }[] = [];

  clients.forEach((client) => {
    if (client.status === 'active') {
      client.subscriptions.forEach((sub) => {
        if (sub.status === 'active') {
          const days = getDaysRemaining(sub.cutDate);
          if (days <= 7) {
            allAlertItems.push({
              clientName: client.name,
              clientId: client.id,
              phone: client.phone,
              sub,
              days
            });
          }
        }
      });
    }
  });

  // Sort by urgency (expired first, then closest cut-off)
  allAlertItems.sort((a, b) => a.days - b.days);

  const filteredItems = allAlertItems.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.sub.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (item.sub.email && item.sub.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'expired') return item.days < 0;
    if (filter === 'warning') return item.days >= 0 && item.days <= 5;
    return true;
  });

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#E4E4E7] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Alertas de Vencimiento & Renovaciones
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            Suscripciones que vencen en los próximos 7 días o ya expiraron
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94949E]" />
            <input
              type="text"
              placeholder="Filtrar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7]"
            />
          </div>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] border border-transparent dark:border-[#2D2D33]'
            }`}
          >
            Todos ({allAlertItems.length})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] border border-transparent dark:border-[#2D2D33]'
            }`}
          >
            Por Vencer
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] border border-transparent dark:border-[#2D2D33]'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-[#1F1F23] rounded-xl">
          <AlertCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-700 dark:text-[#E4E4E7]">
            ¡Todo al día!
          </p>
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            No se encontraron cuentas por vencer en este rango de filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const platformConfig = getPlatformConfig(item.sub.serviceName);
            const badgeProps = getPlatformBadgeProps(platformConfig);
            const statusInfo = formatCutDateStatus(item.sub.cutDate);

            return (
              <div
                key={item.sub.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#1F1F23] bg-slate-50/50 dark:bg-[#1A1A1E]/50 hover:border-[#2D2D33] transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={badgeProps.className}
                      style={badgeProps.style}
                    >
                      <PlatformIcon platform={item.sub.serviceName} className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.sub.serviceName}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {item.clientName}
                  </h4>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Corte: <strong className="text-slate-700 dark:text-slate-200">{item.sub.cutDate}</strong></span>
                    </div>
                    {item.sub.email && (
                      <div className="truncate text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {item.sub.email}
                      </div>
                    )}
                    {item.sub.profileName && (
                      <div className="text-[11px]">
                        Perfil: <span className="font-medium text-slate-800 dark:text-slate-200">{item.sub.profileName}</span>
                        {item.sub.pin && ` (PIN: ${item.sub.pin})`}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSub({ sub: item.sub, phone: item.phone })}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                  <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Modal */}
      {selectedSub && (
        <WhatsAppModal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          clientName={selectedSub.sub.clientName}
          serviceName={selectedSub.sub.serviceName}
          cutDate={selectedSub.sub.cutDate}
          email={selectedSub.sub.email}
          password={selectedSub.sub.password}
          profileName={selectedSub.sub.profileName}
          pin={selectedSub.sub.pin}
          phone={selectedSub.phone}
        />
      )}
    </div>
  );
};
