import { useCallback, useRef, useState } from "react";

type Props = {
  file: File | null;
  preview: string | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function UploadZone({ file, preview, onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f) return;
      if (f.size > 15 * 1024 * 1024) {
        alert("File too large (max 15 MB).");
        return;
      }
      onFile(f);
    },
    [onFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload leaf image"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e.dataTransfer.files);
      }}
      className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
        drag
          ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-950/30"
          : "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
        disabled={disabled}
      />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="max-h-48 max-w-full rounded-lg object-contain shadow-md"
        />
      ) : (
        <>
          <div className="mb-2 text-4xl" aria-hidden>
            🌿
          </div>
          <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
            Drag & drop a leaf photo
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">JPEG, PNG, WebP · max 15 MB</p>
        </>
      )}
      {file && (
        <p className="mt-2 max-w-full truncate px-4 text-xs text-slate-500" title={file.name}>
          {file.name}
        </p>
      )}
    </div>
  );
}
