import React from "react";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Tv,
  Users,
  Wallet,
  Truck,
  Crown,
  Sparkles,
  PieChart,
  ArrowDownRight,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import {
  getDaysRemaining,
  getPlatformConfig,
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
> = ({ onNavigateTab }) => {
  const { t, resolvedLanguage } = useTranslation();
  const { clients, suppliers } = useDataStore();

  const activeClients = clients.filter((c) => c.status === "active");

  // 1. Cálculos de Facturación y Clientes
  let totalRevenue = 0;
  let ownRevenue = 0;
  let ownSubsCount = 0;
  let supplierClientRevenue = 0;
  let supplierSubsCount = 0;
  let revenueAtRisk = 0;
  let healthyCount = 0;
  let warningCount = 0;
  let expiredCount = 0;
  let totalActiveSubs = 0;

  const platformRevenueMap: Record<
    string,
    { count: number; totalRevenue: number }
  > = {};

  activeClients.forEach((client) => {
    let clientHasExpired = false;
    let clientHasWarning = false;

    client.subscriptions.forEach((sub) => {
      if (sub.status === "active") {
        totalActiveSubs++;
        const price = typeof sub.price === "number" ? sub.price : 0;
        totalRevenue += price;

        const supName = (sub.supplierName || "").trim().toLowerCase();
        const isOwnAccount =
          !supName ||
          supName === "propia" ||
          supName === "propio" ||
          supName === "mía" ||
          supName === "mia" ||
          supName === "cuenta propia";

        if (isOwnAccount) {
          ownRevenue += price;
          ownSubsCount++;
        } else {
          supplierClientRevenue += price;
          supplierSubsCount++;
        }

        const days = getDaysRemaining(sub.cutDate);
        if (days < 0) {
          clientHasExpired = true;
          revenueAtRisk += price;
        } else if (days <= 5) {
          clientHasWarning = true;
          revenueAtRisk += price;
        }

        const platformName =
          getPlatformDisplayName(sub.serviceName) || "Otros";
        if (!platformRevenueMap[platformName]) {
          platformRevenueMap[platformName] = { count: 0, totalRevenue: 0 };
        }
        platformRevenueMap[platformName].count += 1;
        platformRevenueMap[platformName].totalRevenue += price;
      }
    });

    if (clientHasExpired) {
      expiredCount++;
    } else if (clientHasWarning) {
      warningCount++;
    } else {
      healthyCount++;
    }
  });

  // 2. Cálculos de Gastos en Proveedores
  let totalSupplierExpenses = 0;
  let activeSupplierAccountsCount = 0;

  suppliers.forEach((s) => {
    (s.accounts || []).forEach((acc) => {
      if (acc.status !== "expired") {
        activeSupplierAccountsCount++;
        if (typeof acc.cost === "number" && acc.cost > 0) {
          totalSupplierExpenses += acc.cost;
        }
      }
    });
  });

  // 3. Cálculos de Ganancias y Rentabilidad
  const netProfit = totalRevenue - totalSupplierExpenses;
  const netMarginPct =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Cuentas propias: Ganancia al 100% (costo = 0)
  const ownProfit = ownRevenue;

  // Cuentas con proveedor: Ingreso cliente - Costo proveedor
  const supplierNetProfit = supplierClientRevenue - totalSupplierExpenses;
  const supplierMarginPct =
    supplierClientRevenue > 0
      ? (supplierNetProfit / supplierClientRevenue) * 100
      : 0;

  const totalEvaluatedClients = activeClients.length || 1;
  const healthPercentage = Math.round(
    (healthyCount / totalEvaluatedClients) * 100,
  );
  const avgTicketPerClient =
    activeClients.length > 0 ? totalRevenue / activeClients.length : 0;
  const avgProfitPerSub =
    totalActiveSubs > 0 ? netProfit / totalActiveSubs : 0;

  const topRevenuePlatforms = Object.entries(platformRevenueMap)
    .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
    .slice(0, 4);

  // Porcentaje visual de ganancia vs costo
  const profitBarPct =
    totalRevenue > 0
      ? Math.max(0, Math.min(100, Math.round((netProfit / totalRevenue) * 100)))
      : 100;
  const expenseBarPct =
    totalRevenue > 0
      ? Math.max(0, Math.min(100, Math.round((totalSupplierExpenses / totalRevenue) * 100)))
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Métrica Financiera Principal (Balance & Ganancia Neta) */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-white to-slate-50 dark:from-[#141418] dark:to-[#181820] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t("finance.title")}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("finance.currency")}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-cascadia border ${
                netProfit >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {netMarginPct >= 0 ? `+${netMarginPct.toFixed(1)}%` : `${netMarginPct.toFixed(1)}%`}{" "}
              {resolvedLanguage === "en" ? "Net Margin" : "Margen Neto"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Ganancia Neta Mensual */}
            <div className="p-4 rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-500/30 dark:border-emerald-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  {t("finance.netProfit")}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {resolvedLanguage === "en" ? "Revenue minus supplier costs" : "Ventas menos costo proveedores"}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-cascadia text-emerald-600 dark:text-emerald-400">
                  S/{" "}
                  {netProfit.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t("finance.perMonth")}</span>
              </div>
            </div>

            {/* Comparativa: Facturación vs Gasto en Proveedores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-[#101014] border border-slate-200/60 dark:border-[#25252D]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block truncate">
                    {t("finance.totalMonthlyRevenue")}
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold font-cascadia text-slate-900 dark:text-white block">
                  S/ {totalRevenue.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {totalActiveSubs} {resolvedLanguage === "en" ? "subs" : "suscripciones"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-[#101014] border border-slate-200/60 dark:border-[#25252D]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block truncate">
                    {t("finance.supplierExpenses")}
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold font-cascadia text-purple-600 dark:text-purple-400 block">
                  S/ {totalSupplierExpenses.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {activeSupplierAccountsCount} {resolvedLanguage === "en" ? "accounts" : "cuentas"}
                </span>
              </div>
            </div>

            {/* Barra Visual de Distribución del Dinero */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{resolvedLanguage === "en" ? "Profit retention" : "Retención de Ganancia"}: {profitBarPct}%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span>{resolvedLanguage === "en" ? "Supplier cost" : "Costo Proveedores"}: {expenseBarPct}%</span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#121216] overflow-hidden flex p-0.5 border border-slate-200/50 dark:border-[#25252D]">
                <div
                  style={{ width: `${profitBarPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all"
                  title={`Ganancia Neta: ${profitBarPct}%`}
                />
                <div
                  style={{ width: `${expenseBarPct}%` }}
                  className="bg-purple-500 h-full rounded-r-full transition-all"
                  title={`Gasto Proveedor: ${expenseBarPct}%`}
                />
              </div>
            </div>

            {/* Promedios unitarios */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("finance.avgTicket")}
                </span>
                <span className="text-xs font-bold font-cascadia text-slate-800 dark:text-slate-200">
                  S/ {avgTicketPerClient.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {resolvedLanguage === "en" ? "Net Profit / Sub" : "Ganancia / Suscripción"}
                </span>
                <span className="text-xs font-bold font-cascadia text-emerald-600 dark:text-emerald-400">
                  S/ {avgProfitPerSub.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {t("finance.billableProfiles", { count: totalActiveSubs })}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("clients_active")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{t("finance.viewClients")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Desglose Especial: Cuentas Propias (100% Ganancia) vs Cuentas Proveedores */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-white to-slate-50 dark:from-[#141418] dark:to-[#181820] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t("finance.breakdownTitle")}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {resolvedLanguage === "en"
                    ? "Direct ownership vs wholesale resellers"
                    : "Origen de cuentas y margen real"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bloque A: Cuentas Propias (100% Margen Limpio) */}
            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {t("finance.ownAccountsTitle")}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-cascadia shrink-0">
                  👑 {t("finance.pureProfitBadge")}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                    {resolvedLanguage === "en" ? "Net Clean Profit" : "Ganancia Neta Limpia"}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-cascadia text-emerald-600 dark:text-emerald-400">
                    S/ {ownProfit.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {resolvedLanguage === "en" ? "Direct sales" : "Perfiles vendidos"}
                  </span>
                  <span className="text-xs font-bold font-cascadia text-slate-800 dark:text-slate-200">
                    {ownSubsCount} {resolvedLanguage === "en" ? "subs" : "suscripciones"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-amber-500/15">
                {t("finance.ownAccountsDesc")}
              </p>
            </div>

            {/* Bloque B: Cuentas con Proveedores */}
            <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/25 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {t("finance.supplierAccountsTitle")}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-cascadia shrink-0 ${
                    supplierMarginPct >= 0
                      ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                      : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                  }`}
                >
                  {supplierMarginPct >= 0 ? `+${supplierMarginPct.toFixed(1)}%` : `${supplierMarginPct.toFixed(1)}%`}{" "}
                  {resolvedLanguage === "en" ? "Margin" : "Margen"}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                    {resolvedLanguage === "en" ? "Net Resell Profit" : "Ganancia Neta Proveedor"}
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-bold font-cascadia ${
                      supplierNetProfit >= 0
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    S/ {supplierNetProfit.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {resolvedLanguage === "en" ? "Resold profiles" : "Perfiles revendidos"}
                  </span>
                  <span className="text-xs font-bold font-cascadia text-slate-800 dark:text-slate-200">
                    {supplierSubsCount} {resolvedLanguage === "en" ? "subs" : "suscripciones"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/15 text-[11px]">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                    {t("finance.supplierSales")}:
                  </span>
                  <span className="font-cascadia font-bold text-slate-800 dark:text-slate-200">
                    S/ {supplierClientRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                    {t("finance.supplierCost")}:
                  </span>
                  <span className="font-cascadia font-bold text-purple-600 dark:text-purple-400">
                    S/ {totalSupplierExpenses.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                {t("finance.supplierAccountsDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {suppliers.length} {resolvedLanguage === "en" ? "suppliers" : "proveedores registrados"}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab("suppliers")}
            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{t("finance.manageSuppliers")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Salud de Cartera & Top Plataformas */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-white to-slate-50 dark:from-[#141418] dark:to-[#181820] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t("finance.collectionHealth")}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("finance.rateUpToDate")}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold font-cascadia ${
                healthPercentage >= 80
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {t("finance.upToDate", { pct: healthPercentage })}
            </span>
          </div>

          <div className="space-y-4">
            {/* Barra de progreso de estado */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>
                  {resolvedLanguage === "en"
                    ? "Clients distribution"
                    : "Distribución de clientes"}
                </span>
                <span>
                  {activeClients.length} {t("clients.clientCount")}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#101014] overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/50 dark:border-[#25252D]">
                <div
                  style={{
                    width: `${(healthyCount / totalEvaluatedClients) * 100}%`,
                  }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all"
                  title={`${healthyCount} ${t("clients.healthy")}`}
                />
                <div
                  style={{
                    width: `${(warningCount / totalEvaluatedClients) * 100}%`,
                  }}
                  className="bg-amber-500 h-full transition-all"
                  title={`${warningCount} ${t("clients.warning")}`}
                />
                <div
                  style={{
                    width: `${(expiredCount / totalEvaluatedClients) * 100}%`,
                  }}
                  className="bg-red-500 h-full rounded-r-full transition-all"
                  title={`${expiredCount} ${t("clients.expired")}`}
                />
              </div>
            </div>

            {/* Badges de desglose */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {t("clients.healthy")}
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-cascadia">
                  {healthyCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                  ≤ 5d
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-cascadia">
                  {warningCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-red-500/5 border border-red-500/15">
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold block">
                  {t("clients.expired")}
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-cascadia">
                  {expiredCount}
                </span>
              </div>
            </div>

            {revenueAtRisk > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{t("finance.revenueAtRisk")}:</span>
                </span>
                <strong className="font-cascadia font-bold">
                  S/ {revenueAtRisk.toFixed(2)}
                </strong>
              </div>
            )}

            {/* Top plataformas */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-[#25252D] space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                {t("finance.topPlatforms")}
              </span>
              <div className="space-y-1.5">
                {topRevenuePlatforms.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1">
                    {resolvedLanguage === "en"
                      ? "No subscriptions yet."
                      : "Sin suscripciones aún."}
                  </p>
                ) : (
                  topRevenuePlatforms.map(([platform, data]) => {
                    const share =
                      totalRevenue > 0
                        ? Math.round((data.totalRevenue / totalRevenue) * 100)
                        : 0;

                    return (
                      <div
                        key={platform}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-[#101014] border border-slate-200/50 dark:border-[#25252D] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PlatformIcon
                            platform={platform}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {platform}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs font-cascadia text-emerald-600 dark:text-emerald-400 block">
                            S/ {data.totalRevenue.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-cascadia">
                            {share}% {resolvedLanguage === "en" ? "share" : "del total"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-[#25252D] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => onNavigateTab("alerts")}
            className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{t("finance.viewExpirations")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
