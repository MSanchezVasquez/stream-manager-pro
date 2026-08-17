import React, { useState } from "react";
import { useDataStore } from "../../store/dataStore";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import { CircularSpinner } from "../common/LoadingSpinners";
import {
  Truck,
  Tv,
  Mail,
  Key,
  Calendar,
  Compass,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Search,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Supplier, SupplierAccount } from "../../types";
import { SupplierModal } from "./SupplierModal";

export const SupplierList: React.FC = () => {
  const { suppliers, saveSupplier, deleteSupplier } = useDataStore();

  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [accountToEdit, setAccountToEdit] = useState<SupplierAccount | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // New Supplier Inline Form state
  const [isNewSupplierFormOpen, setIsNewSupplierFormOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");

  // Delete Supplier Confirmation Modal state
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );

  // Delete Account Confirmation Modal state
  const [accountToDelete, setAccountToDelete] = useState<{
    supplier: Supplier;
    accountId: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const togglePassword = (accId: string) => {
    setShowPasswords((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    try {
      const updatedAccounts = accountToDelete.supplier.accounts.filter(
        (a) => a.id !== accountToDelete.accountId,
      );
      await saveSupplier({
        ...accountToDelete.supplier,
        accounts: updatedAccounts,
      });
      setAccountToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNewSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplierName.trim(),
      accounts: [],
    };
    await saveSupplier(newSup);
    setNewSupplierName("");
    setIsNewSupplierFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7]">
              Proveedores de Streaming
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              Gestión de licencias, vencimientos y navegadores asignados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94949E]" />
            <input
              type="text"
              placeholder="Buscar por proveedor o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7]"
            />
          </div>

          <button
            onClick={() => setIsNewSupplierFormOpen(!isNewSupplierFormOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isNewSupplierFormOpen ? "Cerrar" : "Nuevo Proveedor"}</span>
          </button>
        </div>
      </div>

      {/* Inline New Supplier Creation Form */}
      {isNewSupplierFormOpen && (
        <form
          onSubmit={handleAddNewSupplierSubmit}
          className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Nombre del nuevo proveedor (ej: Licencias FX, Global Streaming...)"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-500/30 bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsNewSupplierFormOpen(false);
                setNewSupplierName("");
              }}
              className="px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1F1F24] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar Proveedor</span>
            </button>
          </div>
        </form>
      )}

      {/* Supplier Cards */}
      <div className="space-y-6">
        {suppliers.map((supplier) => {
          const filteredAccounts = supplier.accounts.filter((acc) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
              supplier.name.toLowerCase().includes(q) ||
              acc.serviceName.toLowerCase().includes(q) ||
              acc.email.toLowerCase().includes(q) ||
              (acc.browser && acc.browser.toLowerCase().includes(q))
            );
          });

          return (
            <div
              key={supplier.id}
              className="p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm space-y-4"
            >
              {/* Supplier Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F1F23]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/20">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-[#E4E4E7]">
                      {supplier.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94949E]">
                      {supplier.accounts.length} cuenta(s) registradas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setAccountToEdit(null);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Cuenta</span>
                  </button>

                  <button
                    onClick={() => setSupplierToDelete(supplier)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Eliminar Proveedor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Accounts list */}
              {filteredAccounts.length === 0 ? (
                <p className="text-xs text-[#94949E] italic py-2">
                  No hay cuentas registradas para este proveedor.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAccounts.map((acc) => {
                    const platConfig = getPlatformConfig(acc.serviceName);
                    const badgeProps = getPlatformBadgeProps(platConfig);
                    const isPassVisible = !!showPasswords[acc.id];

                    return (
                      <div
                        key={acc.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50/50 dark:bg-[#1A1A1E] space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={badgeProps.className}
                            style={badgeProps.style}
                          >
                            <PlatformIcon
                              platform={acc.serviceName}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <span>{acc.serviceName}</span>
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setAccountToEdit(acc);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-500 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setAccountToDelete({
                                  supplier,
                                  accountId: acc.id,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                            <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                              {acc.email}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(acc.email, `semail-${acc.id}`)
                            }
                            className="text-slate-400 hover:text-indigo-500 p-0.5 shrink-0 cursor-pointer"
                          >
                            {copiedField === `semail-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Key className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                            <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                              {isPassVisible ? acc.password : "••••••••••••"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => togglePassword(acc.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(acc.password, `spass-${acc.id}`)
                              }
                              className="text-slate-400 hover:text-indigo-500 p-0.5 cursor-pointer"
                            >
                              {copiedField === `spass-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          {acc.expirationDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              <span>
                                Expira:{" "}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {acc.expirationDate}
                                </strong>
                              </span>
                            </div>
                          )}

                          {acc.browser && (
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-sky-500" />
                              <span>
                                Navegador:{" "}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {acc.browser}
                                </strong>
                              </span>
                            </div>
                          )}

                          {acc.webmailUrl && (
                            <a
                              href={acc.webmailUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-500 hover:underline flex items-center gap-1 pt-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{acc.webmailUrl}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Supplier Modal */}
      {isModalOpen && selectedSupplier && (
        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          supplier={selectedSupplier}
          accountToEdit={accountToEdit}
        />
      )}

      {/* Delete Supplier Modal */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2">
              ¿Eliminar Proveedor?
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              ¿Deseas borrar al proveedor{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {supplierToDelete.name}
              </strong>{" "}
              y todas sus cuentas asociadas?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSupplierToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteSupplier}
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

      {/* Delete Account Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2">
              ¿Eliminar Cuenta?
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              ¿Estás seguro de que deseas eliminar esta cuenta de proveedor?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAccount}
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
    </div>
  );
};
