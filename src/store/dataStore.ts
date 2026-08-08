import { create } from "zustand";
import {
  Client,
  Supplier,
  FreeProfile,
  QuickLink,
  ClientSubscription,
} from "../types";
import {
  COLLECTIONS,
  subscribeUserCollection,
  saveUserDocument,
  deleteUserDocument,
  clearUserCollection,
} from "../lib/firebase";

interface DataState {
  clients: Client[];
  suppliers: Supplier[];
  freeProfiles: FreeProfile[];
  quickLinks: QuickLink[];
  loading: boolean;

  // Acciones
  subscribeToData: (uid: string | null) => () => void;
  saveClient: (uid: string, client: Client) => Promise<boolean>;
  deleteClient: (uid: string, clientId: string) => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (uid: string, jsonStr: string) => Promise<boolean>;
  // ... (puedes agregar saveSupplier, saveFreeProfile siguiendo el mismo patrón)
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  suppliers: [],
  freeProfiles: [],
  quickLinks: [],
  loading: true,

  subscribeToData: (uid) => {
    if (!uid) {
      // Si no hay usuario, limpiamos el estado
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

  saveClient: async (uid, client) => {
    // Actualización optimista local
    set((state) => {
      const idx = state.clients.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const newClients = [...state.clients];
        newClients[idx] = client;
        return { clients: newClients };
      }
      return { clients: [client, ...state.clients] };
    });
    // Guardado en Firebase
    return await saveUserDocument(uid, COLLECTIONS.CLIENTS, client);
  },

  deleteClient: async (uid, clientId) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== clientId),
    }));
    return await deleteUserDocument(uid, COLLECTIONS.CLIENTS, clientId);
  },

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

  importDataJSON: async (uid, jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.clients) {
        set({ clients: parsed.clients });
        for (const c of parsed.clients)
          await saveUserDocument(uid, COLLECTIONS.CLIENTS, c);
      }
      // ... Repetir para proveedores y perfiles
      return true;
    } catch (e) {
      console.error("Invalid backup JSON", e);
      return false;
    }
  },
}));
