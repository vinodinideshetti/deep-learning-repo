import type { QAEntry } from "@/data/qaKnowledge";
import { QA_PAIRS } from "@/data/qaKnowledge";

export type RankedQA = { entry: QAEntry; score: number };

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall",
  "can", "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
  "from", "as", "into", "through", "during", "before", "after", "above", "below", "between",
  "under", "again", "further", "then", "once", "i", "you", "he", "she", "it", "we", "they",
  "what", "which", "who", "whom", "this", "that", "these", "those", "am", "been", "being",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
  "same", "so", "than", "too", "very", "just", "and", "but", "if", "or", "because", "until",
  "while", "about", "against", "between", "into", "through", "how", "when", "where", "why",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Score FAQ entries against a user query; higher is better. */
export function rankQuestions(query: string, limit = 5): RankedQA[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const tokens = tokenize(raw);
  const ranked: RankedQA[] = [];

  for (const entry of QA_PAIRS) {
    const hay = `${entry.q} ${entry.a} ${(entry.keywords ?? []).join(" ")}`.toLowerCase();
    let score = 0;
    if (hay.includes(raw)) score += 25;
    for (const t of tokens) {
      if (hay.includes(t)) score += 3;
    }
    if (score > 0) ranked.push({ entry, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

export const NO_MATCH_REPLY =
  "I couldn’t match that to one of my 50 saved answers. Try different keywords (e.g. API, dark mode, classes, TensorFlow, port 8010) or browse the full list below.";
