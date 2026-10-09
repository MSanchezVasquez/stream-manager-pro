import React, { useState } from "react";
import { PlatformSelect } from "../common/PlatformSelect";
import { useDataStore } from "../../store/dataStore";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  getPlatformDisplayName,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import { CircularSpinner } from "../common/LoadingSpinners";
import {
  Sparkles,
  Mail,
  Key,
  Compass,
  UserCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Eye,
  EyeOff,
  Truck,
  Calendar,
} from "lucide-react";
import { FreeProfile, StreamingPlatform } from "../../types";
import { AssignProfileModal } from "./AssignProfileModal";
import { AddFromSupplierModal } from "./AddFromSupplierModal";
import { useTranslation } from "../../utils/translations";

export const FreeProfilesList: React.FC = () => {
  const { freeProfiles, suppliers, saveFreeProfile, deleteFreeProfile } =
    useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  const [search, setSearch] = useState("");
  const [selectedProfileForAssign, setSelectedProfileForAssign] =
    useState<FreeProfile | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Profile deletion modal
  const [profileToDelete, setProfileToDelete] = useState<FreeProfile | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Import from supplier modal state
  const [isImportFromSupplierModalOpen, setIsImportFromSupplierModalOpen] =
    useState(false);

  // New profile modal state
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [newService, setNewService] =
    useState<StreamingPlatform>("Prime Video");
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newBrowser, setNewBrowser] = useState("Google Chrome");
  const [selectedSupplierMeta, setSelectedSupplierMeta] = useState<{
    supplierId?: string;
    supplierName?: string;
    supplierAccountId?: string;
    expirationDate?: string;
  } | null>(null);

  const allSupplierAccounts = React.useMemo(() => {
    return suppliers.flatMap((s) =>
      (s.accounts || []).map((a) => ({
        ...a,
        supplierId: s.id,
        supplierName: s.name,
      })),
    );
  }, [suppliers]);

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFreeProfile(profileToDelete.id);
      setProfileToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      alert("Por favor complete correo y contraseña");
      return;
    }

    const newProf: FreeProfile = {
      id: `fp-${Date.now()}`,
      serviceName: newService,
      quantity: newQuantity,
      email: newEmail,
      password: newPassword,
      browser: newBrowser,
      supplierId: selectedSupplierMeta?.supplierId,
      supplierName: selectedSupplierMeta?.supplierName,
      supplierAccountId: selectedSupplierMeta?.supplierAccountId,
      expirationDate: selectedSupplierMeta?.expirationDate,
    };

    setIsNewProfileModalOpen(false);
    setNewEmail("");
    setNewPassword("");
    setSelectedSupplierMeta(null);

    saveFreeProfile(newProf).then((success) => {
      if (!success) {
        alert(
          "No se pudo guardar el perfil libre. Verifica tu conexión e inténtalo de nuevo.",
        );
      }
    });
  };

  const filteredProfiles = freeProfiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.serviceName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.browser && p.browser.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7]">
              {t("profiles.title")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              {t("profiles.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94949E]" />
            <input
              type="text"
              placeholder={t("profiles.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7]"
            />
          </div>

          <button
            onClick={() => setIsImportFromSupplierModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{t("profiles.addFromSupplier")}</span>
          </button>

          <button
            onClick={() => {
              setSelectedSupplierMeta(null);
              setIsNewProfileModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("profiles.add")}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
          <Sparkles className="w-12 h-12 text-[#94949E] mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-slate-700 dark:text-[#E4E4E7]">
            {t("profiles.noProfiles")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((prof) => {
            const platConfig = getPlatformConfig(prof.serviceName);
            const badgeProps = getPlatformBadgeProps(platConfig);
            const isPassVisible = !!showPasswords[prof.id];

            return (
              <div
                key={prof.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#1F1F23] bg-white dark:bg-[#141418] shadow-sm hover:border-[#2D2D33] transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={badgeProps.className}
                    style={badgeProps.style}
                  >
                    <PlatformIcon
                      platform={prof.serviceName}
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    <span>{getPlatformDisplayName(prof.serviceName)}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {t("profiles.available", { count: prof.quantity })}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                    <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                      {prof.email}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(prof.email, `fpemail-${prof.id}`)
                    }
                    className="text-slate-400 hover:text-amber-500 p-0.5 shrink-0 cursor-pointer"
                  >
                    {copiedField === `fpemail-${prof.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Key className="w-3.5 h-3.5 text-[#94949E] shrink-0" />
                    <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                      {isPassVisible ? prof.password : "••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePassword(prof.id)}
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
                        copyToClipboard(prof.password, `fppass-${prof.id}`)
                      }
                      className="text-slate-400 hover:text-amber-500 p-0.5 cursor-pointer"
                    >
                      {copiedField === `fppass-${prof.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {prof.browser && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-500" />
                    {t("suppliers.browser")}:{" "}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {prof.browser}
                    </strong>
                  </p>
                )}

                {(prof.supplierName || prof.expirationDate) && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-1 pt-0.5">
                    {prof.supplierName && (
                      <span
                        title={
                          resolvedLanguage === "en"
                            ? "Linked and automatically synchronized with supplier account"
                            : "Vinculado y sincronizado automáticamente con cuenta del proveedor"
                        }
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                      >
                        <Truck className="w-2.5 h-2.5" />
                        <span>{prof.supplierName}</span>
                      </span>
                    )}
                    {prof.expirationDate && (
                      <span className="inline-flex items-center gap-1 font-cascadia text-[10px] text-amber-600 dark:text-amber-400">
                        <Calendar className="w-2.5 h-2.5 text-amber-500" />
                        <span>{prof.expirationDate}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedProfileForAssign(prof)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t("profiles.assignToClient")}</span>
                  </button>

                  <button
                    onClick={() => setProfileToDelete(prof)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title={t("profiles.deleteTitle")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {selectedProfileForAssign && (
        <AssignProfileModal
          isOpen={!!selectedProfileForAssign}
          onClose={() => setSelectedProfileForAssign(null)}
          profile={selectedProfileForAssign}
        />
      )}

      {/* Add New Profile Modal */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              {t("profiles.addNewTitle")}
            </h3>

            <form onSubmit={handleAddProfile} className="space-y-4">
              {/* Optional Autofill from Supplier Account */}
              {allSupplierAccounts.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t("profiles.importFromSupplierAccount")}</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const accId = e.target.value;
                      if (!accId) {
                        setSelectedSupplierMeta(null);
                        return;
                      }
                      const found = allSupplierAccounts.find((a) => a.id === accId);
                      if (found) {
                        setNewService(found.serviceName);
                        setNewEmail(found.email);
                        setNewPassword(found.password);
                        setNewBrowser(found.browser || "Google Chrome");
                        setSelectedSupplierMeta({
                          supplierId: found.supplierId,
                          supplierName: found.supplierName,
                          supplierAccountId: found.id,
                          expirationDate: found.expirationDate,
                        });
                      }
                    }}
                    defaultValue=""
                    className="w-full p-2 text-xs rounded-lg border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{t("profiles.selectSupplierAccount")}</option>
                    {allSupplierAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {getPlatformDisplayName(a.serviceName)} - {a.email} ({a.supplierName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("profiles.platform")}
                </label>
                <PlatformSelect value={newService} onChange={setNewService} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("profiles.quantity")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={newQuantity || ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setNewQuantity("" as any);
                      return;
                    }
                    const val = parseInt(raw, 10);
                    if (!isNaN(val)) {
                      setNewQuantity(val);
                    }
                  }}
                  onBlur={() => {
                    if (!newQuantity || (typeof newQuantity === "number" && newQuantity < 1)) {
                      setNewQuantity(1);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("profiles.email")}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("profiles.password")}
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("clientModal.password")}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("profiles.browser")}
                </label>
                <input
                  type="text"
                  value={newBrowser}
                  onChange={(e) => setNewBrowser(e.target.value)}
                  placeholder="Google Chrome / Opera / Brave"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {t("profiles.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  {t("profiles.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2">
              {t("profiles.deleteTitle")}
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              {t("profiles.deleteDesc")} ({profileToDelete.serviceName} - {profileToDelete.email})
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProfileToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
              >
                {t("profiles.cancel")}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProfile}
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

      {/* Import from Supplier Modal */}
      {isImportFromSupplierModalOpen && (
        <AddFromSupplierModal
          isOpen={isImportFromSupplierModalOpen}
          onClose={() => setIsImportFromSupplierModalOpen(false)}
        />
      )}
    </div>
  );
};
