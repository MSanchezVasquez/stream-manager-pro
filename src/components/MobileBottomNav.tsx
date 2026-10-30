import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Truck,
  Menu,
  Plus,
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { getDaysRemaining } from '../utils/platformHelpers';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileDrawer: () => void;
  onOpenAddClientModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileDrawer,
  onOpenAddClientModal,
}) => {
  const { clients, suppliers } = useDataStore();

  const activeClientsCount = useMemo(() => {
    return clients.filter((c) => c.status === 'active').length;
  }, [clients]);

  const suppliersCount = useMemo(() => {
    return suppliers.length;
  }, [suppliers]);

  // Alert indicator if any client or supplier is expiring soon
  const hasPendingAlerts = useMemo(() => {
    const hasClientAlert = clients.some((c) => {
      if (c.status !== 'active') return false;
      return c.subscriptions.some((s) => s.cutDate && getDaysRemaining(s.cutDate) <= 5);
    });
    if (hasClientAlert) return true;

    return suppliers.some((s) =>
      (s.accounts || []).some((a) => a.expirationDate && getDaysRemaining(a.expirationDate) <= 5),
    );
  }, [clients, suppliers]);

  const isClientTabActive = activeTab === 'clients_active' || activeTab === 'clients_inactive';

  return (
    <nav
      aria-label="Navegación móvil inferior fija"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#141418]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#22222A] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center px-1 py-1">
        {/* Inicio */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-slate-900 dark:text-white font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        {/* Clientes */}
        <button
          type="button"
          onClick={() => setActiveTab('clients_active')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isClientTabActive
              ? 'text-slate-900 dark:text-white font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            {activeClientsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-white min-w-3.5 text-center leading-tight">
                {activeClientsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Clientes</span>
        </button>

        {/* Botón Central: Nuevo Cliente / Servicio */}
        <div className="flex items-center justify-center -mt-3">
          <button
            type="button"
            onClick={onOpenAddClientModal}
            className="w-11 h-11 rounded-full bg-[#1A1A1A] hover:bg-black active:bg-black text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 shadow-lg shadow-black/20 dark:shadow-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95 border-2 border-white dark:border-[#141418]"
            title="Nuevo Cliente o Servicio"
            aria-label="Nuevo Cliente o Servicio"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Proveedores */}
        <button
          type="button"
          onClick={() => setActiveTab('suppliers')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'suppliers'
              ? 'text-slate-900 dark:text-white font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Truck className="w-5 h-5 mb-0.5" />
            {suppliersCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-[#1A1A1A] dark:bg-white text-white dark:text-slate-950 min-w-3.5 text-center leading-tight">
                {suppliersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Provs</span>
        </button>

        {/* Menú Completo */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab !== 'dashboard' && !isClientTabActive && activeTab !== 'suppliers'
              ? 'text-slate-900 dark:text-white font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5 mb-0.5" />
            {hasPendingAlerts && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#141418]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Menú</span>
        </button>
      </div>
    </nav>
  );
};
