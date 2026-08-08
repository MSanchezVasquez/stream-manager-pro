import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Client,
  Supplier,
  FreeProfile,
  QuickLink,
  ClientSubscription,
} from "../types";
import { useAuth } from "./AuthContext";
import {
  COLLECTIONS,
  subscribeUserCollection,
  saveUserDocument,
  deleteUserDocument,
  clearUserCollection,
  subscribeCollection,
  saveDocument,
  deleteDocument,
  clearCollection,
} from "../lib/firebase";

interface DataContextType {
  clients: Client[];
  suppliers: Supplier[];
  freeProfiles: FreeProfile[];
  quickLinks: QuickLink[];
  loading: boolean;
  isFirestoreConnected: boolean;
  // Actions
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
  clearAllFirestoreData: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [freeProfiles, setFreeProfiles] = useState<FreeProfile[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirestoreConnected, setIsFirestoreConnected] =
    useState<boolean>(true);

  useEffect(() => {
    let unsubClients = () => {};
    let unsubSuppliers = () => {};
    let unsubProfiles = () => {};
    let unsubLinks = () => {};

    setLoading(true);

    if (user?.uid) {
      // Authenticated user collection in Firestore
      unsubClients = subscribeUserCollection<Client>(
        user.uid,
        COLLECTIONS.CLIENTS,
        (data) => {
          setClients(data);
          setLoading(false);
        },
        [],
      );

      unsubSuppliers = subscribeUserCollection<Supplier>(
        user.uid,
        COLLECTIONS.SUPPLIERS,
        (data) => setSuppliers(data),
        [],
      );

      unsubProfiles = subscribeUserCollection<FreeProfile>(
        user.uid,
        COLLECTIONS.FREE_PROFILES,
        (data) => setFreeProfiles(data),
        [],
      );

      unsubLinks = subscribeUserCollection<QuickLink>(
        user.uid,
        COLLECTIONS.QUICK_LINKS,
        (data) => setQuickLinks(data),
        [],
      );
    } else {
      setClients([]);
      setSuppliers([]);
      setFreeProfiles([]);
      setQuickLinks([]);
      setLoading(false);
    }

    return () => {
      unsubClients();
      unsubSuppliers();
      unsubProfiles();
      unsubLinks();
    };
  }, [user?.uid]);

