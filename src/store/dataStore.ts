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

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  suppliers: [],
  freeProfiles: [],
  quickLinks: [],
  loading: true,

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
  saveClient: async (client) => {
    // Extraemos el uid automáticamente de la otra tienda
    const uid = useAuthStore.getState().user?.uid;
    if (!uid || !client) return false;

    const previousClients = get().clients;

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
    }
    return success;
  },

  deleteClient: async (clientId) => {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid || !clientId) return false;

    const previousClients = get().clients;

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
    }
    return success;
  },

  // --- CRUD PROVEEDORES ---
  saveSupplier: async (supplier) => {
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
  },

  deleteSupplier: async (supplierId) => {
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
  },

  // --- CRUD PERFILES LIBRES ---
  saveFreeProfile: async (profile) => {
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
  },

  deleteFreeProfile: async (profileId) => {
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
  },

  saveQuickLink: async (link) => {
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
  },

  deleteQuickLink: async (linkId) => {
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
  },

  assignFreeProfileToClient: async (profile: FreeProfile, clientId: string) => {
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
      console.error("Error al asignar perfil (transacción revertida):", error);
      return false;
    }
  },

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

  importDataJSON: async (jsonStr) => {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) return false;

    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.clients) {
        set({ clients: parsed.clients });
        for (const c of parsed.clients)
          await saveUserDocument(uid, COLLECTIONS.CLIENTS, c);
      }
      return true;
    } catch (e) {
      console.error("Invalid backup JSON", e);
      return false;
    }
  },
}));
