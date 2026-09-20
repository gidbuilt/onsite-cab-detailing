import { useCallback, useSyncExternalStore } from "react";
import {
  loadData,
  saveData,
  type AppData,
} from "./store";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("onsite-data-changed", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("onsite-data-changed", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): AppData {
  return loadData();
}

export function useAppData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const update = useCallback((updater: (current: AppData) => AppData) => {
    const next = updater(loadData());
    saveData(next);
  }, []);

  return { data, update };
}
