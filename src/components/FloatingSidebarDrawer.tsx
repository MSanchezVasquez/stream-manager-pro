import React, { useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  UserX,
  Truck,
  Sparkles,
  BellRing,
  ExternalLink,
  PlusCircle,
  X,
} from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { AppLogo } from "./AppLogo";

interface FloatingSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddClientModal: () => void;
}

export const FloatingSidebarDrawer: React.FC<FloatingSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenAddClientModal,
}) => {
  const { clients, suppliers, freeProfiles } = useDataStore();

  // Bloquear el scroll del fondo cuando el drawer flotante está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  const handleAddNewClick = () => {
    onClose();
    onOpenAddClientModal();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Fondo oscuro transparente sin efecto opaco/difuminado - al hacer clic se cierra */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel flotante lateral (Drawer) - flota sobre el contenido sin empujarlo */}
      <aside
        className="relative w-80 max-w-[85vw] bg-white dark:bg-[#0E0E12] h-full shadow-2xl border-r border-slate-200 dark:border-[#1F1F24] p-5 flex flex-col gap-4 overflow-y-auto z-10 animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación principal"
      >
        {/* Header del sidebar flotante */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1F1F24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2242cc] flex items-center justify-center text-white shadow-sm">
              <AppLogo className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                StreamManager
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-[#2242cc] text-white px-1.5 py-0.5 rounded font-black">
                PRO
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botón CTA Nuevo Cliente */}
        <button
          type="button"
          onClick={handleAddNewClick}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Cliente / Servicio</span>
        </button>

        {/* Menú de navegación */}
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#80808C] px-1 pb-2 font-space">
            Navegación
          </div>
          <nav className="p-1.5 rounded-2xl bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F24] space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-[#94949E] hover:bg-white dark:hover:bg-[#1C1C22] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-[#94949E]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
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

        {/* Footer del drawer flotante */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#1F1F24] text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Toca fuera o presiona <kbd className="font-mono bg-slate-100 dark:bg-[#1C1C22] px-1 py-0.5 rounded text-[10px]">Esc</kbd> para cerrar
          </p>
        </div>
      </aside>
    </div>
  );
};
