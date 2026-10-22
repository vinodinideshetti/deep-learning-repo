import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export function HealthBadge() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [at, setAt] = useState<Date | null>(null);
  const [msg, setMsg] = useState("");

  const ping = () => {
    fetchHealth()
      .then((h) => {
        setOk(h.model_loaded);
        setAt(new Date());
        setMsg("");
      })
      .catch((e: Error) => {
        setOk(false);
        setAt(new Date());
        setMsg(e.message);
      });
  };

  useEffect(() => {
    ping();
    const t = setInterval(ping, 30000);
    return () => clearInterval(t);
  }, []);

  if (ok === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden />
        Checking API…
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          ok
            ? "bg-leaf-100 text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-200"
            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
        }`}
        title={msg || undefined}
      >
        <span
          className={`h-2 w-2 rounded-full ${ok ? "bg-leaf-500" : "bg-red-500"}`}
          aria-hidden
        />
        {ok ? "API connected" : "API offline"}
      </span>
      {at && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {at.toLocaleTimeString()}
        </span>
      )}
      {!ok && (
        <button
          type="button"
          onClick={ping}
          className="text-[10px] font-medium text-leaf-600 underline dark:text-leaf-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
