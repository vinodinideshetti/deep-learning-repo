type Item = { class: string; confidence: number };

export function Top5Bars({ items }: { items: Item[] }) {
  const max = Math.max(...items.map((i) => i.confidence), 1e-6);
  return (
    <ul className="space-y-3" aria-label="Top 5 predictions">
      {items.map((row) => (
        <li key={row.class}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="max-w-[70%] truncate font-medium" title={row.class}>
              {row.class.replace(/___/g, " · ").replace(/_/g, " ")}
            </span>
            <span className="tabular-nums text-slate-600 dark:text-slate-400">
              {(row.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-leaf-400 transition-all"
              style={{ width: `${(row.confidence / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
