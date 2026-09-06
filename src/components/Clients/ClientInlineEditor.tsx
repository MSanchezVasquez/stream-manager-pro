import React from "react";
import { Edit2, Sidebar as SidebarIcon, Save, X } from "lucide-react";
import { Client } from "../../types";
import { getClientAccountHealth } from "../../utils/platformHelpers";

interface ClientInlineEditorProps {
  client: Client;
  inlineClientData: Client;
  setInlineClientData: React.Dispatch<React.SetStateAction<Client | null>>;
  health: ReturnType<typeof getClientAccountHealth>;
  onSave: () => void;
  onCancel: () => void;
  onOpenDrawer: () => void;
}

export const ClientInlineEditor: React.FC<ClientInlineEditorProps> = ({
  inlineClientData,
  setInlineClientData,
  health,
  onSave,
  onCancel,
  onOpenDrawer,
}) => {
  return (
    <div className="break-inside-avoid mb-6 p-5 rounded-2xl bg-white dark:bg-[#141418] border-2 border-indigo-500/50 shadow-xl transition-all flex flex-col space-y-4 relative">
      {/* Inline Edit Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F1F23]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            Edición Rápida en Tarjeta
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${health.badgeClass} select-none`}
            title={health.tooltip}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${health.dotClass}`} />
            <span>{health.label}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenDrawer}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1A1A20] hover:bg-slate-200 dark:hover:bg-[#25252E] text-[11px] font-semibold text-slate-600 dark:text-[#E4E4E7] flex items-center gap-1 transition-colors cursor-pointer"
            title="Abrir panel lateral completo"
          >
            <SidebarIcon className="w-3 h-3 text-indigo-500" />
            <span>Panel Lateral</span>
          </button>
        </div>
      </div>

      {/* General Info Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
            Nombre del Cliente
          </label>
          <input
            type="text"
            value={inlineClientData.name}
            onChange={(e) =>
              setInlineClientData({
                ...inlineClientData,
                name: e.target.value,
              })
            }
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-semibold focus:ring-2 focus:ring-indigo-500 font-space"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
            Teléfono / WhatsApp
          </label>
          <input
            type="text"
            value={inlineClientData.phone || ""}
            onChange={(e) =>
              setInlineClientData({
                ...inlineClientData,
                phone: e.target.value,
              })
            }
            placeholder="+51 987654321"
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-cascadia font-light focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Subscriptions Inline Form */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#1F1F23]">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94949E]">
          Servicios
        </h4>
        {inlineClientData.subscriptions.map((sub, idx) => (
          <div
            key={sub.id}
            className="p-3 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50/80 dark:bg-[#1A1A1E] space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-[#E4E4E7]">
                {sub.serviceName}
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">
                Servicio #{idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  Fecha Corte
                </label>
                <input
                  type="text"
                  value={sub.cutDate}
                  onChange={(e) => {
                    const newSubs = [...inlineClientData.subscriptions];
                    newSubs[idx] = {
                      ...newSubs[idx],
                      cutDate: e.target.value,
                    };
                    setInlineClientData({
                      ...inlineClientData,
                      subscriptions: newSubs,
                    });
                  }}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-amber-600 dark:text-amber-400 text-[11px] font-cascadia font-light font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  Correo / Usuario
                </label>
                <input
                  type="text"
                  value={sub.email || ""}
                  onChange={(e) => {
                    const newSubs = [...inlineClientData.subscriptions];
                    newSubs[idx] = {
                      ...newSubs[idx],
                      email: e.target.value,
                    };
                    setInlineClientData({
                      ...inlineClientData,
                      subscriptions: newSubs,
                    });
                  }}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-[11px] font-cascadia font-light"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  Contraseña
                </label>
                <input
                  type="text"
                  value={sub.password || ""}
                  onChange={(e) => {
                    const newSubs = [...inlineClientData.subscriptions];
                    newSubs[idx] = {
                      ...newSubs[idx],
                      password: e.target.value,
                    };
                    setInlineClientData({
                      ...inlineClientData,
                      subscriptions: newSubs,
                    });
                  }}
                  placeholder="••••••"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-[11px] font-cascadia font-light"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  Perfil / PIN
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={sub.profileName || ""}
                    onChange={(e) => {
                      const newSubs = [...inlineClientData.subscriptions];
                      newSubs[idx] = {
                        ...newSubs[idx],
                        profileName: e.target.value,
                      };
                      setInlineClientData({
                        ...inlineClientData,
                        subscriptions: newSubs,
                      });
                    }}
                    placeholder="Perfil"
                    className="w-2/3 px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-[11px]"
                  />
                  <input
                    type="text"
                    value={sub.pin || ""}
                    onChange={(e) => {
                      const newSubs = [...inlineClientData.subscriptions];
                      newSubs[idx] = {
                        ...newSubs[idx],
                        pin: e.target.value,
                      };
                      setInlineClientData({
                        ...inlineClientData,
                        subscriptions: newSubs,
                      });
                    }}
                    placeholder="PIN"
                    className="w-1/3 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-[11px] font-cascadia font-light"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1F1F23]">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancelar</span>
        </button>
        <button
          onClick={onSave}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
};
