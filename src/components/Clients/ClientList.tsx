import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDataStore } from "../../store/dataStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  formatCutDateStatus,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import {
  User,
  Tv,
  Calendar,
  Key,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  UserX,
  Smartphone,
  Sidebar as SidebarIcon,
  Save,
  X,
} from "lucide-react";
import { Client, ClientSubscription, StreamingPlatform } from "../../types";
import { ClientModal } from "./ClientModal";
import { WhatsAppModal } from "../WhatsAppModal";

interface ClientListProps {
  statusFilter: "active" | "inactive";
  globalSearchQuery: string;
}

const PLATFORM_FILTER_OPTIONS = [
  "Todos",
  "Netflix",
  "Disney+",
  "HBO Max",
  "Youtube Premium",
  "Amazon Prime Video",
  "Paramount Plus",
  "Spotify Premium",
  "Crunchyroll",
  "DGO",
];

export const ClientList: React.FC<ClientListProps> = ({
  statusFilter,
  globalSearchQuery,
}) => {
  const { clients, deleteClient, saveClient } = useDataStore();

  const [platformFilter, setPlatformFilter] = useState<string>("Todos");
  const [localSearch, setLocalSearch] = useState<string>("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inline editing state
  const [inlineEditingClientId, setInlineEditingClientId] = useState<
    string | null
  >(null);
  const [inlineClientData, setInlineClientData] = useState<Client | null>(null);

  // Modals / Drawer state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [whatsAppSub, setWhatsAppSub] = useState<{
    clientName: string;
    sub: ClientSubscription;
    phone?: string;
  } | null>(null);

  const effectiveSearch = globalSearchQuery || localSearch;

  const startInlineEdit = (client: Client) => {
    setInlineEditingClientId(client.id);
    setInlineClientData(JSON.parse(JSON.stringify(client)));
  };

  const cancelInlineEdit = () => {
    setInlineEditingClientId(null);
    setInlineClientData(null);
  };

  const handleSaveInline = async () => {
    if (!inlineClientData) return;
    if (!inlineClientData.name.trim()) {
      alert("El nombre del cliente no puede estar vacío");
      return;
    }
    const success = await saveClient(inlineClientData);
    if (!success) {
      alert(
        "No se pudo guardar el cliente. Verifica tu conexión e inténtalo de nuevo.",
      );
      return;
    }
    cancelInlineEdit();
  };

  // Filter clients by status (active / inactive)
  const filteredClients = clients.filter((client) => {
    if (client.status !== statusFilter) return false;

    // Platform filter
    if (platformFilter !== "Todos") {
      const hasPlatform = client.subscriptions.some((sub) =>
        sub.serviceName.toLowerCase().includes(platformFilter.toLowerCase()),
      );
      if (!hasPlatform) return false;
    }

    // Search query
    if (effectiveSearch) {
      const query = effectiveSearch.toLowerCase();
      const matchesName = client.name.toLowerCase().includes(query);
      const matchesPhone =
        client.phone && client.phone.toLowerCase().includes(query);
      const matchesSub = client.subscriptions.some(
        (sub) =>
          sub.serviceName.toLowerCase().includes(query) ||
          (sub.email && sub.email.toLowerCase().includes(query)) ||
          (sub.profileName && sub.profileName.toLowerCase().includes(query)),
      );
      if (!matchesName && !matchesPhone && !matchesSub) return false;
    }

    return true;
  });

  const togglePasswordVisibility = (subId: string) => {
    setShowPasswords((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`p-2.5 rounded-xl ${
              statusFilter === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-500/10 text-slate-500"
            }`}
          >
            {statusFilter === "active" ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <UserX className="w-5 h-5" />
            )}
          </div>
          <div>
            {/* font-space en el título principal */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7] font-space tracking-tight">
              {statusFilter === "active"
                ? "Clientes Activos"
                : "Clientes No Activos / Cancelados"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              Mostrando{" "}
              <span className="font-cascadia font-bold text-slate-700 dark:text-slate-300">
                {filteredClients.length}
              </span>{" "}
              cliente(s)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0 flex-1 justify-end">
          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Filter className="w-3.5 h-3.5 text-[#94949E] shrink-0 mr-1" />
            {PLATFORM_FILTER_OPTIONS.map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  platformFilter === plat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#1A1A1E] text-slate-600 dark:text-[#94949E] hover:bg-slate-200 border border-transparent dark:border-[#2D2D33]"
                }`}
              >
                {plat !== "Todos" && (
                  <PlatformIcon platform={plat} className="w-3.5 h-3.5" />
                )}
                <span>{plat}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Cliente</span>
          </button>
        </div>
      </div>

      {/* Clients Grid - Adaptable Fluid Masonry Layout */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
          <User className="w-12 h-12 text-[#94949E] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-700 dark:text-[#E4E4E7] mb-1 font-space">
            No se encontraron clientes
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94949E] max-w-sm mx-auto">
            Intenta cambiar el término de búsqueda o registra un nuevo cliente
            en el sistema.
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {filteredClients.map((client) => {
            const isInlineEditing =
              inlineEditingClientId === client.id && inlineClientData;

            if (isInlineEditing) {
              return (
                <div
                  key={client.id}
                  className="break-inside-avoid mb-6 p-5 rounded-2xl bg-white dark:bg-[#141418] border-2 border-indigo-500/50 shadow-xl transition-all flex flex-col space-y-4 relative"
                >
                  {/* Inline Edit Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F1F23]">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edición Rápida en Tarjeta
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          cancelInlineEdit();
                          setEditingClient(client);
                          setIsClientModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1A1A20] hover:bg-slate-200 dark:hover:bg-[#25252E] text-[11px] font-semibold text-slate-600 dark:text-[#E4E4E7] flex items-center gap-1 transition-colors"
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
                        /* Aplicamos font-cascadia */
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
                                const newSubs = [
                                  ...inlineClientData.subscriptions,
                                ];
                                newSubs[idx] = {
                                  ...newSubs[idx],
                                  cutDate: e.target.value,
                                };
                                setInlineClientData({
                                  ...inlineClientData,
                                  subscriptions: newSubs,
                                });
                              }}
                              /* font-cascadia para la edición de fechas */
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
                                const newSubs = [
                                  ...inlineClientData.subscriptions,
                                ];
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
                              /* Reemplazamos font-mono por font-cascadia */
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
                                const newSubs = [
                                  ...inlineClientData.subscriptions,
                                ];
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
                                  const newSubs = [
                                    ...inlineClientData.subscriptions,
                                  ];
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
                                  const newSubs = [
                                    ...inlineClientData.subscriptions,
                                  ];
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
                      onClick={cancelInlineEdit}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSaveInline}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={client.id}
                className="break-inside-avoid mb-6 p-5 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm hover:border-[#2D2D33] transition-all flex flex-col relative group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#1F1F23]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-600/20 font-space">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      {/* font-space en los nombres */}
                      <h3 className="font-bold text-base text-slate-900 dark:text-[#E4E4E7] leading-tight font-space tracking-tight">
                        {client.name}
                      </h3>
                      {client.phone ? (
                        <p className="text-xs text-slate-500 dark:text-[#94949E] flex items-center gap-1 mt-0.5 font-cascadia font-light">
                          <Smartphone className="w-3 h-3 text-emerald-500" />
                          {client.phone}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-[#94949E] italic">
                          <span className="font-cascadia font-bold">
                            {client.subscriptions.length}
                          </span>{" "}
                          servicio(s) contratado(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startInlineEdit(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
                      title="Edición rápida en tarjeta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
                      title="Abrir panel lateral"
                    >
                      <SidebarIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                      title="Eliminar Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subscriptions list */}
                <div className="space-y-3 mb-2">
                  {(platformFilter === "Todos"
                    ? client.subscriptions
                    : client.subscriptions.filter((sub) =>
                        sub.serviceName
                          .toLowerCase()
                          .includes(platformFilter.toLowerCase()),
                      )
                  ).map((sub) => {
                    const platConfig = getPlatformConfig(sub.serviceName);
                    const badgeProps = getPlatformBadgeProps(platConfig);
                    const statusInfo = formatCutDateStatus(sub.cutDate);
                    const isPasswordVisible = !!showPasswords[sub.id];

                    return (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50/70 dark:bg-[#1A1A1E] space-y-2 relative"
                      >
                        {/* Platform header */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={badgeProps.className}
                            style={badgeProps.style}
                          >
                            <PlatformIcon
                              platform={sub.serviceName}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <span className="font-semibold">
                              {sub.serviceName}
                            </span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.badge}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-[#94949E] pt-1">
                          <div>
                            Contratado: {/* font-cascadia para fechas */}
                            <span className="font-medium text-slate-700 dark:text-[#E4E4E7] font-cascadia font-light">
                              {sub.hireDate || "N/A"}
                            </span>
                          </div>
                          <div>
                            Fecha Corte: {/* font-cascadia para fechas */}
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
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-[#94949E] shrink-0" />
                                  {/* Cambiamos a font-cascadia font-light */}
                                  <span className="font-cascadia font-light text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate tracking-wide">
                                    {sub.email}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      sub.email!,
                                      `email-${sub.id}`,
                                    )
                                  }
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
                                <div className="flex items-center gap-1.5 truncate">
                                  <Key className="w-3 h-3 text-[#94949E] shrink-0" />
                                  {/* Cambiamos a font-cascadia font-light */}
                                  <span className="font-cascadia font-light text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate tracking-wide">
                                    {isPasswordVisible
                                      ? sub.password
                                      : "••••••••••••"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() =>
                                      togglePasswordVisibility(sub.id)
                                    }
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
                                    onClick={() =>
                                      copyToClipboard(
                                        sub.password!,
                                        `pass-${sub.id}`,
                                      )
                                    }
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
                                  /* Usamos Cascadia Code para el PIN */
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
                          onClick={() =>
                            setWhatsAppSub({
                              clientName: client.name,
                              sub,
                              phone: client.phone,
                            })
                          }
                          className="w-full mt-2 py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Notificar Renovación</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          initialClient={editingClient}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppSub && (
        <WhatsAppModal
          isOpen={!!whatsAppSub}
          onClose={() => setWhatsAppSub(null)}
          clientName={whatsAppSub.clientName}
          serviceName={whatsAppSub.sub.serviceName}
          cutDate={whatsAppSub.sub.cutDate}
          email={whatsAppSub.sub.email}
          password={whatsAppSub.sub.password}
          profileName={whatsAppSub.sub.profileName}
          pin={whatsAppSub.sub.pin}
          phone={whatsAppSub.phone}
        />
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in"
              onClick={() => !isDeletingClient && setClientToDelete(null)}
            />
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative z-10 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2 font-space">
                ¿Eliminar Cliente?
              </h3>
              <p className="text-sm text-center text-slate-500 dark:text-[#94949E] mb-6">
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong className="text-slate-800 dark:text-white font-semibold">
                  {clientToDelete.name}
                </strong>
                ? Esta acción borra el cliente y todas sus suscripciones
                asociadas.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isDeletingClient}
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeletingClient}
                  onClick={async () => {
                    setIsDeletingClient(true);
                    try {
                      const id = clientToDelete.id;
                      await deleteClient(id);
                      setClientToDelete(null);
                    } finally {
                      setIsDeletingClient(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isDeletingClient && (
                    <CircularSpinner size={16} className="text-white" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
