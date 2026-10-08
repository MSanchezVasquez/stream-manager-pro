import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Truck,
  Sparkles,
  Search,
  Check,
  Copy,
  Plus,
  Minus,
  Calendar,
  Compass,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { PlatformIcon } from "../common/PlatformIcon";
import { CircularSpinner } from "../common/LoadingSpinners";
import { useDataStore } from "../../store/dataStore";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  getPlatformDisplayName,
  getDaysRemaining,
} from "../../utils/platformHelpers";
import { FreeProfile, SupplierAccount, StreamingPlatform } from "../../types";
import { useTranslation } from "../../utils/translations";

interface AddFromSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccountId?: string;
}

interface SupplierAccountWithMeta extends SupplierAccount {
  supplierId: string;
  supplierName: string;
}

// Recommended default profile capacity per platform
function getDefaultProfilesForPlatform(platform: string): number {
  const p = (platform || "").toLowerCase();
  if (p.includes("netflix")) return 5;
  if (p.includes("prime")) return 6;
  if (p.includes("disney")) return 4;
  if (p.includes("hbo") || p.includes("max")) return 5;
  if (p.includes("paramount")) return 3;
  if (p.includes("crunchyroll")) return 4;
  return 1;
}

export const AddFromSupplierModal: React.FC<AddFromSupplierModalProps> = ({
  isOpen,
  onClose,
  initialAccountId,
}) => {
  const { suppliers, freeProfiles, saveFreeProfile } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  const [search, setSearch] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  // Quantity to add per account: accountId -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  // Processing state for individual adds: accountId -> boolean
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  // Success indicator per account: accountId -> boolean
  const [addedSuccessMap, setAddedSuccessMap] = useState<Record<string, boolean>>({});
  // Copied field feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected accounts for bulk addition
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  // Scroll lock when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  // Extract and flatten all supplier accounts
  const allAccounts: SupplierAccountWithMeta[] = useMemo(() => {
    const list: SupplierAccountWithMeta[] = [];
    suppliers.forEach((s) => {
      (s.accounts || []).forEach((acc) => {
        list.push({
          ...acc,
          supplierId: s.id,
          supplierName: s.name,
        });
      });
    });
    return list;
  }, [suppliers]);

  // Initialize quantities when modal opens or accounts change
  useEffect(() => {
    if (!isOpen) return;
    const initQty: Record<string, number> = {};
    allAccounts.forEach((acc) => {
      initQty[acc.id] = getDefaultProfilesForPlatform(acc.serviceName);
    });
    setQuantities(initQty);
    setQuantityInputs({});
    setAddedSuccessMap({});
    setBulkSuccessMessage(null);

    if (initialAccountId && allAccounts.some((a) => a.id === initialAccountId)) {
      setSelectedAccountIds([initialAccountId]);
    } else {
      setSelectedAccountIds([]);
    }
  }, [isOpen, allAccounts, initialAccountId]);

  // Unique platforms and suppliers for filter dropdowns
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    allAccounts.forEach((a) => set.add(a.serviceName));
    return Array.from(set).sort();
  }, [allAccounts]);

  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      if (selectedSupplierId !== "all" && acc.supplierId !== selectedSupplierId) {
        return false;
      }
      if (selectedPlatform !== "all" && acc.serviceName !== selectedPlatform) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesEmail = acc.email.toLowerCase().includes(q);
        const matchesPlatform = acc.serviceName.toLowerCase().includes(q);
        const matchesSupplier = acc.supplierName.toLowerCase().includes(q);
        const matchesBrowser = (acc.browser || "").toLowerCase().includes(q);
        if (!matchesEmail && !matchesPlatform && !matchesSupplier && !matchesBrowser) {
          return false;
        }
      }
      return true;
    });
  }, [allAccounts, selectedSupplierId, selectedPlatform, search]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuantityChange = (accId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[accId] || 1;
      const next = Math.max(1, current + delta);
      setQuantityInputs((q) => ({ ...q, [accId]: String(next) }));
      return { ...prev, [accId]: next };
    });
  };

  const handleQuantityInput = (accId: string, val: string) => {
    setQuantityInputs((prev) => ({ ...prev, [accId]: val }));
    if (val === "") return;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setQuantities((prev) => ({ ...prev, [accId]: num }));
    }
  };

  const toggleSelectAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedAccountIds.length === filteredAccounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(filteredAccounts.map((a) => a.id));
    }
  };

  // Add a single account to Free Profiles
  const handleAddSingleAccount = async (acc: SupplierAccountWithMeta) => {
    const qtyToAdd = quantities[acc.id] || 1;
    setLoadingMap((prev) => ({ ...prev, [acc.id]: true }));

    try {
      // Check if an existing FreeProfile with the exact same platform and email already exists
      const existingMatch = freeProfiles.find(
        (fp) =>
          fp.serviceName === acc.serviceName &&
          fp.email.toLowerCase().trim() === acc.email.toLowerCase().trim(),
      );

      if (existingMatch) {
        // Increment quantity of existing record
        const updatedProf: FreeProfile = {
          ...existingMatch,
          quantity: (existingMatch.quantity || 0) + qtyToAdd,
          password: acc.password || existingMatch.password,
          browser: acc.browser || existingMatch.browser,
          supplierId: acc.supplierId,
          supplierName: acc.supplierName,
          supplierAccountId: acc.id,
          expirationDate: acc.expirationDate || existingMatch.expirationDate,
        };
        await saveFreeProfile(updatedProf);
      } else {
        // Create new free profile
        const newProf: FreeProfile = {
          id: `fp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          serviceName: acc.serviceName,
          quantity: qtyToAdd,
          email: acc.email,
          password: acc.password,
          browser: acc.browser || "Google Chrome",
          notes: acc.notes || "",
          supplierId: acc.supplierId,
          supplierName: acc.supplierName,
          supplierAccountId: acc.id,
          expirationDate: acc.expirationDate,
        };
        await saveFreeProfile(newProf);
      }

      setAddedSuccessMap((prev) => ({ ...prev, [acc.id]: true }));
      setTimeout(() => {
        setAddedSuccessMap((prev) => ({ ...prev, [acc.id]: false }));
      }, 3000);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [acc.id]: false }));
    }
  };

  // Bulk add all selected accounts
  const handleBulkAdd = async () => {
    if (selectedAccountIds.length === 0) return;
    setIsBulkAdding(true);

    try {
      let countAdded = 0;
      for (const accId of selectedAccountIds) {
        const acc = allAccounts.find((a) => a.id === accId);
        if (!acc) continue;

        const qtyToAdd = quantities[acc.id] || 1;
        const existingMatch = freeProfiles.find(
          (fp) =>
            fp.serviceName === acc.serviceName &&
            fp.email.toLowerCase().trim() === acc.email.toLowerCase().trim(),
        );

        if (existingMatch) {
          const updatedProf: FreeProfile = {
            ...existingMatch,
            quantity: (existingMatch.quantity || 0) + qtyToAdd,
            password: acc.password || existingMatch.password,
            browser: acc.browser || existingMatch.browser,
            supplierId: acc.supplierId,
            supplierName: acc.supplierName,
            supplierAccountId: acc.id,
            expirationDate: acc.expirationDate || existingMatch.expirationDate,
          };
          await saveFreeProfile(updatedProf);
        } else {
          const newProf: FreeProfile = {
            id: `fp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            serviceName: acc.serviceName,
            quantity: qtyToAdd,
            email: acc.email,
            password: acc.password,
            browser: acc.browser || "Google Chrome",
            notes: acc.notes || "",
            supplierId: acc.supplierId,
            supplierName: acc.supplierName,
            supplierAccountId: acc.id,
            expirationDate: acc.expirationDate,
          };
          await saveFreeProfile(newProf);
        }
        countAdded++;
      }

      setBulkSuccessMessage(
        resolvedLanguage === "en"
          ? `${countAdded} accounts successfully added as free profiles!`
          : `¡${countAdded} cuentas añadidas con éxito como perfiles libres!`,
      );
      setSelectedAccountIds([]);
      setTimeout(() => setBulkSuccessMessage(null), 4000);
    } finally {
      setIsBulkAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#1F1F23] flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-[#101014]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7] leading-tight font-space">
                {t("profiles.addFromSupplierTitle")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94949E] mt-0.5">
                {t("profiles.addFromSupplierSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-[#1F1F23] bg-white dark:bg-[#141418] grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("suppliers.search")}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Supplier Filter */}
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">{t("profiles.allSuppliers")}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.accounts.length})
              </option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">{t("profiles.allPlatforms")}</option>
            {availablePlatforms.map((plat) => (
              <option key={plat} value={plat}>
                {getPlatformDisplayName(plat as StreamingPlatform)}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Header & Feedback */}
        {bulkSuccessMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{bulkSuccessMessage}</span>
          </div>
        )}

        {filteredAccounts.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-[#101014]/50 border-b border-slate-200/60 dark:border-[#1F1F23] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all-supplier-accounts"
                checked={
                  filteredAccounts.length > 0 &&
                  selectedAccountIds.length === filteredAccounts.length
                }
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <label
                htmlFor="select-all-supplier-accounts"
                className="text-slate-600 dark:text-slate-400 cursor-pointer font-medium"
              >
                {resolvedLanguage === "en" ? "Select all" : "Seleccionar todas"} (
                {filteredAccounts.length})
              </label>
            </div>

            {selectedAccountIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={isBulkAdding}
                className="px-3.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isBulkAdding ? (
                  <CircularSpinner size={14} className="text-white" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {resolvedLanguage === "en"
                    ? `Add selected (${selectedAccountIds.length})`
                    : `Añadir seleccionadas (${selectedAccountIds.length})`}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Accounts List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] border border-dashed border-slate-200 dark:border-[#2D2D33]">
              <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {t("profiles.noSupplierAccounts")}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {t("profiles.noSupplierAccountsDesc")}
              </p>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const platConfig = getPlatformConfig(acc.serviceName);
              const badgeProps = getPlatformBadgeProps(platConfig);
              const isSelected = selectedAccountIds.includes(acc.id);
              const currentQty = quantities[acc.id] || 1;
              const isLoading = !!loadingMap[acc.id];
              const isAdded = !!addedSuccessMap[acc.id];

              // Check if matching profile already in free inventory
              const matchingFp = freeProfiles.find(
                (fp) =>
                  fp.serviceName === acc.serviceName &&
                  fp.email.toLowerCase().trim() === acc.email.toLowerCase().trim(),
              );

              const daysRemaining = acc.expirationDate
                ? getDaysRemaining(acc.expirationDate)
                : null;
              const isExpired = daysRemaining !== null && daysRemaining <= 0;

              return (
                <div
                  key={acc.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                    isSelected
                      ? "border-purple-500/80 bg-purple-500/5 dark:bg-purple-500/10 shadow-xs"
                      : "border-slate-200 dark:border-[#25252D] bg-white dark:bg-[#1A1A1E] hover:border-slate-300 dark:hover:border-[#353540]"
                  }`}
                >
                  {/* Left Column: Checkbox, Platform, Supplier Badge, Email */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectAccount(acc.id)}
                      className="w-4 h-4 mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Platform & Supplier badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={badgeProps.className}
                          style={badgeProps.style}
                        >
                          <PlatformIcon
                            platform={acc.serviceName}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span>{getPlatformDisplayName(acc.serviceName)}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          <Truck className="w-2.5 h-2.5" />
                          <span>{acc.supplierName}</span>
                        </span>

                        {matchingFp && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>
                              {t("profiles.alreadyInInventory", {
                                count: matchingFp.quantity,
                              })}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Account Email & Info */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate">
                          {acc.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.email, acc.id)}
                          className="p-1 rounded text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                          title="Copiar correo"
                        >
                          {copiedId === acc.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Expiration & Browser */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        {acc.expirationDate && (
                          <span className="flex items-center gap-1 font-cascadia">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            <span
                              className={
                                isExpired
                                  ? "text-red-500 font-bold"
                                  : "text-slate-700 dark:text-slate-300"
                              }
                            >
                              {acc.expirationDate}
                            </span>
                            {daysRemaining !== null && (
                              <span
                                className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                                  isExpired
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {isExpired
                                  ? resolvedLanguage === "en"
                                    ? "Expired"
                                    : "Vencida"
                                  : `${daysRemaining}d`}
                              </span>
                            )}
                          </span>
                        )}

                        {acc.browser && (
                          <span className="flex items-center gap-1">
                            <Compass className="w-3 h-3 text-sky-500" />
                            <span>{acc.browser}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quantity Stepper & Add Button */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#101014] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(acc.id, -1)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#202028] transition-colors cursor-pointer"
                        title="Menos"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={
                          quantityInputs[acc.id] !== undefined
                            ? quantityInputs[acc.id]
                            : currentQty
                        }
                        onChange={(e) => handleQuantityInput(acc.id, e.target.value)}
                        onBlur={() => {
                          const raw = quantityInputs[acc.id];
                          if (raw !== undefined) {
                            const num = parseInt(raw, 10);
                            const fallback =
                              !isNaN(num) && num > 0 ? num : quantities[acc.id] || 1;
                            setQuantityInputs((prev) => ({
                              ...prev,
                              [acc.id]: String(fallback),
                            }));
                            setQuantities((prev) => ({ ...prev, [acc.id]: fallback }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-10 text-center font-cascadia font-bold text-xs bg-transparent text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(acc.id, 1)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#202028] transition-colors cursor-pointer"
                        title="Más"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleAddSingleAccount(acc)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isAdded
                          ? "bg-emerald-600 text-white shadow-emerald-600/20"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
                      }`}
                    >
                      {isLoading ? (
                        <CircularSpinner size={14} className="text-white" />
                      ) : isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {resolvedLanguage === "en" ? "Added!" : "¡Añadido!"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t("profiles.addToInventory")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1F1F23] flex items-center justify-between bg-slate-50/60 dark:bg-[#101014]/60 shrink-0">
          <p className="text-xs text-slate-500 dark:text-[#94949E]">
            {resolvedLanguage === "en"
              ? "Accounts added will be immediately ready to assign to clients in Free Profiles."
              : "Las cuentas añadidas quedarán listas para asignarse a clientes en Perfiles Libres."}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-white dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
          >
            {t("profiles.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
