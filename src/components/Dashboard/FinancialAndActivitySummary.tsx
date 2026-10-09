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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* 1. Centro de Acciones Rápidas (Atajos de 1 clic) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isEn ? "Quick Operational Actions" : "Acciones Rápidas"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn
                    ? "1-click shortcuts for your daily workflow"
                    : "Atajos de 1 clic para tu gestión diaria"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {isEn ? "Direct" : "Atajos"}
            </span>
          </div>

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
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-[#181820] dark:hover:bg-indigo-950/20 border border-slate-200/70 hover:border-indigo-400/50 dark:border-[#25252D] dark:hover:border-indigo-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {isEn ? "New Client / Sale" : "Nueva Venta / Cliente"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? "Register client and assign subscription"
                      : "Registrar cliente y asignar servicio"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Botón 2: Asignar Perfil Libre */}
            <button
              type="button"
              onClick={() => onNavigateTab("free_profiles")}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-sky-50/60 dark:bg-[#181820] dark:hover:bg-sky-950/20 border border-slate-200/70 hover:border-sky-400/50 dark:border-[#25252D] dark:hover:border-sky-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                    {isEn ? "Assign Free Profile" : "Asignar Perfil Libre"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalFreeProfilesCount} profile(s) ready to deliver`
                      : `${totalFreeProfilesCount} perfil(es) listos para vender`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Botón 3: Recordatorios de WhatsApp */}
            <button
              type="button"
              onClick={() => onNavigateTab("alerts")}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-[#181820] dark:hover:bg-emerald-950/20 border border-slate-200/70 hover:border-emerald-400/50 dark:border-[#25252D] dark:hover:border-emerald-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {isEn ? "WhatsApp Expiration Alerts" : "Alertas de WhatsApp"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalAttentionSubs} subscription(s) expiring soon`
                      : `${totalAttentionSubs} suscripción(es) próximas a vencer`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Botón 4: Cuentas de Proveedores */}
            <button
              type="button"
              onClick={() => onNavigateTab("suppliers")}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 dark:bg-[#181820] dark:hover:bg-purple-950/20 border border-slate-200/70 hover:border-purple-400/50 dark:border-[#25252D] dark:hover:border-purple-500/40 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {isEn ? "Suppliers & Master Accounts" : "Cuentas de Proveedores"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isEn
                      ? `${totalSupplierAccounts} master account(s) registered`
                      : `${totalSupplierAccounts} cuenta(s) maestra(s) registradas`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {isEn ? "StreamManager Pro Engine" : "Panel Operativo Pro"}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "Online" : "Activo"}
          </span>
        </div>
      </div>

      {/* 2. Stock y Disponibilidad de Perfiles Libres */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isEn ? "Available Profile Stock" : "Stock de Perfiles Disponibles"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn
                    ? "Free profiles ready for instant delivery"
                    : "Inventario libre listo para entrega inmediata"}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-cascadia ${
                totalFreeProfilesCount > 0
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {totalFreeProfilesCount}{" "}
              {isEn ? "in stock" : "en stock"}
            </span>
          </div>

          <div className="space-y-2.5">
            {platformsWithStock.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#181820] border border-dashed border-slate-200 dark:border-[#25252D] text-center">
                <PackageOpen className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "No free profiles in stock" : "Sin perfiles libres en stock"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
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
              platformsWithStock.slice(0, 4).map(([platName, info]) => (
                <div
                  key={platName}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/60 dark:border-[#25252D] flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlatformIcon
                      platform={info.rawPlatform}
                      className="w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
                        {platName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
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

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-cascadia ${
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
              ))
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {platformsWithStock.length}{" "}
            {isEn ? "platforms with stock" : "plataformas con stock"}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("free_profiles")}
            className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{isEn ? "Manage inventory" : "Gestionar inventario"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Estado Operativo de Proveedores & Vencimientos */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isEn
                    ? "Suppliers & Service Status"
                    : "Estado de Proveedores y Servicio"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn
                    ? "Master accounts and service continuity"
                    : "Cuentas maestras y continuidad de clientes"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-cascadia">
              {suppliers.length} {isEn ? "prov." : "proveed."}
            </span>
          </div>

          <div className="space-y-3">
            {/* Alerta o estado de cuentas maestras con proveedores */}
            {supplierAccountsExpiringSoon > 0 || supplierAccountsExpired > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {supplierAccountsExpired > 0
                      ? isEn
                        ? `${supplierAccountsExpired} master account(s) expired!`
                        : `¡${supplierAccountsExpired} cuenta(s) maestra(s) vencida(s)!`
                      : isEn
                        ? `${supplierAccountsExpiringSoon} master account(s) expiring soon`
                        : `${supplierAccountsExpiringSoon} cuenta(s) de proveedor por vencer`}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    {isEn
                      ? "Renew with suppliers to keep client subscriptions active."
                      : "Renuévalas con el proveedor para no cortar a tus clientes."}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("suppliers")}
                    className="mt-2 text-[11px] font-bold text-amber-800 dark:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isEn ? "Go to Suppliers" : "Renovar en Proveedores"}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                    {isEn
                      ? "Master accounts up to date"
                      : "Cuentas maestras al día"}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 truncate">
                    {totalSupplierAccounts}{" "}
                    {isEn
                      ? "active account(s) from suppliers"
                      : "cuenta(s) activa(s) con proveedores"}
                  </p>
                </div>
              </div>
            )}

            {/* Resumen de Clientes Activos y Vencimientos */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {isEn ? "Active Clients" : "Clientes Activos"}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-cascadia">
                  {activeClients.length}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {totalActiveSubs} {isEn ? "subs in service" : "subs en servicio"}
                </p>
              </div>

              <div
                onClick={() => onNavigateTab("alerts")}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D] hover:border-amber-400/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                    {isEn ? "Next Expirations" : "Por Vencer (≤5d)"}
                  </span>
                </div>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-cascadia">
                  {warningSubsCount + expiredSubsCount}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                  {isEn ? "Requires WhatsApp alert" : "Requiere aviso WhatsApp"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {isEn ? "Automatic Monitoring" : "Monitoreo Continuo"}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("alerts")}
            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{isEn ? "View all alerts" : "Ver alertas de clientes"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
