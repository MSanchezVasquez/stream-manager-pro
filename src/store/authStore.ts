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
  User,
} from "../lib/firebase";
import { AuthResponse } from "../context/AuthContext";

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
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, loading: false });
    });
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
          errorMessage = "Correo o contraseña incorrectos. Verifica tus datos.";
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
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          error: "Se cerró la ventana de autenticación.",
        };
      }
      return {
        success: false,
        error: err.message || "Error con Google Sign-In.",
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  },
}));
