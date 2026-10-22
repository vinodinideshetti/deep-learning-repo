"""Shared model loading and prediction for CLI and API."""
import io
import os
from typing import Dict, List, Optional, Tuple

import h5py
import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.image import img_to_array, load_img

ROOT = os.path.dirname(os.path.abspath(__file__))

# ── Model paths ────────────────────────────────────────────────────────────
MODEL_DIR            = os.path.join(ROOT, "models", "plant_leaf_disease_detector")
_MOBILENET_SAVED_DIR = os.path.join(ROOT, "models", "mobilenet_plant_leaf_disease_detector")
_PRETRAINED_H5       = os.path.join(ROOT, "best_model.h5")


def _load_saved_model(path: str):
    """Load a SavedModel for inference only.

    Models exported with old TensorFlow versions embed an optimizer
    checkpoint that newer TF (Keras 3) can't restore (fails with
    "'_UserObject' object has no attribute 'add_slot'"). Retry with a
    partial load restricted to the root, which skips the optimizer state
    since it isn't needed to run `serving_default`.
    """
    try:
        return tf.saved_model.load(path)
    except AttributeError as e:
        if "add_slot" not in str(e):
            raise
        from tensorflow.python.saved_model import load as _tf_load
        return _tf_load.load_partial(path, filters=["root"])["root"]

# ── Image sizes ────────────────────────────────────────────────────────────
IMG_SIZE        = (256, 256)   # Custom CNN
_PRETRAINED_SIZE = (224, 224)  # best_model.h5


# ── Class names ────────────────────────────────────────────────────────────
# Fixed alphabetical label order matching how the models were trained
# (Keras assigns class indices by sorting subfolder names). Hardcoded
# instead of scanned from disk because OneDrive can leave a folder as an
# online-only placeholder that os.path.isdir() doesn't see as a directory
# (e.g. "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot"); a missing
# folder in the middle of the list would silently shift every class after
# it by one index, corrupting predictions for that class onward.
_CANONICAL_CLASS_NAMES: List[str] = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]


def resolve_train_dir() -> str:
    candidates = [
        os.path.join(ROOT, "dataset", "New Plant Diseases Dataset(Augmented)",
                     "New Plant Diseases Dataset(Augmented)", "train"),
        os.path.join(ROOT, "New Plant Diseases Dataset(Augmented)",
                     "New Plant Diseases Dataset(Augmented)", "train"),
    ]
    for p in candidates:
        if os.path.isdir(p):
            return p
    raise FileNotFoundError("Could not find train/ folder (expected under dataset/...).")


def _resolve_val_dir() -> str:
    path = os.path.join(ROOT, "dataset", "New Plant Diseases Dataset(Augmented)",
                        "New Plant Diseases Dataset(Augmented)", "valid")
    if os.path.isdir(path):
        return path
    raise FileNotFoundError("Could not find valid/ folder.")


def class_names() -> List[str]:
    return list(_CANONICAL_CLASS_NAMES)


def _class_names_from_val(num_classes: int) -> List[str]:
    """Build class list from sorted folder names.

    OneDrive can leave a class folder as an online-only placeholder that
    os.path.isdir() reports as a plain file, which would otherwise drop
    it from the list and shift every class after it by one index. Class
    folder names never contain a "." (unlike the image files inside
    them), so treat any dotless entry as a class folder too.
    """
    try:
        val     = _resolve_val_dir()
        entries = sorted(
            e for e in os.listdir(val)
            if os.path.isdir(os.path.join(val, e)) or "." not in e
        )
        names   = list(entries)
    except FileNotFoundError:
        names = []
    while len(names) < num_classes:
        names.append(f"Unknown_Class_{len(names)}")
    return names[:num_classes]


# ── Image preprocessing ────────────────────────────────────────────────────

def preprocess_pil(img: Image.Image, size: Tuple[int, int] = IMG_SIZE) -> np.ndarray:
    img = img.convert("RGB").resize(size)
    x   = np.asarray(img, dtype=np.float32) / 255.0
    return np.expand_dims(x, axis=0)


def preprocess_path(path: str, size: Tuple[int, int] = IMG_SIZE) -> np.ndarray:
    img = load_img(path, target_size=size)
    x   = img_to_array(img, dtype="float32")
    return np.expand_dims(x, axis=0) / 255.0


