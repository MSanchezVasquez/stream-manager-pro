import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useVaultStore } from "../../store/vaultStore";
import { CircularSpinner } from "../common/LoadingSpinners";

interface VaultUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si es true, el usuario puede posponer la configuración del vault
   * y seguir usando la app sin cifrado (modo retrocompatible). Si es
   * false, el modal es obligatorio y no se puede cerrar sin desbloquear. */
  allowSkip?: boolean;
}

export const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  isOpen,
  onClose,
  allowSkip = true,
}) => {
  const { user } = useAuthStore();
  const {
    hasVaultConfigured,
    isCheckingStatus,
    error,
    checkVaultStatus,
    setupVault,
    unlockVault,
  } = useVaultStore();

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Verificar si el usuario ya tiene un vault configurado al abrir el modal
  useEffect(() => {
    if (isOpen && user?.uid) {
      checkVaultStatus(user.uid);
    }
  }, [isOpen, user?.uid, checkVaultStatus]);

  // Reset de formulario cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setPassphrase("");
      setConfirmPassphrase("");
      setLocalError("");
      setAcknowledgedRisk(false);
      requestAnimationFrame(() => {
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.25, ease: "power2.out" },
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
              duration: 0.3,
              ease: "back.out(1.5)",
            },
          );
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFirstTimeSetup = !hasVaultConfigured;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!user?.uid) {
      setLocalError("No hay una sesión activa.");
      return;
    }

    if (!passphrase.trim()) {
      setLocalError("Ingresa una passphrase.");
      return;
    }

    if (isFirstTimeSetup) {
      if (passphrase.length < 8) {
        setLocalError("La passphrase debe tener al menos 8 caracteres.");
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setLocalError("Las passphrases no coinciden.");
        return;
      }
      if (!acknowledgedRisk) {
        setLocalError(
          "Debes confirmar que entiendes que la passphrase no se puede recuperar.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const success = isFirstTimeSetup
        ? await setupVault(user.uid, passphrase)
        : await unlockVault(user.uid, passphrase);

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (!allowSkip) return;
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={allowSkip ? handleSkip : undefined}
        className="fixed inset-0 bg-black/60 backdrop-brightness-[0.75] backdrop-blur-sm transition-all duration-300"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-[#25252D]">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isCheckingStatus
                  ? "Verificando..."
                  : isFirstTimeSetup
                    ? "Configura tu Vault de Seguridad"
                    : "Desbloquear Vault"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94949E]">
                {isCheckingStatus
                  ? "Comprobando el estado de tu cifrado"
                  : isFirstTimeSetup
                    ? "Protege las contraseñas de tus clientes"
                    : "Ingresa tu passphrase para ver los datos cifrados"}
              </p>
            </div>
          </div>

          {isCheckingStatus ? (
            <div className="py-10 flex items-center justify-center">
              <CircularSpinner size={28} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Explicación / advertencia solo en configuración inicial */}
              {isFirstTimeSetup && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-start gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Esta passphrase cifrará las contraseñas y PINs de tus
                      clientes. <strong>No se guarda en ningún lado</strong> —
                      ni siquiera nosotros podemos recuperarla.
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                    Si la olvidas, los datos cifrados con ella{" "}
                    <strong>no podrán descifrarse nunca más</strong>. Anótala en
                    un lugar seguro (gestor de contraseñas físico o digital).
                  </p>
                </div>
              )}

              {(error || localError) && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{localError || error}</span>
                </div>
              )}

              {/* Campo passphrase */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  {isFirstTimeSetup ? "Nueva Passphrase" : "Tu Passphrase"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                  <input
                    type={showPassphrase ? "text" : "password"}
                    autoFocus
                    required
                    placeholder="••••••••••••"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassphrase ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar passphrase (solo en setup inicial) */}
              {isFirstTimeSetup && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                    Confirmar Passphrase
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                    <input
                      type={showPassphrase ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Checkbox de confirmación de riesgo (solo en setup inicial) */}
              {isFirstTimeSetup && (
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledgedRisk}
                    onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 dark:border-[#2D2D33] text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-[#94949E] leading-relaxed">
                    Entiendo que si olvido esta passphrase, no podré recuperar
                    las contraseñas de mis clientes que estén cifradas con ella.
                  </span>
                </label>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-3 pt-2">
                {allowSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors disabled:opacity-60"
                  >
                    Ahora no
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <>
                      <span>
                        {isFirstTimeSetup ? "Crear Vault" : "Desbloquear"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#25252D] bg-slate-50/50 dark:bg-[#121217] text-center text-[11px] text-[#94949E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Cifrado AES-256-GCM, la clave nunca sale de tu navegador</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
