import React from "react";
import {
  Edit2,
  Sidebar as SidebarIcon,
  Trash2,
  Smartphone,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  UserX,
  UserCheck,
} from "lucide-react";
import { Client, ClientSubscription } from "../../types";
import { getClientAccountHealth } from "../../utils/platformHelpers";
import { ClientSubscriptionItem } from "./ClientSubscriptionItem";

interface ClientCardProps {
  client: Client;
  visibleSubs: ClientSubscription[];
  health: ReturnType<typeof getClientAccountHealth>;
  hasActiveSubFilters: boolean;
  freeProfiles: any[];
  showPasswords: Record<string, boolean>;
  copiedField: string | null;
  onTogglePassword: (subId: string) => void;
  onCopy: (text: string, fieldId: string) => void;
  onStartInlineEdit: (client: Client) => void;
  onOpenDrawer: (client: Client) => void;
  onDelete: (client: Client) => void;
  onReactivate?: (client: Client) => void;
  onNotifyWhatsApp: (sub: ClientSubscription) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  visibleSubs,
  health,
  hasActiveSubFilters,
  freeProfiles,
  showPasswords,
  copiedField,
  onTogglePassword,
  onCopy,
  onStartInlineEdit,
  onOpenDrawer,
  onDelete,
  onReactivate,
  onNotifyWhatsApp,
}) => {
  return (
    <div className="break-inside-avoid mb-6 p-5 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm hover:border-slate-300 dark:hover:border-[#2D2D33] transition-all flex flex-col relative group">
      {/* Header */}
      <div className="mb-4 pb-3.5 border-b border-slate-100 dark:border-[#1F1F23] space-y-2.5">
        {/* Top Row: Avatar + Name + Header Actions */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-600/20 font-space shrink-0">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <h3
              className="font-bold text-base text-slate-900 dark:text-[#E4E4E7] leading-tight font-space tracking-tight truncate"
              title={client.name}
            >
              {client.name}
            </h3>
          </div>

          {/* Card Header Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {client.status === "inactive" && onReactivate && (
              <button
                onClick={() => onReactivate(client)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                title="Reactivar cliente (Mover a Clientes Activos)"
              >
                <UserCheck className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onStartInlineEdit(client)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
              title="Edición rápida en tarjeta"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenDrawer(client)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
              title="Abrir panel lateral"
            >
              <SidebarIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(client)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
              title={
                client.status === "active"
                  ? "Desactivar (Mover a Clientes Inactivos)"
                  : "Eliminar cliente definitivamente"
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-row: Health Status Badge and Phone + Profiles Count */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Account Health Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${health.badgeClass} select-none transition-all shadow-xs`}
            title={health.tooltip}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${health.dotClass} shrink-0`}
            />
            {health.level === "expired" && (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            {(health.level === "near_expiration" ||
              health.level === "expiring_today") && (
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            {health.level === "healthy" && (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {health.level === "no_profiles" && (
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            )}
            {health.level === "inactive" && (
              <UserX className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            )}
            <span className="whitespace-nowrap">{health.label}</span>
          </span>

          {/* Phone and Profiles Count Side-by-Side - Guaranteed single line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94949E] whitespace-nowrap shrink-0">
            {client.phone && (
              <span className="inline-flex items-center gap-1.5 font-cascadia font-medium text-xs text-slate-600 dark:text-slate-300 shrink-0">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{client.phone}</span>
              </span>
            )}

            {client.phone && (
              <span className="text-slate-300 dark:text-slate-600 font-bold select-none shrink-0">
                •
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#94949E] whitespace-nowrap shrink-0">
              <span className="font-cascadia font-bold text-slate-700 dark:text-slate-300">
                {visibleSubs.length}
              </span>
              <span>{visibleSubs.length === 1 ? "perfil" : "perfiles"}</span>
              {hasActiveSubFilters &&
                visibleSubs.length !== client.subscriptions.length && (
                  <span className="text-[10px] text-slate-400 dark:text-[#94949E] font-normal ml-0.5">
                    (de {client.subscriptions.length})
                  </span>
                )}
            </span>
          </div>
        </div>
      </div>

      {/* Subscriptions list */}
      <div className="space-y-3 mb-2">
        {visibleSubs.map((sub) => (
          <ClientSubscriptionItem
            key={sub.id}
            sub={sub}
            clientName={client.name}
            clientPhone={client.phone}
            freeProfiles={freeProfiles}
            isPasswordVisible={!!showPasswords[sub.id]}
            onTogglePassword={() => onTogglePassword(sub.id)}
            copiedField={copiedField}
            onCopy={onCopy}
            onNotifyWhatsApp={onNotifyWhatsApp}
          />
        ))}

        {visibleSubs.length === 0 && (
          <div className="py-4 px-3 text-center text-xs text-slate-400 dark:text-[#94949E] rounded-xl border border-dashed border-slate-200 dark:border-[#2D2D33]">
            Sin perfiles coincidentes
          </div>
        )}
      </div>
    </div>
  );
};
