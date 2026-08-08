import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";

import {
  INITIAL_CLIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_FREE_PROFILES,
  INITIAL_QUICK_LINKS,
} from "../data/initialData";
import { Client, Supplier, FreeProfile, QuickLink } from "../types";

// 2. AGREGAMOS la nueva configuración apuntando a tu .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App lazily
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
// Nota: quitamos la referencia a firebaseConfig.firestoreDatabaseId porque ya no viene del JSON
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collection Names
export const COLLECTIONS = {
  CLIENTS: "clients",
  SUPPLIERS: "suppliers",
  FREE_PROFILES: "free_profiles",
  QUICK_LINKS: "quick_links",
};

/**
 * Helper error handler according to Firebase standards
 */
export function handleFirestoreError(
  error: unknown,
  operationType: string,
  path: string | null,
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    userId: auth.currentUser?.uid || null,
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
}

/**
 * Seed initial data for a specific authenticated user (Only if explicitly requested by user)
 */
export async function seedInitialUserDataToFirestore(userId: string) {
  // Do not auto-seed fake data automatically
  return;
}

/**
 * Clear all documents in a user collection in Firestore
 */
export async function clearUserCollection(
  userId: string,
  collectionName: string,
) {
  if (!userId) return;
  try {
    const colRef = collection(db, "users", userId, collectionName);
    const snap = await getDocs(colRef);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    handleFirestoreError(err, "clear", `users/${userId}/${collectionName}`);
  }
}

/**
 * Clear all documents in a root collection in Firestore
 */
export async function clearCollection(collectionName: string) {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    handleFirestoreError(err, "clear", collectionName);
  }
}

/**
 * Real-time listener for root Firestore collection
 */
export function subscribeCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as T[];
          onData(items);
        } else {
          onData([]);
        }
      },
      (error) => {
        handleFirestoreError(error, "list", collectionName);
        onData([]);
      },
    );
  } catch (e) {
    handleFirestoreError(e, "subscribe", collectionName);
    onData([]);
    return () => {};
  }
}

/**
 * Save or update document in a root collection
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  docData: T,
) {
  try {
    const docRef = doc(db, collectionName, docData.id);
    await setDoc(docRef, docData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, "write", `${collectionName}/${docData.id}`);
    return false;
  }
}

/**
 * Delete document from a root collection
 */
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, "delete", `${collectionName}/${docId}`);
    return false;
  }
}

/**
 * Real-time listener for a specific user's Firestore collection
 */
export function subscribeUserCollection<T>(
  userId: string,
  collectionName: string,
  onData: (data: T[]) => void,
  fallbackData: T[],
) {
  if (!userId) {
    onData(fallbackData);
    return () => {};
  }

  try {
    const colRef = collection(db, "users", userId, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as T[];
          onData(items);
        } else {
          onData([]);
        }
      },
      (error) => {
        handleFirestoreError(
          error,
          "list",
          `users/${userId}/${collectionName}`,
        );
        onData(fallbackData);
      },
    );
  } catch (e) {
    handleFirestoreError(e, "subscribe", `users/${userId}/${collectionName}`);
    onData(fallbackData);
    return () => {};
  }
}

/**
 * Save or update document in a user's collection
 */
export async function saveUserDocument<T extends { id: string }>(
  userId: string,
  collectionName: string,
  docData: T,
) {
  if (!userId) return false;
  try {
    const docRef = doc(db, "users", userId, collectionName, docData.id);
    await setDoc(docRef, docData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      "write",
      `users/${userId}/${collectionName}/${docData.id}`,
    );
    return false;
  }
}

/**
 * Delete document from a user's collection
 */
export async function deleteUserDocument(
  userId: string,
  collectionName: string,
  docId: string,
) {
  if (!userId) return false;
  try {
    const docRef = doc(db, "users", userId, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      "delete",
      `users/${userId}/${collectionName}/${docId}`,
    );
    return false;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
};
export type { User };
