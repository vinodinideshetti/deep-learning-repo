import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { detectImage, predictImage, type DetectResponse, type PredictResponse } from "@/lib/api";
import { copyToClipboard } from "@/lib/copy";
import { guideForPredictedClass, PESTICIDE_DISCLAIMER, splitClassName } from "@/lib/plantInfo";
import { pushHistory } from "@/lib/settings";
import { Top5Bars } from "@/components/Top5Bars";
import { UploadZone } from "@/components/UploadZone";

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [detectExtra, setDetectExtra] = useState<DetectResponse | null>(null);
  const [compareDetect, setCompareDetect] = useState(false);
  const [copyOk, setCopyOk] = useState(false);

  const onFile = useCallback((f: File | null) => {
    setFile(f);
    setResult(null);
    setDetectExtra(null);
    setError(null);
    if (!f) {
      setPreview(null);
      return;
    }
    const r = new FileReader();
    r.onload = () => setPreview(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setDetectExtra(null);
    try {
      const pred = await predictImage(file);
      setResult(pred);
      if (preview) {
        pushHistory({
          thumb: preview,
          predicted_class: pred.predicted_class,
          confidence: pred.confidence,
          filename: pred.filename ?? file.name,
        });
      }
      if (compareDetect) {
        const det = await detectImage(file, false);
        setDetectExtra(det);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [file, preview, compareDetect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
      if (!file || loading) return;
      e.preventDefault();
      void run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, loading, run]);

  const exportJson = () => {
    if (!result) return;
    const g = guideForPredictedClass(result.predicted_class);
    const blob = new Blob(
      [
        JSON.stringify(
          {
            predicted_class: result.predicted_class,
            confidence: result.confidence,
            top5: result.top5,
            disease_description: g.description,
            pesticide_suggestions: g.pesticides,
            detect_compare: detectExtra,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prediction-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const { plant, condition } = result
    ? splitClassName(result.predicted_class)
    : { plant: "", condition: "" };
  const diseaseGuide = result ? guideForPredictedClass(result.predicted_class) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analyze a leaf
          </h1>
          <p className="mt-1 max-w-2xl text-slate-600 dark:text-slate-300">
            Upload a clear photo — the model returns one of 38 labels. Screening aid only; verify with an
            expert in the field.
          </p>
        </div>
        <Link
          to="/tips"
          className="shrink-0 rounded-xl border border-leaf-200 bg-leaf-50 px-4 py-2 text-sm font-medium text-leaf-800 hover:bg-leaf-100 dark:border-leaf-800 dark:bg-leaf-950/50 dark:text-leaf-200 dark:hover:bg-leaf-900/40"
        >
          Photo tips →
        </Link>
      </div>

      <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100/90">
        <strong>Classification</strong> (whole image), not bounding-box detection.{" "}
        <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">/api/detect</code> uses a full-frame
        box only.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <UploadZone file={file} preview={preview} onFile={onFile} disabled={loading} />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={compareDetect}
              onChange={(e) => setCompareDetect(e.target.checked)}
              className="rounded border-slate-300"
            />
            Also call <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/api/detect</code> (verify
            label)
          </label>
          <button
            type="button"
            onClick={() => void run()}
            disabled={!file || loading}
            className="w-full rounded-xl bg-leaf-600 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-600/25 transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Run analysis"}
          </button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Shortcut: <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">Ctrl</kbd>{" "}
            + <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">Enter</kbd>{" "}
            ( <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">⌘</kbd>{" "}
            + <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">Enter</kbd> on Mac )
          </p>
          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!result && !loading && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Results appear here after you run analysis.
            </p>
          )}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600" />
              <p className="text-sm text-slate-500">Running model…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prediction</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {plant}
                  {condition ? (
                    <span className="font-normal text-slate-600 dark:text-slate-300"> — {condition}</span>
                  ) : null}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-leaf-600 dark:text-leaf-400">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
                {diseaseGuide && (
                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        About this result
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {diseaseGuide.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Treatment / pesticide ideas
                      </p>
                      <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {diseaseGuide.pesticides.map((line, i) => (
                          <li key={i} className="leading-relaxed">
                            {line}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100/90">
                        {PESTICIDE_DISCLAIMER}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Top 5</p>
                <Top5Bars items={result.top5} />
              </div>
              {compareDetect && detectExtra && detectExtra.detections[0] && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="font-medium text-slate-700 dark:text-slate-200">/api/detect check</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {detectExtra.detections[0].class_name} ·{" "}
                    {(detectExtra.detections[0].confidence * 100).toFixed(1)}%
                  </p>
                  {detectExtra.detections[0].class_name !== result.predicted_class && (
                    <p className="mt-2 text-amber-700 dark:text-amber-300">
                      Labels differ — check API base URL and class order.
                    </p>
                  )}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!result) return;
                    const g = guideForPredictedClass(result.predicted_class);
                    const lines = [
                      `Prediction: ${result.predicted_class}`,
                      `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
                      "",
                      "About this result:",
                      g.description,
                      "",
                      "Treatment / pesticide ideas:",
                      ...g.pesticides.map((p) => `• ${p}`),
                      "",
                      PESTICIDE_DISCLAIMER,
                      "",
                      "Top 5:",
                      ...result.top5.map(
                        (t, i) => `${i + 1}. ${t.class} — ${(t.confidence * 100).toFixed(1)}%`
                      ),
                    ];
                    const ok = await copyToClipboard(lines.join("\n"));
                    if (ok) {
                      setCopyOk(true);
                      setTimeout(() => setCopyOk(false), 2000);
                    }
                  }}
                  className="rounded-xl border border-slate-200 py-2 text-sm font-medium dark:border-slate-600"
                >
                  {copyOk ? "Copied summary" : "Copy text summary"}
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  className="rounded-xl border border-slate-200 py-2 text-sm font-medium dark:border-slate-600"
                >
                  Download JSON
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