# ── 1. Custom CNN (original SavedModel) ───────────────────────────────────

class LeafDiseasePredictor:
    """Custom CNN trained from scratch, saved as TF SavedModel."""

    name = "Custom CNN"

    def __init__(self) -> None:
        self._fn    = None
        self._names: List[str] = []

    @property
    def labels(self) -> List[str]:
        if not self._names:
            raise RuntimeError("Model not loaded; call load() first.")
        return self._names

    def available(self) -> bool:
        return os.path.isdir(MODEL_DIR)

    def load(self) -> None:
        if not os.path.isdir(MODEL_DIR):
            raise FileNotFoundError(f"Model directory not found: {MODEL_DIR}")
        m           = _load_saved_model(MODEL_DIR)
        self._fn    = m.signatures["serving_default"]
        # Infer number of output classes from the model itself
        dummy       = np.zeros((1, *IMG_SIZE, 3), dtype="float32")
        out         = self._fn(Input=tf.convert_to_tensor(dummy))["Output"].numpy()
        num_classes = out.shape[1]
        names       = class_names()
        # Pad if OneDrive hides one folder from os.path.isdir()
        while len(names) < num_classes:
            names.append(f"Unknown_Class_{len(names)}")
        self._names = names[:num_classes]

    def predict_batch(self, x: np.ndarray) -> Tuple[str, float, List[float]]:
        if self._fn is None:
            raise RuntimeError("Model not loaded; call load() first.")
        out   = self._fn(Input=tf.convert_to_tensor(x, dtype=tf.float32))["Output"].numpy()
        idx   = int(np.argmax(out[0]))
        probs = out[0].tolist()
        return self._names[idx], float(out[0][idx]), probs

    def predict_bytes(self, data: bytes) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_pil(Image.open(io.BytesIO(data)), IMG_SIZE))

    def predict_path(self, path: str) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_path(path, IMG_SIZE))


# ── 2. Pretrained MobileNetV2 (best_model.h5) ─────────────────────────────

def _weight_sort_key(name: str) -> int:
    # Must match Keras 3 layer.weights order:
    # Conv: kernel | BN: gamma, beta, moving_mean, moving_variance | Dense: kernel, bias
    order = {
        "depthwise_kernel": 0, "kernel":          0,
        "gamma":            1, "beta":             2,
        "moving_mean":      3, "moving_variance":  4,
        "bias":             5,
    }
    for key, pri in order.items():
        if key in name:
            return pri
    return 99


def _load_pretrained_h5(h5_path: str) -> tf.keras.Model:
    """Rebuild MobileNetV2 + Dense head and restore weights from Keras 2.10 h5 file."""
    size = _PRETRAINED_SIZE
    base = MobileNetV2(input_shape=(*size, 3), include_top=False, pooling="avg", weights=None)
    model = Sequential([
        base,
        Dense(128, activation="relu",    name="dense_6"),
        Dropout(0.5,                      name="dropout_4"),
        Dense(128, activation="relu",    name="dense_7"),
        Dropout(0.5,                      name="dropout_5"),
        Dense(39,  activation="softmax", name="dense_8"),
    ], name="Pretrained_MobileNetV2")
    model.build((None, *size, 3))

    saved = []
    with h5py.File(h5_path, "r") as f:
        mn = f["model_weights"]["mobilenetv2_1.00_224"]
        for layer in base.layers:
            if layer.name in mn:
                for wn in sorted(mn[layer.name].keys(), key=_weight_sort_key):
                    saved.append(np.array(mn[layer.name][wn]))
        for ln in ["dense_6", "dense_7", "dense_8"]:
            g = f["model_weights"][ln][ln]
            for wn in sorted(g.keys(), key=_weight_sort_key):
                saved.append(np.array(g[wn]))

    model.set_weights(saved)
    return model


