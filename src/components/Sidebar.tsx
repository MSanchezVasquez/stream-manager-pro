import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  UserX,
  Truck,
  Sparkles,
  BellRing,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

import { useDataStore } from "../store/dataStore";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddClientModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddClientModal,
}) => {
  const { clients, suppliers, freeProfiles } = useDataStore();

  // SOLUCIÓN: Memorizar los cálculos pesados
  const { activeClientsCount, inactiveClientsCount } = useMemo(() => {
    return {
      activeClientsCount: clients.filter((c) => c.status === "active").length,
      inactiveClientsCount: clients.filter((c) => c.status === "inactive")
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
      id: "dashboard",
      label: "Resumen General",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "clients_active",
      label: "Clientes Activos",
      icon: Users,
      badge: activeClientsCount,
      badgeColor:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    {
      id: "clients_inactive",
      label: "Clientes Inactivos",
      icon: UserX,
      badge: inactiveClientsCount,
      badgeColor: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
    },
    {
      id: "suppliers",
      label: "Proveedores",
      icon: Truck,
      badge: suppliersCount,
      badgeColor:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
    },
    {
      id: "free_profiles",
      label: "Perfiles Libres",
      icon: Sparkles,
      badge: freeProfilesCount,
      badgeColor:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    {
      id: "alerts",
      label: "Alertas & WhatsApp",
      icon: BellRing,
      badge: null,
    },
    {
      id: "links",
      label: "Enlaces Rápidos",
      icon: ExternalLink,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-20 flex flex-col gap-4">
        {/* Primary CTA button */}
        <button
          onClick={onOpenAddClientModal}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Cliente / Servicio</span>
        </button>

        {/* Navigation items */}
        <nav className="p-2 rounded-2xl bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-[#1F1F23] shadow-sm space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1A1A1E]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-[#94949E]"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 transition-colors duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white dark:bg-indigo-500"
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
    </aside>
  );
};