  // Save / Update Client
  const saveClient = async (client: Client): Promise<boolean> => {
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = client;
        return copy;
      }
      return [client, ...prev];
    });

    if (user?.uid) {
      return await saveUserDocument(user.uid, COLLECTIONS.CLIENTS, client);
    } else {
      return await saveDocument(COLLECTIONS.CLIENTS, client);
    }
  };

  // Delete Client
  const deleteClient = async (clientId: string): Promise<boolean> => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (user?.uid) {
      return await deleteUserDocument(user.uid, COLLECTIONS.CLIENTS, clientId);
    } else {
      return await deleteDocument(COLLECTIONS.CLIENTS, clientId);
    }
  };

  // Save / Update Supplier
  const saveSupplier = async (supplier: Supplier): Promise<boolean> => {
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s.id === supplier.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = supplier;
        return copy;
      }
      return [supplier, ...prev];
    });

    if (user?.uid) {
      return await saveUserDocument(user.uid, COLLECTIONS.SUPPLIERS, supplier);
    } else {
      return await saveDocument(COLLECTIONS.SUPPLIERS, supplier);
    }
  };

  // Delete Supplier
  const deleteSupplier = async (supplierId: string): Promise<boolean> => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    if (user?.uid) {
      return await deleteUserDocument(
        user.uid,
        COLLECTIONS.SUPPLIERS,
        supplierId,
      );
    } else {
      return await deleteDocument(COLLECTIONS.SUPPLIERS, supplierId);
    }
  };

  // Save Free Profile
  const saveFreeProfile = async (profile: FreeProfile): Promise<boolean> => {
    setFreeProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = profile;
        return copy;
      }
      return [profile, ...prev];
    });

    if (user?.uid) {
      return await saveUserDocument(
        user.uid,
        COLLECTIONS.FREE_PROFILES,
        profile,
      );
    } else {
      return await saveDocument(COLLECTIONS.FREE_PROFILES, profile);
    }
  };

  // Delete Free Profile
  const deleteFreeProfile = async (profileId: string): Promise<boolean> => {
    setFreeProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (user?.uid) {
      return await deleteUserDocument(
        user.uid,
        COLLECTIONS.FREE_PROFILES,
        profileId,
      );
    } else {
      return await deleteDocument(COLLECTIONS.FREE_PROFILES, profileId);
    }
  };

  // Quick Links
  const saveQuickLink = async (link: QuickLink): Promise<boolean> => {
    setQuickLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === link.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = link;
        return copy;
      }
      return [link, ...prev];
    });

    if (user?.uid) {
      return await saveUserDocument(user.uid, COLLECTIONS.QUICK_LINKS, link);
    } else {
      return await saveDocument(COLLECTIONS.QUICK_LINKS, link);
    }
  };

  const deleteQuickLink = async (linkId: string): Promise<boolean> => {
    setQuickLinks((prev) => prev.filter((l) => l.id !== linkId));
    if (user?.uid) {
      return await deleteUserDocument(
        user.uid,
        COLLECTIONS.QUICK_LINKS,
        linkId,
      );
    } else {
      return await deleteDocument(COLLECTIONS.QUICK_LINKS, linkId);
    }
  };

  // Assign Free Profile directly to a Client
  const assignFreeProfileToClient = async (
    profile: FreeProfile,
    clientId: string,
  ): Promise<boolean> => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return false;

    const newSub: ClientSubscription = {
      id: `sub-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      serviceName: profile.serviceName,
      hireDate: new Date().toLocaleDateString("es-ES"),
      cutDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("es-ES"),
      email: profile.email,
      password: profile.password,
      status: "active",
    };

    const updatedClient: Client = {
      ...client,
      status: "active",
      subscriptions: [...client.subscriptions, newSub],
    };

    await saveClient(updatedClient);

    if (profile.quantity > 1) {
      await saveFreeProfile({ ...profile, quantity: profile.quantity - 1 });
    } else {
      await deleteFreeProfile(profile.id);
    }

    return true;
  };

  // Clear all Firestore Data
  const clearAllFirestoreData = async () => {
    setClients([]);
    setSuppliers([]);
    setFreeProfiles([]);
    setQuickLinks([]);

    if (user?.uid) {
      await clearUserCollection(user.uid, COLLECTIONS.CLIENTS);
      await clearUserCollection(user.uid, COLLECTIONS.SUPPLIERS);
      await clearUserCollection(user.uid, COLLECTIONS.FREE_PROFILES);
      await clearUserCollection(user.uid, COLLECTIONS.QUICK_LINKS);
    } else {
      await clearCollection(COLLECTIONS.CLIENTS);
      await clearCollection(COLLECTIONS.SUPPLIERS);
      await clearCollection(COLLECTIONS.FREE_PROFILES);
      await clearCollection(COLLECTIONS.QUICK_LINKS);
    }
  };

  // Reset Data to empty
  const resetToDefaultData = async () => {
    await clearAllFirestoreData();
  };

  // Export JSON backup
  const exportDataJSON = () => {
    const backup = {
      clients,
      suppliers,
      freeProfiles,
      quickLinks,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `backup_cuentas_streaming_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const importDataJSON = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.clients) {
        setClients(parsed.clients);
        if (user?.uid) {
          for (const c of parsed.clients)
            await saveUserDocument(user.uid, COLLECTIONS.CLIENTS, c);
        }
      }
      if (parsed.suppliers) {
        setSuppliers(parsed.suppliers);
        if (user?.uid) {
          for (const s of parsed.suppliers)
            await saveUserDocument(user.uid, COLLECTIONS.SUPPLIERS, s);
        }
      }
      if (parsed.freeProfiles) {
        setFreeProfiles(parsed.freeProfiles);
        if (user?.uid) {
          for (const p of parsed.freeProfiles)
            await saveUserDocument(user.uid, COLLECTIONS.FREE_PROFILES, p);
        }
      }
      if (parsed.quickLinks) {
        setQuickLinks(parsed.quickLinks);
        if (user?.uid) {
          for (const l of parsed.quickLinks)
            await saveUserDocument(user.uid, COLLECTIONS.QUICK_LINKS, l);
        }
      }
      return true;
    } catch (e) {
      console.error("Invalid backup JSON", e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        suppliers,
        freeProfiles,
        quickLinks,
        loading,
        isFirestoreConnected,
        saveClient,
        deleteClient,
        saveSupplier,
        deleteSupplier,
        saveFreeProfile,
        deleteFreeProfile,
        saveQuickLink,
        deleteQuickLink,
        assignFreeProfileToClient,
        clearAllFirestoreData,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
