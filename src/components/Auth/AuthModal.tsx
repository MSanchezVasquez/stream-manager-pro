import React, { useState, useEffect, useRef } from "react";
import {
  X,
  LogIn,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import gsap from "gsap";

import { LogoutConfirmModal } from "./LogoutConfirmModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithEmail, loginWithGoogle, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
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
            { scale: 0.88, opacity: 0, y: 15 },
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
    } else if (isVisible) {
      handleAnimatedClose();
    }
  }, [isOpen]);

  const handleAnimatedClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setIsVisible(false);
          onClose();
        },
      });
    } else {
      setIsVisible(false);
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      handleAnimatedClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Se cerró la ventana de inicio con Google.");
      } else {
        setErrorMsg(err.message || "Error al iniciar sesión con Google.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      handleAnimatedClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    handleAnimatedClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Backdrop Overlay with dimming effect */}
      <div
        ref={overlayRef}
        onClick={handleAnimatedClose}
        className="fixed inset-0 bg-black/60 backdrop-brightness-[0.75] backdrop-blur-sm transition-all duration-300"
      />

      {/* Central Modal Card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-[#25252D]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {user ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {user ? "Mi Cuenta" : "Iniciar Sesión"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94949E]">
                  {user
                    ? "Información y estado de sesión"
                    : "Accede a tu cuenta de streaming"}
                </p>
              </div>
            </div>

            <button
              onClick={handleAnimatedClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile View */}
          {user ? (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1B1B22] border border-slate-200 dark:border-[#2D2D33] space-y-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-[11px] text-[#94949E] uppercase font-bold tracking-wider">
                      Usuario Autenticado
                    </p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {user.displayName || user.email}
                    </p>
                    {user.email && (
                      <p className="text-xs text-slate-500 dark:text-[#94949E] truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Cuentas y clientes vinculados permanentemente a tu perfil
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#25252D] bg-white dark:bg-[#141418] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94949E]">Autenticación</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {user.providerData?.[0]?.providerId === "google.com"
                      ? "Google"
                      : "Correo / Contraseña"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94949E]">Guardado Cloud</span>
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> En tiempo real
                    (Firestore)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>

              <LogoutConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={async () => {
                  setShowLogoutConfirm(false);
                  await handleLogout();
                }}
              />
            </div>
          ) : (
            /* Login Form View */
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                type="button"
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-[#25252D] font-bold text-xs flex items-center justify-center gap-3 shadow-sm transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <CircularSpinner size={16} />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continuar con Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-[#25252D]"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#94949E] uppercase font-bold tracking-wider">
                  O con Correo Electrónico
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-[#25252D]"></div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                    <input
                      type="email"
                      required
                      placeholder="usuario@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94949E]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting && (
                    <CircularSpinner size={16} className="text-white" />
                  )}
                  <span>Ingresar a mi Cuenta</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info in central modal */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#25252D] bg-slate-50/50 dark:bg-[#121217] text-center text-[11px] text-[#94949E]">
          Gestor de Cuentas • Guardado permanente de clientes en la nube
        </div>
      </div>
    </div>
  );
};
