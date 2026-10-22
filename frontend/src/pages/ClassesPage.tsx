import { useEffect, useMemo, useState } from "react";
import { fetchClasses } from "@/lib/api";
import { copyToClipboard } from "@/lib/copy";
import { hintForPlant, splitClassName } from "@/lib/plantInfo";

export function ClassesPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchClasses()
      .then((r) => setClasses(r.classes))
      .catch((e: Error) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return classes;
    return classes.filter((c) => c.toLowerCase().includes(s));
  }, [classes, q]);

  const grouped = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const c of filtered) {
      const plant = c.split("___")[0] || "Other";
      if (!m.has(plant)) m.set(plant, []);
      m.get(plant)!.push(c);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dataset classes</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {classes.length ? `${classes.length} labels from the API.` : "Loading…"}
        </p>
      </div>

      <input
        type="search"
        placeholder="Search classes…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        aria-label="Filter classes"
      />

      {err && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {grouped.map(([plant, items]) => (
            <div
              key={plant}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="font-semibold text-leaf-800 dark:text-leaf-300">
                {plant.replace(/_/g, " ")}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {items.map((c) => {
                  const { condition } = splitClassName(c);
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => setSel(c)}
                        className={`rounded-lg border px-2 py-1 text-left text-xs transition ${
                          sel === c
                            ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-950/50"
                            : "border-slate-200 hover:border-leaf-300 dark:border-slate-700"
                        }`}
                      >
                        {condition || c}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Details</h3>
          {sel ? (
            <div className="mt-3 text-sm">
              <p className="font-mono text-xs break-all text-slate-700 dark:text-slate-300">{sel}</p>
              <button
                type="button"
                className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={async () => {
                  const ok = await copyToClipboard(sel);
                  if (ok) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }
                }}
              >
                {copied ? "Copied label" : "Copy class name"}
              </button>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                {hintForPlant(sel.split("___")[0])}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Select a class to see a short note.</p>
          )}
        </div>
      </div>
    </div>
  );
}
