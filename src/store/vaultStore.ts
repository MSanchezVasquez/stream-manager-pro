import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  deriveKey,
  generateSalt,
  saltToBase64,
  saltFromBase64,
} from "../lib/crypto";

const VAULT_META_COLLECTION = "meta";
const VAULT_META_DOC_ID = "vault";

interface VaultMetaDoc {
  salt: string; // base64
  createdAt: string;
}

interface VaultState {
  /** Clave AES-GCM derivada en memoria. null = bloqueado o sin configurar. */
  key: CryptoKey | null;
  /** true si el usuario ya desbloqueó el vault en esta sesión. */
  isUnlocked: boolean;
  /** true si el usuario ya configuró una passphrase alguna vez (existe salt en Firestore). */
  hasVaultConfigured: boolean;
  /** true mientras se verifica hasVaultConfigured al iniciar sesión. */
  isCheckingStatus: boolean;
  /** Último error legible para mostrar en la UI (ej. passphrase incorrecta). */
  error: string | null;

  checkVaultStatus: (uid: string) => Promise<void>;
  setupVault: (uid: string, passphrase: string) => Promise<boolean>;
  unlockVault: (uid: string, passphrase: string) => Promise<boolean>;
  lockVault: () => void;
  resetVaultState: () => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  key: null,
  isUnlocked: false,
  hasVaultConfigured: false,
  isCheckingStatus: false,
  error: null,

  /**
   * Consulta si el usuario ya tiene un vault configurado (existe el
   * documento con el salt). Se llama típicamente justo después del login,
   * para decidir si mostrar "Crea tu passphrase" o "Ingresa tu passphrase"
   * en el VaultUnlockModal.
   */
  checkVaultStatus: async (uid: string) => {
    if (!uid) return;
    set({ isCheckingStatus: true, error: null });
    try {
      const metaSnap = await getDoc(
        doc(db, "users", uid, VAULT_META_COLLECTION, VAULT_META_DOC_ID),
      );
      set({ hasVaultConfigured: metaSnap.exists() });
    } catch (err) {
      console.error("Error al verificar estado del vault:", err);
      set({ error: "No se pudo verificar el estado del vault." });
    } finally {
      set({ isCheckingStatus: false });
    }
  },

  /**
   * Configura el vault por PRIMERA VEZ: genera un salt nuevo, lo guarda en
   * Firestore (el salt no es secreto) y deriva + guarda la clave en memoria.
   * Si ya existía un vault configurado, esta función no debe llamarse de
   * nuevo (usar unlockVault en su lugar) para no invalidar datos ya cifrados
   * con el salt anterior.
   */
  setupVault: async (uid: string, passphrase: string): Promise<boolean> => {
    if (!uid || !passphrase) return false;
    set({ error: null });

    try {
      const existing = await getDoc(
        doc(db, "users", uid, VAULT_META_COLLECTION, VAULT_META_DOC_ID),
      );
      if (existing.exists()) {
        set({
          error:
            "Ya existe un vault configurado para esta cuenta. Usa 'Desbloquear' en vez de 'Crear'.",
        });
        return false;
      }

      const salt = generateSalt();
      const metaDoc: VaultMetaDoc = {
        salt: saltToBase64(salt),
        createdAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "users", uid, VAULT_META_COLLECTION, VAULT_META_DOC_ID),
        metaDoc,
      );

      const key = await deriveKey(passphrase, salt);
      set({ key, isUnlocked: true, hasVaultConfigured: true, error: null });
      return true;
    } catch (err) {
      console.error("Error al configurar el vault:", err);
      set({ error: "No se pudo configurar el vault. Intenta de nuevo." });
      return false;
    }
  },

  /**
   * Desbloquea un vault ya existente derivando la clave con el salt
   * guardado en Firestore + la passphrase ingresada.
   *
   * IMPORTANTE: no hay forma de "validar" matemáticamente que la passphrase
   * es correcta en este paso (PBKDF2 siempre produce una clave, correcta o
   * no). El error solo se detecta cuando se intenta descifrar un dato real
   * y falla (ver decryptText en crypto.ts). Por eso este método devuelve
   * `true` incluso si la passphrase es incorrecta; la UI debe manejar el
   * caso mostrando datos como "⚠️ No se pudo descifrar" y ofreciendo
   * reintentar.
   */
  unlockVault: async (uid: string, passphrase: string): Promise<boolean> => {
    if (!uid || !passphrase) return false;
    set({ error: null });

    try {
      const metaSnap = await getDoc(
        doc(db, "users", uid, VAULT_META_COLLECTION, VAULT_META_DOC_ID),
      );

      if (!metaSnap.exists()) {
        set({
          error: "No hay un vault configurado todavía. Crea uno primero.",
        });
        return false;
      }

      const metaData = metaSnap.data() as VaultMetaDoc;
      const salt = saltFromBase64(metaData.salt);
      const key = await deriveKey(passphrase, salt);

      set({ key, isUnlocked: true, hasVaultConfigured: true, error: null });
      return true;
    } catch (err) {
      console.error("Error al desbloquear el vault:", err);
      set({ error: "No se pudo desbloquear el vault. Intenta de nuevo." });
      return false;
    }
  },

  /**
   * Bloquea el vault: elimina la clave de memoria. Se llama típicamente
   * al cerrar sesión, o si el usuario pide "bloquear" manualmente.
   * Los datos ya cargados en dataStore volverán a mostrarse con el
   * placeholder de "🔒 Bloqueado" (ver dataStore.ts, que escucha cambios
   * de esta store para re-decidir qué mostrar).
   */
  lockVault: () => set({ key: null, isUnlocked: false }),

  /**
   * Resetea todo el estado del vault store. Se llama al cerrar sesión por
   * completo (logout), para que el siguiente usuario que inicie sesión en
   * el mismo dispositivo no herede ningún residuo de estado.
   */
  resetVaultState: () =>
    set({
      key: null,
      isUnlocked: false,
      hasVaultConfigured: false,
      isCheckingStatus: false,
      error: null,
    }),
}));
