import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClasses, fetchHealth } from "@/lib/api";
import { QA_COUNT } from "@/data/qaKnowledge";
import { loadHistory } from "@/lib/settings";

export function DashboardPage() {
  const [health, setHealth] = useState<{ ok: boolean; loading: boolean }>({ ok: false, loading: true });
  const [classCount, setClassCount] = useState<number | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    setHistoryCount(loadHistory().length);
    fetchHealth()
      .then((h) => setHealth({ ok: h.model_loaded, loading: false }))
      .catch(() => setHealth({ ok: false, loading: false }));
    fetchClasses()
      .then((c) => setClassCount(c.count))
      .catch(() => setClassCount(null));
  }, []);

  const cards = [
    {
      label: "API & model",
      value: health.loading ? "…" : health.ok ? "Ready" : "Offline",
      sub: "TensorFlow SavedModel via FastAPI",
      tone: health.ok ? "text-leaf-600 dark:text-leaf-400" : "text-amber-600 dark:text-amber-400",
      to: "/analyze",
      cta: "Run analysis",
    },
    {
      label: "Dataset classes",
      value: classCount != null ? String(classCount) : "—",
      sub: "Labels from /classes",
      tone: "text-slate-900 dark:text-white",
      to: "/classes",
      cta: "Browse classes",
    },
    {
      label: "Saved in browser",
      value: String(historyCount),
      sub: "Recent predictions (local)",
      tone: "text-slate-900 dark:text-white",
      to: "/history",
      cta: "View history",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Snapshot of connectivity, dataset coverage, and your local activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold tabular-nums ${c.tone}`}>{c.value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.sub}</p>
            <Link
              to={c.to}
              className="mt-4 inline-block text-sm font-semibold text-leaf-600 hover:underline dark:text-leaf-400"
            >
              {c.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-leaf-200 bg-gradient-to-r from-leaf-50 to-white p-6 dark:border-leaf-900 dark:from-leaf-950/40 dark:to-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Q&A assistant</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {QA_COUNT} built-in answers about ports, APIs, the dataset, and limitations — plus a simple chat
          matcher.
        </p>
        <Link
          to="/qa"
          className="mt-4 inline-flex rounded-xl bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          Open Q&A bot →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Shortcuts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="text-leaf-600 hover:underline dark:text-leaf-400" to="/analyze">
                New leaf upload
              </Link>{" "}
              <span className="text-slate-400">· Ctrl+Enter</span>
            </li>
            <li>
              <Link className="text-leaf-600 hover:underline dark:text-leaf-400" to="/qa">
                Help & FAQ bot
              </Link>
            </li>
            <li>
              <Link className="text-leaf-600 hover:underline dark:text-leaf-400" to="/tips">
                Improve image quality
              </Link>
            </li>
            <li>
              <Link className="text-leaf-600 hover:underline dark:text-leaf-400" to="/about">
                Model & disclaimer
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Tip</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            If the API shows offline, start the backend from the project root:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs dark:bg-slate-800">
              uvicorn api.app:app --host 127.0.0.1 --port 8010
            </code>
            . Use the <strong>sun/moon</strong> button in the header for dark mode. Settings still lets you
            change the API URL.
          </p>
        </div>
      </div>
    </div>
  );
}