class PretrainedMobileNetV2Predictor:
    """MobileNetV2 loaded from best_model.h5 (Keras 2.10 checkpoint)."""

    name = "Pretrained MobileNetV2"

    def __init__(self) -> None:
        self._model = None
        self._names: List[str] = []

    @property
    def labels(self) -> List[str]:
        if not self._names:
            raise RuntimeError("Model not loaded; call load() first.")
        return self._names

    def available(self) -> bool:
        return os.path.isfile(_PRETRAINED_H5)

    def load(self) -> None:
        if not os.path.isfile(_PRETRAINED_H5):
            raise FileNotFoundError(f"Pretrained model not found: {_PRETRAINED_H5}")
        self._model = _load_pretrained_h5(_PRETRAINED_H5)
        self._names = _class_names_from_val(39)

    def predict_batch(self, x: np.ndarray) -> Tuple[str, float, List[float]]:
        if self._model is None:
            raise RuntimeError("Model not loaded; call load() first.")
        out   = self._model.predict(x, verbose=0)
        idx   = int(np.argmax(out[0]))
        probs = out[0].tolist()
        return self._names[idx], float(out[0][idx]), probs

    def predict_bytes(self, data: bytes) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_pil(Image.open(io.BytesIO(data)), _PRETRAINED_SIZE))

    def predict_path(self, path: str) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_path(path, _PRETRAINED_SIZE))


# ── 3. Trained MobileNetV2 (saved from Train.ipynb) ───────────────────────

class TrainedMobileNetV2Predictor:
    """MobileNetV2 trained in Train.ipynb and saved as TF SavedModel."""

    name = "MobileNetV2 (trained)"

    def __init__(self) -> None:
        self._fn    = None
        self._names: List[str] = []

    @property
    def labels(self) -> List[str]:
        if not self._names:
            raise RuntimeError("Model not loaded; call load() first.")
        return self._names

    def available(self) -> bool:
        return os.path.isdir(_MOBILENET_SAVED_DIR)

    def load(self) -> None:
        if not os.path.isdir(_MOBILENET_SAVED_DIR):
            raise FileNotFoundError(f"MobileNetV2 SavedModel not found: {_MOBILENET_SAVED_DIR}")
        self._names = class_names()
        m           = _load_saved_model(_MOBILENET_SAVED_DIR)
        self._fn    = m.signatures["serving_default"]

    def predict_batch(self, x: np.ndarray) -> Tuple[str, float, List[float]]:
        if self._fn is None:
            raise RuntimeError("Model not loaded; call load() first.")
        out_dict = self._fn(MN_Input=tf.convert_to_tensor(x, dtype=tf.float32))
        out      = list(out_dict.values())[0].numpy()
        idx      = int(np.argmax(out[0]))
        probs    = out[0].tolist()
        return self._names[idx], float(out[0][idx]), probs

    def predict_bytes(self, data: bytes) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_pil(Image.open(io.BytesIO(data)), IMG_SIZE))

    def predict_path(self, path: str) -> Tuple[str, float, List[float]]:
        return self.predict_batch(preprocess_path(path, IMG_SIZE))


# ── Multi-model comparison ─────────────────────────────────────────────────

class MultiModelPredictor:
    """Loads all available models and returns side-by-side predictions."""

    def __init__(self) -> None:
        self._all     = [
            LeafDiseasePredictor(),
            PretrainedMobileNetV2Predictor(),
            TrainedMobileNetV2Predictor(),
        ]
        self._loaded: List = []

    def load(self) -> None:
        self._loaded = []
        for p in self._all:
            if p.available():
                try:
                    p.load()
                    self._loaded.append(p)
                    print(f"  Loaded  : {p.name}")
                except Exception as e:
                    print(f"  Skipped : {p.name} — {e}")
            else:
                print(f"  Missing : {p.name}")

    def loaded_names(self) -> List[str]:
        return [p.name for p in self._loaded]

    def predict_bytes(self, data: bytes) -> List[Dict]:
        return [self._run(p, "bytes", data) for p in self._loaded]

    def predict_path(self, path: str) -> List[Dict]:
        return [self._run(p, "path", path) for p in self._loaded]

    def _run(self, predictor, mode: str, source) -> Dict:
        try:
            if mode == "bytes":
                label, conf, probs = predictor.predict_bytes(source)
            else:
                label, conf, probs = predictor.predict_path(source)
            labels   = predictor.labels
            top3_idx = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:3]
            top3     = [{"class": labels[i], "confidence": round(probs[i], 4)}
                        for i in top3_idx]
            return {
                "model":           predictor.name,
                "predicted_class": label,
                "confidence":      round(conf, 4),
                "top3":            top3,
                "status":          "ok",
            }
        except Exception as e:
            return {
                "model":  predictor.name,
                "status": "error",
                "error":  str(e),
            }
