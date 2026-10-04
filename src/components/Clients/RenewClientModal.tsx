import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  RotateCw,
  Calendar,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import { DatePicker } from "../common/DatePicker";
import { PlatformIcon } from "../common/PlatformIcon";
import { CircularSpinner } from "../common/LoadingSpinners";
import { Client, ClientSubscription } from "../../types";
import { useDataStore } from "../../store/dataStore";
import { useTranslation } from "../../utils/translations";
import {
  getPlatformConfig,
  getPlatformBadgeProps,
  getPlatformDisplayName,
  getDaysRemaining,
  getDaysDifference,
  addPeriodToDateString,
  formatDateToString,
} from "../../utils/platformHelpers";

interface RenewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  targetSubscriptionId?: string;
  onNotifyWhatsApp?: (
    sub: ClientSubscription,
    clientName: string,
    phone?: string,
  ) => void;
}

function getTodayFormatted(): string {
  return formatDateToString(new Date());
}

export const RenewClientModal: React.FC<RenewClientModalProps> = ({
  isOpen,
  onClose,
  client,
  targetSubscriptionId,
  onNotifyWhatsApp,
}) => {
  const { saveClient } = useDataStore();
  const { t, resolvedLanguage } = useTranslation();

  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [periodUnit, setPeriodUnit] = useState<"days" | "months" | "years">("months");
  const [periodValue, setPeriodValue] = useState<number>(1);
  const [renewalBase, setRenewalBase] = useState<"cutDate" | "today">("cutDate");
  const [customCutDates, setCustomCutDates] = useState<Record<string, string>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number | undefined>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [renewedSuccess, setRenewedSuccess] = useState(false);
  const [lastRenewedSubs, setLastRenewedSubs] = useState<ClientSubscription[]>([]);

  // Initialize state when modal opens
  useEffect(() => {
    if (!isOpen || !client) {
      setRenewedSuccess(false);
      setLastRenewedSubs([]);
      return;
    }

    setRenewedSuccess(false);

    // Initial selected subscription(s)
    let initialIds: string[] = [];
    if (targetSubscriptionId && client.subscriptions.some((s) => s.id === targetSubscriptionId)) {
      initialIds = [targetSubscriptionId];
    } else {
      initialIds = client.subscriptions.map((s) => s.id);
    }
    setSelectedSubIds(initialIds);

    // Initial period from first selected subscription
    const firstSub = client.subscriptions.find((s) => initialIds.includes(s.id));
    const initUnit = firstSub?.periodUnit || "months";
    const initVal = firstSub?.periodValue || 1;
    setPeriodUnit(initUnit);
    setPeriodValue(initVal);

    // Initial base: if active, extend cutDate; if expired (<= 0 days), default to today
    const isFirstActive = firstSub?.cutDate ? getDaysRemaining(firstSub.cutDate) > 0 : false;
    setRenewalBase(isFirstActive ? "cutDate" : "today");

    // Initialize custom prices
    const prices: Record<string, number | undefined> = {};
    client.subscriptions.forEach((s) => {
      prices[s.id] = s.price;
    });
    setCustomPrices(prices);
    setCustomCutDates({});
  }, [isOpen, client, targetSubscriptionId]);

  // Recalculate cut dates when periodUnit, periodValue, or renewalBase changes
  useEffect(() => {
    if (!client) return;

    const newDates: Record<string, string> = {};
    const today = getTodayFormatted();

    client.subscriptions.forEach((s) => {
      const baseDate =
        renewalBase === "cutDate" && s.cutDate
          ? s.cutDate
          : today;

      newDates[s.id] = addPeriodToDateString(baseDate, periodValue, periodUnit);
    });

    setCustomCutDates(newDates);
  }, [client, periodUnit, periodValue, renewalBase]);

  if (!isOpen || !client) return null;

  const handleToggleSub = (subId: string) => {
    setSelectedSubIds((prev) => {
      if (prev.includes(subId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((id) => id !== subId);
      }
      return [...prev, subId];
    });
  };

  const handleSelectAll = () => {
    if (selectedSubIds.length === client.subscriptions.length) {
      if (client.subscriptions.length > 0) {
        setSelectedSubIds([client.subscriptions[0].id]);
      }
    } else {
      setSelectedSubIds(client.subscriptions.map((s) => s.id));
    }
  };

  const applyPreset = (val: number, unit: "days" | "months" | "years") => {
    setPeriodValue(val);
    setPeriodUnit(unit);
  };

  const handleCustomCutDateChange = (subId: string, val: string) => {
    setCustomCutDates((prev) => ({
      ...prev,
      [subId]: val,
    }));
  };

  const handlePriceChange = (subId: string, val: string) => {
    const num = parseFloat(val);
    setCustomPrices((prev) => ({
      ...prev,
      [subId]: isNaN(num) ? undefined : num,
    }));
  };

  const handleConfirmRenewal = async () => {
    if (selectedSubIds.length === 0) return;

    setIsSaving(true);
    try {
      const today = getTodayFormatted();
      const updatedSubscriptions: ClientSubscription[] = client.subscriptions.map((s) => {
        if (!selectedSubIds.includes(s.id)) return s;

        const newCut = customCutDates[s.id] || addPeriodToDateString(
          renewalBase === "cutDate" && s.cutDate
            ? s.cutDate
            : today,
          periodValue,
          periodUnit,
        );

        const totalDays = getDaysDifference(today, newCut);
        const newPrice = customPrices[s.id] !== undefined ? customPrices[s.id] : s.price;

        return {
          ...s,
          cutDate: newCut,
          periodUnit,
          periodValue,
          periodDays: totalDays > 0 ? totalDays : 30,
          status: "active",
          price: newPrice,
        };
      });

      const updatedClient: Client = {
        ...client,
        status: "active",
        subscriptions: updatedSubscriptions,
      };

      const success = await saveClient(updatedClient);
      if (success) {
        const renewed = updatedSubscriptions.filter((s) => selectedSubIds.includes(s.id));
        setLastRenewedSubs(renewed);
        setRenewedSuccess(true);
      } else {
        alert(resolvedLanguage === "en" ? "Failed to save renewal." : "No se pudo guardar la renovación.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const todayStr = getTodayFormatted();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shadow-xs border border-emerald-500/20">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7] leading-tight font-space">
              {t("renewModal.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E] mt-0.5">
              {t("renewModal.subtitle", { name: client.name })}
            </p>
          </div>
        </div>

        {/* Success View */}
        {renewedSuccess ? (
          <div className="space-y-5 py-4 text-center animate-fade-in overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t("renewModal.success")}
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94949E] mt-1 max-w-sm mx-auto">
                {resolvedLanguage === "en"
                  ? `Subscriptions for ${client.name} have been extended and marked active.`
                  : `Las suscripciones de ${client.name} han sido extendidas y marcadas como activas.`}
              </p>
            </div>

            {/* List of renewed subs */}
            <div className="space-y-2 text-left bg-slate-50 dark:bg-[#1A1A1E] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#2D2D33]">
              {lastRenewedSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={sub.serviceName} className="w-4 h-4" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {getPlatformDisplayName(sub.serviceName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-cascadia font-medium text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{sub.cutDate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {onNotifyWhatsApp && lastRenewedSubs.length > 0 && (
                <button
                  onClick={() => {
                    onNotifyWhatsApp(lastRenewedSubs[0], client.name, client.phone);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t("renewModal.notifyWhatsApp")}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1F1F26] dark:hover:bg-[#282832] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {t("clientModal.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* 1. Subscriptions Selection (if client has multiple) */}
            {client.subscriptions.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                    {t("renewModal.selectSubs")}
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                  >
                    {selectedSubIds.length === client.subscriptions.length
                      ? (resolvedLanguage === "en" ? "Deselect" : "Deseleccionar")
                      : t("renewModal.selectAll")}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {client.subscriptions.map((sub) => {
                    const isSelected = selectedSubIds.includes(sub.id);
                    const days = getDaysRemaining(sub.cutDate);
                    const isExp = days <= 0;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSub(sub.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10"
                            : "border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PlatformIcon platform={sub.serviceName} className="w-4 h-4 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {getPlatformDisplayName(sub.serviceName)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-[#94949E] font-cascadia">
                              {t("renewModal.currentCutDate")}: {sub.cutDate || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isExp
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isExp ? (resolvedLanguage === "en" ? "Expired" : "Vencido") : `${days}d`}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 dark:border-[#3D3D45]"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Base Calculation (Cut Date vs Today) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-[#2D2D33] space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                {t("renewModal.baseCalculation")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRenewalBase("cutDate")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    renewalBase === "cutDate"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202028]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      renewalBase === "cutDate"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-400"
                    }`}
                  >
                    {renewalBase === "cutDate" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="leading-tight">
                      {resolvedLanguage === "en" ? "From current cut date" : "Fecha de corte actual"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {resolvedLanguage === "en" ? "Accumulate onto remaining days" : "Suma el periodo a los días restantes"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRenewalBase("today")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    renewalBase === "today"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202028]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      renewalBase === "today"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-400"
                    }`}
                  >
                    {renewalBase === "today" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="leading-tight">
                      {resolvedLanguage === "en" ? `Starting today (${todayStr})` : `A partir de hoy (${todayStr})`}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {resolvedLanguage === "en" ? "Recommended if already expired" : "Ideal si ya venció el servicio"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Renewal Period Inputs & Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                {t("renewModal.renewPeriod")}
              </label>

              <div className="flex items-center gap-2">
                {/* Numeric Quantity without spinners */}
                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    value={periodValue}
                    onChange={(e) => setPeriodValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs font-cascadia font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Period Unit Selector */}
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
                    {t("renewModal.days")}
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
                    {t("renewModal.months")}
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
                    {t("renewModal.years")}
                  </button>
                </div>
              </div>

              {/* Quick Presets Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 dark:text-[#80808C] mr-1">
                  {t("renewModal.quickPresets")}:
                </span>
                {[
                  { label: "+15 d", val: 15, unit: "days" as const },
                  { label: "+1 m", val: 1, unit: "months" as const },
                  { label: "+2 m", val: 2, unit: "months" as const },
                  { label: "+3 m", val: 3, unit: "months" as const },
                  { label: "+6 m", val: 6, unit: "months" as const },
                  { label: "+1 a", val: 1, unit: "years" as const },
                ].map((preset) => {
                  const isActive = periodValue === preset.val && periodUnit === preset.unit;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset.val, preset.unit)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A1E] dark:hover:bg-[#25252E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2D2D33]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Preview & Date Adjustments for Selected Subscriptions */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E]">
                {t("renewModal.summary")}
              </label>

              {client.subscriptions
                .filter((sub) => selectedSubIds.includes(sub.id))
                .map((sub) => {
                  const currentCut = sub.cutDate || todayStr;
                  const newCut = customCutDates[sub.id] || addPeriodToDateString(
                    renewalBase === "cutDate" && sub.cutDate
                      ? sub.cutDate
                      : todayStr,
                    periodValue,
                    periodUnit,
                  );
                  const daysToCut = getDaysDifference(todayStr, newCut);

                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3"
                    >
                      {/* Subscription Platform & Price */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={sub.serviceName} className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {getPlatformDisplayName(sub.serviceName)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 dark:text-[#94949E]">
                            {t("renewModal.newPrice")}:
                          </span>
                          <div className="w-20">
                            <input
                              type="number"
                              step="0.5"
                              value={customPrices[sub.id] ?? ""}
                              onChange={(e) => handlePriceChange(sub.id, e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#141418] text-right font-cascadia font-bold text-xs text-emerald-600 dark:text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dates Transformation Visual */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1 border-t border-emerald-500/20">
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-[#94949E] uppercase font-bold">
                            {t("renewModal.currentCutDate")}
                          </p>
                          <p className="text-xs font-cascadia font-medium text-slate-600 dark:text-slate-300">
                            {currentCut}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center justify-between">
                            <span>{t("renewModal.newCutDate")}</span>
                            <span className="font-cascadia font-normal">+{daysToCut}d</span>
                          </p>
                          <DatePicker
                            value={newCut}
                            onChange={(val) => handleCustomCutDateChange(sub.id, val)}
                            valueClassName="font-cascadia font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              {t("renewModal.cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirmRenewal}
              disabled={isSaving || selectedSubIds.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <CircularSpinner size={16} className="text-white" />
              ) : (
                <RotateCw className="w-4 h-4" />
              )}
              <span>{t("renewModal.confirm")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
