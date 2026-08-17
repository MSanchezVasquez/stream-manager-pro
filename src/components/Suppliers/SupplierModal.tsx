import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  Tv,
  Mail,
  Key,
  Calendar,
  Compass,
  Globe,
} from "lucide-react";
import { Supplier, SupplierAccount, StreamingPlatform } from "../../types";
import { useDataStore } from "@/src/store/dataStore";
import { ALL_STREAMING_PLATFORMS } from "../../utils/platformHelpers";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  accountToEdit?: SupplierAccount | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  accountToEdit,
}) => {
  const { saveSupplier } = useDataStore();

  const [serviceName, setServiceName] = useState<StreamingPlatform>("DGO");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [browser, setBrowser] = useState("Google Chrome");
  const [webmailUrl, setWebmailUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (accountToEdit) {
      setServiceName(accountToEdit.serviceName);
      setEmail(accountToEdit.email);
      setPassword(accountToEdit.password);
      setExpirationDate(accountToEdit.expirationDate || "");
      setBrowser(accountToEdit.browser || "Google Chrome");
      setWebmailUrl(accountToEdit.webmailUrl || "");
      setNotes(accountToEdit.notes || "");
    } else {
      setServiceName("DGO");
      setEmail("");
      setPassword("");
      setExpirationDate("");
      setBrowser("Google Chrome");
      setWebmailUrl("");
      setNotes("");
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Por favor complete correo y contraseña");
      return;
    }

    const newAcc: SupplierAccount = {
      id: accountToEdit ? accountToEdit.id : `sup-acc-${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      serviceName,
      email,
      password,
      expirationDate,
      browser,
      webmailUrl,
      notes,
      status: "active",
    };

    let updatedAccounts = [...supplier.accounts];
    if (accountToEdit) {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === accountToEdit.id ? newAcc : a,
      );
    } else {
      updatedAccounts.push(newAcc);
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      accounts: updatedAccounts,
    };

    await saveSupplier(updatedSupplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7]">
              {accountToEdit
                ? "Editar Cuenta de Proveedor"
                : "Añadir Cuenta a Proveedor"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              Proveedor:{" "}
              <strong className="text-purple-600 dark:text-purple-400">
                {supplier.name}
              </strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
              Plataforma Streaming *
            </label>
            <select
              value={serviceName}
              onChange={(e) =>
                setServiceName(e.target.value as StreamingPlatform)
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium"
            >
              {ALL_STREAMING_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#94949E]" />
                Correo de Cuenta *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-[#94949E]" />
                Contraseña *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#94949E]" />
                Fecha de Expiración
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#94949E]" />
                Navegador Asignado
              </label>
              <select
                value={browser}
                onChange={(e) => setBrowser(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs"
              >
                <option value="Google Chrome">Google Chrome</option>
                <option value="Opera">Opera</option>
                <option value="Opera GX">Opera GX</option>
                <option value="Brave">Brave</option>
                <option value="Firefox">Firefox</option>
                <option value="Navegador Edge">Navegador Edge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#94949E]" />
              Enlace Webmail / Validación
            </label>
            <input
              type="text"
              placeholder="https://webmail..."
              value={webmailUrl}
              onChange={(e) => setWebmailUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#1F1F23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
            >
              Guardar Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
