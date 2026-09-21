import { useCallback, useEffect, useSyncExternalStore } from "react";
import { isCloudConfigured, type SyncStatus } from "./cloudConfig";
import { loadData, saveData, STORAGE_KEY, type AppData } from "./store";

let snapshot = loadData();
let snapshotRaw = localStorage.getItem(STORAGE_KEY);
let syncStatus: SyncStatus = isCloudConfigured()
  ? "offline"
  : "not_configured";
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let cloudReady = false;
/** Fingerprint of AppData we last pushed, to ignore our own snapshot echo. */
let lastPushedKey: string | null = null;
let cloudStarted = false;
const listeners = new Set<() => void>();

function dataKey(data: AppData) {
  return JSON.stringify({
    packages: data.packages,
    addOns: data.addOns,
    customers: data.customers,
    invoices: data.invoices,
  });
}

function emit() {
  for (const listener of listeners) listener();
}

function setSyncStatus(next: SyncStatus) {
  if (syncStatus === next) return;
  syncStatus = next;
  emit();
}

function applyLocal(data: AppData, { persistCloud }: { persistCloud: boolean }) {
  saveData(data);
  snapshot = data;
  snapshotRaw = localStorage.getItem(STORAGE_KEY);
  emit();

  if (!persistCloud || !isCloudConfigured() || !cloudStarted) return;

  if (saveTimer) clearTimeout(saveTimer);
  setSyncStatus("saving");
  const key = dataKey(data);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void import("./cloud")
      .then(({ pushCloudData }) => pushCloudData(data))
      .then(() => {
        lastPushedKey = key;
        setSyncStatus(navigator.onLine ? "synced" : "offline");
      })
      .catch(() => {
        setSyncStatus(navigator.onLine ? "error" : "offline");
      });
  }, 400);
}

function refreshFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  snapshot = loadData();
  return snapshot;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const handler = () => {
    refreshFromStorage();
    onStoreChange();
  };
  window.addEventListener("onsite-data-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("onsite-data-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): AppData {
  return snapshot;
}

function getSyncSnapshot(): SyncStatus {
  return syncStatus;
}

function subscribeSync(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function startCloudSync() {
  if (cloudStarted) return;
  cloudStarted = true;

  if (!isCloudConfigured()) {
    setSyncStatus("not_configured");
    return;
  }

  setSyncStatus(navigator.onLine ? "saving" : "offline");

  void import("./cloud").then(({ pushCloudData, subscribeCloudData }) => {
    const unsub = subscribeCloudData(
      (remote) => {
        if (remote == null) {
          if (!cloudReady) {
            cloudReady = true;
            const local = loadData();
            void pushCloudData(local)
              .then(() => {
                lastPushedKey = dataKey(local);
                setSyncStatus(navigator.onLine ? "synced" : "offline");
              })
              .catch(() => {
                setSyncStatus(navigator.onLine ? "error" : "offline");
              });
          }
          return;
        }

        const key = dataKey(remote);
        if (key === lastPushedKey || key === dataKey(snapshot)) {
          cloudReady = true;
          setSyncStatus(navigator.onLine ? "synced" : "offline");
          return;
        }

        cloudReady = true;
        saveData(remote);
        snapshot = remote;
        snapshotRaw = localStorage.getItem(STORAGE_KEY);
        setSyncStatus(navigator.onLine ? "synced" : "offline");
        emit();
      },
      () => {
        setSyncStatus(navigator.onLine ? "error" : "offline");
      },
    );

    const onOnline = () => {
      if (syncStatus !== "saving" && syncStatus !== "not_configured") {
        setSyncStatus("synced");
      }
    };
    const onOffline = () => setSyncStatus("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    void unsub;
  });
}

/**
 * Enable Firestore realtime sync. Call from Admin only so public pages
 * do not pull customer/invoice data or open a cloud listener.
 */
export function useCloudSync() {
  useEffect(() => {
    startCloudSync();
  }, []);
}

export function useAppData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const status = useSyncExternalStore(
    subscribeSync,
    getSyncSnapshot,
    getSyncSnapshot,
  );

  const update = useCallback((updater: (current: AppData) => AppData) => {
    const next = updater(loadData());
    applyLocal(next, { persistCloud: true });
  }, []);

  return { data, update, syncStatus: status };
}
