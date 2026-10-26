import React, { useState, useRef, useMemo } from "react";
import {
  MessageSquareText,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Layers,
  HelpCircle,
  Building2,
  CreditCard,
  Send,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import {
  useMessageTemplateStore,
  TemplateType,
  TEMPLATE_VARIABLES,
  DEFAULT_TEMPLATES_ES,
  DEFAULT_TEMPLATES_EN,
  MessageData,
} from "../../store/messageTemplateStore";
import { useTranslation } from "../../utils/translations";

export const MessageTemplatesView: React.FC = () => {
  const { resolvedLanguage } = useTranslation();
  const isEn = resolvedLanguage === "en";

  const {
    templates,
    paymentInfo,
    businessName,
    updateTemplate,
    resetTemplate,
    resetAllTemplates,
    updatePaymentInfo,
    updateBusinessName,
    formatMessage,
  } = useMessageTemplateStore();

  const [activeType, setActiveType] = useState<TemplateType>("renewal");
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettingsCard, setShowSettingsCard] = useState(true);

  // Preset de datos de prueba
  const [testPreset, setTestPreset] = useState<"netflix" | "disney" | "combo">(
    "netflix",
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sampleData: Record<"netflix" | "disney" | "combo", MessageData> = useMemo(
    () => ({
      netflix: {
        clientName: "Carlos Mendoza",
        serviceName: "Netflix Premium",
        cutDate: "28/10/2026",
        email: "carlos.stream@gmail.com",
        password: "Pass2026Netflix*",
        profileName: "Perfil 1 (Carlos)",
        pin: "4321",
        price: 15.0,
        phone: "+51987654321",
        lang: resolvedLanguage as "es" | "en",
      },
      disney: {
        clientName: "Lucía Fernández",
        serviceName: "Disney+ Premium",
        cutDate: "30/10/2026",
        email: "lucia.disney@fam.net",
        password: "MagicDisney2026",
        profileName: "Lucía Kids",
        pin: "8899",
        price: 18.5,
        phone: "+51912345678",
        lang: resolvedLanguage as "es" | "en",
      },
      combo: {
        clientName: "Diego Ramos",
        serviceName: "Combo Netflix + Max",
        cutDate: "05/11/2026",
        email: "diego.ramos@combo.com",
        password: "StreamCombo#99",
        profileName: "Diego R.",
        price: 32.0,
        phone: "+51999888777",
        lang: resolvedLanguage as "es" | "en",
        renewedSubs: [
          {
            id: "sub-1",
            clientId: "c-1",
            clientName: "Diego Ramos",
            serviceName: "Netflix Premium",
            hireDate: "05/10/2026",
            cutDate: "05/11/2026",
            email: "diego.ramos@combo.com",
            password: "NetflixPass2026*",
            profileName: "Perfil 1",
            pin: "1122",
            price: 16.0,
            status: "active",
          },
          {
            id: "sub-2",
            clientId: "c-1",
            clientName: "Diego Ramos",
            serviceName: "HBO Max Platino",
            hireDate: "05/10/2026",
            cutDate: "05/11/2026",
            email: "diego.ramos@combo.com",
            password: "MaxPass2026*",
            profileName: "Perfil 2",
            pin: "3344",
            price: 16.0,
            status: "active",
          },
        ],
      },
    }),
    [resolvedLanguage],
  );

  const templateTabs: {
    id: TemplateType;
    label: string;
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
    desc: string;
  }[] = [
    {
      id: "renewal",
      label: isEn ? "Successful Renewal" : "Renovación Exitosa",
      icon: CheckCircle2,
      badge: isEn ? "Renewal" : "Renovación",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      desc: isEn
        ? "Sent after confirming a subscription renewal in the modal or alerts."
        : "Se envía tras confirmar la renovación de un servicio en el modal o desde alertas.",
    },
    {
      id: "reminder",
      label: isEn ? "Expiring Soon (Alert)" : "Aviso de Vencimiento",
      icon: Calendar,
      badge: isEn ? "Reminder" : "Por Vencer",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      desc: isEn
        ? "Friendly reminder sent 1 to 5 days before the service cutoff date."
        : "Recordatorio amistoso que se envía 1 a 5 días antes de la fecha de corte.",
    },
    {
      id: "expired",
      label: isEn ? "Service Expired" : "Servicio Vencido / Cobro",
      icon: AlertTriangle,
      badge: isEn ? "Expired" : "Vencido",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      desc: isEn
        ? "Sent when the account has expired or cutoff date was reached without payment."
        : "Se envía cuando el servicio ya venció o se cortó por falta de pago.",
    },
    {
      id: "welcome",
      label: isEn ? "New Client / Credentials" : "Cliente Nuevo / Entrega",
      icon: UserPlus,
      badge: isEn ? "Welcome" : "Bienvenida",
      badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      desc: isEn
        ? "Sent when onboarding a new client or delivering account credentials."
        : "Se envía al vender una nueva cuenta/perfil entregando credenciales y reglas de uso.",
    },
    {
      id: "multi_renewal",
      label: isEn ? "Multi-Account Renewal" : "Renovación Múltiple (Combo)",
      icon: Layers,
      badge: isEn ? "Combo" : "Combo",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      desc: isEn
        ? "Used when renewing multiple subscriptions for the same client in a single message."
        : "Se utiliza al renovar más de una suscripción de un mismo cliente en un solo mensaje.",
    },
  ];

  const currentTab = templateTabs.find((t) => t.id === activeType)!;
  const currentTemplate =
    templates[activeType] ||
    (isEn ? DEFAULT_TEMPLATES_EN[activeType] : DEFAULT_TEMPLATES_ES[activeType]);

  // Insertar variable en el textarea en la posición actual del cursor
  const handleInsertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateTemplate(activeType, currentTemplate + " " + variableKey);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentTemplate;
    const newText =
      text.substring(0, start) + variableKey + text.substring(end);

    updateTemplate(activeType, newText);

    // Restaurar foco y mover cursor después de la variable insertada
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variableKey.length,
        start + variableKey.length,
      );
    }, 10);
  };

  // Formato del mensaje de prueba
  const livePreviewText = formatMessage(
    activeType,
    sampleData[testPreset],
  );

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(livePreviewText);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  const handleTestWhatsApp = () => {
    const encoded = encodeURIComponent(livePreviewText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleResetCurrent = () => {
    resetTemplate(activeType, isEn ? "en" : "es");
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleResetAllConfirm = () => {
    resetAllTemplates(isEn ? "en" : "es");
    setShowResetConfirm(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Parser simple para renderizar formato tipo WhatsApp en la vista previa
  const renderFormattedWhatsAppText = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-3" />;
      }

      // Convertir *negrita* en <strong>
      const parts: React.ReactNode[] = [];
      const regex = /\*(.*?)\*/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold">
            {match[1]}
          </strong>,
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={lineIdx} className="leading-relaxed">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* ENCABEZADO PRINCIPAL                                      */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "WhatsApp Message Templates" : "Plantillas de Mensajes WhatsApp"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-cascadia">
                {isEn ? "Customizable" : "Personalizables"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn
                ? "Configure automated WhatsApp copy for renewals, reminders, expirations, and new deliveries."
                : "Edita y personaliza los textos que se envían por WhatsApp para renovaciones, recordatorios, cortes y clientes nuevos."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSettingsCard(!showSettingsCard)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showSettingsCard
                ? "bg-slate-100 dark:bg-[#1F1F25] text-slate-900 dark:text-white border-slate-300 dark:border-[#2C2C36]"
                : "bg-white dark:bg-[#141418] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#25252D] hover:bg-slate-50 dark:hover:bg-[#1A1A1E]"
            }`}
            title="Configuración de medios de pago y firma"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isEn ? "Payment & Brand" : "Cuentas & Firma"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#141418] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restablecer todas las plantillas a los textos por defecto"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isEn ? "Reset All" : "Restablecer Todo"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación para restablecer todo */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEn ? "Reset all templates?" : "¿Restablecer todas las plantillas?"}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? "This will restore all 5 message templates, payment methods, and business signature to their default values. Custom edits will be overwritten."
                : "Esta acción reemplazará las 5 plantillas de mensaje, cuentas de pago y firma por los textos estándar iniciales. Los cambios personalizados se sobreescribirán."}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1F1F25] cursor-pointer"
              >
                {isEn ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleResetAllConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm cursor-pointer"
              >
                {isEn ? "Yes, Reset All" : "Sí, Restablecer Todo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PANEL DE DATOS GLOBALES (MEDIOS DE PAGO Y FIRMA)          */}
      {/* ========================================================= */}
      {showSettingsCard && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-xs space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEn ? "Global Message Variables" : "Variables Globales de Mensajería"}
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn
                ? "Inserted via {metodo_pago} and {firma}"
                : "Se insertan mediante {metodo_pago} y {firma}"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medios de Pago */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isEn ? "Default Payment Methods ({metodo_pago})" : "Medios de Pago Predeterminados ({metodo_pago})"}</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                  Yape / Plin / Cuentas
                </span>
              </label>
              <textarea
                value={paymentInfo}
                onChange={(e) => updatePaymentInfo(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#25252D] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors resize-none"
                placeholder="• Yape / Plin: 999-999-999&#10;• BCP: 191-XXXXXXXX-0-XX"
              />
            </div>

            {/* Firma / Nombre del Negocio */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isEn ? "Business Name / Signature ({firma})" : "Nombre del Negocio o Firma ({firma})"}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                    Firma al pie
                  </span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => updateBusinessName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#25252D] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                  placeholder="Ej: StreamManager Pro o Tu Tienda Streaming"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? "Any change made in this section or in the templates is saved automatically and applies immediately whenever you click WhatsApp anywhere in the app."
                    : "Cualquier cambio guardado aquí o en las plantillas se aplica inmediatamente al hacer clic en 'Avisar por WhatsApp' o al renovar clientes."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SELECTOR DE PLANTILLAS (TABS)                             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {templateTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isActive
                  ? "bg-indigo-500/10 border-indigo-500/40 shadow-xs dark:bg-indigo-500/15"
                  : "bg-white dark:bg-[#141418] border-slate-200 dark:border-[#1F1F23] hover:border-slate-300 dark:hover:border-[#2A2A32]"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-[#1F1F25] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-cascadia border uppercase shrink-0 ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </div>

              <div>
                <p
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tab.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {tab.id === "renewal"
                    ? "Confirmación"
                    : tab.id === "reminder"
                      ? "Previo a corte"
                      : tab.id === "expired"
                        ? "Cobro urgente"
                        : tab.id === "welcome"
                          ? "Credenciales"
                          : "Varias cuentas"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* CUERPO PRINCIPAL: EDITOR + LIVE PREVIEW                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: EDITOR DE PLANTILLA (7 COLS) */}
        <div className="lg:col-span-7 space-y-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-xs">
          {/* Header de la plantilla activa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentTab.label}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-cascadia border ${currentTab.badgeColor}`}
                >
                  {currentTab.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentTab.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetCurrent}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              title="Restablecer este mensaje a su versión predeterminada"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? "Reset template" : "Restablecer"}</span>
            </button>
          </div>

          {/* Selector de Variables Dinámicas (Chips interactivos) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                {isEn ? "Dynamic Variables (Click to insert):" : "Variables dinámicas (Clic para insertar):"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {isEn ? "Auto-replaced on send" : "Se reemplazan al enviar"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/70 dark:border-[#25252D]">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleInsertVariable(v.key)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-[#202028] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-[#2B2B36] hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all font-mono cursor-pointer shadow-2xs"
                  title={`${v.label}: ej. ${v.example} (${v.description})`}
                >
                  +{v.key}
                </button>
              ))}
            </div>
          </div>

          {/* Área de texto para editar la plantilla */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{isEn ? "Template Content" : "Cuerpo de la Plantilla"}</span>
              <span className="text-[10px] text-slate-400 font-cascadia">
                {currentTemplate.length} {isEn ? "chars" : "caracteres"}
              </span>
            </label>

            <textarea
              ref={textareaRef}
              value={currentTemplate}
              onChange={(e) => updateTemplate(activeType, e.target.value)}
              rows={14}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#25252D] text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-inner"
              placeholder={isEn ? "Write your template here..." : "Escribe tu plantilla aquí..."}
            />
          </div>

          {/* Formato de WhatsApp tips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                <strong className="text-slate-700 dark:text-slate-300">*negrita*</strong>
              </span>
              <span>
                <em className="text-slate-700 dark:text-slate-300">_cursiva_</em>
              </span>
              <span className="line-through text-slate-700 dark:text-slate-300">
                ~tachado~
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{isEn ? "Auto-saved" : "Guardado automático"}</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA WHATSAPP EN VIVO (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-xs space-y-4">
            {/* Header de la vista previa con selector de presets */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F1F25]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isEn ? "WhatsApp Live Preview" : "Vista Previa en WhatsApp"}
                </h3>
              </div>

              {/* Selector de Presets de prueba */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1A1A22] p-0.5 rounded-xl border border-slate-200/80 dark:border-[#25252D]">
                <button
                  type="button"
                  onClick={() => setTestPreset("netflix")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    testPreset === "netflix"
                      ? "bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Netflix
                </button>
                <button
                  type="button"
                  onClick={() => setTestPreset("disney")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    testPreset === "disney"
                      ? "bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Disney+
                </button>
                <button
                  type="button"
                  onClick={() => setTestPreset("combo")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    testPreset === "combo"
                      ? "bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Combo
                </button>
              </div>
            </div>

            {/* MOCKUP INTERACTIVO DE WHATSAPP */}
            <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-[#2B2B36] shadow-sm flex flex-col">
              {/* WhatsApp Header Verde */}
              <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {sampleData[testPreset].clientName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs leading-tight truncate">
                      {sampleData[testPreset].clientName}
                    </p>
                    <p className="text-[10px] text-emerald-200 dark:text-emerald-300 leading-tight">
                      {isEn ? "online" : "en línea"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* WhatsApp Chat Body */}
              <div className="bg-[#EFEAE2] dark:bg-[#0B141A] p-3 sm:p-4 min-h-[320px] max-h-[460px] overflow-y-auto flex flex-col justify-end space-y-3">
                {/* Separador de Fecha */}
                <div className="flex justify-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/90 dark:bg-[#182229] text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
                    {isEn ? "TODAY" : "HOY"}
                  </span>
                </div>

                {/* Burbuja de Mensaje Saliente */}
                <div className="flex justify-end">
                  <div className="max-w-[92%] sm:max-w-[88%] rounded-2xl rounded-tr-xs p-3.5 bg-[#E7FFDB] dark:bg-[#005C4B] text-slate-900 dark:text-slate-100 text-xs shadow-xs space-y-2 border border-emerald-500/20">
                    <div className="whitespace-pre-wrap break-words font-sans">
                      {renderFormattedWhatsAppText(livePreviewText)}
                    </div>

                    {/* Timestamp y Checks Azules */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-emerald-200/80 pt-1 font-cascadia">
                      <span>14:32</span>
                      <span className="text-[#34B7F1] dark:text-[#53BDEB] font-bold">
                        ✓✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Input Fake Bar */}
              <div className="p-2 bg-[#F0F2F5] dark:bg-[#202C33] border-t border-slate-200 dark:border-[#2B2B36] flex items-center justify-between gap-2 text-slate-400 text-xs">
                <span className="truncate px-2 text-[11px]">
                  {isEn ? "Type a message..." : "Escribe un mensaje..."}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Acciones de la vista previa */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPreview}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A22] dark:hover:bg-[#252530] text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedPreview ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isEn ? "Copied!" : "¡Copiado!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? "Copy preview message" : "Copiar mensaje de prueba"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                title="Abrir en WhatsApp Web para probar envío real"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isEn ? "Test Web" : "Probar Web"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
