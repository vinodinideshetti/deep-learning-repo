import { useEffect, useState } from "react";
import {
  getApiBase,
  getStoredApiBase,
  isDarkMode,
  setDarkMode,
  setStoredApiBase,
} from "@/lib/settings";

type Props = { open: boolean; onClose: () => void };

export function SettingsPanel({ open, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(getStoredApiBase() ?? "");
      setDark(isDarkMode());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const sync = () => setDark(isDarkMode());
    window.addEventListener("plantleaf-theme-change", sync);
    return () => window.removeEventListener("plantleaf-theme-change", sync);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          API base URL
        </label>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Empty = dev proxy <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/api-proxy</code>{" "}
          → <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">127.0.0.1:8010</code>, or set e.g.{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">http://127.0.0.1:8010</code>
        </p>
        <input
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
          placeholder="http://127.0.0.1:8010"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-medium">Dark mode</span>
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            onClick={() => {
              const t = url.trim();
              setStoredApiBase(t || null);
              setDarkMode(dark);
              onClose();
              window.location.reload();
            }}
          >
            Save & reload
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
            onClick={() => {
              setStoredApiBase(null);
              onClose();
              window.location.reload();
            }}
          >
            Clear saved URL
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Active base: <strong>{getApiBase() || "(proxy /api-proxy)"}</strong>
        </p>
      </div>
    </div>
  );
}
