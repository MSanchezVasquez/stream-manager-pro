import React, { useState, useEffect } from "react";
import {
  X,
  RotateCw,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Key,
  DollarSign,
  FileText,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DatePicker } from "../common/DatePicker";
import { PlatformIcon } from "../common/PlatformIcon";
import { CircularSpinner } from "../common/LoadingSpinners";
import { Supplier, SupplierAccount } from "../../types";
import { useDataStore } from "../../store/dataStore";
import { useTranslation } from "../../utils/translations";
import {
  getPlatformDisplayName,
  getDaysRemaining,
  getDaysDifference,
  addPeriodToDateString,
  formatDateToString,
} from "../../utils/platformHelpers";

interface RenewSupplierAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  account: SupplierAccount | null;
}

function getTodayFormatted(): string {
  return formatDateToString(new Date());
}

export const RenewSupplierAccountModal: React.FC<
  RenewSupplierAccountModalProps
> = ({ isOpen, onClose, supplier, account }) => {
  const { saveSupplier } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  const [periodUnit, setPeriodUnit] = useState<"days" | "months" | "years">("months");
  const [periodValue, setPeriodValue] = useState<number>(1);
  const [renewalBase, setRenewalBase] = useState<"expirationDate" | "today">("expirationDate");
  const [customExpirationDate, setCustomExpirationDate] = useState<string>("");
  const [renewalCost, setRenewalCost] = useState<string>("");
  const [renewalNotes, setRenewalNotes] = useState<string>("");
  const [updatedPassword, setUpdatedPassword] = useState<string>("");
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [renewedSuccess, setRenewedSuccess] = useState<boolean>(false);

  // Initialize modal state
  useEffect(() => {
    if (!isOpen || !account) {
      setRenewedSuccess(false);
      return;
    }

    setRenewedSuccess(false);
    const initUnit = account.periodUnit || "months";
    const initVal = account.periodValue || 1;
    setPeriodUnit(initUnit);
    setPeriodValue(initVal);

    // Initial base: if account expiration is in the future, extend from expiration; otherwise start from today
    const isActive = account.expirationDate
      ? getDaysRemaining(account.expirationDate) > 0
      : false;
    const defaultBase = isActive ? "expirationDate" : "today";
    setRenewalBase(defaultBase);

    const today = getTodayFormatted();
    const baseDate = defaultBase === "expirationDate" && account.expirationDate ? account.expirationDate : today;
    setCustomExpirationDate(addPeriodToDateString(baseDate, initVal, initUnit));

    setRenewalCost(account.cost !== undefined ? String(account.cost) : "");
    setRenewalNotes("");
    setUpdatedPassword(account.password || "");
    setShowPasswordInput(false);
    setCopiedEmail(false);
  }, [isOpen, account]);

  // Recalculate new expiration date whenever periodUnit, periodValue or renewalBase changes
  useEffect(() => {
    if (!account) return;
    const today = getTodayFormatted();
    const baseDate =
      renewalBase === "expirationDate" && account.expirationDate && getDaysRemaining(account.expirationDate) > 0
        ? account.expirationDate
        : today;

    setCustomExpirationDate(addPeriodToDateString(baseDate, periodValue, periodUnit));
  }, [account, periodUnit, periodValue, renewalBase]);

  if (!isOpen || !supplier || !account) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(account.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const applyPreset = (val: number, unit: "days" | "months" | "years") => {
    setPeriodValue(val);
    setPeriodUnit(unit);
  };

  const handleConfirmRenewal = async () => {
    setIsSaving(true);
    try {
      const today = getTodayFormatted();
      const finalExpDate =
        customExpirationDate ||
        addPeriodToDateString(
          renewalBase === "expirationDate" && account.expirationDate && getDaysRemaining(account.expirationDate) > 0
            ? account.expirationDate
            : today,
          periodValue,
          periodUnit,
        );

      const parsedCost = parseFloat(renewalCost);

      // Append renewal note if provided
      let finalNotes = account.notes || "";
      if (renewalNotes.trim()) {
        const noteStamp = `[Renovado ${today} - +${periodValue} ${periodUnit}]: ${renewalNotes.trim()}`;
        finalNotes = finalNotes ? `${finalNotes}\n${noteStamp}` : noteStamp;
      }

      const updatedAccount: SupplierAccount = {
        ...account,
        expirationDate: finalExpDate,
        password: updatedPassword.trim() ? updatedPassword.trim() : account.password,
        status: "active",
        cost: isNaN(parsedCost) ? account.cost : parsedCost,
        periodValue,
        periodUnit,
        lastRenewedAt: today,
        notes: finalNotes,
      };

      const updatedAccounts = supplier.accounts.map((a) =>
        a.id === account.id ? updatedAccount : a,
      );

      const updatedSupplier: Supplier = {
        ...supplier,
        accounts: updatedAccounts,
      };

      const success = await saveSupplier(updatedSupplier);
      if (success) {
        setRenewedSuccess(true);
      } else {
        alert(
          resolvedLanguage === "en"
            ? "Could not save supplier account renewal."
            : "No se pudo guardar la renovación de la cuenta de proveedor.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const daysRemaining = getDaysRemaining(account.expirationDate);
  const isExp = daysRemaining <= 0;
  const todayStr = getTodayFormatted();
  const calculatedDaysDiff = customExpirationDate
    ? getDaysDifference(todayStr, customExpirationDate)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shadow-xs border border-purple-500/20">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7] leading-tight font-space">
              {t("suppliers.renewTitle")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E] mt-0.5">
              {t("suppliers.renewSubtitle", {
                platform: getPlatformDisplayName(account.serviceName),
                supplier: supplier.name,
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        {renewedSuccess ? (
          <div className="space-y-5 py-4 text-center animate-fade-in overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t("suppliers.renewSuccess")}
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94949E] mt-1 max-w-sm mx-auto">
                {resolvedLanguage === "en"
                  ? `The supplier license for ${account.email} has been extended.`
                  : `La licencia del proveedor para ${account.email} ha sido extendida.`}
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-[#2D2D33] space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {resolvedLanguage === "en" ? "Account / Email:" : "Cuenta / Correo:"}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {account.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">
                  {t("suppliers.newExpiration")}:
                </span>
                <span className="font-cascadia font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {customExpirationDate}
                </span>
              </div>
              {renewalCost && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("suppliers.renewCost")}:
                  </span>
                  <span className="font-cascadia font-bold text-slate-800 dark:text-slate-200">
                    S/ {parseFloat(renewalCost).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                {t("suppliers.close")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Account Info Pill */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-[#2D2D33] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <PlatformIcon platform={account.serviceName} className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {getPlatformDisplayName(account.serviceName)}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {account.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200/60 dark:hover:bg-[#25252E] transition-colors cursor-pointer"
                  title="Copiar correo"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isExp
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isExp
                    ? resolvedLanguage === "en"
                      ? "Expired"
                      : "Vencida"
                    : `${daysRemaining}d`}
                </span>
              </div>
            </div>

            {/* Base Date Calculation */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                {resolvedLanguage === "en"
                  ? "Calculate renewal starting from"
                  : "Calcular renovación a partir de"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRenewalBase("expirationDate")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    renewalBase === "expirationDate"
                      ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold"
                      : "border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202028]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      renewalBase === "expirationDate"
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-400"
                    }`}
                  >
                    {renewalBase === "expirationDate" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="leading-tight">
                      {resolvedLanguage === "en"
                        ? "Current Expiration"
                        : "Vencimiento actual"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {account.expirationDate || "N/A"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRenewalBase("today")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    renewalBase === "today"
                      ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold"
                      : "border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202028]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      renewalBase === "today"
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-400"
                    }`}
                  >
                    {renewalBase === "today" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="leading-tight">
                      {resolvedLanguage === "en"
                        ? `Starting today (${todayStr})`
                        : `A partir de hoy (${todayStr})`}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {resolvedLanguage === "en"
                        ? "If account is already expired"
                        : "Si la cuenta ya estaba vencida"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Period Inputs & Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                {t("suppliers.renewPeriod")}
              </label>

              <div className="flex items-center gap-2">
                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    value={periodValue}
                    onChange={(e) =>
                      setPeriodValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs font-cascadia font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex-1 flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2D2D33]">
                  <button
                    type="button"
                    onClick={() => setPeriodUnit("days")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      periodUnit === "days"
                        ? "bg-white dark:bg-[#25252E] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-[#94949E] hover:text-slate-700"
                    }`}
                  >
                    {resolvedLanguage === "en" ? "Days" : "Días"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodUnit("months")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      periodUnit === "months"
                        ? "bg-white dark:bg-[#25252E] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-[#94949E] hover:text-slate-700"
                    }`}
                  >
                    {resolvedLanguage === "en" ? "Months" : "Meses"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodUnit("years")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      periodUnit === "years"
                        ? "bg-white dark:bg-[#25252E] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-[#94949E] hover:text-slate-700"
                    }`}
                  >
                    {resolvedLanguage === "en" ? "Years" : "Años"}
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { label: "+15 d", val: 15, unit: "days" as const },
                  { label: "+1 m", val: 1, unit: "months" as const },
                  { label: "+2 m", val: 2, unit: "months" as const },
                  { label: "+3 m", val: 3, unit: "months" as const },
                  { label: "+6 m", val: 6, unit: "months" as const },
                  { label: "+1 a", val: 1, unit: "years" as const },
                ].map((preset) => {
                  const isActive =
                    periodValue === preset.val && periodUnit === preset.unit;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset.val, preset.unit)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A1E] dark:hover:bg-[#25252E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2D2D33]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Transformation Preview */}
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-[#94949E] uppercase font-bold">
                    {t("suppliers.currentExpiration")}
                  </p>
                  <p className="text-xs font-cascadia font-medium text-slate-700 dark:text-slate-300">
                    {account.expirationDate || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold flex items-center justify-between">
                    <span>{t("suppliers.newExpiration")}</span>
                    <span className="font-cascadia font-normal">+{calculatedDaysDiff}d</span>
                  </p>
                  <DatePicker
                    value={customExpirationDate}
                    onChange={(val) => setCustomExpirationDate(val)}
                    valueClassName="font-cascadia font-bold text-purple-600 dark:text-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* Optional Cost & Reference Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                  {t("suppliers.renewCost")}
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-cascadia">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(e.target.value)}
                    placeholder={t("suppliers.renewCostPlaceholder")}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs font-cascadia font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94949E] mb-1">
                  {resolvedLanguage === "en" ? "Payment reference" : "Referencia de pago"}
                </label>
                <input
                  type="text"
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder={
                    resolvedLanguage === "en"
                      ? "e.g. Paid via transfer"
                      : "Ej. Yape / Transferencia"
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Optional Credentials Update (e.g. password changed by supplier upon renewal) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Key className="w-3.5 h-3.5" />
                <span>
                  {showPasswordInput
                    ? (resolvedLanguage === "en" ? "Hide password field" : "Ocultar campo de contraseña")
                    : (resolvedLanguage === "en" ? "¿Cambió la contraseña el proveedor?" : "¿El proveedor cambió la contraseña?")}
                </span>
              </button>

              {showPasswordInput && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2D2D33] space-y-1 animate-fade-in">
                  <label className="block text-[10px] text-slate-500 font-semibold">
                    {resolvedLanguage === "en" ? "New Account Password" : "Nueva Contraseña de la Cuenta"}
                  </label>
                  <input
                    type="text"
                    value={updatedPassword}
                    onChange={(e) => setUpdatedPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#141418] text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        {!renewedSuccess && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#1F1F23] mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
            >
              {t("suppliers.cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirmRenewal}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <CircularSpinner size={16} className="text-white" />
              ) : (
                <RotateCw className="w-4 h-4" />
              )}
              <span>{t("suppliers.renewAccount")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
