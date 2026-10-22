import { useMemo, useRef, useState } from "react";
import { QA_COUNT, QA_PAIRS } from "@/data/qaKnowledge";
import { copyToClipboard } from "@/lib/copy";
import { NO_MATCH_REPLY, rankQuestions } from "@/lib/qaMatch";

type ChatMsg = { role: "user" | "bot"; text: string; id: string };

const SAMPLE_CHIPS = [
  "How do I enable dark mode?",
  "What port is the API?",
  "How many classes?",
  "Does it draw bounding boxes?",
  "Where is the model stored?",
];

export function QAPage() {
  const [filter, setFilter] = useState("");
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      id: "welcome",
      text: "hello im rule based assistant Type a question or pick a chip below.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return QA_PAIRS;
    return QA_PAIRS.filter(
      (p) =>
        p.q.toLowerCase().includes(q) ||
        p.a.toLowerCase().includes(q) ||
        (p.keywords?.some((k) => k.includes(q)) ?? false)
    );
  }, [filter]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((m) => [...m, { role: "user", text: t, id: uid() }]);
    const ranked = rankQuestions(t, 3);
    let reply: string;
    if (ranked.length === 0) {
      reply = NO_MATCH_REPLY;
    } else {
      reply = ranked
        .map((r, i) => `**(${i + 1}) ${r.entry.q}**\n${r.entry.a}`)
        .join("\n\n---\n\n");
    }
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: reply, id: uid() }]);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 0);
    setInput("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Q&A assistant</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {QA_COUNT} saved Q&amp;As. Replies use keyword matching (not ChatGPT).
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Chat</h2>
          </div>
          <div
            ref={listRef}
            className="max-h-[min(420px,50vh)] flex-1 space-y-3 overflow-y-auto p-4 text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "ml-8 bg-leaf-100 text-slate-900 dark:bg-leaf-900/40 dark:text-leaf-50"
                    : "mr-4 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {msg.role === "user" ? "You" : "Assistant"}
                </p>
                <div className="mt-1 [&_strong]:font-semibold">
                  {msg.text.split("\n").map((line, i) => {
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={i} className="leading-relaxed">
                        {parts.map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex flex-wrap gap-2">
              {SAMPLE_CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {c}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                placeholder="Ask about the project, API, dataset…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Your question"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Browse all {QA_COUNT} answers
          </label>
          <input
            type="search"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            placeholder="Filter questions…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <ul className="mt-4 max-h-[min(520px,60vh)] space-y-2 overflow-y-auto pr-1">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 font-medium text-slate-900 dark:text-white">
                    <span className="text-slate-400">#{p.id}</span> {p.q}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={async () => {
                      const ok = await copyToClipboard(`Q: ${p.q}\n\nA: ${p.a}`);
                      if (ok) {
                        setCopiedId(p.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }
                    }}
                  >
                    {copiedId === p.id ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">{p.a}</p>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">No matches for that filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
