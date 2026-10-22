import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { HealthBadge } from "./HealthBadge";
import { SettingsPanel } from "./SettingsPanel";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { SideNav } from "./SideNav";
import { ThemeToggle } from "./ThemeToggle";

const TITLES: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/analyze": "Analyze",
  "/classes": "Classes",
  "/history": "History",
  "/tips": "Photo tips",
  "/about": "About",
  "/qa": "Q&A assistant",
};

export function Layout() {
  const [settings, setSettings] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "LeafCare AI";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <SideNav
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenSettings={() => setSettings(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col md:pl-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShortcuts(true)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
              title="Tips & shortcuts"
              aria-label="Tips and keyboard shortcuts"
            >
              ?
            </button>
            <ThemeToggle />
            <Link
              to="/analyze"
              className="hidden rounded-lg bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-leaf-700 sm:inline-block"
            >
              Quick analyze
            </Link>
            <HealthBadge />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <SettingsPanel open={settings} onClose={() => setSettings(false)} />
      <ShortcutsHelp open={shortcuts} onClose={() => setShortcuts(false)} />
    </div>
  );
}
