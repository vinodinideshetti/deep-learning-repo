export function AboutPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">About this app</h1>
      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
        This interface talks to a <strong>TensorFlow</strong> model (SavedModel) trained on the{" "}
        <strong>New Plant Diseases (Augmented)</strong> style benchmark: 38 classes mixing crop species and
        conditions (healthy vs various diseases).
      </p>
      <h2 className="mt-8 text-lg font-semibold text-slate-900 dark:text-white">What the model does</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
        <li>
          <strong>Image classification</strong> — one predicted label per image with softmax probabilities.
        </li>
        <li>
          It does <strong>not</strong> draw disease regions on the leaf; any &quot;detection&quot; API in this
          project maps that single label to a full-frame box for compatibility with older UIs.
        </li>
      </ul>
      <h2 className="mt-8 text-lg font-semibold text-slate-900 dark:text-white">Disclaimer</h2>
      <p className="text-slate-600 dark:text-slate-300">
        Outputs are for <strong>education and screening only</strong>. Agricultural decisions should involve
        local extension services, agronomists, or plant pathologists and appropriate lab tests where needed.
      </p>
      <h2 className="mt-8 text-lg font-semibold text-slate-900 dark:text-white">Credits</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Original notebook and model concept: Mayur Garg. Frontend and API wiring added in this repository
        fork.
      </p>
    </div>
  );
}
