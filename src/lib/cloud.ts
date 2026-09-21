import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { isCloudConfigured } from "./cloudConfig";
import { emptyData, type AppData } from "./store";

/** Single shared admin document in Firestore. */
const DOC_PATH = { collection: "admin", id: "appData" } as const;

export type CloudDocument = {
  packages: AppData["packages"];
  addOns: AppData["addOns"];
  customers: AppData["customers"];
  invoices: AppData["invoices"];
  updatedAt: string;
};

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readConfig(): FirebaseWebConfig | null {
  if (!isCloudConfigured()) return null;
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY.trim(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID.trim(),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID.trim(),
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb(): Firestore | null {
  const config = readConfig();
  if (!config) return null;
  if (!app) {
    app = initializeApp(config);
    db = getFirestore(app);
  }
  return db;
}

function appDataRef() {
  const firestore = getDb();
  if (!firestore) return null;
  return doc(firestore, DOC_PATH.collection, DOC_PATH.id);
}

export function normalizeCloudData(
  raw: Partial<CloudDocument> | null | undefined,
): AppData | null {
  if (!raw) return null;
  if (
    !Array.isArray(raw.packages) ||
    !Array.isArray(raw.addOns) ||
    !Array.isArray(raw.customers) ||
    !Array.isArray(raw.invoices)
  ) {
    return null;
  }

  const base = emptyData();
  return {
    packages: raw.packages.length > 0 ? raw.packages : base.packages,
    addOns: raw.addOns.length > 0 ? raw.addOns : base.addOns,
    customers: raw.customers,
    invoices: raw.invoices.map((invoice) => ({
      ...invoice,
      poNumber: invoice.poNumber ?? "",
    })),
  };
}

export async function pushCloudData(data: AppData): Promise<void> {
  const ref = appDataRef();
  if (!ref) throw new Error("Firebase is not configured");
  const payload: CloudDocument = {
    packages: data.packages,
    addOns: data.addOns,
    customers: data.customers,
    invoices: data.invoices,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, payload);
}

export function subscribeCloudData(
  onData: (data: AppData | null) => void,
  onError: (error: Error) => void,
): Unsubscribe | null {
  const ref = appDataRef();
  if (!ref) return null;

  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(normalizeCloudData(snap.data() as Partial<CloudDocument>));
    },
    (error) => {
      onError(error);
    },
  );
}
