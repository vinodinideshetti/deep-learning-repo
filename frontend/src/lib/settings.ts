const STORAGE_API = "plantleaf_api_base_url";
const STORAGE_DARK = "plantleaf_dark_mode";
const STORAGE_HISTORY = "plantleaf_prediction_history";

export function getStoredApiBase(): string | null {
  return localStorage.getItem(STORAGE_API);
}

export function setStoredApiBase(url: string | null): void {
  if (!url) localStorage.removeItem(STORAGE_API);
  else localStorage.setItem(STORAGE_API, url.replace(/\/$/, ""));
}

export function getApiBase(): string {
  const stored = getStoredApiBase();
  if (stored) return stored;
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (import.meta.env.DEV) return ""; // use Vite proxy /api-proxy
  return "http://127.0.0.1:8010";
}

export function resolveApiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (base) return `${base}${p}`;
  return `/api-proxy${p}`;
}

export function isDarkMode(): boolean {
  const s = localStorage.getItem(STORAGE_DARK);
  if (s === "1") return true;
  if (s === "0") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function setDarkMode(dark: boolean): void {
  localStorage.setItem(STORAGE_DARK, dark ? "1" : "0");
  document.documentElement.classList.toggle("dark", dark);
  window.dispatchEvent(new CustomEvent("plantleaf-theme-change"));
}

/** Flip light/dark and return the new state. */
export function toggleDarkMode(): boolean {
  const next = !document.documentElement.classList.contains("dark");
  setDarkMode(next);
  return next;
}

export function initTheme(): void {
  document.documentElement.classList.toggle("dark", isDarkMode());
}

export type HistoryEntry = {
  id: string;
  at: number;
  thumb: string;
  predicted_class: string;
  confidence: number;
  filename: string | null;
};

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(entries.slice(0, 20)));
}

export function pushHistory(entry: Omit<HistoryEntry, "id" | "at">): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const full: HistoryEntry = { ...entry, id, at: Date.now() };
  const next = [full, ...loadHistory()].slice(0, 20);
  saveHistory(next);
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_HISTORY);
}

export function removeHistoryEntry(id: string): void {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
}
