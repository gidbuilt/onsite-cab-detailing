const SESSION_KEY = "onsite-cab-admin-session";

/** Change this password anytime. Kept client-side for a private tools page. */
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD?.trim() || "CleanerCab2026";

export function isAdminAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function loginAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) return false;
  sessionStorage.setItem(SESSION_KEY, "1");
  return true;
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}
