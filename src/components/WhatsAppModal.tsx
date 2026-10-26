import React, { useState, useMemo, useEffect } from "react";
import { MessageSquare, Copy, Check, ExternalLink, X, Settings2 } from "lucide-react";
import { ClientSubscription } from "../types";
import { useTranslation } from "../utils/translations";
import { useBodyScrollLock } from "../utils/useBodyScrollLock";
import {
  useMessageTemplateStore,
  TemplateType,
} from "../store/messageTemplateStore";
import { getDaysRemaining } from "../utils/platformHelpers";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  serviceName: string;
  cutDate: string;
  email?: string;
  password?: string;
  profileName?: string;
  pin?: string;
  phone?: string;
  price?: number;
  isRenewal?: boolean;
  renewedSubs?: ClientSubscription[];
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  clientName,
  serviceName,
  cutDate,
  email,
  password,
  profileName,
  pin,
  phone,
  price,
  isRenewal = false,
  renewedSubs,
}) => {
  useBodyScrollLock(isOpen);
  const { t, resolvedLanguage } = useTranslation();
  const isEn = resolvedLanguage === "en";

  const { formatMessage } = useMessageTemplateStore();
  const [copied, setCopied] = useState(false);

  // Determinar la plantilla inicial según el contexto
  const initialType: TemplateType = useMemo(() => {
    if (isRenewal) {
      if (renewedSubs && renewedSubs.length > 1) {
        return "multi_renewal";
      }
      return "renewal";
    }
    const days = cutDate ? getDaysRemaining(cutDate) : 0;
    if (days < 0) {
      return "expired";
    }
    return "reminder";
  }, [isRenewal, renewedSubs, cutDate]);

  const [selectedType, setSelectedType] = useState<TemplateType>(initialType);

  // Actualizar plantilla inicial si cambian los props
  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const generatedMsg = useMemo(() => {
    return formatMessage(selectedType, {
      clientName,
      serviceName,
      cutDate,
      email,
      password,
      profileName,
      pin,
      price,
      phone,
      renewedSubs,
      lang: resolvedLanguage as "es" | "en",
    });
  }, [
    formatMessage,
    selectedType,
    clientName,
    serviceName,
    cutDate,
    email,
    password,
    profileName,
    pin,
    price,
    phone,
    renewedSubs,
    resolvedLanguage,
  ]);

  const [messageText, setMessageText] = useState(generatedMsg);

  useEffect(() => {
    setMessageText(generatedMsg);
  }, [generatedMsg]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  const templateOptions: { id: TemplateType; label: string }[] = [
    { id: "renewal", label: isEn ? "Renewal" : "Renovación" },
    { id: "reminder", label: isEn ? "Reminder" : "Recordatorio" },
    { id: "expired", label: isEn ? "Expired" : "Vencido / Corte" },
    { id: "welcome", label: isEn ? "Credentials" : "Credenciales / Bienvenida" },
    ...(renewedSubs && renewedSubs.length > 1
      ? [{ id: "multi_renewal" as TemplateType, label: isEn ? "Combo" : "Combo Multi" }]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-all duration-300 animate-fade-in"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative z-10 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7]">
              {isRenewal ? t("whatsapp.renewalTitle") : t("whatsapp.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              {isRenewal
                ? t("whatsapp.renewalSubtitle", { name: clientName })
                : t("whatsapp.subtitle", { name: clientName })}
            </p>
          </div>
        </div>

        {/* Selector de tipo de plantilla rápida */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isEn ? "Select Template:" : "Seleccionar Plantilla:"}
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              {isEn ? "From Templates Tab" : "Configurada en pestaña Plantillas"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {templateOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedType(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === opt.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#1F1F25] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282832]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1.5">
            {t("whatsapp.formattedMsg")}
          </label>
          <textarea
            rows={8}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#25252D] bg-slate-50 dark:bg-[#18181E] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono outline-none focus:outline-none ring-0 focus:ring-0 focus:border-slate-300 dark:focus:border-[#383844] transition-all resize-y leading-relaxed"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#25252D] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F1F26] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{t("whatsapp.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t("whatsapp.copy")}</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t("whatsapp.open")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
