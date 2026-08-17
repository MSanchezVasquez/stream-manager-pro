import React from "react";
import { useDataStore } from "../../store/dataStore";
import { getPlatformConfig } from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import { Tv } from "lucide-react";

export const PlatformDistributionChart: React.FC = () => {
  const { clients } = useDataStore();

  // Count active subscriptions per platform
  const platformCounts: Record<string, number> = {};
  clients.forEach((c) => {
    if (c.status === "active") {
      c.subscriptions.forEach((s) => {
        if (s.status === "active") {
          const norm = s.serviceName || "Otros";
          platformCounts[norm] = (platformCounts[norm] || 0) + 1;
        }
      });
    }
  });

  const sortedPlatforms = Object.entries(platformCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const totalSubs = sortedPlatforms.reduce((acc, [, val]) => acc + val, 0);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#E4E4E7] flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-500" />
            Distribución por Plataforma
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            Total de {totalSubs} suscripciones activas registradas
          </p>
        </div>
      </div>

      {sortedPlatforms.length === 0 ? (
        <p className="text-sm text-[#94949E] italic py-4">
          No hay datos suficientes.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedPlatforms.map(([platform, count]) => {
            const config = getPlatformConfig(platform);
            const percentage =
              totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0;

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
                  <span className="text-slate-500 dark:text-[#94949E]">
                    {count} cliente(s) ({percentage}%)
                  </span>
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
