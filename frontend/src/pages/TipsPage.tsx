import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const TIPS = [
  {
    title: "Lighting",
    body: "Use diffuse daylight or even indoor lighting. Avoid harsh shadows on the leaf; the model was trained on fairly uniform illumination.",
  },
  {
    title: "Focus & distance",
    body: "Fill most of the frame with a single leaf. Blurry or tiny leaves reduce confidence.",
  },
  {
    title: "Background",
    body: "A plain or natural background is fine. Extreme clutter can sometimes confuse edge cases.",
  },
  {
    title: "Angle",
    body: "Shoot top-down or slightly angled so the leaf surface and any spots are visible.",
  },
  {
    title: "Format",
    body: "JPEG, PNG, or WebP work. Keep files under 15 MB as required by the API.",
  },
  {
    title: "Multiple leaves",
    body: "The model assumes one dominant label for the whole image. Crop to one leaf when possible.",
  },
];

export function TipsPage() {
  const [spotlight, setSpotlight] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  const randomTip = () => {
    const n = Math.floor(Math.random() * TIPS.length);
    setSpotlight(n);
    refs.current[n]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Better photos, better scores</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            These guidelines align with how many plant disease image datasets are collected. They are not a
            guarantee of accuracy.
          </p>
        </div>
        <button
          type="button"
          onClick={randomTip}
          className="rounded-xl border border-leaf-300 bg-leaf-50 px-4 py-2 text-sm font-medium text-leaf-800 hover:bg-leaf-100 dark:border-leaf-800 dark:bg-leaf-950/50 dark:text-leaf-200 dark:hover:bg-leaf-900/40"
        >
          Random tip
        </button>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {TIPS.map((t, i) => (
          <li
            key={t.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`flex gap-4 rounded-2xl border bg-white p-5 dark:bg-slate-900 ${
              spotlight === i
                ? "border-leaf-500 ring-2 ring-leaf-400/50 dark:border-leaf-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-lg font-bold text-leaf-800 dark:bg-leaf-900/50 dark:text-leaf-200">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/analyze"
          className="inline-flex rounded-xl bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          Try analyze now
        </Link>
      </div>
    </div>
  );
}
