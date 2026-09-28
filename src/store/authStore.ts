import { create } from "zustand";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  reauthenticateWithPopup,
  User,
} from "../lib/firebase";
import { useVaultStore } from "./vaultStore";

export interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initAuth: () => () => void;
  loginWithEmail: (email: string, pass: string) => Promise<AuthResponse>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
  ) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  loginAsGuest: () => Promise<AuthResponse>;
  createAccountPassword: (password: string) => Promise<AuthResponse>;
  changeAccountPassword: (password: string) => Promise<AuthResponse>;
  hasPasswordProvider: () => boolean;
  hasGoogleProvider: () => boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        set({ user: currentUser, loading: false });
      },
      (error) => {
        console.error("Error en el listener de autenticación:", error);
        set({ loading: false, user: null });
      },
    );
    return unsubscribe;
  },

  loginWithEmail: async (email, pass) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      console.error("Store Login Error:", err);
      let errorMessage = "Error inesperado al iniciar sesión.";
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage =
            "Correo o contraseña incorrectos. Si te registraste con Google y aún no creaste una contraseña, ingresa primero con Google.";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Demasiados intentos fallidos. Por favor, intenta más tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifica tu acceso a internet.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  registerWithEmail: async (email, pass, name) => {
    set({ loading: true });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && name) {
        await updateProfile(res.user, { displayName: name });
      }
      return { success: true };
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "Error al crear la cuenta.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage =
          "Este correo ya está registrado. Por favor inicia sesión.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          code: err.code,
          error: "Se cerró la ventana de autenticación con Google.",
        };
      }
      if (err.code === "auth/unauthorized-domain") {
        const domain =
          typeof window !== "undefined" ? window.location.hostname : "";
        console.warn(
          `[Firebase Auth] auth/unauthorized-domain: El dominio actual '${domain}' debe agregarse a Dominios Autorizados en Firebase Console (Authentication > Settings > Authorized Domains).`,
        );
        return {
          success: false,
          code: "auth/unauthorized-domain",
          error: `Dominio no autorizado para Google Sign-In (${domain}). Para usar Google, agrega este dominio en Firebase Console > Authentication > Settings > Dominios autorizados. Mientras tanto, puedes iniciar sesión o registrarte con correo y contraseña.`,
        };
      }
      console.warn("Google Auth notice:", err?.message || err);
      return {
        success: false,
        code: err.code,
        error: err.message || "Error con Google Sign-In.",
      };
    } finally {
      set({ loading: false });
    }
  },

  loginAsGuest: async () => {
    set({ loading: true });
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (err: any) {
      console.warn("Guest Auth notice:", err?.message || err);
      return {
        success: false,
        code: err.code,
        error:
          err.code === "auth/admin-restricted-operation" ||
          err.code === "auth/operation-not-allowed"
            ? "El acceso anónimo no está habilitado en Firebase Console. Por favor regístrate o inicia sesión con correo."
            : err.message || "Error al acceder como invitado.",
      };
    } finally {
      set({ loading: false });
    }
  },

  hasPasswordProvider: () => {
    const user = get().user || auth.currentUser;
    if (!user || !user.providerData) return false;
    return user.providerData.some((p) => p.providerId === "password");
  },

  hasGoogleProvider: () => {
    const user = get().user || auth.currentUser;
    if (!user || !user.providerData) return false;
    return user.providerData.some((p) => p.providerId === "google.com");
  },

  createAccountPassword: async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        error: "No se encontró un usuario autenticado con correo electrónico.",
      };
    }
    set({ loading: true });
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password,
      );
      await linkWithCredential(currentUser, credential);
      await currentUser.reload();
      set({ user: auth.currentUser });
      return { success: true };
    } catch (err: any) {
      console.error("Error creating password for account:", err);
      if (err.code === "auth/requires-recent-login") {
        try {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(currentUser, provider);
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            password,
          );
          await linkWithCredential(currentUser, credential);
          await currentUser.reload();
          set({ user: auth.currentUser });
          return { success: true };
        } catch (reauthErr: any) {
          return {
            success: false,
            code: reauthErr.code,
            error:
              "Por seguridad, confirma tu identidad con Google e inténtalo de nuevo.",
          };
        }
      }
      if (err.code === "auth/provider-already-linked") {
        try {
          await updatePassword(currentUser, password);
          await currentUser.reload();
          set({ user: auth.currentUser });
          return { success: true };
        } catch (upErr: any) {
          return {
            success: false,
            error: upErr?.message || "Error al actualizar la contraseña.",
          };
        }
      }
      if (err.code === "auth/weak-password") {
        return {
          success: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        };
      }
      return {
        success: false,
        error: err?.message || "No se pudo crear la contraseña.",
      };
    } finally {
      set({ loading: false });
    }
  },

  changeAccountPassword: async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        error: "No hay una sesión activa.",
      };
    }
    set({ loading: true });
    try {
      await updatePassword(currentUser, password);
      await currentUser.reload();
      set({ user: auth.currentUser });
      return { success: true };
    } catch (err: any) {
      console.error("Error changing password:", err);
      if (err.code === "auth/requires-recent-login") {
        try {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(currentUser, provider);
          await updatePassword(currentUser, password);
          await currentUser.reload();
          set({ user: auth.currentUser });
          return { success: true };
        } catch (reauthErr: any) {
          return {
            success: false,
            code: reauthErr.code,
            error:
              "Por seguridad, confirma tu identidad con Google e inténtalo de nuevo.",
          };
        }
      }
      if (err.code === "auth/weak-password") {
        return {
          success: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        };
      }
      return {
        success: false,
        error: err?.message || "No se pudo cambiar la contraseña.",
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      useVaultStore.getState().resetVaultState();
      set({ user: null });
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  },
}));
