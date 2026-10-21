import React, { useEffect, useMemo } from "react";
import {
  Home,
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
import { useTranslation } from "../utils/translations";
import { useBodyScrollLock } from "../utils/useBodyScrollLock";

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
  useBodyScrollLock(isOpen);
  const { clients, suppliers, freeProfiles } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  // Esc key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      label: resolvedLanguage === "en" ? "Overview" : "Inicio",
      icon: Home,
      badge: null,
    },
    {
      id: "clients_active",
      label: t("nav.activeClients"),
      icon: Users,
      badge: activeClientsCount,
    },
    {
      id: "clients_inactive",
      label: t("nav.inactiveClients"),
      icon: UserX,
      badge: inactiveClientsCount,
    },
    {
      id: "suppliers",
      label: t("nav.suppliers"),
      icon: Truck,
      badge: suppliersCount,
    },
    {
      id: "free_profiles",
      label: t("nav.freeProfiles"),
      icon: Sparkles,
      badge: freeProfilesCount,
    },
    {
      id: "alerts",
      label: t("nav.alertsWhatsapp"),
      icon: BellRing,
      badge: null,
    },
    {
      id: "links",
      label: t("nav.quickLinks"),
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Drawer - WIN Style */}
      <aside
        className="relative w-80 max-w-[85vw] bg-gradient-to-b from-[#FF5500] via-[#FF5000] to-[#E64000] text-white h-full shadow-2xl rounded-r-3xl pt-5 pb-6 pl-2 pr-0 flex flex-col gap-4 overflow-y-auto z-10 animate-in slide-in-from-left duration-200 select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación principal"
      >
        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between pb-3 pr-4 border-b border-white/20">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0 shadow-xs">
              <AppLogo className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-space">
                StreamManager
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-white text-[#FF5500] px-1.5 py-0.5 rounded font-black shadow-xs">
                PRO
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="px-3">
          <button
            type="button"
            onClick={handleAddNewClick}
            className="w-full py-2.5 px-3 rounded-xl bg-white text-[#FF5500] hover:bg-orange-50 active:bg-orange-100 font-bold text-xs shadow-md shadow-black/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <PlusCircle className="w-4 h-4 text-[#FF5500] shrink-0" />
            <span>{t("nav.newClientService")}</span>
          </button>
        </div>

        {/* Section Title: MENÚ */}
        <div className="px-5 -mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/90 font-space">
            MENÚ
          </span>
        </div>

        {/* Navigation Items List with WIN-style curved cutout */}
        <nav className="flex-1 flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative">
                {isActive && (
                  <>
                    <svg
                      className="absolute -top-4 right-0 w-4 h-4 pointer-events-none text-slate-50 dark:text-[#0A0A0C] fill-current z-20"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M16,0 L16,16 L0,16 C8.836556,16 16,8.836556 16,0 Z" />
                    </svg>
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
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-auto flex items-center justify-between py-2.5 transition-all duration-150 cursor-pointer relative z-10 ${
                    isActive
                      ? "ml-2.5 mr-0 pl-3.5 pr-4 bg-slate-50 dark:bg-[#0A0A0C] text-slate-900 dark:text-white rounded-l-2xl font-bold shadow-xs"
                      : "mx-2.5 px-3.5 rounded-xl text-white/95 hover:text-white hover:bg-white/10 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#FF5500] dark:text-[#FF6611]"
                          : "text-white"
                      }`}
                    />
                    <span className="truncate text-xs sm:text-sm">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-black rounded-full shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#FF5500] text-white shadow-xs"
                          : "bg-white/20 text-white backdrop-blur-xs"
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

        {/* Footer info */}
        <div className="pt-3 pr-4 border-t border-white/20 text-center">
          <p className="text-xs text-white/80">
            Toca fuera o presiona <kbd className="font-mono bg-white/20 px-1 py-0.5 rounded text-[10px]">Esc</kbd> para cerrar
          </p>
        </div>
      </aside>
    </div>
  );
};
