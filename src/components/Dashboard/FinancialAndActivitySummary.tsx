import React from "react";
import {
  Coins,
  ShieldCheck,
  Clock,
  ArrowUpRight,
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
> = ({ onNavigateTab }) => {
  const { t, resolvedLanguage } = useTranslation();
  const { clients } = useDataStore();

  const activeClients = clients.filter((c) => c.status === "active");

  let totalRevenue = 0;
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

  const totalEvaluatedClients = activeClients.length || 1;
  const healthPercentage = Math.round(
    (healthyCount / totalEvaluatedClients) * 100,
  );
  const avgTicketPerClient =
    activeClients.length > 0 ? totalRevenue / activeClients.length : 0;
  const avgPricePerSub =
    totalActiveSubs > 0 ? totalRevenue / totalActiveSubs : 0;

  const topRevenuePlatforms = Object.entries(platformRevenueMap)
    .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Métrica Financiera Principal */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-white to-slate-50 dark:from-[#141418] dark:to-[#181820] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Coins className="w-5 h-5" />
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
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-cascadia bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {totalActiveSubs} {resolvedLanguage === "en" ? "subs" : "suscripciones"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Facturación Mensual Total */}
            <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-500/30 dark:border-blue-500/20">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
                {t("finance.totalMonthlyRevenue")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-cascadia text-blue-600 dark:text-blue-400">
                  S/{" "}
                  {totalRevenue.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t("finance.perMonth")}
                </span>
              </div>
            </div>

            {/* Promedios unitarios */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("finance.avgTicket")}
                </span>
                <span className="text-sm font-bold font-cascadia text-slate-800 dark:text-slate-200">
                  S/ {avgTicketPerClient.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/50 dark:border-[#25252D]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("finance.avgPrice")}
                </span>
                <span className="text-sm font-bold font-cascadia text-blue-600 dark:text-blue-400">
                  S/ {avgPricePerSub.toFixed(2)}
                </span>
              </div>
            </div>

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
                          <span className="font-bold text-xs font-cascadia text-slate-900 dark:text-slate-100 block">
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

      {/* 2. Salud de Cartera & Top Plataformas */}
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
