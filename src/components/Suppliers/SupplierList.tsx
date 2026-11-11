import React, { useState } from "react";
import { useDataStore } from "../../store/dataStore";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  getPlatformDisplayName,
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
  RotateCw,
  Coins,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  User,
} from "lucide-react";
import { Supplier, SupplierAccount } from "../../types";
import { SupplierModal } from "./SupplierModal";
import { RenewSupplierAccountModal } from "./RenewSupplierAccountModal";
import { useTranslation } from "../../utils/translations";

export const SupplierList: React.FC = () => {
  const { suppliers, saveSupplier, deleteSupplier } = useDataStore();
  const { t } = useTranslation();

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

  // Supplier Form state (New or Edit)
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierFormName, setSupplierFormName] = useState("");
  const [supplierFormPhone, setSupplierFormPhone] = useState("");
  const [supplierFormEmail, setSupplierFormEmail] = useState("");
  const [supplierFormNotes, setSupplierFormNotes] = useState("");

  // Delete Supplier Confirmation Modal state
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );

  // Delete Account Confirmation Modal state
  const [accountToDelete, setAccountToDelete] = useState<{
    supplier: Supplier;
    accountId: string;
  } | null>(null);

  // Renew Account Modal state
  const [accountToRenew, setAccountToRenew] = useState<{
    supplier: Supplier;
    account: SupplierAccount;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // Umbral mínimo de cuentas para mostrar el botón de colapsar.
  // Si un proveedor tiene 3 o menos cuentas ("pocas cuentas"), caben en una sola fila y no es necesario colapsarlas.
  const MIN_ACCOUNTS_TO_COLLAPSE = 4;
  const [collapsedSupplierIds, setCollapsedSupplierIds] = useState<Record<string, boolean>>({});

  const toggleSupplierCollapse = (supplierId: string) => {
    setCollapsedSupplierIds((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  const collapsibleSuppliers = suppliers.filter(
    (s) => (s.accounts || []).length >= MIN_ACCOUNTS_TO_COLLAPSE
  );
  const hasCollapsibleSuppliers = collapsibleSuppliers.length > 0;
  const areAllCollapsed =
    hasCollapsibleSuppliers &&
    collapsibleSuppliers.every((s) => !!collapsedSupplierIds[s.id]);

  const toggleAllSuppliers = () => {
    if (areAllCollapsed) {
      setCollapsedSupplierIds({});
    } else {
      const next: Record<string, boolean> = {};
      collapsibleSuppliers.forEach((s) => {
        next[s.id] = true;
      });
      setCollapsedSupplierIds(next);
    }
  };

  const togglePassword = (accId: string) => {
    setShowPasswords((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    const { supplier, accountId } = accountToDelete;
    setAccountToDelete(null);
    const updatedAccounts = supplier.accounts.filter((a) => a.id !== accountId);
    saveSupplier({
      ...supplier,
      accounts: updatedAccounts,
    });
  };

  const confirmDeleteSupplier = () => {
    if (!supplierToDelete) return;
    const targetId = supplierToDelete.id;
    setSupplierToDelete(null);
    deleteSupplier(targetId);
  };

  const handleOpenNewSupplier = () => {
    if (isSupplierFormOpen && !editingSupplierId) {
      setIsSupplierFormOpen(false);
    } else {
      setEditingSupplierId(null);
      setSupplierFormName("");
      setSupplierFormPhone("");
      setSupplierFormEmail("");
      setSupplierFormNotes("");
      setIsSupplierFormOpen(true);
    }
  };

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setSupplierFormName(supplier.name);
    setSupplierFormPhone(supplier.phone || supplier.contactInfo || "");
    setSupplierFormEmail(supplier.email || "");
    setSupplierFormNotes(supplier.notes || "");
    setIsSupplierFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseSupplierForm = () => {
    setIsSupplierFormOpen(false);
    setEditingSupplierId(null);
    setSupplierFormName("");
    setSupplierFormPhone("");
    setSupplierFormEmail("");
    setSupplierFormNotes("");
  };

  const handleSaveSupplierForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormName.trim()) return;

    if (editingSupplierId) {
      const existing = suppliers.find((s) => s.id === editingSupplierId);
      if (existing) {
        await saveSupplier({
          ...existing,
          name: supplierFormName.trim(),
          phone: supplierFormPhone.trim() || undefined,
          email: supplierFormEmail.trim() || undefined,
          notes: supplierFormNotes.trim() || undefined,
        });
      }
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        name: supplierFormName.trim(),
        phone: supplierFormPhone.trim() || undefined,
        email: supplierFormEmail.trim() || undefined,
        notes: supplierFormNotes.trim() || undefined,
        accounts: [],
      };
      await saveSupplier(newSup);
    }

    handleCloseSupplierForm();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#c9c918]/15 text-[#7a7a08] dark:text-[#dada28] border border-[#c9c918]/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7]">
              {t("suppliers.title")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              {t("suppliers.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94949E]" />
            <input
              type="text"
              placeholder={t("suppliers.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7]"
            />
          </div>

          {hasCollapsibleSuppliers && (
            <button
              type="button"
              onClick={toggleAllSuppliers}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2D2D33] hover:bg-slate-50 dark:hover:bg-[#222228] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
              title={areAllCollapsed ? t("suppliers.expandAll") : t("suppliers.collapseAll")}
            >
              {areAllCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7a7a08] dark:text-[#dada28]" />
                  <span className="hidden sm:inline">{t("suppliers.expandAll")}</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{t("suppliers.collapseAll")}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleOpenNewSupplier}
            className="px-3.5 py-1.5 rounded-xl bg-[#c9c918] hover:bg-[#b5b514] active:bg-[#a1a110] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#c9c918]/20 transition-all shrink-0 cursor-pointer"
          >
            {isSupplierFormOpen && !editingSupplierId ? (
              <>
                <X className="w-4 h-4" />
                <span>{t("suppliers.close")}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t("suppliers.newSupplier")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline New / Edit Supplier Form */}
      {isSupplierFormOpen && (
        <form
          onSubmit={handleSaveSupplierForm}
          className="p-5 rounded-xl bg-white dark:bg-[#141418] border border-[#c9c918]/40 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222228]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c9c918]/15 text-[#7a7a08] dark:text-[#dada28] border border-[#c9c918]/30">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#E4E4E7]">
                  {editingSupplierId
                    ? t("suppliers.editSupplierTitle")
                    : t("suppliers.newSupplierTitle")}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#94949E]">
                  {editingSupplierId
                    ? "Actualiza el teléfono, correo y notas de este proveedor."
                    : "Ingresa el nombre, número de teléfono/WhatsApp y datos de contacto."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseSupplierForm}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Nombre del Proveedor */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7a7a08] dark:text-[#dada28]" />
                <span>{t("suppliers.supplierName")}</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder={t("suppliers.supplierNamePlaceholder")}
                value={supplierFormName}
                onChange={(e) => setSupplierFormName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] focus:outline-none focus:border-[#c9c918] focus:ring-0 transition-colors"
              />
            </div>

            {/* Teléfono / WhatsApp */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("suppliers.supplierPhone")}</span>
              </label>
              <input
                type="text"
                placeholder={t("suppliers.supplierPhonePlaceholder")}
                value={supplierFormPhone}
                onChange={(e) => setSupplierFormPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] focus:outline-none focus:border-[#c9c918] focus:ring-0 transition-colors font-mono"
              />
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#94949E]" />
                <span>{t("suppliers.supplierEmail")}</span>
              </label>
              <input
                type="email"
                placeholder={t("suppliers.supplierEmailPlaceholder")}
                value={supplierFormEmail}
                onChange={(e) => setSupplierFormEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] focus:outline-none focus:border-[#c9c918] focus:ring-0 transition-colors font-mono"
              />
            </div>

            {/* Notas / Canal de Soporte */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#94949E]" />
                <span>{t("suppliers.supplierNotes")}</span>
              </label>
              <input
                type="text"
                placeholder={t("suppliers.supplierNotesPlaceholder")}
                value={supplierFormNotes}
                onChange={(e) => setSupplierFormNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] focus:outline-none focus:border-[#c9c918] focus:ring-0 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#222228]">
            <button
              type="button"
              onClick={handleCloseSupplierForm}
              className="px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1F1F24] text-xs font-semibold transition-colors cursor-pointer"
            >
              {t("suppliers.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#c9c918] hover:bg-[#b5b514] active:bg-[#a1a110] text-slate-950 text-xs font-bold shadow-md shadow-[#c9c918]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t("suppliers.saveSupplier")}</span>
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

          const isCollapsible = (supplier.accounts || []).length >= MIN_ACCOUNTS_TO_COLLAPSE;
          const isCollapsed = isCollapsible && !search.trim() && !!collapsedSupplierIds[supplier.id];

          // Plataformas únicas para el preview resumido cuando está colapsado
          const platformCounts = (supplier.accounts || []).reduce<Record<string, number>>((acc, a) => {
            acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
            return acc;
          }, {});
          const uniquePlatforms = Object.entries(platformCounts).map(([platform, count]) => ({
            platform,
            count,
          }));

          return (
            <div
              key={supplier.id}
              className="p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm space-y-4"
            >
              {/* Supplier Header */}
              <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1F1F23]">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#c9c918]/15 text-[#7a7a08] dark:text-[#dada28] font-bold flex items-center justify-center text-sm border border-[#c9c918]/30 shrink-0 mt-0.5 sm:mt-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-[#E4E4E7]">
                        {supplier.name}
                      </h3>
                      {(supplier.phone || supplier.contactInfo) && (
                        <a
                          href={`https://wa.me/${(supplier.phone || supplier.contactInfo || "").replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-colors shadow-2xs"
                          title={`Enviar WhatsApp a ${supplier.name} (${supplier.phone || supplier.contactInfo})`}
                        >
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-mono text-[11px]">{supplier.phone || supplier.contactInfo}</span>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-[#94949E] flex-wrap">
                      <span>{t("suppliers.accountsCount", { count: supplier.accounts.length })}</span>
                      {supplier.email && (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[200px]">{supplier.email}</span>
                        </span>
                      )}
                      {supplier.notes && (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] italic">
                          <FileText className="w-3 h-3 text-[#7a7a08] dark:text-[#dada28] shrink-0" />
                          <span className="truncate max-w-[240px]">{supplier.notes}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Botón representativo para colapsar cuentas (icono simple con animación) */}
                  {isCollapsible && (
                    <button
                      type="button"
                      onClick={() => toggleSupplierCollapse(supplier.id)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                        isCollapsed
                          ? "bg-[#c9c918]/20 hover:bg-[#c9c918]/30 text-slate-950 dark:text-[#dada28] border-[#c9c918]/50 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E26] dark:hover:bg-[#282834] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2D2D35]"
                      }`}
                      title={
                        isCollapsed
                          ? t("suppliers.expandAccounts", { count: supplier.accounts.length })
                          : t("suppliers.collapseAccounts")
                      }
                      aria-label={
                        isCollapsed
                          ? t("suppliers.expandAccounts", { count: supplier.accounts.length })
                          : t("suppliers.collapseAccounts")
                      }
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                          isCollapsed
                            ? "rotate-0 text-[#7a7a08] dark:text-[#dada28]"
                            : "rotate-180 text-slate-600 dark:text-slate-300"
                        }`}
                      />
                    </button>
                  )}

                  {/* Editar datos del proveedor */}
                  <button
                    onClick={() => handleOpenEditSupplier(supplier)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#7a7a08] dark:hover:text-[#dada28] hover:bg-[#c9c918]/10 transition-colors cursor-pointer"
                    title={t("suppliers.editSupplier")}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setAccountToEdit(null);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#c9c918]/15 hover:bg-[#c9c918]/25 text-slate-900 dark:text-[#dada28] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#c9c918]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t("suppliers.addAccount")}</span>
                  </button>

                  <button
                    onClick={() => setSupplierToDelete(supplier)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title={t("suppliers.deleteSupplier")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Accounts list / Collapsed summary */}
              {isCollapsed ? (
                <div
                  onClick={() => toggleSupplierCollapse(supplier.id)}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#18181E] border border-dashed border-slate-200 dark:border-[#26262E] hover:border-[#c9c918]/50 dark:hover:border-[#c9c918]/40 flex items-center gap-2 flex-wrap cursor-pointer transition-all select-none animate-fade-in group"
                  title={t("suppliers.expandAccounts", { count: supplier.accounts.length })}
                >
                  {uniquePlatforms.map(({ platform, count }) => (
                    <span
                      key={platform}
                      className="text-[11.5px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121216] border border-slate-200 dark:border-[#2A2A33] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 shadow-2xs group-hover:border-slate-300 dark:group-hover:border-[#383844] transition-colors"
                    >
                      <PlatformIcon platform={platform} className="w-3.5 h-3.5 shrink-0" />
                      <span>{getPlatformDisplayName(platform)}</span>
                      <span className="font-cascadia font-bold text-[10px] text-slate-400 dark:text-slate-500">
                        ({count})
                      </span>
                    </span>
                  ))}
                </div>
              ) : filteredAccounts.length === 0 ? (
                <p className="text-xs text-[#94949E] italic py-2">
                  {t("suppliers.noAccounts")}
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
                        className="p-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50/50 dark:bg-[#1A1A1E] space-y-3 relative group overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`${badgeProps.className.replace(/\bshrink-0\b/g, "")} min-w-0 flex-1 flex items-center gap-1.5`}
                            style={badgeProps.style}
                            title={getPlatformDisplayName(acc.serviceName)}
                          >
                            <PlatformIcon
                              platform={acc.serviceName}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <span className="truncate min-w-0">{getPlatformDisplayName(acc.serviceName)}</span>
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
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
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Mail className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                            <span
                              className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate min-w-0"
                              title={acc.email}
                            >
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
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Key className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                            <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate min-w-0">
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
                                {t("suppliers.expires")}:{" "}
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
                                {t("suppliers.browser")}:{" "}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {acc.browser}
                                </strong>
                              </span>
                            </div>
                          )}

                          {acc.cost !== undefined && acc.cost > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Coins className="w-3.5 h-3.5 text-emerald-500" />
                              <span>
                                {t("suppliers.cost")}:{" "}
                                <strong className="text-emerald-600 dark:text-emerald-400 font-cascadia">
                                  S/ {acc.cost.toFixed(2)}
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

                        {/* Renew Account Button */}
                        <button
                          type="button"
                          onClick={() => setAccountToRenew({ supplier, account: acc })}
                          className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20"
                          title={t("suppliers.renewAccount")}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>{t("suppliers.renewAccount")}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Renew Supplier Account Modal */}
      {accountToRenew && (
        <RenewSupplierAccountModal
          isOpen={!!accountToRenew}
          onClose={() => setAccountToRenew(null)}
          supplier={accountToRenew.supplier}
          account={accountToRenew.account}
        />
      )}

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
              {t("suppliers.deleteSupplierTitle")}
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              {t("suppliers.deleteSupplierDesc", { name: supplierToDelete.name })}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSupplierToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                {t("suppliers.cancel")}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteSupplier}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                {t("deleteModal.delete")}
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
              {t("suppliers.deleteAccountTitle")}
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              {t("suppliers.deleteAccountDesc")}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                {t("suppliers.cancel")}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                {t("deleteModal.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
