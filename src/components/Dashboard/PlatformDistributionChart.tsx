import React from "react";
import { useDataStore } from "../../store/dataStore";
import { getPlatformConfig, getPlatformDisplayName } from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import { useTranslation } from "../../utils/translations";
import { Tv, Coins } from "lucide-react";

export const PlatformDistributionChart: React.FC = () => {
  const { t } = useTranslation();
  const { clients } = useDataStore();

  // Count active subscriptions and revenue per platform in Soles (PEN)
  const platformStats: Record<string, { count: number; revenue: number }> = {};
  clients.forEach((c) => {
    if (c.status === "active") {
      c.subscriptions.forEach((s) => {
        if (s.status === "active") {
          const norm = getPlatformDisplayName(s.serviceName) || "Otros";
          const price = typeof s.price === "number" ? s.price : 0;
          if (!platformStats[norm]) {
            platformStats[norm] = { count: 0, revenue: 0 };
          }
          platformStats[norm].count += 1;
          platformStats[norm].revenue += price;
        }
      });
    }
  });

  const sortedPlatforms = Object.entries(platformStats).sort(
    (a, b) => b[1].count - a[1].count,
  );
  const totalSubs = sortedPlatforms.reduce((acc, [, val]) => acc + val.count, 0);
  const totalRevenue = sortedPlatforms.reduce((acc, [, val]) => acc + val.revenue, 0);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#E4E4E7] flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-500" />
            {t("chart.title")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            {t("chart.subtitle", { total: totalSubs })}
          </p>
        </div>
        {totalRevenue > 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-cascadia">
              {t("chart.totalRevenue", { amount: totalRevenue.toFixed(2) })}
            </span>
          </div>
        )}
      </div>

      {sortedPlatforms.length === 0 ? (
        <p className="text-sm text-[#94949E] italic py-4">
          {t("chart.noData")}
        </p>
      ) : (
        <div className="space-y-4">
          {sortedPlatforms.map(([platform, data]) => {
            const config = getPlatformConfig(platform);
            const percentage =
              totalSubs > 0 ? Math.round((data.count / totalSubs) * 100) : 0;

            return (
              <div key={platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-[#E4E4E7] flex items-center gap-2">
                    <PlatformIcon
                      platform={platform}
                      className="w-4 h-4 shrink-0"
                    />
                    <span>{platform}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    {data.revenue > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-cascadia font-bold">
                        S/ {data.revenue.toFixed(2)}
                      </span>
                    )}
                    <span className="text-slate-500 dark:text-[#94949E]">
                      {data.count} sub(s) ({percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#1A1A1E] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
