import { create } from "zustand";
import { doc, runTransaction } from "firebase/firestore";
import {
  Client,
  Supplier,
  FreeProfile,
  QuickLink,
  ClientSubscription,
  SupplierAccount,
} from "../types";
import {
  db,
  COLLECTIONS,
  subscribeUserCollection,
  saveUserDocument,
  deleteUserDocument,
} from "../lib/firebase";
import { useAuthStore } from "./authStore";
import { useVaultStore } from "./vaultStore";
import { encryptText, decryptText, isEncryptedPayload } from "../lib/crypto";

const LOCKED_PLACEHOLDER = "🔒 Bloqueado";
const DECRYPT_ERROR_PLACEHOLDER = "⚠️ No se pudo descifrar";

interface DataState {
  clients: Client[];
  suppliers: Supplier[];
  freeProfiles: FreeProfile[];
  quickLinks: QuickLink[];
  loading: boolean;
  isSyncing: boolean;
  setIsSyncing: (isSyncing: boolean) => void;

  subscribeToData: (uid: string | null) => () => void;
  saveClient: (client: Client) => Promise<boolean>;
  deleteClient: (clientId: string) => Promise<boolean>;
  saveSupplier: (supplier: Supplier) => Promise<boolean>;
  deleteSupplier: (supplierId: string) => Promise<boolean>;
  saveFreeProfile: (profile: FreeProfile) => Promise<boolean>;
  deleteFreeProfile: (profileId: string) => Promise<boolean>;
  saveQuickLink: (link: QuickLink) => Promise<boolean>;
  deleteQuickLink: (linkId: string) => Promise<boolean>;
  assignFreeProfileToClient: (
    profile: FreeProfile,
    clientId: string,
  ) => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => Promise<boolean>;
}

// ============================================================
// HELPERS DE CIFRADO / DESCIFRADO
// ============================================================
// Estrategia: los datos SIEMPRE se persisten en Firestore cifrados
// (si hay un vault configurado y desbloqueado al momento de guardar).
// En memoria (estado de Zustand / lo que ve la UI) siempre viven
// DESCIFRADOS para que los componentes existentes (ClientCard,
// SupplierList, etc.) no necesiten saber nada sobre cifrado.
//
// Si el vault está bloqueado:
//   - Al guardar: se persiste tal cual (sin cifrar) si nunca hubo
//     vault configurado, o se rechaza el guardado de campos sensibles
//     si el vault existe pero está bloqueado (ver saveClient).
//   - Al leer: los campos que vienen cifrados desde Firestore se
//     reemplazan por un placeholder visual en vez de mostrar ciphertext.

/**
 * Cifra un campo de texto sensible solo si hay una clave de vault activa.
 * Si no hay clave (vault nunca configurado), devuelve el texto tal cual
 * (comportamiento legado, retrocompatible).
 */
async function encryptField(
  value: string | undefined,
  key: CryptoKey | null,
): Promise<string | undefined> {
  if (!value) return value;
  if (!key) return value; // Sin vault configurado: se guarda en claro (legado)
  return encryptText(value, key);
}

/**
 * Descifra un campo de texto sensible.
 * - Si el valor no está cifrado (dato legado en texto plano), lo devuelve tal cual.
 * - Si está cifrado pero no hay clave (vault bloqueado), devuelve un placeholder.
 * - Si está cifrado y hay clave pero falla el descifrado (passphrase incorrecta
 *   o dato corrupto), devuelve un placeholder de error.
 */
async function decryptField(
  value: string | undefined,
  key: CryptoKey | null,
): Promise<string | undefined> {
  if (!value) return value;
  if (!isEncryptedPayload(value)) return value; // dato legado sin cifrar

  if (!key) return LOCKED_PLACEHOLDER;

  try {
    return await decryptText(value, key);
  } catch {
    return DECRYPT_ERROR_PLACEHOLDER;
  }
}

async function encryptSubscription(
  sub: ClientSubscription,
  key: CryptoKey | null,
): Promise<ClientSubscription> {
  return {
    ...sub,
    password: await encryptField(sub.password, key),
    pin: await encryptField(sub.pin, key),
    freeProfileSnapshot: sub.freeProfileSnapshot
      ? {
          ...sub.freeProfileSnapshot,
          password: await encryptField(sub.freeProfileSnapshot.password, key),
        }
      : sub.freeProfileSnapshot,
  };
}

