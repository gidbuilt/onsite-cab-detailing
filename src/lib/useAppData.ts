import { useCallback, useSyncExternalStore } from "react";
import { loadData, saveData, STORAGE_KEY, type AppData } from "./store";

let snapshot = loadData();
let snapshotRaw = localStorage.getItem(STORAGE_KEY);

function refreshSnapshot() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  snapshot = loadData();
  return snapshot;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    refreshSnapshot();
    onStoreChange();
  };
  window.addEventListener("onsite-data-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("onsite-data-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): AppData {
  return snapshot;
}

export function useAppData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const update = useCallback((updater: (current: AppData) => AppData) => {
    const next = updater(loadData());
    saveData(next);
    snapshot = next;
    snapshotRaw = localStorage.getItem(STORAGE_KEY);
  }, []);

  return { data, update };
}
