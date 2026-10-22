import { resolveApiUrl } from "./settings";

export type HealthResponse = {
  status: string;
  model_loaded: boolean;
};

export type ClassesResponse = {
  count: number;
  classes: string[];
};

export type PredictResponse = {
  filename: string | null;
  predicted_class: string;
  confidence: number;
  top5: { class: string; confidence: number }[];
};

export type DetectResponse = {
  detections: {
    class_name: string;
    confidence: number;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  }[];
  image_jpeg_base64: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: unknown };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail))
      return j.detail.map((x: { msg?: string }) => x.msg ?? "").join("; ");
    return res.statusText || `HTTP ${res.status}`;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(resolveApiUrl("/health"));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<HealthResponse>;
}

export async function fetchClasses(): Promise<ClassesResponse> {
  const res = await fetch(resolveApiUrl("/classes"));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ClassesResponse>;
}

export async function predictImage(file: File): Promise<PredictResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(resolveApiUrl("/predict"), {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<PredictResponse>;
}

export async function detectImage(
  file: File,
  includeImage: boolean
): Promise<DetectResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const q = new URLSearchParams({
    include_image: includeImage ? "true" : "false",
  });
  const res = await fetch(`${resolveApiUrl("/api/detect")}?${q}`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<DetectResponse>;
}