async function decryptSubscription(
  sub: ClientSubscription,
  key: CryptoKey | null,
): Promise<ClientSubscription> {
  return {
    ...sub,
    password: await decryptField(sub.password, key),
    pin: await decryptField(sub.pin, key),
    freeProfileSnapshot: sub.freeProfileSnapshot
      ? {
          ...sub.freeProfileSnapshot,
          password: await decryptField(sub.freeProfileSnapshot.password, key),
        }
      : sub.freeProfileSnapshot,
  };
}

async function encryptClient(
  client: Client,
  key: CryptoKey | null,
): Promise<Client> {
  return {
    ...client,
    subscriptions: await Promise.all(
      client.subscriptions.map((s) => encryptSubscription(s, key)),
    ),
  };
}

async function decryptClient(
  client: Client,
  key: CryptoKey | null,
): Promise<Client> {
  return {
    ...client,
    subscriptions: await Promise.all(
      client.subscriptions.map((s) => decryptSubscription(s, key)),
    ),
  };
}

async function encryptSupplierAccount(
  acc: SupplierAccount,
  key: CryptoKey | null,
): Promise<SupplierAccount> {
  return { ...acc, password: (await encryptField(acc.password, key)) || "" };
}

async function decryptSupplierAccount(
  acc: SupplierAccount,
  key: CryptoKey | null,
): Promise<SupplierAccount> {
  return { ...acc, password: (await decryptField(acc.password, key)) || "" };
}

async function encryptSupplier(
  supplier: Supplier,
  key: CryptoKey | null,
): Promise<Supplier> {
  return {
    ...supplier,
    accounts: await Promise.all(
      supplier.accounts.map((a) => encryptSupplierAccount(a, key)),
    ),
  };
}

async function decryptSupplier(
  supplier: Supplier,
  key: CryptoKey | null,
): Promise<Supplier> {
  return {
    ...supplier,
    accounts: await Promise.all(
      supplier.accounts.map((a) => decryptSupplierAccount(a, key)),
    ),
  };
}

async function encryptFreeProfile(
  profile: FreeProfile,
  key: CryptoKey | null,
): Promise<FreeProfile> {
  return {
    ...profile,
    password: (await encryptField(profile.password, key)) || "",
  };
}

async function decryptFreeProfile(
  profile: FreeProfile,
  key: CryptoKey | null,
): Promise<FreeProfile> {
  return {
    ...profile,
    password: (await decryptField(profile.password, key)) || "",
  };
}

// ============================================================

// Helper para identificar si una suscripción proviene de Perfiles Libres
export const isSubscriptionFromFreeProfile = (
  sub: ClientSubscription,
  existingFreeProfiles: FreeProfile[] = [],
): boolean => {
  if (sub.isFromFreeProfile || sub.freeProfileId || sub.freeProfileSnapshot) {
    return true;
  }
  // Si no tiene proveedor asignado y coincide en plataforma y correo con un perfil libre existente
  if (
    !sub.supplierName &&
    sub.email &&
    existingFreeProfiles.some(
      (fp) =>
        fp.serviceName === sub.serviceName &&
        fp.email?.toLowerCase().trim() === sub.email?.toLowerCase().trim(),
    )
  ) {
    return true;
  }
  return false;
};

