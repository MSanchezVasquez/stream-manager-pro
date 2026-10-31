import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Bell,
  X,
  ArrowRight,
  User,
  Truck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import gsap from 'gsap';
import { useDataStore } from '../../store/dataStore';
import { getDaysRemaining } from '../../utils/platformHelpers';
import { PlatformIcon } from '../common/PlatformIcon';
import { useTranslation } from '../../utils/translations';
import { Client, Supplier, ClientSubscription, SupplierAccount } from '../../types';

interface NotificationAlertItem {
  id: string;
  type: 'client' | 'supplier';
  title: string;
  subtitle: string;
  serviceName: string;
  dateStr: string;
  daysRemaining: number;
  phone?: string;
  clientRef?: Client;
  supplierRef?: Supplier;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  onNavigateAlerts: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  onNavigateAlerts,
}) => {
  const { clients, suppliers } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();
  const isEn = resolvedLanguage === 'en';

  const [activeFilter, setActiveFilter] = useState<'all' | 'expired' | 'warning'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance animation
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      gsap.fromTo(
        popoverRef.current,
        { opacity: 0, scale: 0.92, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'back.out(1.5)' },
      );
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInside = popoverRef.current?.contains(target);
      const clickedOnTrigger = triggerRef?.current?.contains(target);

      if (!clickedInside && !clickedOnTrigger) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Compile alerts from clients and suppliers
  const allAlerts: NotificationAlertItem[] = useMemo(() => {
    const items: NotificationAlertItem[] = [];

    // Client subscriptions expiring in <= 7 days or expired
    clients.forEach((client) => {
      if (client.status === 'active') {
        client.subscriptions.forEach((sub: ClientSubscription) => {
          if (sub.status === 'active' && sub.cutDate) {
            const days = getDaysRemaining(sub.cutDate);
            if (days <= 7) {
              items.push({
                id: `client-${client.id}-${sub.id}`,
                type: 'client',
                title: client.name,
                subtitle: isEn ? 'Client' : 'Cliente',
                serviceName: sub.serviceName || (isEn ? 'Subscription' : 'Suscripción'),
                dateStr: sub.cutDate,
                daysRemaining: days,
                phone: client.phone,
                clientRef: client,
              });
            }
          }
        });
      }
    });

    // Supplier accounts expiring in <= 7 days or expired
    suppliers.forEach((supplier) => {
      (supplier.accounts || []).forEach((acc: SupplierAccount) => {
        if (acc.expirationDate) {
          const days = getDaysRemaining(acc.expirationDate);
          if (days <= 7) {
            items.push({
              id: `supplier-${supplier.id}-${acc.id}`,
              type: 'supplier',
              title: supplier.name,
              subtitle: isEn ? 'Supplier' : 'Proveedor',
              serviceName: acc.serviceName || (isEn ? 'Account' : 'Cuenta'),
              dateStr: acc.expirationDate,
              daysRemaining: days,
              supplierRef: supplier,
            });
          }
        }
      });
    });

    // Sort: most urgent first (most expired to upcoming)
    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [clients, suppliers, isEn]);

  const expiredCount = useMemo(() => {
    return allAlerts.filter((item) => item.daysRemaining < 0).length;
  }, [allAlerts]);

  const warningCount = useMemo(() => {
    return allAlerts.filter((item) => item.daysRemaining >= 0).length;
  }, [allAlerts]);

  // Filtered items
  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'expired') {
      return allAlerts.filter((item) => item.daysRemaining < 0);
    }
    if (activeFilter === 'warning') {
      return allAlerts.filter((item) => item.daysRemaining >= 0);
    }
    return allAlerts;
  }, [allAlerts, activeFilter]);

  if (!isOpen) return null;

  const handleOpenAllAlerts = () => {
    onClose();
    onNavigateAlerts();
  };

  const getUrgencyBadge = (days: number) => {
    if (days < 0) {
      return {
        label: isEn ? `Expired ${Math.abs(days)}d ago` : `Vencido hace ${Math.abs(days)}d`,
        className:
          'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25',
      };
    }
    if (days === 0) {
      return {
        label: isEn ? 'Expires today!' : '¡Vence hoy!',
        className:
          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 animate-pulse',
      };
    }
    return {
      label: isEn ? `Expires in ${days}d` : `Vence en ${days}d`,
      className:
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    };
  };

  return (
    <div
      ref={popoverRef}
      style={{ transformOrigin: 'top right' }}
      className="absolute right-0 top-full mt-3 w-80 sm:w-84 max-w-[calc(100vw-1.5rem)] z-50 bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl shadow-2xl overflow-hidden transition-colors duration-200 flex flex-col select-none"
    >
      {/* Header */}
      <div className="px-4.5 py-3.5 border-b border-slate-100 dark:border-[#22222A] flex items-center justify-between bg-slate-50/50 dark:bg-[#141418]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-500 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
              {isEn ? 'Notifications' : 'Notificaciones'}
            </h4>
            {allAlerts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 shrink-0">
                {allAlerts.length}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
          title={isEn ? 'Close' : 'Cerrar'}
          aria-label={isEn ? 'Close' : 'Cerrar'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      {allAlerts.length > 0 && (
        <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-100 dark:border-[#22222A] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26]'
            }`}
          >
            {isEn ? 'All' : 'Todas'} ({allAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('expired')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'expired'
                ? 'bg-red-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26]'
            }`}
          >
            {isEn ? 'Expired' : 'Vencidas'} ({expiredCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('warning')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'warning'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26]'
            }`}
          >
            {isEn ? 'Upcoming' : 'Por Vencer'} ({warningCount})
          </button>
        </div>
      )}

      {/* Notifications Vertical List */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#22222A] scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
            {allAlerts.length === 0 ? (
              <>
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-[#E4E4E7]">
                  {isEn ? 'All caught up!' : '¡Todo al día!'}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#94949E] mt-0.5 max-w-[200px]">
                  {isEn
                    ? 'No pending expiration alerts.'
                    : 'No tienes alertas de vencimiento pendientes.'}
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1F1F26] text-slate-400 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isEn
                    ? 'No notifications in this filter'
                    : 'No hay notificaciones en este filtro'}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const badge = getUrgencyBadge(item.daysRemaining);

            return (
              <div
                key={item.id}
                onClick={handleOpenAllAlerts}
                className="p-3 sm:px-4 hover:bg-slate-50 dark:hover:bg-[#1C1C24] transition-colors cursor-pointer flex items-start gap-3 group"
              >
                {/* Platform Icon container */}
                <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 dark:bg-[#1A1A22] border border-slate-200 dark:border-[#2D2D33] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <PlatformIcon
                    platform={item.serviceName}
                    className="w-5 h-5 object-contain"
                  />
                </div>

                {/* Content details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#94949E] truncate">
                    <span className="inline-flex items-center gap-0.5 text-slate-400 dark:text-slate-500 shrink-0">
                      {item.type === 'client' ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Truck className="w-3 h-3" />
                      )}
                    </span>
                    <span className="truncate">{item.serviceName}</span>
                    <span className="opacity-40">•</span>
                    <span className="inline-flex items-center gap-1 font-cascadia shrink-0">
                      <Calendar className="w-3 h-3 opacity-60" />
                      {item.dateStr}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-slate-100 dark:border-[#22222A] bg-slate-50/50 dark:bg-[#141418]/60">
        <button
          type="button"
          onClick={handleOpenAllAlerts}
          className="w-full py-2 px-3 rounded-xl bg-[#1A1A1A] hover:bg-black active:bg-black text-white dark:bg-white dark:hover:bg-slate-200 dark:active:bg-slate-300 dark:text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>
            {isEn
              ? `View all alerts (${allAlerts.length})`
              : `Ver todas las alertas (${allAlerts.length})`}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
