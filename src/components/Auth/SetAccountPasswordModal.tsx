import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Mail,
  ArrowRight,
  RotateCw,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { CircularSpinner } from "../common/LoadingSpinners";

interface SetAccountPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep =
  | "CHECKING"
  | "SEND_CODE"
  | "VERIFY_CODE"
  | "SET_PASSWORD"
  | "SUCCESS"
  | "SETUP_GUIDE";

export const SetAccountPasswordModal: React.FC<SetAccountPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    hasPasswordProvider,
    createAccountPassword,
    changeAccountPassword,
  } = useAuthStore();
  const isExistingPassword = hasPasswordProvider();

  const [step, setStep] = useState<ModalStep>("CHECKING");
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean>(false);
  const [senderDisplay, setSenderDisplay] = useState<string | null>(null);

  const [inputCode, setInputCode] = useState("");
  const [codeCountdown, setCodeCountdown] = useState<number>(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Check mail service status on open
  useEffect(() => {
    if (isOpen) {
      setStep("CHECKING");
      setInputCode("");
      setCodeCountdown(0);
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setErrorMsg("");
      setSuccessMsg("");

      // Query server for Gmail SMTP config status
      fetch("/api/mail-status")
        .then((res) => res.json())
        .then((data) => {
          setIsSmtpConfigured(!!data.configured);
          setSenderDisplay(data.senderEmail || null);
          setStep(data.configured ? "SEND_CODE" : "SETUP_GUIDE");
        })
        .catch(() => {
          setIsSmtpConfigured(false);
          setStep("SETUP_GUIDE");
        });

      requestAnimationFrame(() => {
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.22, ease: "power2.out" },
          );
        }
        if (modalRef.current) {
          gsap.fromTo(
            modalRef.current,
            { scale: 0.9, opacity: 0, y: 15 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.28,
              ease: "back.out(1.5)",
            },
          );
        }
      });
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const interval = setInterval(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeCountdown]);

  if (!isOpen || !user) return null;

  // Paso 1: Enviar código de 6 dígitos al Gmail a través de Nodemailer
  const handleSendVerificationCode = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      if (!user.email) {
        throw new Error("No hay correo asociado a la cuenta de usuario.");
      }

      const res = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.missingConfig) {
          setStep("SETUP_GUIDE");
          setErrorMsg(
            "Falta configurar las credenciales de Gmail en las variables de entorno.",
          );
        } else {
          setErrorMsg(data.error || "No se pudo enviar el correo con el código.");
        }
        return;
      }

      setStep("VERIFY_CODE");
      setCodeCountdown(60);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setErrorMsg(
        err?.message ||
          "Error de conexión con el servidor de correo. Verifica que el servidor esté activo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2: Verificar el código de 6 dígitos ingresado por el usuario
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = inputCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg("Por favor ingresa el código numérico de 6 dígitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error || "El código ingresado es incorrecto o ha expirado.",
        );
        return;
      }

      // Validado correctamente: pasar al formulario de nueva contraseña
      setStep("SET_PASSWORD");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al validar el código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 3: Guardar la nueva contraseña en Firebase Auth
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isExistingPassword
        ? await changeAccountPassword(newPassword)
        : await createAccountPassword(newPassword);

      if (res.success) {
        setStep("SUCCESS");
        setSuccessMsg(
          isExistingPassword
            ? "¡Contraseña actualizada con éxito!"
            : "¡Contraseña creada con éxito! Ahora puedes ingresar con tu correo y esta contraseña.",
        );
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.error || "Error al guardar la contraseña.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al procesar la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-brightness-[0.75] backdrop-blur-sm transition-all duration-300"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-[#25252D]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Verificación de Seguridad
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94949E] truncate max-w-[220px]">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP: CHECKING */}
          {step === "CHECKING" && (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <CircularSpinner size={32} className="text-indigo-600" />
              <p className="text-xs text-slate-500 dark:text-[#94949E]">
                Conectando con el servidor de correo...
              </p>
            </div>
          )}

          {/* STEP 1: Solicitud de código al Gmail */}
          {step === "SEND_CODE" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Código de 6 dígitos a tu Gmail
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-indigo-200/70">
                      Servicio Nodemailer activo
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-[#2D2D33] flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#94949E]">
                    Destinatario:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {user.email}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-[#94949E] leading-relaxed">
                  Te enviaremos un código de seguridad de 6 dígitos a tu correo
                  para verificar tu identidad y permitirte{" "}
                  {isExistingPassword ? "cambiar" : "crear"} tu contraseña aquí
                  en la aplicación.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <>
                      <span>Enviar código a mi Gmail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Ingreso del código de 6 dígitos (sin mostrarlo en pantalla) */}
          {step === "VERIFY_CODE" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[12px]">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Código de 6 dígitos enviado</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-indigo-200/80 leading-relaxed">
                  Revisa tu bandeja de entrada en{" "}
                  <strong>{user.email}</strong> y copia el código de 6 dígitos
                  recibido.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-2 text-center">
                  Ingresa el código numérico recibido
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="• • • • • •"
                  value={inputCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setInputCode(val);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 rounded-2xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94949E] px-1">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Abrir Gmail</span>
                </a>

                <button
                  type="button"
                  disabled={codeCountdown > 0 || isSubmitting}
                  onClick={handleSendVerificationCode}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>
                    {codeCountdown > 0
                      ? `Reenviar en ${codeCountdown}s`
                      : "Reenviar código"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("SEND_CODE")}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
                >
                  Atrás
                </button>

                <button
                  type="submit"
                  disabled={inputCode.length !== 6 || isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <>
                      <span>Validar Código</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Establecer nueva contraseña */}
          {step === "SET_PASSWORD" && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Identidad verificada exitosamente</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  {isExistingPassword ? "Nueva Contraseña" : "Crear Contraseña"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repite la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <span>Guardar Contraseña</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmación exitosa */}
          {step === "SUCCESS" && (
            <div className="py-6 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                ¡Contraseña guardada con éxito!
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94949E]">
                Tu cuenta ahora está protegida con tu nueva contraseña.
              </p>
            </div>
          )}

          {/* STEP: Guía de configuración si faltan variables SMTP en .env */}
          {step === "SETUP_GUIDE" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Configuración de Gmail (Nodemailer)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                  Para que tu cuenta de Gmail envíe los correos con el código de
                  6 dígitos a tus usuarios, necesitas agregar dos variables en
                  tu archivo <code>.env</code>:
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#121216] border border-amber-400/30 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
                  <div>SMTP_GMAIL_USER="tu_correo@gmail.com"</div>
                  <div>SMTP_GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-[#2D2D33] text-[11px] text-slate-600 dark:text-[#94949E] space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-white">
                  ¿Cómo obtener tu Contraseña de Aplicación de Google gratis?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-[#888894]">
                  <li>
                    Entra a tu cuenta de Google:{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 underline font-medium"
                    >
                      myaccount.google.com/apppasswords
                    </a>
                  </li>
                  <li>
                    Escribe el nombre de la app (ej:{" "}
                    <em>StreamManager</em>) y haz clic en <strong>Crear</strong>
                    .
                  </li>
                  <li>
                    Copia la clave de 16 letras generada y agrégala a tu{" "}
                    <code>.env</code>.
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#202028] dark:hover:bg-[#282832] text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#25252D] bg-slate-50/50 dark:bg-[#121217] text-center text-[11px] text-[#94949E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            {isSmtpConfigured
              ? `Envío activo desde Gmail (${senderDisplay || "Configurado"})`
              : "Envío directo seguro con Nodemailer"}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
