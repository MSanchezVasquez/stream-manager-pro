import React, { useState, useEffect, useRef } from "react";
import { DatePicker } from "../common/DatePicker";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Tv,
  User,
  Key,
  Mail,
  Shield,
  Smartphone,
  AlertTriangle,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserX,
  RefreshCw,
} from "lucide-react";
import { Client, ClientSubscription } from "../../types";
import {
  useDataStore,
  isSubscriptionFromFreeProfile,
} from "../../store/dataStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import { PlatformSelect } from "../common/PlatformSelect";
import {
  getClientAccountHealth,
  addDaysToDateString,
  addPeriodToDateString,
  getDaysDifference,
  getDaysRemaining,
  formatSubscriptionPeriod,
} from "../../utils/platformHelpers";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: Client | null;
}

function getTodayFormatted(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getFutureDateFormatted(daysAhead: number = 30): string {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  initialClient,
}) => {
  const { clients, freeProfiles, saveClient, deleteClient } = useDataStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null);
  const [confirmDuplicateAnyway, setConfirmDuplicateAnyway] = useState(false);

  const initialCutDatesRef = useRef<Record<string, string>>({});
  const [renewalBaseMap, setRenewalBaseMap] = useState<
    Record<string, "today" | "cutDate">
  >({});

  // Cliente "activo" del formulario. Empieza siendo initialClient, pero
  // puede cambiar internamente (ej. al elegir "Editar cliente existente"
  // en el aviso de duplicado) sin depender de que el componente padre
  // vuelva a renderizar el modal con un initialClient distinto.
  const [activeClient, setActiveClient] = useState<Client | null | undefined>(
    initialClient,
  );

  useEffect(() => {
    setActiveClient(initialClient);
  }, [initialClient, isOpen]);

  useEffect(() => {
    setDuplicateClient(null);
    setConfirmDuplicateAnyway(false);

    if (activeClient) {
      setName(activeClient.name);
      setPhone(activeClient.phone || "");
      setStatus(activeClient.status);
      const cuts: Record<string, string> = {};
      const subs = (activeClient.subscriptions || []).map((s) => {
        cuts[s.id] = s.cutDate;
        return {
          ...s,
          periodUnit: s.periodUnit || "months",
          periodValue:
            s.periodValue ||
            (s.periodUnit === "days"
              ? s.periodDays || 30
              : s.periodUnit === "years"
                ? 1
                : 1),
          periodDays:
            s.periodDays ||
            (s.hireDate && s.cutDate
              ? getDaysDifference(s.hireDate, s.cutDate)
              : 30),
        };
      });
      initialCutDatesRef.current = cuts;
      setSubscriptions(subs);
    } else {
      setName("");
      setPhone("");
      setStatus("active");
      initialCutDatesRef.current = {};
      setSubscriptions([
        {
          id: crypto.randomUUID(),
          clientId: "",
          clientName: "",
          serviceName: "" as any,
          hireDate: getTodayFormatted(),
          cutDate: getFutureDateFormatted(30),
          periodUnit: "months",
          periodValue: 1,
          periodDays: 30,
          email: "",
          password: "",
          profileName: "",
          pin: "",
          status: "active",
          price: undefined,
        },
      ]);
    }
  }, [activeClient]);

  if (!isOpen) return null;

  const handleAddSubscription = () => {
    setSubscriptions([
      ...subscriptions,
      {
        id: crypto.randomUUID(),
        clientId: activeClient?.id || "",
        clientName: name || "Cliente",
        serviceName: "" as any,
        hireDate: getTodayFormatted(),
        cutDate: getFutureDateFormatted(30),
        periodUnit: "months",
        periodValue: 1,
        periodDays: 30,
        email: "",
        password: "",
        profileName: "",
        pin: "",
        status: "active",
        price: undefined,
      },
    ]);
  };

  const handleRemoveSubscription = (subId: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== subId));
  };

  const handleUpdateSubscription = (
    subId: string,
    field: keyof ClientSubscription,
    value: any,
  ) => {
    setSubscriptions(
      subscriptions.map((s) => (s.id === subId ? { ...s, [field]: value } : s)),
    );
  };

  const handlePeriodChange = (
    subId: string,
    value: number,
    unit: "days" | "months" | "years",
    forcedBase?: "today" | "cutDate",
  ) => {
    const validVal = Math.max(1, value);
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;

        // Base de cálculo para renovación:
        // NUNCA usamos hireDate (fecha de contratación inicial).
        // Si el corte inicial está activo (> 0 días restantes), se puede extender ese corte o renovar desde hoy.
        // Si el corte inicial ya está vencido (<= 0 días) o no existe, SIEMPRE se renueva a partir de HOY.
        const originalCut = initialCutDatesRef.current[subId] || s.cutDate;
        const isOriginalCutActive = originalCut
          ? getDaysRemaining(originalCut) > 0
          : false;
        const chosenBase =
          forcedBase ||
          renewalBaseMap[subId] ||
          (isOriginalCutActive ? "cutDate" : "today");

        const baseDateStr =
          chosenBase === "cutDate" && isOriginalCutActive && originalCut
            ? originalCut
            : getTodayFormatted();

        const newCutDate = addPeriodToDateString(baseDateStr, validVal, unit);
        const totalDays = getDaysDifference(getTodayFormatted(), newCutDate);

        return {
          ...s,
          periodUnit: unit,
          periodValue: validVal,
          periodDays: totalDays > 0 ? totalDays : 30,
          cutDate: newCutDate,
        };
      }),
    );
  };

  const handleHireDateChange = (subId: string, newHireDate: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        // Solo actualizamos la fecha de contratación; NO modificamos la fecha de corte
        return {
          ...s,
          hireDate: newHireDate,
        };
      }),
    );
  };

  const handleCutDateChange = (subId: string, newCutDate: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        const diff = getDaysDifference(getTodayFormatted(), newCutDate);
        return {
          ...s,
          cutDate: newCutDate,
          periodDays: diff > 0 ? diff : 30,
        };
      }),
    );
  };

  // Detecta en vivo si ya existe otro cliente con el mismo nombre, para
  // evitar crear registros duplicados (ej. añadir un servicio nuevo desde
  // "Añadir Cliente" en vez de editar el cliente que ya existía).
  useEffect(() => {
    setConfirmDuplicateAnyway(false);

    if (activeClient || !name.trim()) {
      setDuplicateClient(null);
      return;
    }

    const match = clients.find(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    setDuplicateClient(match || null);
  }, [name, clients, activeClient]);

  const performSave = () => {
    const clientId = activeClient?.id || crypto.randomUUID();
    const updatedSubscriptions = subscriptions.map((s) => ({
      ...s,
      clientId,
      clientName: name,
      periodUnit: s.periodUnit || "months",
      periodValue:
        s.periodValue ||
        (s.periodUnit === "days"
          ? s.periodDays || 30
          : s.periodUnit === "years"
            ? 1
            : 1),
      periodDays:
        s.periodDays ||
        (s.hireDate && s.cutDate
          ? getDaysDifference(s.hireDate, s.cutDate)
          : 30),
      price:
        s.price !== undefined && s.price !== null && !isNaN(Number(s.price))
          ? Number(s.price)
          : 0,
    }));

    const clientToSave: Client = {
      id: clientId,
      name,
      phone,
      status,
      createdAt: activeClient?.createdAt || new Date().toISOString(),
      subscriptions: updatedSubscriptions,
    };

    onClose();

    saveClient(clientToSave).then((success) => {
      if (!success) {
        alert(
          "No se pudo guardar el cliente. Verifica tu conexión e inténtalo de nuevo.",
        );
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }
    const hasEmptyPlatform = subscriptions.some(
      (s) => !s.serviceName || s.serviceName.trim() === "",
    );
    if (hasEmptyPlatform) {
      alert("Por favor selecciona una plataforma de streaming para cada servicio contratado.");
      return;
    }
    if (duplicateClient && !confirmDuplicateAnyway) {
      return;
    }
    performSave();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none z-10">
        <div className="w-full max-w-xl bg-white dark:bg-[#141418] border-l border-slate-200 dark:border-[#25252D] shadow-2xl flex flex-col pointer-events-auto animate-slide-in-right">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-[#25252D] flex items-center justify-between bg-slate-50/80 dark:bg-[#101014]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7]">
                    {activeClient ? "Editar Cliente" : "Nuevo Cliente"}
                  </h3>
                  {activeClient &&
                    (() => {
                      const health = getClientAccountHealth(activeClient);
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${health.badgeClass} select-none shadow-xs`}
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
                          <span>{health.label}</span>
                        </span>
                      );
                    })()}
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94949E]">
                  {activeClient
                    ? `Gestión de datos de ${activeClient.name}`
                    : "Añadir nuevo registro y suscripciones"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeClient && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title={
                    activeClient.status === "active"
                      ? "Desactivar (Mover a Clientes Inactivos)"
                      : "Eliminar definitivamente"
                  }
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1F1F26] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* General info */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#25252D]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94949E]">
                  Información Personal
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#C4C4CE] mb-1">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Alan Torres"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D35] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#C4C4CE] mb-1">
                      WhatsApp / Teléfono
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94949E]" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+51 987654321"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D35] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {duplicateClient && (
                  <div className="p-3 rounded-xl border border-amber-400/40 bg-amber-500/10 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-2">
                      {confirmDuplicateAnyway ? (
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          Ok, se creará un cliente nuevo aunque el nombre se
                          repita con{" "}
                          <span className="font-bold">
                            {duplicateClient.name}
                          </span>
                          .
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            Ya existe un cliente llamado{" "}
                            <span className="font-bold">
                              {duplicateClient.name}
                            </span>
                            . Si quieres añadirle un servicio nuevo, edítalo en
                            vez de crear un registro duplicado.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveClient(duplicateClient)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors"
                            >
                              Editar cliente existente
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDuplicateAnyway(true)}
                              className="px-2.5 py-1 rounded-lg bg-transparent border border-amber-400/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-[11px] font-semibold transition-colors"
                            >
                              Crear de todas formas
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C4C4CE] mb-1">
                    Estado del Cliente
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "inactive")
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D35] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">No Activo / Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Subscriptions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-purple-500" />
                    Servicios Contratados ({subscriptions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSubscription}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Servicio</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {subscriptions.map((sub, index) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-[#25252D] bg-slate-50/70 dark:bg-[#181820] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Servicio #{index + 1}
                          </span>
                          {isSubscriptionFromFreeProfile(sub, freeProfiles) && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                              title="Asignado desde Perfiles Libres (si se elimina este servicio, volverá al inventario)"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>Perfil Libre</span>
                            </span>
                          )}
                        </div>
                        {subscriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubscription(sub.id)}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Eliminar este servicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Plataforma Streaming *
                          </label>
                          <PlatformSelect
                            value={sub.serviceName}
                            onChange={(platform) =>
                              handleUpdateSubscription(
                                sub.id,
                                "serviceName",
                                platform,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Precio de Suscripción (S/)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={
                              sub.price === undefined || sub.price === null
                                ? ""
                                : sub.price
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateSubscription(
                                sub.id,
                                "price",
                                val === "" ? undefined : parseFloat(val),
                              );
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-cascadia focus:border-indigo-500 outline-none transition-colors shadow-sm"
                          />
                        </div>

                        {/* Subscription Period: Días / Meses / Años Selector */}
                        <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#121217] border border-slate-200/80 dark:border-[#25252E] space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-[#E4E4E7] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Período de suscripción</span>
                            </label>

                            {/* Segmented Control: Días | Meses | Años */}
                            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200 dark:bg-[#1B1B22] border border-slate-300/70 dark:border-[#2A2A35]">
                              {(
                                [
                                  { id: "days", label: "Días" },
                                  { id: "months", label: "Meses" },
                                  { id: "years", label: "Años" },
                                ] as const
                              ).map((tab) => {
                                const currentUnit = sub.periodUnit || "months";
                                const isActive = currentUnit === tab.id;
                                return (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                      const defaultVal =
                                        tab.id === "days"
                                          ? 30
                                          : 1;
                                      handlePeriodChange(
                                        sub.id,
                                        defaultVal,
                                        tab.id,
                                      );
                                    }}
                                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                      isActive
                                        ? "bg-indigo-600 text-white shadow-xs font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="relative w-32 shrink-0">
                              <input
                                type="number"
                                min="1"
                                value={
                                  sub.periodValue ||
                                  (sub.periodUnit === "days"
                                    ? sub.periodDays || 30
                                    : 1)
                                }
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  handlePeriodChange(
                                    sub.id,
                                    isNaN(val) ? 1 : val,
                                    sub.periodUnit || "months",
                                  );
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-full pl-3 pr-14 py-1.5 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-cascadia font-bold focus:border-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 select-none">
                                {sub.periodUnit === "days"
                                  ? (sub.periodValue === 1 ? "día" : "días")
                                  : sub.periodUnit === "years"
                                    ? (sub.periodValue === 1 ? "año" : "años")
                                    : (sub.periodValue === 1 ? "mes" : "meses")}
                              </span>
                            </div>

                            {/* Dynamic quick presets */}
                            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1">
                              {(sub.periodUnit === "days"
                                ? [7, 15, 30, 60, 90]
                                : sub.periodUnit === "years"
                                  ? [1, 2, 3]
                                  : [1, 2, 3, 6, 12]
                              ).map((preset) => {
                                const currentVal =
                                  sub.periodValue ||
                                  (sub.periodUnit === "days" ? 30 : 1);
                                const isSelected = currentVal === preset;
                                const label =
                                  sub.periodUnit === "days"
                                    ? `${preset}d`
                                    : sub.periodUnit === "years"
                                      ? `${preset} ${preset === 1 ? "año" : "años"}`
                                      : `${preset} ${preset === 1 ? "mes" : "meses"}`;
                                return (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() =>
                                      handlePeriodChange(
                                        sub.id,
                                        preset,
                                        sub.periodUnit || "months",
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                                      isSelected
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>

                            <span className="text-[11px] font-bold font-cascadia text-indigo-600 dark:text-indigo-400 whitespace-nowrap hidden sm:inline ml-auto">
                              {formatSubscriptionPeriod(
                                sub.periodUnit || "months",
                                sub.periodValue ||
                                  (sub.periodUnit === "days" ? 30 : 1),
                                sub.periodDays,
                              )}
                            </span>
                          </div>

                          {/* Base information for renewal */}
                          {(() => {
                            const originalCut =
                              initialCutDatesRef.current[sub.id] || sub.cutDate;
                            const isOriginalCutActive = originalCut
                              ? getDaysRemaining(originalCut) > 0
                              : false;
                            const currentBase =
                              renewalBaseMap[sub.id] ||
                              (isOriginalCutActive ? "cutDate" : "today");

                            if (isOriginalCutActive && originalCut) {
                              return (
                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-[#25252E] flex-wrap gap-2">
                                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <RefreshCw className="w-3 h-3 text-indigo-500" />
                                    Renovar calculando desde:
                                  </span>
                                  <div className="inline-flex rounded-lg border border-slate-200 dark:border-[#2D2D33] p-0.5 bg-white dark:bg-[#0F0F12]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRenewalBaseMap((prev) => ({
                                          ...prev,
                                          [sub.id]: "cutDate",
                                        }));
                                        handlePeriodChange(
                                          sub.id,
                                          sub.periodValue ||
                                            (sub.periodUnit === "days"
                                              ? 30
                                              : 1),
                                          sub.periodUnit || "months",
                                          "cutDate",
                                        );
                                      }}
                                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                        currentBase === "cutDate"
                                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                      }`}
                                    >
                                      Corte actual ({originalCut})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRenewalBaseMap((prev) => ({
                                          ...prev,
                                          [sub.id]: "today",
                                        }));
                                        handlePeriodChange(
                                          sub.id,
                                          sub.periodValue ||
                                            (sub.periodUnit === "days"
                                              ? 30
                                              : 1),
                                          sub.periodUnit || "months",
                                          "today",
                                        );
                                      }}
                                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                        currentBase === "today"
                                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                      }`}
                                    >
                                      Hoy ({getTodayFormatted()})
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-[#25252E] flex-wrap gap-2 text-emerald-600 dark:text-emerald-400">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  Renovación calculada a partir de hoy ({getTodayFormatted()})
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Fecha Contratación
                          </label>
                          <DatePicker
                            value={sub.hireDate}
                            onChange={(v) => handleHireDateChange(sub.id, v)}
                            placeholder="DD/MM/YYYY"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E]">
                              Fecha de Corte *
                            </label>
                            <span className="text-[10px] font-medium text-indigo-500 font-cascadia">
                              {(() => {
                                const days = getDaysRemaining(sub.cutDate);
                                if (days === 999) return "";
                                if (days < 0)
                                  return `Vencido (${Math.abs(days)}d)`;
                                if (days === 0) return "¡Vence hoy!";
                                return `${days} días restantes`;
                              })()}
                            </span>
                          </div>
                          <DatePicker
                            value={sub.cutDate}
                            onChange={(v) => handleCutDateChange(sub.id, v)}
                            placeholder="DD/MM/YYYY"
                            valueClassName="font-semibold text-amber-600 dark:text-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-[#2D2D35]">
                        <div>
                          <label className=" text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#94949E]" />
                            Correo / Usuario de Cuenta
                          </label>
                          <input
                            type="email"
                            value={sub.email || ""}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "email",
                                e.target.value,
                              )
                            }
                            placeholder="correo@ejemplo.com"
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className=" text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
                            <Key className="w-3 h-3 text-[#94949E]" />
                            Contraseña de Cuenta
                          </label>
                          <input
                            type="text"
                            value={sub.password || ""}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "password",
                                e.target.value,
                              )
                            }
                            placeholder="Contraseña"
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Perfil Asignado
                          </label>
                          <input
                            type="text"
                            value={sub.profileName || ""}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "profileName",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: Valentina / Perfil 1"
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs"
                          />
                        </div>

                        <div>
                          <label className=" text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-[#94949E]" />
                            PIN del Perfil
                          </label>
                          <input
                            type="text"
                            value={sub.pin || ""}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "pin",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: 1234"
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#101014] border-t border-slate-200 dark:border-[#25252D] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  isSaving || (!!duplicateClient && !confirmDuplicateAnyway)
                }
                title={
                  duplicateClient && !confirmDuplicateAnyway
                    ? "Resuelve el aviso de cliente duplicado para continuar"
                    : undefined
                }
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                {activeClient ? "Guardar Cambios" : "Registrar Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete / Deactivate Confirmation Overlay */}
      {showDeleteConfirm && activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative z-10 animate-scale-in">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
                activeClient.status === "active"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {activeClient.status === "active" ? (
                <UserX className="w-6 h-6" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2 font-space">
              {activeClient.status === "active"
                ? "¿Desactivar Cliente?"
                : "¿Eliminar Cliente Definitivamente?"}
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-[#94949E] mb-4 leading-relaxed">
              {activeClient.status === "active" ? (
                <>
                  ¿Estás seguro de que deseas desactivar a{" "}
                  <strong className="text-slate-800 dark:text-white font-semibold">
                    {activeClient.name}
                  </strong>
                  ? Se moverá a la pestaña de{" "}
                  <strong className="text-amber-600 dark:text-amber-400">
                    Clientes Inactivos
                  </strong>
                  . Podrás consultarlo y reactivarlo cuando quieras.
                </>
              ) : (
                <>
                  ¿Estás seguro de que deseas eliminar permanentemente a{" "}
                  <strong className="text-slate-800 dark:text-white font-semibold">
                    {activeClient.name}
                  </strong>
                  ? Esta acción no se puede deshacer y borrará al cliente de la
                  base de datos.
                </>
              )}
            </p>

            {activeClient.status !== "active" &&
              activeClient.subscriptions.some((sub) =>
                isSubscriptionFromFreeProfile(sub, freeProfiles),
              ) && (
                <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-left">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-700 dark:text-amber-300 mb-0.5">
                      Restauración de inventario
                    </span>
                    <span>
                      Los perfiles asignados desde <em>Perfiles Libres</em> se
                      restaurarán y sumarán de vuelta automáticamente.
                    </span>
                  </div>
                </div>
              )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onClose();

                  const action =
                    activeClient.status === "active"
                      ? saveClient({ ...activeClient, status: "inactive" })
                      : deleteClient(activeClient.id);

                  action.then((success) => {
                    if (!success) {
                      alert(
                        "No se pudo completar la acción. Verifica tu conexión e inténtalo de nuevo.",
                      );
                    }
                  });
                }}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeClient.status === "active"
                    ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                }`}
              >
                {isDeleting && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                {activeClient.status === "active"
                  ? "Mover a Inactivos"
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};
