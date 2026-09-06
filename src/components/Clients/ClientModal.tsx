import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Tv,
  User,
  Calendar,
  Key,
  Mail,
  Shield,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { Client, ClientSubscription } from "../../types";
import { useDataStore } from "../../store/dataStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import { PlatformSelect } from "./PlatformSelect";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  initialClient,
}) => {
  const { clients, saveClient, deleteClient } = useDataStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null);
  const [confirmDuplicateAnyway, setConfirmDuplicateAnyway] = useState(false);

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
      setSubscriptions(activeClient.subscriptions || []);
    } else {
      setName("");
      setPhone("");
      setStatus("active");
      setSubscriptions([
        {
          id: crypto.randomUUID(),
          clientId: "",
          clientName: "",
          serviceName: "Netflix",
          hireDate: new Date().toLocaleDateString("es-ES"),
          cutDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("es-ES"),
          email: "",
          password: "",
          profileName: "",
          pin: "",
          status: "active",
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
        serviceName: "Disney+",
        hireDate: new Date().toLocaleDateString("es-ES"),
        cutDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString("es-ES"),
        email: "",
        password: "",
        profileName: "",
        pin: "",
        status: "active",
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

  const performSave = async () => {
    setIsSaving(true);
    try {
      const clientId = activeClient?.id || crypto.randomUUID();
      const updatedSubscriptions = subscriptions.map((s) => ({
        ...s,
        clientId,
        clientName: name,
      }));

      const clientToSave: Client = {
        id: clientId,
        name,
        phone,
        status,
        createdAt: activeClient?.createdAt || new Date().toISOString(),
        subscriptions: updatedSubscriptions,
      };

      await saveClient(clientToSave);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    // Si hay un posible duplicado sin confirmar, no guardamos todavía:
    // el aviso ya está visible en el formulario con la opción de abrir
    // el cliente existente o continuar de todas formas.
    if (duplicateClient && !confirmDuplicateAnyway) {
      return;
    }

    await performSave();
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
                <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7]">
                  {activeClient ? "Editar Cliente" : "Nuevo Cliente"}
                </h3>
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
                  title="Eliminar Cliente"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Servicio #{index + 1}
                        </span>
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Plataforma Streaming
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
                            Fecha Contratación
                          </label>
                          <input
                            type="text"
                            placeholder="DD/MM/YY"
                            value={sub.hireDate}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "hireDate",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                            Fecha de Corte *
                          </label>
                          <input
                            type="text"
                            placeholder="DD/MM/YY"
                            value={sub.cutDate}
                            onChange={(e) =>
                              handleUpdateSubscription(
                                sub.id,
                                "cutDate",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#0F0F12] text-slate-900 dark:text-[#E4E4E7] text-xs font-semibold text-amber-600 dark:text-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-[#2D2D35]">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
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
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
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
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1 flex items-center gap-1">
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

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative z-10 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2">
              ¿Eliminar Cliente?
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-[#94949E] mb-6">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {activeClient.name}
              </strong>
              ?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteClient(activeClient.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};
