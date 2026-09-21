export type SyncStatus =
  | "not_configured"
  | "synced"
  | "saving"
  | "offline"
  | "error";

export function isCloudConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY?.trim() &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() &&
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() &&
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() &&
      import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  );
}

export function syncStatusLabel(status: SyncStatus): string {
  switch (status) {
    case "not_configured":
      return "Not configured";
    case "synced":
      return "Synced";
    case "saving":
      return "Saving";
    case "offline":
      return "Offline";
    case "error":
      return "Offline";
  }
}
