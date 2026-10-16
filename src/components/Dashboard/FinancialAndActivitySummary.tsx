import React from "react";
import {
  Zap,
  UserPlus,
  Sparkles,
  MessageSquare,
  Truck,
  Package,
  PackageOpen,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Layers,
  Users,
  Tv,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import {
  getDaysRemaining,
  getPlatformDisplayName,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import { useTranslation } from "../../utils/translations";

interface FinancialAndActivitySummaryProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddClientModal?: () => void;
}

export const FinancialAndActivitySummary: React.FC<
  FinancialAndActivitySummaryProps
> = ({ onNavigateTab, onOpenAddClientModal }) => {
  const { resolvedLanguage } = useTranslation();
  const { clients, suppliers, freeProfiles } = useDataStore();

  const isEn = resolvedLanguage === "en";
  const activeClients = clients.filter((c) => c.status === "active");

  // 1. Stock y disponibilidad de perfiles libres agrupados por plataforma
  const freeProfilesByPlatform: Record<
    string,
    { count: number; rawPlatform: string }
  > = {};

  freeProfiles.forEach((p) => {
    const displayName = getPlatformDisplayName(p.serviceName) || p.serviceName;
    if (!freeProfilesByPlatform[displayName]) {
      freeProfilesByPlatform[displayName] = {
        count: 0,
        rawPlatform: p.serviceName,
      };
    }
    freeProfilesByPlatform[displayName].count += p.quantity || 0;
  });

  const totalFreeProfilesCount = freeProfiles.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0,
  );

  const platformsWithStock = Object.entries(freeProfilesByPlatform).sort(
    (a, b) => b[1].count - a[1].count,
  );

  // 2. Cuentas de proveedores y estado de vencimiento
  let totalSupplierAccounts = 0;
  let supplierAccountsExpiringSoon = 0;
  let supplierAccountsExpired = 0;

  suppliers.forEach((sup) => {
    (sup.accounts || []).forEach((acc) => {
      totalSupplierAccounts++;
      if (acc.expirationDate) {
        const days = getDaysRemaining(acc.expirationDate);
        if (days < 0) {
          supplierAccountsExpired++;
        } else if (days <= 7) {
          supplierAccountsExpiringSoon++;
        }
      }
    });
  });

  // 3. Suscripciones y clientes próximos a vencer (≤ 5 días)
  let totalActiveSubs = 0;
  let warningSubsCount = 0;
  let expiredSubsCount = 0;

  activeClients.forEach((client) => {
    client.subscriptions.forEach((sub) => {
      if (sub.status === "active") {
        totalActiveSubs++;
        const days = getDaysRemaining(sub.cutDate);
        if (days < 0) {
          expiredSubsCount++;
        } else if (days <= 5) {
          warningSubsCount++;
        }
      }
    });
  });

  const totalAttentionSubs = warningSubsCount + expiredSubsCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {/* 1. Centro de Acciones Rápidas (Atajos de 1 clic) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Quick Actions" : "Acciones Rápidas"}
                >
                  {isEn ? "Quick Actions" : "Acciones Rápidas"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "1-click operational shortcuts"
                      : "Atajos operativos de 1 clic"
                  }
                >
                  {isEn
                    ? "1-click operational shortcuts"
                    : "Atajos operativos de 1 clic"}
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-cascadia">
              {isEn ? "Direct" : "Atajos"}
            </span>
          </div>

          {/* Body: 4 Botones de Acción Rápida */}
          <div className="space-y-2.5">
            {/* Botón 1: Nuevo Cliente / Venta */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAddClientModal) {
                  onOpenAddClientModal();
                } else {
                  onNavigateTab("clients_active");
                }
              }}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-[#181820] dark:hover:bg-indigo-950/20 border border-slate-200/70 hover:border-indigo-400/50 dark:border-[#25252D] dark:hover:border-indigo-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {isEn ? "New Client / Sale" : "Nueva Venta / Cliente"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? "Register client and subscription"
                      : "Registrar cliente y suscripción"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </button>

            {/* Botón 2: Asignar Perfil Libre */}
            <button
              type="button"
              onClick={() => onNavigateTab("free_profiles")}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-sky-50/60 dark:bg-[#181820] dark:hover:bg-sky-950/20 border border-slate-200/70 hover:border-sky-400/50 dark:border-[#25252D] dark:hover:border-sky-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                    {isEn ? "Assign Free Profile" : "Asignar Perfil Libre"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalFreeProfilesCount} profile(s) ready to sell`
                      : `${totalFreeProfilesCount} perfil(es) listos para vender`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </button>

            {/* Botón 3: Recordatorios de WhatsApp */}
            <button
              type="button"
              onClick={() => onNavigateTab("alerts")}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-[#181820] dark:hover:bg-emerald-950/20 border border-slate-200/70 hover:border-emerald-400/50 dark:border-[#25252D] dark:hover:border-emerald-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {isEn ? "WhatsApp Alerts" : "Alertas de WhatsApp"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalAttentionSubs} subscription(s) expiring soon`
                      : `${totalAttentionSubs} suscripción(es) próximas a vencer`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </button>

            {/* Botón 4: Cuentas de Proveedores */}
            <button
              type="button"
              onClick={() => onNavigateTab("suppliers")}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 dark:bg-[#181820] dark:hover:bg-purple-950/20 border border-slate-200/70 hover:border-purple-400/50 dark:border-[#25252D] dark:hover:border-purple-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {isEn ? "Supplier Accounts" : "Cuentas de Proveedores"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalSupplierAccounts} master account(s) registered`
                      : `${totalSupplierAccounts} cuenta(s) maestra(s) registradas`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </button>
          </div>
        </div>

        {/* Footer Card 1 */}
        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {isEn ? "StreamManager Pro Engine" : "Panel Operativo Pro"}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "Online" : "Activo"}
          </span>
        </div>
      </div>

      {/* 2. Stock y Disponibilidad de Perfiles Libres */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Available Stock" : "Stock de Perfiles"}
                >
                  {isEn ? "Available Stock" : "Stock de Perfiles"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "Free profiles ready to deliver"
                      : "Perfiles libres listos para entrega"
                  }
                >
                  {isEn
                    ? "Free profiles ready to deliver"
                    : "Perfiles libres listos para entrega"}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold font-cascadia ${
                totalFreeProfilesCount > 0
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {totalFreeProfilesCount} {isEn ? "in stock" : "en stock"}
            </span>
          </div>

          {/* Body: Lista de Plataformas con Stock */}
          <div className="space-y-2.5">
            {platformsWithStock.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-dashed border-slate-200 dark:border-[#25252D] text-center flex flex-col items-center justify-center min-h-[224px]">
                <PackageOpen className="w-7 h-7 text-slate-400 mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "No free profiles in stock" : "Sin perfiles libres en stock"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3 max-w-[220px]">
                  {isEn
                    ? "Import profiles from suppliers to have stock ready to sell"
                    : "Importa cuentas de proveedores para tener stock listo para vender"}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab("free_profiles")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isEn ? "+ Add Profiles" : "+ Añadir Perfiles"}
                </button>
              </div>
            ) : (
              <>
                {platformsWithStock.slice(0, 4).map(([platName, info]) => (
                  <div
                    key={platName}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D] flex items-center justify-between gap-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#121216] border border-slate-200/60 dark:border-[#25252D] flex items-center justify-center shrink-0 shadow-xs">
                        <PlatformIcon
                          platform={info.rawPlatform}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block"
                          title={platName}
                        >
                          {platName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          {info.count}{" "}
                          {info.count === 1
                            ? isEn
                              ? "profile ready"
                              : "perfil disponible"
                            : isEn
                              ? "profiles ready"
                              : "perfiles disponibles"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-cascadia whitespace-nowrap ${
                          info.count > 1
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {info.count > 1
                          ? isEn
                            ? "In Stock"
                            : "En Stock"
                          : isEn
                            ? "Last 1"
                            : "Último"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigateTab("free_profiles")}
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer"
                        title={isEn ? "View in profiles" : "Ver en perfiles"}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Si hay menos de 4 plataformas con stock, completamos los slots para mantener la alineación idéntica */}
                {platformsWithStock.length < 4 && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("free_profiles")}
                    className="w-full p-2.5 sm:p-3 rounded-xl border border-dashed border-slate-200 dark:border-[#282832] hover:border-sky-500/40 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition-all flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">
                      {isEn ? "+ Add more stock" : "+ Añadir más perfiles libres"}
                    </span>
                  </button>
                )}

                {platformsWithStock.length === 1 && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("suppliers")}
                    className="w-full p-2.5 sm:p-3 rounded-xl border border-dashed border-slate-200 dark:border-[#282832] hover:border-purple-500/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">
                      {isEn ? "Import supplier accounts" : "Importar cuentas de proveedor"}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Card 2 */}
        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {platformsWithStock.length}{" "}
            {isEn ? "platforms with stock" : "plataformas con stock"}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("free_profiles")}
            className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? "Manage inventory" : "Gestionar inventario"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Estado Operativo de Proveedores & Vencimientos */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Suppliers & Status" : "Estado de Proveedores"}
                >
                  {isEn ? "Suppliers & Status" : "Estado de Proveedores"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "Accounts and service monitoring"
                      : "Monitoreo y cuentas maestras"
                  }
                >
                  {isEn
                    ? "Accounts and service monitoring"
                    : "Monitoreo y cuentas maestras"}
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-cascadia">
              {suppliers.length} {isEn ? "prov." : "proveed."}
            </span>
          </div>

          {/* Body: 4 Filas de Estado Operativo con Idéntica Altura y Cero Desbordamiento */}
          <div className="space-y-2.5">
            {/* Fila 1: Cuentas de Proveedores (Alerta prioritaria o Estado al día) */}
            <div
              onClick={() => onNavigateTab("suppliers")}
              className={`w-full p-2.5 sm:p-3 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                supplierAccountsExpired > 0
                  ? "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/30 dark:border-rose-500/30"
                  : supplierAccountsExpiringSoon > 0
                    ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 dark:border-amber-500/30"
                    : "bg-slate-50 hover:bg-purple-50/60 dark:bg-[#181820] dark:hover:bg-purple-950/20 border-slate-200/70 hover:border-purple-400/50 dark:border-[#25252D] dark:hover:border-purple-500/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-lg group-hover:scale-105 transition-transform shrink-0 ${
                    supplierAccountsExpired > 0
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      : supplierAccountsExpiringSoon > 0
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {supplierAccountsExpired > 0 || supplierAccountsExpiringSoon > 0 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold transition-colors truncate ${
                      supplierAccountsExpired > 0
                        ? "text-rose-900 dark:text-rose-200"
                        : supplierAccountsExpiringSoon > 0
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400"
                    }`}
                  >
                    {supplierAccountsExpired > 0
                      ? isEn
                        ? `¡${supplierAccountsExpired} master account(s) expired!`
                        : `¡${supplierAccountsExpired} cuenta(s) maestra(s) vencida(s)!`
                      : supplierAccountsExpiringSoon > 0
                        ? isEn
                          ? `${supplierAccountsExpiringSoon} master account(s) expiring`
                          : `${supplierAccountsExpiringSoon} cuenta(s) por vencer (≤7d)`
                        : isEn
                          ? "Master Accounts Up to Date"
                          : "Cuentas Maestras al Día"}
                  </p>
                  <p
                    className={`text-[11px] truncate ${
                      supplierAccountsExpired > 0
                        ? "text-rose-700 dark:text-rose-300 font-medium"
                        : supplierAccountsExpiringSoon > 0
                          ? "text-amber-700 dark:text-amber-300 font-medium"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {supplierAccountsExpired > 0
                      ? isEn
                        ? "Renew urgently with supplier"
                        : "Renovar urgente con proveedor"
                      : supplierAccountsExpiringSoon > 0
                        ? isEn
                          ? "Renew before cutoff date"
                          : "Renovar antes del corte"
                        : isEn
                          ? `${totalSupplierAccounts} active supplier account(s)`
                          : `${totalSupplierAccounts} cuenta(s) activas con proveedores`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-cascadia whitespace-nowrap ${
                    supplierAccountsExpired > 0
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                      : supplierAccountsExpiringSoon > 0
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {supplierAccountsExpired > 0
                    ? isEn
                      ? "Expired"
                      : "Vencida(s)"
                    : supplierAccountsExpiringSoon > 0
                      ? isEn
                        ? "Expiring"
                        : "Por Vencer"
                      : isEn
                        ? "Up to date"
                        : "Al Día"}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </div>

            {/* Fila 2: Vencimientos de Clientes (Alertas WhatsApp) */}
            <div
              onClick={() => onNavigateTab("alerts")}
              className={`w-full p-2.5 sm:p-3 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                totalAttentionSubs > 0
                  ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 dark:border-amber-500/30"
                  : "bg-slate-50 hover:bg-emerald-50/60 dark:bg-[#181820] dark:hover:bg-emerald-950/20 border-slate-200/70 hover:border-emerald-400/50 dark:border-[#25252D] dark:hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-lg group-hover:scale-105 transition-transform shrink-0 ${
                    totalAttentionSubs > 0
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {totalAttentionSubs > 0 ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold transition-colors truncate ${
                      totalAttentionSubs > 0
                        ? "text-amber-900 dark:text-amber-200"
                        : "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    }`}
                  >
                    {totalAttentionSubs > 0
                      ? isEn
                        ? `${totalAttentionSubs} subscription(s) expiring`
                        : `${totalAttentionSubs} suscripción(es) por vencer`
                      : isEn
                        ? "Subscriptions Up to Date"
                        : "Suscripciones al Día"}
                  </p>
                  <p
                    className={`text-[11px] truncate ${
                      totalAttentionSubs > 0
                        ? "text-amber-700 dark:text-amber-300 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {totalAttentionSubs > 0
                      ? isEn
                        ? "Requires WhatsApp alert (≤5d)"
                        : "Requiere aviso WhatsApp (≤5d)"
                      : isEn
                        ? "No client cutoffs in next 5 days"
                        : "Sin cortes en los próximos 5 días"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-cascadia whitespace-nowrap ${
                    totalAttentionSubs > 0
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {totalAttentionSubs > 0
                    ? isEn
                      ? "Alert"
                      : "Avisar"
                    : isEn
                      ? "Up to date"
                      : "Al Día"}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>

            {/* Fila 3: Clientes Activos en Servicio */}
            <div
              onClick={() => onNavigateTab("clients_active")}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 dark:bg-[#181820] dark:hover:bg-blue-950/20 border border-slate-200/70 hover:border-blue-400/50 dark:border-[#25252D] dark:hover:border-blue-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {activeClients.length}{" "}
                    {isEn ? "Active Clients" : "Clientes Activos"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {totalActiveSubs}{" "}
                    {isEn
                      ? "active subscriptions in service"
                      : "suscripciones en servicio activo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-cascadia whitespace-nowrap bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {isEn ? "Active" : "Activos"}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Fila 4: Proveedores Registrados */}
            <div
              onClick={() => onNavigateTab("suppliers")}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 dark:bg-[#181820] dark:hover:bg-purple-950/20 border border-slate-200/70 hover:border-purple-400/50 dark:border-[#25252D] dark:hover:border-purple-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {suppliers.length}{" "}
                    {isEn ? "Registered Suppliers" : "Proveedores Registrados"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {totalSupplierAccounts}{" "}
                    {isEn
                      ? "master accounts managed"
                      : "cuentas maestras gestionadas"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-cascadia whitespace-nowrap bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {suppliers.length} {isEn ? "prov." : "proveed."}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card 3 */}
        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {isEn ? "Continuous Monitoring" : "Monitoreo Continuo"}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("alerts")}
            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? "View all alerts" : "Ver alertas de clientes"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
