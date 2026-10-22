import { useCallback, useEffect, useState } from "react";
import { toggleDarkMode } from "@/lib/settings";

type Props = { className?: string };

export function ThemeToggle({ className = "" }: Props) {
  const [dark, setDark] = useState(false);

  const sync = useCallback(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("plantleaf-theme-change", sync);
    return () => window.removeEventListener("plantleaf-theme-change", sync);
  }, [sync]);

  return (
    <button
      type="button"
      onClick={() => {
        toggleDarkMode();
        setDark(document.documentElement.classList.contains("dark"));
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800 ${className}`}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
