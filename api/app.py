"""FastAPI backend for plant leaf disease classification."""
import base64
import io
import os
import sys
from contextlib import asynccontextmanager
from typing import List, Optional, Tuple

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image

from inference import (
    LeafDiseasePredictor,
    MultiModelPredictor,
    class_names,
    resolve_train_dir,
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024
_predictor: Optional[LeafDiseasePredictor]   = None
_multi:     Optional[MultiModelPredictor]    = None

_BOX = 256


# ── Pydantic models ────────────────────────────────────────────────────────

class DetectionItem(BaseModel):
    class_name: str   = Field(..., description="Predicted disease / plant class")
    confidence: float = Field(..., ge=0.0, le=1.0)
    xmin: int = Field(0)
    ymin: int = 0
    xmax: int = _BOX
    ymax: int = _BOX


class DetectResponse(BaseModel):
    detections:         List[DetectionItem]
    image_jpeg_base64:  str = Field(..., description="Input re-encoded as JPEG (base64)")


class Top3Item(BaseModel):
    class_name: str
    confidence: float


class ModelResult(BaseModel):
    model:           str
    status:          str
    predicted_class: Optional[str]  = None
    confidence:      Optional[float] = None
    top3:            Optional[List[Top3Item]] = None
    error:           Optional[str]  = None


class CompareResponse(BaseModel):
    filename: Optional[str]
    results:  List[ModelResult]


# ── Helpers ────────────────────────────────────────────────────────────────

def _looks_like_image_bytes(data: bytes) -> bool:
    if len(data) < 12:
        return False
    if data[:3] == b"\xff\xd8\xff":               return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":          return True
    if data[:6] in (b"GIF87a", b"GIF89a"):        return True
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP": return True
    return False


async def _read_upload(
    file:  Optional[UploadFile],
    image: Optional[UploadFile],
) -> Tuple[bytes, Optional[str]]:
    upload: Optional[UploadFile] = file or image
    if upload is None:
        raise HTTPException(400, "Send image as multipart 'file' or 'image' field.")
    data = await upload.read()
    if len(data) == 0:
        raise HTTPException(400, "Empty file.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "File too large (max 15 MB).")
    ct = (upload.content_type or "").lower()
    if not (ct.startswith("image/") or _looks_like_image_bytes(data)):
        raise HTTPException(400, "Expected an image file (JPEG/PNG/GIF/WebP).")
    return data, upload.filename


def _jpeg_base64(data: bytes) -> str:
    im = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=90)
    return base64.b64encode(buf.getvalue()).decode("ascii")


# ── Startup / shutdown ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_: FastAPI):
    global _predictor, _multi

    # Single-model predictor (backward compatible)
    p = LeafDiseasePredictor()
    p.load()
    _predictor = p

    # Multi-model predictor (all available models)
    m = MultiModelPredictor()
    m.load()
    _multi = m

    yield

    _predictor = None
    _multi     = None


app = FastAPI(
    title       = "Plant Leaf Disease Detection API",
    description = "Classify leaf images with the Custom CNN, Pretrained MobileNetV2, "
                  "and (if available) Trained MobileNetV2.",
    version     = "2.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":        "ok",
        "model_loaded":  _predictor is not None,
        "models_loaded": _multi.loaded_names() if _multi else [],
    }


@app.get("/classes")
def classes():
    try:
        names = class_names()
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e
    return {"count": len(names), "classes": names}


async def _predict_from_bytes(data: bytes) -> Tuple[str, float, List[float]]:
    if _predictor is None:
        raise HTTPException(503, "Model not loaded")
    try:
        return _predictor.predict_bytes(data)
    except OSError as e:
        raise HTTPException(400, f"Invalid image: {e}") from e
    except Exception as e:
        raise HTTPException(500, str(e)) from e


@app.post("/predict")
async def predict(
    file:  Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """Predict using the original Custom CNN (single result)."""
    data, filename = await _read_upload(file, image)
    label, confidence, probs = await _predict_from_bytes(data)

    labels   = _predictor.labels
    top5_idx = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:5]
    top5     = [{"class": labels[i], "confidence": probs[i]} for i in top5_idx]

    return {
        "filename":        filename,
        "predicted_class": label,
        "confidence":      confidence,
        "top5":            top5,
    }


@app.post("/predict/compare", response_model=CompareResponse)
async def predict_compare(
    file:  Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """
    Run the image through ALL available models and return side-by-side results.

    Models included (when available):
    - Custom CNN (trained from scratch, 256x256)
    - Pretrained MobileNetV2 (best_model.h5, 224x224)
    - MobileNetV2 trained (Train.ipynb output, 256x256)
    """
    if _multi is None:
        raise HTTPException(503, "Models not loaded")

    data, filename = await _read_upload(file, image)

    try:
        raw_results = _multi.predict_bytes(data)
    except OSError as e:
        raise HTTPException(400, f"Invalid image: {e}") from e
    except Exception as e:
        raise HTTPException(500, str(e)) from e

    results = []
    for r in raw_results:
        if r["status"] == "ok":
            results.append(ModelResult(
                model           = r["model"],
                status          = "ok",
                predicted_class = r["predicted_class"],
                confidence      = r["confidence"],
                top3            = [Top3Item(class_name=t["class"], confidence=t["confidence"])
                                   for t in r["top3"]],
            ))
        else:
            results.append(ModelResult(
                model  = r["model"],
                status = "error",
                error  = r.get("error", "unknown error"),
            ))

    return CompareResponse(filename=filename, results=results)


async def _detect_core(data: bytes, include_image: bool) -> DetectResponse:
    label, conf, _probs = await _predict_from_bytes(data)
    item = DetectionItem(class_name=label, confidence=conf)
    b64  = _jpeg_base64(data) if include_image else ""
    return DetectResponse(detections=[item], image_jpeg_base64=b64)


@app.post("/api/detect", response_model=DetectResponse, response_model_exclude_none=True)
@app.post("/detect",     response_model=DetectResponse, response_model_exclude_none=True)
async def api_detect(
    include_image: bool = Query(True),
    file:  Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """Detection-shaped JSON (single box covering full image)."""
    data, _ = await _read_upload(file, image)
    return await _detect_core(data, include_image)


@app.get("/")
def root():
    try:
        resolve_train_dir()
        dataset_ok = True
    except FileNotFoundError:
        dataset_ok = False
    return {
        "service":                 "plant-leaf-disease-api",
        "docs":                    "/docs",
        "endpoints": {
            "health":              "GET  /health",
            "classes":             "GET  /classes",
            "predict (CNN)":       "POST /predict",
            "predict (compare)":   "POST /predict/compare",
            "detect (bbox JSON)":  "POST /detect  or  POST /api/detect",
        },
        "dataset_labels_available": dataset_ok,
    }
