import { create } from "zustand";
import {
  deriveKey,
  generateSalt,
  saltToBase64,
  saltFromBase64,
} from "../lib/crypto";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface VaultState {
  key: CryptoKey | null;
  isUnlocked: boolean;
  hasVaultConfigured: boolean; // si el usuario ya definió una passphrase antes
  checkVaultStatus: (uid: string) => Promise<void>;
  setupVault: (uid: string, passphrase: string) => Promise<void>;
  unlockVault: (uid: string, passphrase: string) => Promise<boolean>;
  lockVault: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  key: null,
  isUnlocked: false,
  hasVaultConfigured: false,

  checkVaultStatus: async (uid) => {
    const saltDoc = await getDoc(doc(db, "users", uid, "meta", "vault"));
    set({ hasVaultConfigured: saltDoc.exists() });
  },

  setupVault: async (uid, passphrase) => {
    const salt = generateSalt();
    await setDoc(doc(db, "users", uid, "meta", "vault"), {
      salt: saltToBase64(salt),
      createdAt: new Date().toISOString(),
    });
    const key = await deriveKey(passphrase, salt);
    set({ key, isUnlocked: true, hasVaultConfigured: true });
  },

  unlockVault: async (uid, passphrase) => {
    const saltDoc = await getDoc(doc(db, "users", uid, "meta", "vault"));
    if (!saltDoc.exists()) return false;

    const salt = saltFromBase64(saltDoc.data().salt);
    const key = await deriveKey(passphrase, salt);
    // No hay forma de "verificar" la passphrase sin intentar descifrar algo;
    // se valida en el primer intento real de descifrado en la UI.
    set({ key, isUnlocked: true });
    return true;
  },

  lockVault: () => set({ key: null, isUnlocked: false }),
}));
