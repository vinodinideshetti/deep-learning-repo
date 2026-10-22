import { useMemo, useState } from "react";
import { copyToClipboard } from "@/lib/copy";
import { clearHistory, loadHistory, removeHistoryEntry, type HistoryEntry } from "@/lib/settings";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>(() => loadHistory());

  const sorted = useMemo(() => [...items].sort((a, b) => b.at - a.at), [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recent analyses</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Stored locally in your browser (last 20).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={sorted.length === 0}
            onClick={() => {
              const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `leaf-history-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => {
              clearHistory();
              setItems([]);
            }}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900 dark:text-red-300"
          >
            Clear history
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          No saved runs yet. Analyze a leaf on the home page.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((h) => (
            <li
              key={h.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <img src={h.thumb} alt="" className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">
                  {h.predicted_class.replace(/___/g, " · ")}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-leaf-600 dark:text-leaf-400">
                  {(h.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(h.at).toLocaleString()}
                  {h.filename ? ` · ${h.filename}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="text-xs font-medium text-leaf-600 hover:underline dark:text-leaf-400"
                    onClick={async () => {
                      await copyToClipboard(
                        `${h.predicted_class} — ${(h.confidence * 100).toFixed(1)}% (${new Date(h.at).toLocaleString()})`
                      );
                    }}
                  >
                    Copy line
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    onClick={() => {
                      removeHistoryEntry(h.id);
                      setItems(loadHistory());
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
