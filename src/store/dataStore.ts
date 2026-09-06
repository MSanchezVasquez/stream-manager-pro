import { create } from "zustand";
import { doc, runTransaction } from "firebase/firestore";
import {
  Client,
  Supplier,
  FreeProfile,
  QuickLink,
  ClientSubscription,
} from "../types";
import {
  db,
  COLLECTIONS,
  subscribeUserCollection,
  saveUserDocument,
  deleteUserDocument,
} from "../lib/firebase";
import { useAuthStore } from "./authStore";

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
const restoreFreeProfilesFromSubscriptions = async (
  uid: string,
  subscriptions: ClientSubscription[],
  currentFreeProfiles: FreeProfile[],
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
      await saveUserDocument(uid, COLLECTIONS.FREE_PROFILES, incremented);
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
        browser:
          sub.freeProfileSnapshot?.browser ||
          "Google Chrome",
        notes: sub.freeProfileSnapshot?.notes || sub.notes || "",
      };
      updatedProfiles.push(restoredProfile);
      await saveUserDocument(uid, COLLECTIONS.FREE_PROFILES, restoredProfile);
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

      const unsubClients = subscribeUserCollection<Client>(
        uid,
        COLLECTIONS.CLIENTS,
        (data) => set({ clients: data, loading: false }),
        [],
      );
      const unsubSuppliers = subscribeUserCollection<Supplier>(
        uid,
        COLLECTIONS.SUPPLIERS,
        (data) => set({ suppliers: data }),
        [],
      );
      const unsubProfiles = subscribeUserCollection<FreeProfile>(
        uid,
        COLLECTIONS.FREE_PROFILES,
        (data) => set({ freeProfiles: data }),
        [],
      );
      const unsubLinks = subscribeUserCollection<QuickLink>(
        uid,
        COLLECTIONS.QUICK_LINKS,
        (data) => set({ quickLinks: data }),
        [],
      );

      return () => {
        unsubClients();
        unsubSuppliers();
        unsubProfiles();
        unsubLinks();
      };
    },

    // --- CRUD CLIENTES ---
    saveClient: async (client) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !client) return false;

        const previousClients = get().clients;
        const existingClient = previousClients.find((c) => c?.id === client.id);

        set((state) => {
          const idx = state.clients.findIndex((c) => c?.id === client.id);
          if (idx >= 0) {
            const newClients = [...state.clients];
            newClients[idx] = client;
            return { clients: newClients };
          }
          return { clients: [client, ...state.clients] };
        });

        const success = await saveUserDocument(uid, COLLECTIONS.CLIENTS, client);
        if (!success) {
          // Rollback
          set({ clients: previousClients });
          return false;
        }

        // Si al editar el cliente se eliminaron suscripciones que venían de Perfiles Libres, restaurarlas
        if (existingClient?.subscriptions) {
          const newSubIds = new Set((client.subscriptions || []).map((s) => s.id));
          const removedSubs = existingClient.subscriptions.filter(
            (s) => !newSubIds.has(s.id),
          );
          if (removedSubs.length > 0) {
            try {
              const updatedProfiles = await restoreFreeProfilesFromSubscriptions(
                uid,
                removedSubs,
                get().freeProfiles,
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

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.SUPPLIERS,
          supplier,
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

        const success = await saveUserDocument(
          uid,
          COLLECTIONS.FREE_PROFILES,
          profile,
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

        const success = await saveUserDocument(uid, COLLECTIONS.QUICK_LINKS, link);
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

    assignFreeProfileToClient: async (
      profile: FreeProfile,
      clientId: string,
    ) =>
      withSync(async () => {
        const uid = useAuthStore.getState().user?.uid;
        if (!uid || !profile || !clientId) return false;

        const clientDocRef = doc(db, "users", uid, COLLECTIONS.CLIENTS, clientId);
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

              const currentClient = clientSnap.data() as Client;
              const currentProfile = profileSnap.data() as FreeProfile;

              if (currentProfile.quantity < 1) {
                throw new Error("No quedan unidades disponibles de este perfil.");
              }

              const newSubscription: ClientSubscription = {
                id: crypto.randomUUID(),
                clientId,
                clientName: currentClient.name,
                serviceName: currentProfile.serviceName,
                hireDate: new Date().toISOString().split("T")[0],
                cutDate: "",
                email: currentProfile.email,
                password: currentProfile.password,
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

          set((state) => ({
            clients: state.clients.map((c) =>
              c.id === clientId ? updatedClient : c,
            ),
            freeProfiles: updatedProfile
              ? state.freeProfiles.map((p) =>
                  p.id === profile.id ? updatedProfile! : p,
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

        try {
          const parsed = JSON.parse(jsonStr);

          if (Array.isArray(parsed.clients)) {
            set({ clients: parsed.clients });
            for (const c of parsed.clients)
              await saveUserDocument(uid, COLLECTIONS.CLIENTS, c);
          }

          if (Array.isArray(parsed.suppliers)) {
            set({ suppliers: parsed.suppliers });
            for (const s of parsed.suppliers)
              await saveUserDocument(uid, COLLECTIONS.SUPPLIERS, s);
          }

          if (Array.isArray(parsed.freeProfiles)) {
            set({ freeProfiles: parsed.freeProfiles });
            for (const p of parsed.freeProfiles)
              await saveUserDocument(uid, COLLECTIONS.FREE_PROFILES, p);
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
