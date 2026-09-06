import React, { useState } from "react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
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
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest } =
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

    // Aquí es donde ocurre la magia limpia:
    const result = await loginWithEmail(cleanEmail, cleanPassword);

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("¡Inicio de sesión exitoso! Accediendo...");
      // Usualmente aquí no necesitas hacer más porque el AuthProvider
      // detectará el cambio de estado y redirigirá la app automáticamente.
    } else {
      setErrorMsg(result.error || "Ocurrió un error");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    // 1. Validate Username
    if (!cleanName) {
      setErrorMsg("Por favor ingresa tu nombre de usuario.");
      return;
    }

    // 2. Validate Email
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

    // 3. Validate Password
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

  const handleGuestAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setUnauthorizedDomain(null);
    setIsSubmitting(true);
    try {
      const res = await loginAsGuest();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al ingresar como invitado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-[#0A0A0E] dark:via-[#111118] dark:to-[#08080C] text-slate-900 dark:text-[#E4E4E7] transition-colors duration-300 relative overflow-hidden">
      {/* App Header & Branding (outside auth forms) */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-2 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              GestorStreaming
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-[#8E8E9A]">
              Administración de Cuentas, Perfiles y Proveedores
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/80 dark:bg-[#1A1A22]/80 backdrop-blur-md border border-slate-200/80 dark:border-[#2D2D38] text-slate-700 dark:text-[#E4E4E7] hover:scale-105 active:scale-95 shadow-md transition-all"
          title="Cambiar tema"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </header>

      {/* Main Container Card */}
      <div className="relative w-full max-w-4xl min-h-[520px] bg-white dark:bg-[#141419] rounded-[32px] border border-slate-200/90 dark:border-[#23232A] shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
        {/* LEFT COLUMN: REGISTRATION FORM (Exposed when isRegister === true) */}
        <div
          className={`w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center transition-all duration-500 ${
            isRegister
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 text-center">
              Registration
            </h2>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              Crea tu cuenta para comenzar a gestionar
            </p>

            {errorMsg && isRegister && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs animate-fade-in space-y-2">
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
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1 shrink-0 text-[11px] transition-colors shadow-sm ml-auto"
                      >
                        {domainCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
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
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      💡 También puedes registrarte usando el formulario de correo y contraseña arriba.
                    </div>
                  </div>
                )}
              </div>
            )}

            {successMsg && isRegister && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium text-center animate-fade-in">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                  <input
                    type="text"
                    required
                    placeholder="Username / Nombre de usuario"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-[#272730] bg-slate-100/70 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                  <input
                    type="email"
                    required
                    placeholder="Email / Correo (ej. usuario@gmail.com)"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-[#272730] bg-slate-100/70 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password / Contraseña (mínimo 6 car.)"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-[#272730] bg-slate-100/70 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <CircularSpinner size={16} className="text-white" />
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center justify-center">
              <span className="text-[11px] text-slate-400 dark:text-[#71717A]">
                o regístrate con otras opciones
              </span>
            </div>

            {/* Social & Alternate Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] hover:bg-slate-100 dark:hover:bg-[#252530] flex items-center justify-center gap-2.5 text-slate-700 dark:text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm text-xs font-semibold disabled:opacity-60"
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

              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-xl border border-dashed border-slate-300 dark:border-[#2F2F3D] text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-[#1E1E28] flex items-center justify-center gap-2 transition-all text-xs font-medium disabled:opacity-60"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Explorar en Modo Demo / Invitado</span>
              </button>
            </div>

            {/* Mobile switch trigger */}
            <div className="mt-6 text-center md:hidden">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setIsRegister(false);
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM (Exposed when isRegister === false) */}
        <div
          className={`w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center transition-all duration-500 ${
            !isRegister
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 text-center">
              Login
            </h2>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              Ingresa tus credenciales para acceder al gestor
            </p>

            {errorMsg && !isRegister && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs animate-fade-in space-y-2">
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
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1 shrink-0 text-[11px] transition-colors shadow-sm ml-auto"
                      >
                        {domainCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
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
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      💡 También puedes iniciar sesión o registrarte usando correo y contraseña.
                    </div>
                  </div>
                )}
              </div>
            )}

            {successMsg && !isRegister && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium text-center animate-fade-in">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                  <input
                    type="email"
                    required
                    placeholder="Email / Correo Electrónico"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-[#272730] bg-slate-100/70 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password / Contraseña"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-[#272730] bg-slate-100/70 dark:bg-[#1C1C24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() =>
                    setErrorMsg(
                      "Por favor contacta al administrador o ingresa con Google.",
                    )
                  }
                  className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-[#94949E] dark:hover:text-indigo-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <CircularSpinner size={16} className="text-white" />
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center justify-center">
              <span className="text-[11px] text-slate-400 dark:text-[#71717A]">
                o ingresa con otras opciones
              </span>
            </div>

            {/* Social & Alternate Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#272730] bg-slate-50 dark:bg-[#1C1C24] hover:bg-slate-100 dark:hover:bg-[#252530] flex items-center justify-center gap-2.5 text-slate-700 dark:text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm text-xs font-semibold disabled:opacity-60"
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

              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-xl border border-dashed border-slate-300 dark:border-[#2F2F3D] text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-[#1E1E28] flex items-center justify-center gap-2 transition-all text-xs font-medium disabled:opacity-60"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Explorar en Modo Demo / Invitado</span>
              </button>
            </div>

            {/* Mobile switch trigger */}
            <div className="mt-6 text-center md:hidden">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setIsRegister(true);
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
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
          {/* Content when in LOGIN MODE (Prompting to Register) */}
          <div
            className={`transition-all duration-500 flex flex-col items-center max-w-xs ${
              isRegister
                ? "opacity-0 scale-95 pointer-events-none hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <h3 className="text-3xl font-extrabold mb-3 tracking-tight">
              Hello, Welcome!
            </h3>
            <p className="text-xs text-indigo-100/90 mb-8 font-medium leading-relaxed">
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(true);
              }}
              className="py-3 px-10 rounded-full border-2 border-white/90 hover:bg-white hover:text-indigo-600 text-white font-bold text-xs tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Register
            </button>
          </div>

          {/* Content when in REGISTER MODE (Prompting to Login) */}
          <div
            className={`transition-all duration-500 flex flex-col items-center max-w-xs ${
              !isRegister
                ? "opacity-0 scale-95 pointer-events-none hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <h3 className="text-3xl font-extrabold mb-3 tracking-tight">
              Welcome Back!
            </h3>
            <p className="text-xs text-indigo-100/90 mb-8 font-medium leading-relaxed">
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setIsRegister(false);
              }}
              className="py-3 px-10 rounded-full border-2 border-white/90 hover:bg-white hover:text-indigo-600 text-white font-bold text-xs tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER FEATURE HIGHLIGHTS (Informative section explaining the app) */}
      <footer className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 z-10">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-[#141419]/60 backdrop-blur-md border border-slate-200/80 dark:border-[#23232A]">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              Cuentas & Servicios
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#8E8E9A]">
              Organiza suscripciones y perfiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-[#141419]/60 backdrop-blur-md border border-slate-200/80 dark:border-[#23232A]">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              Clientes & Proveedores
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#8E8E9A]">
              Gestión de perfiles asignados y libres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-[#141419]/60 backdrop-blur-md border border-slate-200/80 dark:border-[#23232A]">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              Alertas de Vencimiento
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#8E8E9A]">
              Control de corte y recordatorios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
