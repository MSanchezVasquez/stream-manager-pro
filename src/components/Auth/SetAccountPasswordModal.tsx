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
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  auth,
} from "../../lib/firebase";
import { CircularSpinner } from "../common/LoadingSpinners";

interface SetAccountPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = "SEND_EMAIL" | "EMAIL_SENT" | "ENTER_CODE" | "SUCCESS";

export const SetAccountPasswordModal: React.FC<SetAccountPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, hasPasswordProvider } = useAuthStore();
  const isExistingPassword = hasPasswordProvider();

  const [step, setStep] = useState<ModalStep>("SEND_EMAIL");
  const [codeCountdown, setCodeCountdown] = useState<number>(0);

  // Inputs
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("SEND_EMAIL");
      setCode("");
      setCodeCountdown(0);
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setErrorMsg("");
      setSuccessMsg("");

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

  // Countdown timer for resending email
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const interval = setInterval(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeCountdown]);

  if (!isOpen || !user) return null;

  // Paso 1: Enviar correo de seguridad al Gmail
  const handleSendSecurityEmail = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      if (!user.email) {
        throw new Error("No hay correo asociado a la cuenta.");
      }
      await sendPasswordResetEmail(auth, user.email);
      setStep("EMAIL_SENT");
      setCodeCountdown(60);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      if (err.code === "auth/too-many-requests") {
        setErrorMsg(
          "Demasiadas solicitudes enviadas. Por favor espera un momento e inténtalo de nuevo.",
        );
      } else {
        setErrorMsg(
          err?.message || "No se pudo enviar el correo de seguridad a tu Gmail.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso opcional: Validar el código de seguridad o restablecer en el modal
  const handleConfirmWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg("Por favor ingresa el código o enlace recibido en tu correo.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    // Extraer oobCode si el usuario pegó el enlace completo
    let actionCode = cleanCode;
    if (cleanCode.includes("oobCode=")) {
      const match = cleanCode.match(/oobCode=([^&]+)/);
      if (match && match[1]) {
        actionCode = match[1];
      }
    }

    setIsSubmitting(true);
    try {
      await verifyPasswordResetCode(auth, actionCode);
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStep("SUCCESS");
      setSuccessMsg("¡Contraseña actualizada con éxito!");
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error("Error verifying code:", err);
      if (
        err.code === "auth/invalid-action-code" ||
        err.code === "auth/expired-action-code"
      ) {
        setErrorMsg(
          "El código o enlace ingresado no es válido o ya ha expirado. Por favor solicita uno nuevo o usa directamente el enlace recibido en tu Gmail.",
        );
      } else {
        setErrorMsg(
          err?.message || "No se pudo validar el código de seguridad.",
        );
      }
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

          {/* STEP 1: Solicitud de envío al Gmail */}
          {step === "SEND_EMAIL" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Verificación directa en tu Gmail
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-indigo-200/70">
                      Capa de seguridad obligatoria
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-[#2D2D33] flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#94949E]">
                    Tu correo Gmail:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {user.email}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-[#94949E] leading-relaxed">
                  Para proteger tu cuenta, te enviaremos un correo de seguridad
                  oficial a tu Gmail para verificar tu identidad antes de
                  permitir {isExistingPassword ? "cambiar" : "crear"} tu
                  contraseña.
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
                  onClick={handleSendSecurityEmail}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <>
                      <span>Enviar a mi Gmail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Correo enviado a su Gmail (sin mostrar códigos falsos) */}
          {step === "EMAIL_SENT" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                      ¡Correo de seguridad enviado!
                    </p>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Revisa tu bandeja de entrada en Gmail
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-[#141418] border border-emerald-500/30 text-[11px] text-slate-700 dark:text-[#A1A1AA] space-y-2 leading-relaxed">
                  <p>
                    Hemos enviado el correo oficial de Firebase a{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {user.email}
                    </strong>
                    .
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-[#888894]">
                    <li>Abre tu aplicación de Gmail o tu navegador.</li>
                    <li>
                      Busca el correo de restablecimiento (revisa también tu
                      carpeta de <em>Spam</em> o <em>Promociones</em>).
                    </li>
                    <li>
                      Haz clic en el enlace seguro recibido para establecer tu
                      contraseña.
                    </li>
                  </ol>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Abrir mi Gmail</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => setStep("ENTER_CODE")}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1A1E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Pegar código aquí
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94949E] pt-1 px-1">
                <span>¿No te llegó el correo?</span>
                <button
                  type="button"
                  disabled={codeCountdown > 0 || isSubmitting}
                  onClick={handleSendSecurityEmail}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>
                    {codeCountdown > 0
                      ? `Reenviar en ${codeCountdown}s`
                      : "Reenviar correo"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Opcional - Ingresar código / enlace del correo directamente en la app */}
          {step === "ENTER_CODE" && (
            <form onSubmit={handleConfirmWithCode} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-[#94949E] leading-relaxed">
                Ingresa el código de seguridad o pega el enlace completo que
                recibiste en tu Gmail ({user.email}).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  Código o Enlace del correo
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Pega aquí el código o enlace recibido"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
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
                  onClick={() => setStep("EMAIL_SENT")}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
                >
                  Atrás
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

          {/* STEP 4: Éxito */}
          {step === "SUCCESS" && (
            <div className="py-6 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                ¡Contraseña confirmada!
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#94949E]">
                Tu cuenta ha sido actualizada con éxito y de forma segura.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#25252D] bg-slate-50/50 dark:bg-[#121217] text-center text-[11px] text-[#94949E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Verificación de seguridad respaldada por Firebase Authentication</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
