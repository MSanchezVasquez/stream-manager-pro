import React, { useState } from "react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Tv,
  Users,
  Bell,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { CircularSpinner } from "../common/LoadingSpinners";

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } =
    useAuthStore();
  const theme = useThemeStore((state) => state.themeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(
    null,
  );
  const [domainCopied, setDomainCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyDomain = (domainToCopy: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(domainToCopy);
    }
    setDomainCopied(true);
    setTimeout(() => setDomainCopied(false), 2500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = loginEmail.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail) {
      setErrorMsg("Por favor ingresa tu correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg(
        "Por favor ingresa un correo electrónico válido (ejemplo: usuario@correo.com).",
      );
      return;
    }

    if (!cleanPassword) {
      setErrorMsg("Por favor ingresa tu contraseña.");
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithEmail(cleanEmail, cleanPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("¡Inicio de sesión exitoso! Accediendo...");
    } else {
      setErrorMsg(result.error || "Ocurrió un error al iniciar sesión.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setErrorMsg("Por favor ingresa tu nombre de usuario.");
      return;
    }

    if (!cleanEmail) {
      setErrorMsg("Por favor ingresa tu correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg(
        "Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).",
      );
      return;
    }

    if (!cleanPassword) {
      setErrorMsg("Por favor ingresa una contraseña.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerWithEmail(cleanEmail, cleanPassword, cleanName);
      if (res && !res.success && res.error) {
        setErrorMsg(res.error);
        setSuccessMsg("");
        return;
      }
      setSuccessMsg("¡Cuenta registrada con éxito! Ingresando...");
      setLoginEmail(cleanEmail);
    } catch (err: any) {
      setSuccessMsg("");
      setErrorMsg(err?.message || "Error al crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setUnauthorizedDomain(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
        if (res.code === "auth/unauthorized-domain") {
          setUnauthorizedDomain(
            typeof window !== "undefined" ? window.location.hostname : "",
          );
        }
      }
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMsg("Se cerró la ventana de autenticación con Google.");
      } else {
        setErrorMsg(err?.message || "Error con Google Sign-In.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-[#0A0A0E] dark:via-[#111118] dark:to-[#08080C] text-slate-900 dark:text-[#E4E4E7] transition-colors duration-300 relative overflow-y-auto">
      {/* App Header & Branding */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-2 pb-3 sm:pb-4 z-10 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              GestorStreaming
            </h1>
            <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              Administración de Cuentas, Perfiles y Proveedores
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-[#1A1A22]/90 backdrop-blur-md border border-slate-300 dark:border-[#2D2D38] text-slate-800 dark:text-[#E4E4E7] hover:scale-105 active:scale-95 shadow-md transition-all flex items-center justify-center cursor-pointer"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </header>

      {/* Main Container Card */}
      <main
        id="main-content"
        role="main"
        className="relative w-full max-w-md md:max-w-4xl bg-white dark:bg-[#141419] rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-slate-200/90 dark:border-[#23232A] shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto transition-all duration-300"
      >
        {/* Mobile Segmented Toggle (Only on mobile screens < md) */}
        <div className="md:hidden p-4 sm:p-5 pb-0">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#1C1C24] rounded-xl border border-slate-200 dark:border-[#272730]">
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(false);
              }}
              className={`flex-1 min-h-[42px] py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                !isRegister
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(true);
              }}
              className={`flex-1 min-h-[42px] py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                isRegister
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* REGISTRATION FORM COLUMN */}
        <div
          className={`w-full md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col justify-center transition-all duration-500 ${
            isRegister
              ? "flex opacity-100 z-10 pointer-events-auto"
              : "hidden md:flex md:opacity-0 md:pointer-events-none"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            {/* Title block with clean typography and spacing */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Crear Cuenta
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Regístrate para comenzar a gestionar tus cuentas
              </p>
            </div>

            {errorMsg && isRegister && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs animate-fade-in space-y-2">
                <div className="flex items-start gap-2 font-medium text-left">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="flex-1">{errorMsg}</span>
                </div>
                {unauthorizedDomain && (
                  <div className="bg-white/80 dark:bg-[#1C1C24] p-2.5 rounded-xl border border-amber-500/30 text-[11px] space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold text-[11px] break-all">
                        {unauthorizedDomain}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDomain(unauthorizedDomain)}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shrink-0 text-[11px] transition-colors shadow-sm ml-auto cursor-pointer"
                      >
                        {domainCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar dominio</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      En Firebase Console ve a{" "}
                      <strong>Authentication → Configuración → Dominios autorizados</strong>{" "}
                      y agrega este dominio para habilitar Google Sign-In.
                    </p>
                  </div>
                )}
              </div>
            )}

            {successMsg && isRegister && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre o empresa"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-12 py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl sm:rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <span>Registrarse</span>
                  )}
                </button>
              </div>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#141419] px-3 font-medium text-slate-500 dark:text-slate-400">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                aria-label="Registrarse con Google"
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] hover:bg-slate-100 dark:hover:bg-[#252530] flex items-center justify-center gap-2.5 text-slate-800 dark:text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
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
                <span>Continuar con Google</span>
              </button>
            </div>

            {/* Mobile bottom switch link */}
            <div className="mt-5 text-center md:hidden">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setIsRegister(false);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer inline-flex items-center min-h-[44px] px-1"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* LOGIN FORM COLUMN */}
        <div
          className={`w-full md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col justify-center transition-all duration-500 ${
            !isRegister
              ? "flex opacity-100 z-10 pointer-events-auto"
              : "hidden md:flex md:opacity-0 md:pointer-events-none"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            {/* Title block with clean typography and spacing */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Ingresa tus credenciales para acceder al gestor
              </p>
            </div>

            {errorMsg && !isRegister && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs animate-fade-in space-y-2">
                <div className="flex items-start gap-2 font-medium text-left">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="flex-1">{errorMsg}</span>
                </div>
                {unauthorizedDomain && (
                  <div className="bg-white/80 dark:bg-[#1C1C24] p-2.5 rounded-xl border border-amber-500/30 text-[11px] space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold text-[11px] break-all">
                        {unauthorizedDomain}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDomain(unauthorizedDomain)}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shrink-0 text-[11px] transition-colors shadow-sm ml-auto cursor-pointer"
                      >
                        {domainCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar dominio</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      En Firebase Console ve a{" "}
                      <strong>Authentication → Configuración → Dominios autorizados</strong>{" "}
                      y agrega este dominio para habilitar Google Sign-In.
                    </p>
                  </div>
                )}
              </div>
            )}

            {successMsg && !isRegister && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setErrorMsg(
                        "Por favor contacta al administrador o ingresa con Google.",
                      )
                    }
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Ingresa tu contraseña"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-12 py-3 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl sm:rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <CircularSpinner size={16} className="text-white" />
                  ) : (
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              </div>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#141419] px-3 font-medium text-slate-500 dark:text-slate-400">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                aria-label="Iniciar sesión con Google"
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] hover:bg-slate-100 dark:hover:bg-[#252530] flex items-center justify-center gap-2.5 text-slate-800 dark:text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
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
                <span>Continuar con Google</span>
              </button>
            </div>

            {/* Mobile bottom switch link */}
            <div className="mt-5 text-center md:hidden">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setIsRegister(true);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer inline-flex items-center min-h-[44px] px-1"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* SLIDING OVERLAY PANEL FOR DESKTOP (MD+) */}
        <div
          className={`hidden md:flex absolute top-0 bottom-0 w-1/2 bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA] text-white p-10 flex-col justify-center items-center text-center transition-all duration-700 ease-in-out z-20 shadow-2xl ${
            isRegister
              ? "left-1/2 rounded-l-[120px] rounded-r-none"
              : "left-0 rounded-r-[120px] rounded-l-none"
          }`}
        >
          {/* Prompting to Register when in Login Mode */}
          <div
            className={`transition-all duration-500 flex flex-col items-center max-w-xs ${
              isRegister
                ? "opacity-0 scale-95 pointer-events-none hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <h3 className="text-3xl font-extrabold mb-2 tracking-tight">
              ¡Hola, Bienvenido!
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 mb-7 font-medium leading-relaxed">
              ¿No tienes una cuenta registrada todavía?
            </p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(true);
              }}
              className="min-h-[44px] py-2.5 px-8 rounded-full border-2 border-white/90 hover:bg-white hover:text-indigo-600 text-white font-bold text-xs tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
            >
              Crear Cuenta
            </button>
          </div>

          {/* Prompting to Login when in Register Mode */}
          <div
            className={`transition-all duration-500 flex flex-col items-center max-w-xs ${
              !isRegister
                ? "opacity-0 scale-95 pointer-events-none hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <h3 className="text-3xl font-extrabold mb-2 tracking-tight">
              ¡Bienvenido de nuevo!
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 mb-7 font-medium leading-relaxed">
              ¿Ya tienes una cuenta registrada?
            </p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(false);
              }}
              className="min-h-[44px] py-2.5 px-8 rounded-full border-2 border-white/90 hover:bg-white hover:text-indigo-600 text-white font-bold text-xs tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER FEATURE HIGHLIGHTS */}
      <footer className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-4 pb-2 z-10 shrink-0">
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#141419]/80 backdrop-blur-md border border-slate-200/90 dark:border-[#23232A]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Cuentas & Servicios
            </h4>
            <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              Organiza suscripciones y perfiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#141419]/80 backdrop-blur-md border border-slate-200/90 dark:border-[#23232A]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Clientes & Proveedores
            </h4>
            <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              Gestión de perfiles asignados y libres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#141419]/80 backdrop-blur-md border border-slate-200/90 dark:border-[#23232A]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Alertas de Vencimiento
            </h4>
            <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              Control de corte y recordatorios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
