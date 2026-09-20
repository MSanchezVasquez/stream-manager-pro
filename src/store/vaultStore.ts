import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  deriveKey,
  generateSalt,
  saltToBase64,
  saltFromBase64,
  encryptText,
  decryptText,
} from "../lib/crypto";

const VAULT_META_COLLECTION = "meta";
const VAULT_META_DOC_ID = "vault";

// Texto conocido que se cifra al crear el vault y se intenta descifrar al
// desbloquear. Si el resultado no coincide con esta constante, la
// passphrase ingresada es incorrecta (o el dato está corrupto).
const VAULT_CHECK_PLAINTEXT = "vault_check_ok";

interface VaultMetaDoc {
  salt: string; // base64
  check: string; // VAULT_CHECK_PLAINTEXT cifrado con la clave real
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
   * documento con el salt). Debe llamarse en cuanto se conoce el uid del
   * usuario autenticado (ej. en App.tsx, junto a subscribeToData), NO solo
   * cuando se abre el modal — de lo contrario hasVaultConfigured vuelve a
   * false en cada recarga y el indicador visual desaparece aunque el vault
   * siga existiendo en Firestore.
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
   * Configura el vault por PRIMERA VEZ: genera un salt nuevo, cifra un
   * valor de verificación conocido (VAULT_CHECK_PLAINTEXT) con la clave
   * recién derivada, y guarda ambos en Firestore (ni el salt ni el
   * ciphertext de verificación son secretos por sí solos: sin la
   * passphrase no revelan nada útil).
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
      const key = await deriveKey(passphrase, salt);
      const check = await encryptText(VAULT_CHECK_PLAINTEXT, key);

      const metaDoc: VaultMetaDoc = {
        salt: saltToBase64(salt),
        check,
        createdAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "users", uid, VAULT_META_COLLECTION, VAULT_META_DOC_ID),
        metaDoc,
      );

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
   * guardado en Firestore + la passphrase ingresada, y la VALIDA
   * descifrando el valor de verificación. Si la passphrase es incorrecta,
   * el descifrado falla (o produce basura) y esta función devuelve false
   * sin tocar `key`/`isUnlocked` — la UI se queda bloqueada y muestra el
   * error, en vez de aceptar cualquier passphrase silenciosamente.
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

      // Validación real: intentamos descifrar el valor de verificación.
      // Si metaData.check no existe (vault creado antes de este fix),
      // no podemos validar y aceptamos la clave como antes (retrocompatible).
      if (metaData.check) {
        let decryptedCheck: string;
        try {
          decryptedCheck = await decryptText(metaData.check, key);
        } catch {
          set({
            error: "Passphrase incorrecta. Verifica e inténtalo de nuevo.",
          });
          return false;
        }

        if (decryptedCheck !== VAULT_CHECK_PLAINTEXT) {
          set({
            error: "Passphrase incorrecta. Verifica e inténtalo de nuevo.",
          });
          return false;
        }
      }

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
