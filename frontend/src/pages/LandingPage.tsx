import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchClasses, fetchHealth } from "@/lib/api";

export function LandingPage() {
  const [classCount, setClassCount] = useState<number | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((h) => setApiOk(h.model_loaded))
      .catch(() => setApiOk(false));
    fetchClasses()
      .then((c) => setClassCount(c.count))
      .catch(() => setClassCount(null));
  }, []);

  const features = [
    {
      title: "38 disease classes",
      body: "Covers common crops: tomato, potato, apple, grape, corn, and more from the benchmark dataset.",
      emoji: "🧬",
    },
    {
      title: "Fast inference",
      body: "TensorFlow SavedModel behind a FastAPI server — upload and get softmax scores in seconds.",
      emoji: "⚡",
    },
    {
      title: "Top-5 breakdown",
      body: "See alternative labels and confidences to understand model uncertainty at a glance.",
      emoji: "📊",
    },
    {
      title: "Local history",
      body: "Recent runs saved in your browser with thumbnails — no account required.",
      emoji: "🕐",
    },
    {
      title: "JSON export",
      body: "Download structured results for records or downstream tooling.",
      emoji: "📥",
    },
    {
      title: "Dark mode & settings",
      body: "Header toggle or Settings: API base URL, theme, and your own hosted backend.",
      emoji: "🌙",
    },
    {
      title: "Q&A assistant (50 answers)",
      body: "Rule-based help about the API, dataset, ports, and limitations — not a cloud LLM.",
      emoji: "💬",
    },
  ];

  const navLink =
    "text-slate-600 transition hover:text-leaf-700 dark:text-slate-300 dark:hover:text-leaf-400";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 font-semibold text-leaf-800 dark:text-leaf-300"
            aria-label="LeafCare AI home"
          >
            <img src="/leaf.svg" alt="" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" width={36} height={36} />
            <span className="truncate">LeafCare AI</span>
          </Link>
          <nav
            className="hidden items-center gap-5 text-sm font-medium md:flex lg:gap-7"
            aria-label="Primary"
          >
            <Link to="/dashboard" className={navLink}>
              Dashboard
            </Link>
            <Link to="/analyze" className={navLink}>
              Analyze
            </Link>
            <Link to="/classes" className={navLink}>
              Classes
            </Link>
            <Link to="/history" className={navLink}>
              History
            </Link>
            <Link to="/tips" className={navLink}>
              Tips
            </Link>
            <Link to="/qa" className={navLink}>
              Q&A
            </Link>
            <Link to="/about" className={navLink}>
              About
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              to="/analyze"
              className="rounded-xl bg-leaf-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf-700 sm:px-4"
            >
              Get started
            </Link>
          </div>
        </div>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-2 text-xs font-medium dark:border-slate-800/80 md:hidden"
          aria-label="Primary mobile"
        >
          <Link to="/dashboard" className={navLink}>
            Dashboard
          </Link>
          <Link to="/analyze" className={navLink}>
            Analyze
          </Link>
          <Link to="/classes" className={navLink}>
            Classes
          </Link>
          <Link to="/history" className={navLink}>
            History
          </Link>
          <Link to="/tips" className={navLink}>
            Tips
          </Link>
          <Link to="/qa" className={navLink}>
            Q&A
          </Link>
          <Link to="/about" className={navLink}>
            About
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pb-12 pt-8 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-leaf-200 bg-gradient-to-br from-leaf-100 via-white to-emerald-50 px-6 py-16 text-center dark:border-leaf-900 dark:from-leaf-950/50 dark:via-slate-950 dark:to-emerald-950/30 sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf-400/20 blur-3xl dark:bg-leaf-600/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-600/10" />
        <p className="text-sm font-medium uppercase tracking-wider text-leaf-700 dark:text-leaf-400">
          Plant health · AI screening
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Know your leaves faster
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Upload a leaf photo and get an instant disease or health classification. Built for researchers,
          agronomists, and curious growers — always confirm in the field with a professional.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/analyze"
            className="inline-flex rounded-2xl bg-leaf-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-leaf-600/30 transition hover:bg-leaf-700"
          >
            Start analyzing
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex rounded-2xl border-2 border-slate-300 bg-white/80 px-8 py-3.5 text-base font-semibold text-slate-800 backdrop-blur hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900"
          >
            View dashboard
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
          <div className="rounded-2xl bg-white/70 px-5 py-3 shadow-sm dark:bg-slate-900/70">
            <p className="font-bold text-2xl text-leaf-600 dark:text-leaf-400">
              {classCount ?? "—"}
            </p>
            <p className="text-slate-600 dark:text-slate-400">dataset classes</p>
          </div>
          <div className="rounded-2xl bg-white/70 px-5 py-3 shadow-sm dark:bg-slate-900/70">
            <p className="font-bold text-2xl text-leaf-600 dark:text-leaf-400">
              {apiOk === null ? "…" : apiOk ? "Live" : "Down"}
            </p>
            <p className="text-slate-600 dark:text-slate-400">API status</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">What you can do</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Everything runs in your browser plus your FastAPI backend — no cloud lock-in for the demo.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-leaf-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-leaf-800"
            >
              <span className="text-3xl" aria-hidden>
                {f.emoji}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-900 px-6 py-12 text-center text-white dark:border-slate-700">
        <h2 className="text-2xl font-bold">Ready to try a leaf image?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">
          Use natural light, fill the frame with the leaf, and avoid heavy blur for best scores.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/analyze"
            className="inline-flex rounded-xl bg-leaf-500 px-6 py-3 font-semibold text-slate-950 hover:bg-leaf-400"
          >
            Go to Analyze
          </Link>
          <Link
            to="/tips"
            className="inline-flex rounded-xl border border-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Read photo tips
          </Link>
          <Link
            to="/qa"
            className="inline-flex rounded-xl border border-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Q&A assistant
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
