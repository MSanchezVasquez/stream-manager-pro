import React from "react";
import {
  TrendingUp,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Tv,
  Users,
  ShieldCheck,
  Calendar,
  Wallet,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import {
  getDaysRemaining,
  getPlatformDisplayName,
  getPlatformConfig,
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

  // Clientes activos
  const activeClients = clients.filter((c) => c.status === "active");
  const totalClientsCount = clients.length;
  const activeClientsCount = activeClients.length;

  // Suscripciones activas
  const activeSubs = activeClients.flatMap((c) =>
    (c.subscriptions || []).filter((s) => s.status === "active"),
  );
  const totalActiveSubsCount = activeSubs.length;

  // 1. CÁLCULO FINANCIERO MENSUAL PROYECTADO
  // Ingresos mensuales normalizados
  let monthlyRevenue = 0;
  activeSubs.forEach((s) => {
    const p = Number(s.price) || 0;
    if (p > 0) {
      if (s.periodUnit === "years") {
        monthlyRevenue += p / 12;
      } else if (
        s.periodUnit === "days" &&
        s.periodValue &&
        s.periodValue > 0
      ) {
        monthlyRevenue += (p / s.periodValue) * 30;
      } else {
        monthlyRevenue += p;
      }
    }
  });

  // Costos mensuales a proveedores normalizados
  let monthlyCost = 0;
  let totalActiveSupplierAccounts = 0;
  suppliers.forEach((sup) => {
    (sup.accounts || []).forEach((acc) => {
      if (acc.status === "active") {
        totalActiveSupplierAccounts++;
        const c = Number(acc.cost) || 0;
        if (c > 0) {
          if (acc.periodUnit === "years") {
            monthlyCost += c / 12;
          } else if (
            acc.periodUnit === "days" &&
            acc.periodValue &&
            acc.periodValue > 0
          ) {
            monthlyCost += (c / acc.periodValue) * 30;
          } else {
            monthlyCost += c;
          }
        }
      }
    });
  });

  // Ganancia neta y margen
  const netProfit = monthlyRevenue - monthlyCost;
  const profitMargin =
    monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
  const averageTicket =
    activeClientsCount > 0 ? monthlyRevenue / activeClientsCount : 0;
  const averageSubPrice =
    totalActiveSubsCount > 0 ? monthlyRevenue / totalActiveSubsCount : 0;

  // 2. RENDIMIENTO POR PLATAFORMA
  const platformStats: Record<
    string,
    { count: number; revenue: number; rawPlatform: string }
  > = {};

  activeSubs.forEach((s) => {
    const displayName =
      getPlatformDisplayName(s.serviceName) || s.serviceName || "Otros";
    if (!platformStats[displayName]) {
      platformStats[displayName] = {
        count: 0,
        revenue: 0,
        rawPlatform: s.serviceName,
      };
    }
    platformStats[displayName].count += 1;

    const p = Number(s.price) || 0;
    if (p > 0) {
      if (s.periodUnit === "years") {
        platformStats[displayName].revenue += p / 12;
      } else if (
        s.periodUnit === "days" &&
        s.periodValue &&
        s.periodValue > 0
      ) {
        platformStats[displayName].revenue += (p / s.periodValue) * 30;
      } else {
        platformStats[displayName].revenue += p;
      }
    }
  });

  const sortedPlatforms = Object.entries(platformStats).sort(
    (a, b) => b[1].revenue - a[1].revenue || b[1].count - a[1].count,
  );
  const topPlatform = sortedPlatforms[0] ? sortedPlatforms[0][0] : null;

  // 3. SALUD DEL NEGOCIO Y FLUJO A 7 DÍAS
  const retentionRate =
    totalClientsCount > 0
      ? Math.round((activeClientsCount / totalClientsCount) * 100)
      : 100;

  // Flujo próximo a 7 días (cobros clientes vs pagos proveedores)
  let upcomingRevenue7d = 0;
  let upcomingSubsCount7d = 0;

  activeClients.forEach((c) => {
    (c.subscriptions || []).forEach((s) => {
      if (s.status === "active") {
        const days = getDaysRemaining(s.cutDate);
        if (days <= 7) {
          upcomingRevenue7d += Number(s.price) || 0;
          upcomingSubsCount7d++;
        }
      }
    });
  });

  let upcomingCost7d = 0;
  let upcomingSupplierCount7d = 0;

  suppliers.forEach((sup) => {
    (sup.accounts || []).forEach((acc) => {
      if (acc.expirationDate) {
        const days = getDaysRemaining(acc.expirationDate);
        if (days <= 7) {
          upcomingCost7d += Number(acc.cost) || 0;
          upcomingSupplierCount7d++;
        }
      }
    });
  });

  const netCashflow7d = upcomingRevenue7d - upcomingCost7d;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {/* ========================================================= */}
      {/* TARJETA 1: BALANCE Y RENTABILIDAD MENSUAL                */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full hover:border-slate-300 dark:hover:border-[#2A2A32] transition-colors">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Financial Performance" : "Balance y Rentabilidad"}
                >
                  {isEn ? "Financial Performance" : "Balance y Rentabilidad"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "Monthly revenue & operational margin"
                      : "Ingresos y margen operativo mensual"
                  }
                >
                  {isEn
                    ? "Monthly revenue & operational margin"
                    : "Ingresos y margen operativo mensual"}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold font-cascadia ${
                profitMargin >= 40
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : profitMargin >= 15
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {profitMargin >= 0 ? "+" : ""}
              {profitMargin.toFixed(1)}% {isEn ? "Margin" : "Margen"}
            </span>
          </div>

          {/* Body: Indicadores Financieros */}
          <div className="space-y-3">
            {/* KPI Principal: Ganancia Neta Estimada */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isEn ? "Estimated Net Profit / Mo" : "Ganancia Neta Estimada / Mes"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-cascadia tracking-tight ${
                      netProfit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    S/ {netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  netProfit >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            {/* Fila Secundaria: Ingresos Brutos vs Costos Proveedor */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Ingresos Brutos */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D]">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isEn ? "Gross Revenue" : "Ingresos Brutos"}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white font-cascadia truncate">
                  S/ {monthlyRevenue.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {totalActiveSubsCount}{" "}
                  {totalActiveSubsCount === 1
                    ? isEn
                      ? "active sub"
                      : "sub activa"
                    : isEn
                      ? "active subs"
                      : "subs activas"}
                </p>
              </div>

              {/* Costos Operativos */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D]">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isEn ? "Supplier Costs" : "Costos Proveedor"}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white font-cascadia truncate">
                  S/ {monthlyCost.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {totalActiveSupplierAccounts}{" "}
                  {totalActiveSupplierAccounts === 1
                    ? isEn
                      ? "master acc"
                      : "cuenta maestra"
                    : isEn
                      ? "master accs"
                      : "cuentas maestras"}
                </p>
              </div>
            </div>

            {/* Barra de Distribución Financiera */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  {isEn ? "Profit Share" : "Ganancia Neta"}:{" "}
                  <strong className="font-cascadia">
                    {monthlyRevenue > 0
                      ? Math.max(0, Math.round((netProfit / monthlyRevenue) * 100))
                      : 0}
                    %
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  {isEn ? "Cost" : "Costo"}:{" "}
                  <strong className="font-cascadia">
                    {monthlyRevenue > 0
                      ? Math.min(100, Math.round((monthlyCost / monthlyRevenue) * 100))
                      : 0}
                    %
                  </strong>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#25252D] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${
                      monthlyRevenue > 0
                        ? Math.max(0, Math.min(100, (netProfit / monthlyRevenue) * 100))
                        : 0
                    }%`,
                  }}
                  title={isEn ? "Profit margin" : "Margen de ganancia"}
                />
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${
                      monthlyRevenue > 0
                        ? Math.max(0, Math.min(100, (monthlyCost / monthlyRevenue) * 100))
                        : 0
                    }%`,
                  }}
                  title={isEn ? "Supplier cost" : "Costo de compras"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card 1 */}
        <div className="pt-3.5 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {isEn ? "Avg / sub:" : "Promedio / sub:"}{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200 font-cascadia">
              S/ {averageSubPrice.toFixed(2)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("clients_active")}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? "View Active Clients" : "Ver Clientes Activos"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TARJETA 2: RENDIMIENTO Y DEMANDA POR PLATAFORMA           */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full hover:border-slate-300 dark:hover:border-[#2A2A32] transition-colors">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Platform Demand & Sales" : "Top Plataformas"}
                >
                  {isEn ? "Platform Demand & Sales" : "Top Plataformas"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "Demand and billed revenue by service"
                      : "Demanda y facturación por servicio"
                  }
                >
                  {isEn
                    ? "Demand and billed revenue by service"
                    : "Demanda y facturación por servicio"}
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-cascadia">
              {sortedPlatforms.length}{" "}
              {sortedPlatforms.length === 1
                ? isEn
                  ? "service"
                  : "servicio"
                : isEn
                  ? "services"
                  : "servicios"}
            </span>
          </div>

          {/* Body: Lista de Top Plataformas */}
          <div className="space-y-2.5">
            {sortedPlatforms.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-dashed border-slate-200 dark:border-[#25252D] text-center flex flex-col items-center justify-center min-h-[200px]">
                <Tv className="w-7 h-7 text-slate-400 mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "No active subscriptions yet" : "Sin suscripciones activas aún"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3 max-w-[220px]">
                  {isEn
                    ? "Add client subscriptions to view platform breakdown"
                    : "Registra suscripciones de clientes para ver el ranking"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAddClientModal) {
                      onOpenAddClientModal();
                    } else {
                      onNavigateTab("clients_active");
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isEn ? "+ New Client" : "+ Nueva Venta"}
                </button>
              </div>
            ) : (
              sortedPlatforms.slice(0, 4).map(([platName, info], idx) => {
                const config = getPlatformConfig(platName);
                const subShare =
                  totalActiveSubsCount > 0
                    ? Math.round((info.count / totalActiveSubsCount) * 100)
                    : 0;

                return (
                  <div
                    key={platName}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#121216] border border-slate-200/60 dark:border-[#25252D] flex items-center justify-center shrink-0 shadow-xs">
                          <PlatformIcon
                            platform={info.rawPlatform}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate block"
                              title={platName}
                            >
                              {platName}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                                {isEn ? "Top #1" : "Top #1"}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            {info.count}{" "}
                            {info.count === 1
                              ? isEn
                                ? "client"
                                : "cliente"
                              : isEn
                                ? "clients"
                                : "clientes"}{" "}
                            ({subShare}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-cascadia block">
                          S/ {info.revenue.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {isEn ? "/month" : "/mes"}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso de participación */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-[#25252D] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, subShare)}%`,
                          backgroundColor: config.color || "#6366F1",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Card 2 */}
        <div className="pt-3.5 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {topPlatform ? (
              <>
                {isEn ? "Star service:" : "Servicio estrella:"}{" "}
                <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {topPlatform}
                </strong>
              </>
            ) : (
              isEn ? "No sales registered" : "Sin ventas registradas"
            )}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("free_profiles")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? "Profiles Stock" : "Stock de Perfiles"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TARJETA 3: SALUD DEL NEGOCIO Y FLUJO A 7 DÍAS             */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between h-full hover:border-slate-300 dark:hover:border-[#2A2A32] transition-colors">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white truncate"
                  title={isEn ? "Business Health & Cashflow" : "Salud del Negocio y Flujo"}
                >
                  {isEn ? "Business Health & Cashflow" : "Salud del Negocio y Flujo"}
                </h3>
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={
                    isEn
                      ? "Retention and 7-day upcoming cashflow"
                      : "Retención y cobros proyectados a 7 días"
                  }
                >
                  {isEn
                    ? "Retention and 7-day upcoming cashflow"
                    : "Retención y cobros proyectados a 7 días"}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold font-cascadia ${
                retentionRate >= 80
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {retentionRate}% {isEn ? "Retention" : "Retención"}
            </span>
          </div>

          {/* Body: Salud Operativa y Flujo a 7 días */}
          <div className="space-y-3">
            {/* 2 Cajas de Métricas: Retención y Ticket Promedio (ARPU) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tasa de Retención */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isEn ? "Retention" : "Retención"}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      retentionRate >= 80 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white font-cascadia">
                  {retentionRate}%
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {activeClientsCount}/{totalClientsCount}{" "}
                  {isEn ? "active clients" : "clientes activos"}
                </p>
              </div>

              {/* Ticket Promedio (ARPU) */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isEn ? "Avg Ticket" : "Ticket Promedio"}
                  </span>
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white font-cascadia truncate">
                  S/ {averageTicket.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {isEn ? "per active client" : "por cliente activo"}
                </p>
              </div>
            </div>

            {/* Caja de Flujo Proyectado a 7 Días */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {isEn ? "7-Day Projected Cashflow" : "Flujo Proyectado (Próx. 7 días)"}
                </span>
                <span
                  className={`text-xs font-bold font-cascadia ${
                    netCashflow7d >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {netCashflow7d >= 0 ? "+" : ""}S/ {netCashflow7d.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {/* Cobros a clientes */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {isEn ? "Client collections" : "Cobros a clientes"}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      ({upcomingSubsCount7d}{" "}
                      {upcomingSubsCount7d === 1
                        ? isEn
                          ? "sub"
                          : "corte"
                        : isEn
                          ? "subs"
                          : "cortes"}
                      )
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-cascadia shrink-0 ml-1">
                    +S/ {upcomingRevenue7d.toFixed(2)}
                  </span>
                </div>

                {/* Pagos a proveedores */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {isEn ? "Supplier payments" : "Pagos a proveedores"}
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold shrink-0">
                      ({upcomingSupplierCount7d}{" "}
                      {upcomingSupplierCount7d === 1
                        ? isEn
                          ? "acc"
                          : "cuenta"
                        : isEn
                          ? "accs"
                          : "cuentas"}
                      )
                    </span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-cascadia shrink-0 ml-1">
                    -S/ {upcomingCost7d.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card 3 */}
        <div className="pt-3.5 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {upcomingSubsCount7d > 0 ? (
              <>
                <strong className="text-amber-600 dark:text-amber-400 font-semibold font-cascadia">
                  {upcomingSubsCount7d}
                </strong>{" "}
                {isEn ? "renewals due this week" : "renovaciones por vencer (≤7d)"}
              </>
            ) : (
              isEn ? "No immediate renewals due" : "Sin cobros urgentes esta semana"
            )}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("alerts")}
            className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? "View Expirations" : "Ver Alertas de Corte"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
