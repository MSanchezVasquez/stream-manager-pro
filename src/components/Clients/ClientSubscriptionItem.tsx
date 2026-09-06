import React from "react";
import {
  Mail,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { ClientSubscription } from "../../types";
import { isSubscriptionFromFreeProfile } from "../../store/dataStore";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  formatCutDateStatus,
  getPlatformDisplayName,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";

interface ClientSubscriptionItemProps {
  sub: ClientSubscription;
  clientName: string;
  clientPhone?: string;
  freeProfiles: any[];
  isPasswordVisible: boolean;
  onTogglePassword: () => void;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
  onNotifyWhatsApp: (sub: ClientSubscription) => void;
}

export const ClientSubscriptionItem: React.FC<ClientSubscriptionItemProps> = ({
  sub,
  clientName,
  clientPhone,
  freeProfiles,
  isPasswordVisible,
  onTogglePassword,
  copiedField,
  onCopy,
  onNotifyWhatsApp,
}) => {
  const platConfig = getPlatformConfig(sub.serviceName);
  const badgeProps = getPlatformBadgeProps(platConfig);
  const statusInfo = formatCutDateStatus(sub.cutDate);

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50/70 dark:bg-[#1A1A1E] space-y-2 relative">
      {/* Platform header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={badgeProps.className} style={badgeProps.style}>
          <PlatformIcon
            platform={sub.serviceName}
            className="w-3.5 h-3.5 shrink-0"
          />
          <span className="font-semibold whitespace-nowrap">
            {getPlatformDisplayName(sub.serviceName)}
          </span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {isSubscriptionFromFreeProfile(sub, freeProfiles) && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 whitespace-nowrap"
              title="Asignado desde Perfiles Libres (se restaurará al eliminar)"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>Perfil Libre</span>
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${statusInfo.badge}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-[#94949E] pt-1">
        <div>
          Contratado:{" "}
          <span className="font-medium text-slate-700 dark:text-[#E4E4E7] font-cascadia font-light">
            {sub.hireDate || "N/A"}
          </span>
        </div>
        <div>
          Fecha Corte:{" "}
          <span className="font-bold text-slate-900 dark:text-[#E4E4E7] font-cascadia font-light">
            {sub.cutDate || "N/A"}
          </span>
        </div>
      </div>

      {/* Credentials */}
      {(sub.email || sub.password) && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-[#2D2D33] space-y-1.5 text-xs">
          {sub.email && (
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Mail className="w-3 h-3 text-[#94949E] shrink-0" />
                <span className="font-cascadia font-light text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate tracking-wide">
                  {sub.email}
                </span>
              </div>
              <button
                onClick={() => onCopy(sub.email!, `email-${sub.id}`)}
                className="text-slate-400 hover:text-indigo-500 p-0.5 shrink-0"
                title="Copiar correo"
              >
                {copiedField === `email-${sub.id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {sub.password && (
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Key className="w-3 h-3 text-[#94949E] shrink-0" />
                <span className="font-cascadia font-light text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate tracking-wide">
                  {isPasswordVisible ? sub.password : "••••••••••••"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onTogglePassword}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] p-0.5"
                  title={
                    isPasswordVisible
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {isPasswordVisible ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onCopy(sub.password!, `pass-${sub.id}`)}
                  className="text-slate-400 hover:text-indigo-500 p-0.5"
                  title="Copiar contraseña"
                >
                  {copiedField === `pass-${sub.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profile & PIN */}
          {(sub.profileName || sub.pin) && (
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              {sub.profileName && (
                <span>
                  Perfil:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {sub.profileName}
                  </strong>
                </span>
              )}
              {sub.pin && (
                <span className="font-cascadia font-light tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  PIN: {sub.pin}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp trigger per subscription */}
      <button
        onClick={() => onNotifyWhatsApp(sub)}
        className="w-full mt-2 py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3 h-3" />
        <span>Notificar Renovación</span>
      </button>
    </div>
  );
};