// Helper para restaurar el inventario de perfiles libres a partir de suscripciones eliminadas
// NOTA: las suscripciones que llegan aquí ya están DESCIFRADAS (vienen del estado en memoria),
// así que se vuelven a cifrar antes de persistir el perfil restaurado.
const restoreFreeProfilesFromSubscriptions = async (
  uid: string,
  subscriptions: ClientSubscription[],
  currentFreeProfiles: FreeProfile[],
  vaultKey: CryptoKey | null,
): Promise<FreeProfile[]> => {
  const subsToRestore = subscriptions.filter((sub) =>
    isSubscriptionFromFreeProfile(sub, currentFreeProfiles),
  );

  if (subsToRestore.length === 0) {
    return currentFreeProfiles;
  }

  let updatedProfiles = [...currentFreeProfiles];

  for (const sub of subsToRestore) {
    const matchIdx = updatedProfiles.findIndex((fp) => {
      if (sub.freeProfileId && fp.id === sub.freeProfileId) return true;
      if (
        sub.email &&
        fp.serviceName === sub.serviceName &&
        fp.email.toLowerCase().trim() === sub.email.toLowerCase().trim()
      ) {
        return true;
      }
      return false;
    });

    if (matchIdx >= 0) {
      const existing = updatedProfiles[matchIdx];
      const incremented: FreeProfile = {
        ...existing,
        quantity: (existing.quantity || 0) + 1,
      };
      updatedProfiles[matchIdx] = incremented;
      await saveUserDocument(
        uid,
        COLLECTIONS.FREE_PROFILES,
        await encryptFreeProfile(incremented, vaultKey),
      );
    } else {
      const restoredProfile: FreeProfile = {
        id:
          sub.freeProfileSnapshot?.id ||
          sub.freeProfileId ||
          `fp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        serviceName: sub.serviceName,
        quantity: 1,
        email: sub.email || sub.freeProfileSnapshot?.email || "",
        password: sub.password || sub.freeProfileSnapshot?.password || "",
        browser: sub.freeProfileSnapshot?.browser || "Google Chrome",
        notes: sub.freeProfileSnapshot?.notes || sub.notes || "",
      };
      updatedProfiles.push(restoredProfile);
      await saveUserDocument(
        uid,
        COLLECTIONS.FREE_PROFILES,
        await encryptFreeProfile(restoredProfile, vaultKey),
      );
    }
  }

  return updatedProfiles;
};

export const useDataStore = create<DataState>((set, get) => {
  const withSync = async <T>(operation: () => Promise<T>): Promise<T> => {
    set({ isSyncing: true });
    try {
      return await operation();
    } finally {
      set({ isSyncing: false });
    }
  };

  /** Clave de vault vigente en este instante (puede ser null = bloqueado/sin configurar) */
  const getVaultKey = () => useVaultStore.getState().key;

  return {
    clients: [],
    suppliers: [],
    freeProfiles: [],
    quickLinks: [],
    loading: true,
    isSyncing: false,
    setIsSyncing: (isSyncing) => set({ isSyncing }),

    subscribeToData: (uid) => {
      if (!uid) {
        set({
          clients: [],
          suppliers: [],
          freeProfiles: [],
          quickLinks: [],
          loading: false,
        });
        return () => {};
      }

      set({ loading: true });

      // Guardamos la última versión "cruda" (tal como llega de Firestore,
      // potencialmente cifrada) para poder re-descifrar cuando el usuario
      // desbloquee el vault después de que los datos ya se cargaron.
      let lastRawClients: Client[] = [];
      let lastRawSuppliers: Supplier[] = [];
      let lastRawFreeProfiles: FreeProfile[] = [];

      const applyClients = async () => {
        const key = getVaultKey();
        const decrypted = await Promise.all(
          lastRawClients.map((c) => decryptClient(c, key)),
        );
        set({ clients: decrypted, loading: false });
      };

      const applySuppliers = async () => {
        const key = getVaultKey();
        const decrypted = await Promise.all(
          lastRawSuppliers.map((s) => decryptSupplier(s, key)),
        );
        set({ suppliers: decrypted });
      };

      const applyFreeProfiles = async () => {
        const key = getVaultKey();
        const decrypted = await Promise.all(
          lastRawFreeProfiles.map((p) => decryptFreeProfile(p, key)),
        );
        set({ freeProfiles: decrypted });
      };

      const unsubClients = subscribeUserCollection<Client>(
        uid,
        COLLECTIONS.CLIENTS,
        (data) => {
          lastRawClients = data;
          applyClients();
        },
        [],
      );
      const unsubSuppliers = subscribeUserCollection<Supplier>(
        uid,
        COLLECTIONS.SUPPLIERS,
        (data) => {
          lastRawSuppliers = data;
          applySuppliers();
        },
        [],
      );
      const unsubProfiles = subscribeUserCollection<FreeProfile>(
        uid,
        COLLECTIONS.FREE_PROFILES,
        (data) => {
          lastRawFreeProfiles = data;
          applyFreeProfiles();
        },
        [],
      );
      const unsubLinks = subscribeUserCollection<QuickLink>(
        uid,
        COLLECTIONS.QUICK_LINKS,
        (data) => set({ quickLinks: data }),
        [],
      );

      // Cuando el vault se desbloquea/bloquea (ej. el usuario ingresa la
      // passphrase en el modal), volvemos a descifrar los datos ya cargados
      // sin esperar un nuevo snapshot de Firestore.
      const unsubVault = useVaultStore.subscribe((state, prevState) => {
        if (state.key !== prevState.key) {
          applyClients();
          applySuppliers();
          applyFreeProfiles();
        }
      });

      return () => {
        unsubClients();
        unsubSuppliers();
        unsubProfiles();
        unsubLinks();
        unsubVault();
      };
    },

    // --- CRUD CLIENTES ---
    saveClient: async (client) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !client) return false;

        const vaultKey = getVaultKey();
        const previousClients = get().clients;
        const existingClient = previousClients.find((c) => c?.id === client.id);

        // Actualiza el estado local (en claro) de forma optimista
        set((state) => {
          const idx = state.clients.findIndex((c) => c?.id === client.id);
          if (idx >= 0) {
            const newClients = [...state.clients];
            newClients[idx] = client;
            return { clients: newClients };
          }
          return { clients: [client, ...state.clients] };
        });

        // Cifra antes de persistir en Firestore
        const clientToPersist = await encryptClient(client, vaultKey);

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.CLIENTS,
          clientToPersist,
        );
        if (!success) {
          // Rollback
          set({ clients: previousClients });
          return false;
        }

        // Si al editar el cliente se eliminaron suscripciones que venían de Perfiles Libres, restaurarlas
        if (existingClient?.subscriptions) {
          const newSubIds = new Set(
            (client.subscriptions || []).map((s) => s.id),
          );
          const removedSubs = existingClient.subscriptions.filter(
            (s) => !newSubIds.has(s.id),
          );
          if (removedSubs.length > 0) {
            try {
              const updatedProfiles =
                await restoreFreeProfilesFromSubscriptions(
                  uid,
                  removedSubs,
                  get().freeProfiles,
                  vaultKey,
                );
              set({ freeProfiles: updatedProfiles });
            } catch (err) {
              console.error(
                "Error al restaurar perfiles libres tras modificar suscripciones:",
                err,
              );
            }
          }
        }

        return true;
      }),

    deleteClient: async (clientId) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !clientId) return false;

        const vaultKey = getVaultKey();
        const previousClients = get().clients;
        const clientToDelete = previousClients.find((c) => c?.id === clientId);

        set((state) => ({
          clients: state.clients.filter((c) => c?.id !== clientId),
        }));

        const success = await deleteUserDocument(
          uid,
          COLLECTIONS.CLIENTS,
          clientId,
        );
        if (!success) {
          set({ clients: previousClients });
          return false;
        }

        // Si el cliente eliminado tenía suscripciones que provenían de Perfiles Libres, restaurar su stock
        if (
          clientToDelete?.subscriptions &&
          clientToDelete.subscriptions.length > 0
        ) {
          try {
            const updatedProfiles = await restoreFreeProfilesFromSubscriptions(
              uid,
              clientToDelete.subscriptions,
              get().freeProfiles,
              vaultKey,
            );
            set({ freeProfiles: updatedProfiles });
          } catch (err) {
            console.error(
              "Error al restaurar perfiles libres tras eliminar cliente:",
              err,
            );
          }
        }

        return true;
      }),

    // --- CRUD PROVEEDORES ---
    saveSupplier: async (supplier) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !supplier) return false;

        const vaultKey = getVaultKey();
        const previousSuppliers = get().suppliers;

        set((state) => {
          const idx = state.suppliers.findIndex((s) => s?.id === supplier.id);
          if (idx >= 0) {
            const newSuppliers = [...state.suppliers];
            newSuppliers[idx] = supplier;
            return { suppliers: newSuppliers };
          }
          return { suppliers: [supplier, ...state.suppliers] };
        });

        const supplierToPersist = await encryptSupplier(supplier, vaultKey);

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.SUPPLIERS,
          supplierToPersist,
        );
        if (!success) {
          set({ suppliers: previousSuppliers });
        }
        return success;
      }),

    deleteSupplier: async (supplierId) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !supplierId) return false;

        const previousSuppliers = get().suppliers;

        set((state) => ({
          suppliers: state.suppliers.filter((s) => s?.id !== supplierId),
        }));

        const success = await deleteUserDocument(
          uid,
          COLLECTIONS.SUPPLIERS,
          supplierId,
        );
        if (!success) {
          set({ suppliers: previousSuppliers });
        }
        return success;
      }),

    // --- CRUD PERFILES LIBRES ---
    saveFreeProfile: async (profile) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !profile) return false;

        const vaultKey = getVaultKey();
        const previousProfiles = get().freeProfiles;

        set((state) => {
          const idx = state.freeProfiles.findIndex((p) => p?.id === profile.id);
          if (idx >= 0) {
            const newProfiles = [...state.freeProfiles];
            newProfiles[idx] = profile;
            return { freeProfiles: newProfiles };
          }
          return { freeProfiles: [profile, ...state.freeProfiles] };
        });

        const profileToPersist = await encryptFreeProfile(profile, vaultKey);

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.FREE_PROFILES,
          profileToPersist,
        );
        if (!success) {
          set({ freeProfiles: previousProfiles });
        }
        return success;
      }),

    deleteFreeProfile: async (profileId) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !profileId) return false;

        const previousProfiles = get().freeProfiles;

        set((state) => ({
          freeProfiles: state.freeProfiles.filter((p) => p?.id !== profileId),
        }));

        const success = await deleteUserDocument(
          uid,
          COLLECTIONS.FREE_PROFILES,
          profileId,
        );
        if (!success) {
          set({ freeProfiles: previousProfiles });
        }
        return success;
      }),

    saveQuickLink: async (link) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !link) return false;

        const previousLinks = get().quickLinks;

        set((state) => {
          const idx = state.quickLinks.findIndex((l) => l?.id === link.id);
          if (idx >= 0) {
            const newLinks = [...state.quickLinks];
            newLinks[idx] = link;
            return { quickLinks: newLinks };
          }
          return { quickLinks: [link, ...state.quickLinks] };
        });

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.QUICK_LINKS,
          link,
        );
        if (!success) {
          set({ quickLinks: previousLinks });
        }
        return success;
      }),

    deleteQuickLink: async (linkId) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !linkId) return false;

        const previousLinks = get().quickLinks;

        set((state) => ({
          quickLinks: state.quickLinks.filter((l) => l?.id !== linkId),
        }));

        const success = await deleteUserDocument(
          uid,
          COLLECTIONS.QUICK_LINKS,
          linkId,
        );
        if (!success) {
          set({ quickLinks: previousLinks });
        }
        return success;
      }),

    assignFreeProfileToClient: async (profile: FreeProfile, clientId: string) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !profile || !clientId) return false;

        const vaultKey = getVaultKey();
        const clientDocRef = doc(
          db,
          "users",
          uid,
          COLLECTIONS.CLIENTS,
          clientId,
        );
        const profileDocRef = doc(
          db,
          "users",
          uid,
          COLLECTIONS.FREE_PROFILES,
          profile.id,
        );

        try {
          const { updatedClient, updatedProfile } = await runTransaction(
            db,
            async (transaction) => {
              const clientSnap = await transaction.get(clientDocRef);
              const profileSnap = await transaction.get(profileDocRef);

              if (!clientSnap.exists()) {
                throw new Error("El cliente ya no existe.");
              }
              if (!profileSnap.exists()) {
                throw new Error(
                  "El perfil libre ya no está disponible (puede que otro usuario/pestaña ya lo haya asignado).",
                );
              }

              // Estos documentos están tal como se guardaron en Firestore
              // (potencialmente cifrados). El perfil libre se copia
              // "tal cual" (mismo ciphertext) hacia la nueva suscripción,
              // así que no hace falta descifrar/cifrar aquí: el password
              // ya cifrado del perfil se reutiliza directamente.
              const currentClient = clientSnap.data() as Client;
              const currentProfile = profileSnap.data() as FreeProfile;

              if (currentProfile.quantity < 1) {
                throw new Error(
                  "No quedan unidades disponibles de este perfil.",
                );
              }

              const newSubscription: ClientSubscription = {
                id: crypto.randomUUID(),
                clientId,
                clientName: currentClient.name,
                serviceName: currentProfile.serviceName,
                hireDate: new Date().toISOString().split("T")[0],
                cutDate: "",
                email: currentProfile.email,
                password: currentProfile.password, // ya viene cifrado (o en claro si no hay vault)
                profileName: "",
                pin: "",
                status: "active",
                notes: currentProfile.notes || "",
                price: 0,
                isFromFreeProfile: true,
                freeProfileId: profile.id,
                freeProfileSnapshot: {
                  id: profile.id,
                  serviceName: currentProfile.serviceName,
                  email: currentProfile.email,
                  password: currentProfile.password,
                  browser: currentProfile.browser || "Google Chrome",
                  notes: currentProfile.notes || "",
                },
              };

              const updatedClient: Client = {
                ...currentClient,
                id: clientId,
                subscriptions: [
                  ...(currentClient.subscriptions || []),
                  newSubscription,
                ],
              };

              let updatedProfile: FreeProfile | null = null;

              if (currentProfile.quantity > 1) {
                updatedProfile = {
                  ...currentProfile,
                  id: profile.id,
                  quantity: currentProfile.quantity - 1,
                };
                transaction.set(profileDocRef, updatedProfile, { merge: true });
              } else {
                transaction.delete(profileDocRef);
              }

              transaction.set(clientDocRef, updatedClient, { merge: true });

              return { updatedClient, updatedProfile };
            },
          );

          // Lo que viene de la transacción está cifrado (si aplica);
          // se descifra antes de guardarlo en el estado en memoria.
          const decryptedClient = await decryptClient(updatedClient, vaultKey);
          const decryptedProfile = updatedProfile
            ? await decryptFreeProfile(updatedProfile, vaultKey)
            : null;

          set((state) => ({
            clients: state.clients.map((c) =>
              c.id === clientId ? decryptedClient : c,
            ),
            freeProfiles: decryptedProfile
              ? state.freeProfiles.map((p) =>
                  p.id === profile.id ? decryptedProfile! : p,
                )
              : state.freeProfiles.filter((p) => p.id !== profile.id),
          }));

          return true;
        } catch (error) {
          console.error(
            "Error al asignar perfil (transacción revertida):",
            error,
          );
          return false;
        }
      }),

    // --- BACKUP ---
    // ⚠️ El export contiene contraseñas DESCIFRADAS (tal como están en
    // memoria). Si vas a permitir esta exportación, muestra una advertencia
    // explícita en la UI (UserProfile.tsx) antes de descargar el archivo.
    exportDataJSON: () => {
      const { clients, suppliers, freeProfiles, quickLinks } = get();
      const backup = {
        clients,
        suppliers,
        freeProfiles,
        quickLinks,
        exportedAt: new Date().toISOString(),
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
    },

    importDataJSON: async (jsonStr) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid) return false;

        const vaultKey = getVaultKey();

        try {
          const parsed = JSON.parse(jsonStr);

          // El JSON importado se asume en TEXTO PLANO (formato del backup),
          // así que se cifra antes de persistir si hay un vault activo.
          if (Array.isArray(parsed.clients)) {
            set({ clients: parsed.clients });
            for (const c of parsed.clients) {
              const encrypted = await encryptClient(c, vaultKey);
              await saveUserDocument(uid, COLLECTIONS.CLIENTS, encrypted);
            }
          }

          if (Array.isArray(parsed.suppliers)) {
            set({ suppliers: parsed.suppliers });
            for (const s of parsed.suppliers) {
              const encrypted = await encryptSupplier(s, vaultKey);
              await saveUserDocument(uid, COLLECTIONS.SUPPLIERS, encrypted);
            }
          }

          if (Array.isArray(parsed.freeProfiles)) {
            set({ freeProfiles: parsed.freeProfiles });
            for (const p of parsed.freeProfiles) {
              const encrypted = await encryptFreeProfile(p, vaultKey);
              await saveUserDocument(uid, COLLECTIONS.FREE_PROFILES, encrypted);
            }
          }

          if (Array.isArray(parsed.quickLinks)) {
            set({ quickLinks: parsed.quickLinks });
            for (const l of parsed.quickLinks)
              await saveUserDocument(uid, COLLECTIONS.QUICK_LINKS, l);
          }

          return true;
        } catch (e) {
          console.error("Invalid backup JSON", e);
          return false;
        }
      }),
  };
});
