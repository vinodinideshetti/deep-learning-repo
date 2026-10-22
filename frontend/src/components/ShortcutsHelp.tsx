type Props = { open: boolean; onClose: () => void };

const ROWS: [string, string][] = [
  ["Analyze: run model", "Ctrl + Enter (Windows/Linux) or ⌘ + Enter (Mac) when an image is selected"],
  ["Dark / light theme", "Sun / moon button in the header (also in Settings)"],
  ["API address", "Settings → API base URL (or VITE_API_URL / dev proxy)"],
  ["Help topics", "Q&A bot page — 50 saved answers, keyword matching"],
  ["Export runs", "History → Export JSON; Analyze → Download JSON or copy text summary"],
];

export function ShortcutsHelp({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Tips & shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-4 text-sm">
          {ROWS.map(([k, v]) => (
            <li key={k} className="border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
              <p className="font-medium text-slate-800 dark:text-slate-200">{k}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{v}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
