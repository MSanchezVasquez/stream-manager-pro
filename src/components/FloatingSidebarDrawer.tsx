import React, { useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  UserX,
  Truck,
  Sparkles,
  BellRing,
  MessageSquareText,
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
      label: resolvedLanguage === "en" ? "Overview" : "Resumen General",
      icon: LayoutDashboard,
      badge: null,
      badgeColor: "",
    },
    {
      id: "clients_active",
      label: t("nav.activeClients"),
      icon: Users,
      badge: activeClientsCount,
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    {
      id: "clients_inactive",
      label: t("nav.inactiveClients"),
      icon: UserX,
      badge: inactiveClientsCount,
      badgeColor: "bg-slate-100 text-slate-600 dark:bg-[#25252D] dark:text-slate-400",
    },
    {
      id: "suppliers",
      label: t("nav.suppliers"),
      icon: Truck,
      badge: suppliersCount,
      badgeColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    },
    {
      id: "free_profiles",
      label: t("nav.freeProfiles"),
      icon: Sparkles,
      badge: freeProfilesCount,
      badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      id: "alerts",
      label: t("nav.alertsWhatsapp"),
      icon: BellRing,
      badge: null,
      badgeColor: "",
    },
    {
      id: "templates",
      label: t("nav.messageTemplates"),
      icon: MessageSquareText,
      badge: null,
      badgeColor: "",
    },
    {
      id: "links",
      label: t("nav.quickLinks"),
      icon: ExternalLink,
      badge: null,
      badgeColor: "",
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
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Drawer - Fixed full height panel */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-[#141418] text-slate-900 dark:text-[#E4E4E7] h-full shadow-2xl border-r border-slate-200 dark:border-[#1F1F23] flex flex-col select-none animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación principal"
      >
        {/* Fixed Header with Logo and Close Button */}
        <div className="shrink-0 p-4 sm:p-5 pb-3.5 border-b border-slate-100 dark:border-[#22222A] flex items-center justify-between bg-white dark:bg-[#141418] z-10">
          <div className="flex items-center gap-2.5">
            <AppLogo className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-space">
                StreamManager
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black shadow-xs">
                PRO
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pt-3 flex flex-col gap-3.5">
          {/* Primary Action Button */}
          <div>
            <button
              type="button"
              onClick={handleAddNewClick}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t("nav.newClientService")}</span>
            </button>
          </div>

          {/* Section Title */}
          <div className="px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94949E] font-space">
              {resolvedLanguage === "en" ? "NAVIGATION MENU" : "MENÚ DE NAVEGACIÓN"}
            </span>
          </div>

          {/* Navigation Items List */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer select-none ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/80 dark:border-indigo-500/20 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white"
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
    </div>
  );
};
