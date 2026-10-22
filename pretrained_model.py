import os
import h5py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.image import load_img, img_to_array, ImageDataGenerator
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

# ── Paths ──────────────────────────────────────────────────────────────────

PROJECT_ROOT    = os.path.dirname(os.path.abspath(__file__))
PRETRAINED_PATH = os.path.join(PROJECT_ROOT, "best_model.h5")
BASE_DIR        = os.path.join(PROJECT_ROOT, "dataset",
                               "New Plant Diseases Dataset(Augmented)",
                               "New Plant Diseases Dataset(Augmented)")
VAL_DIR         = os.path.join(BASE_DIR, "valid")
TEST_DIR        = os.path.join(PROJECT_ROOT, "dataset", "test", "test")
PLOTS_DIR       = os.path.join(PROJECT_ROOT, "plots")
os.makedirs(PLOTS_DIR, exist_ok=True)

# ── Constants ──────────────────────────────────────────────────────────────

IMG_SHAPE  = (224, 224)
BATCH_SIZE = 64
PLOTS_DPI  = 200

# ── Helpers ────────────────────────────────────────────────────────────────

def is_file_readable(path):
    try:
        open(path, "rb").close()
        return True
    except OSError:
        return False

def val_dataset_available():
    """Return True only if the validation folder exists and files are readable."""
    if not os.path.isdir(VAL_DIR):
        return False
    for cls in os.listdir(VAL_DIR):
        cls_path = os.path.join(VAL_DIR, cls)
        if not os.path.isdir(cls_path):
            continue
        files = os.listdir(cls_path)
        if files:
            return is_file_readable(os.path.join(cls_path, files[0]))
    return False

# ── Load pretrained model ──────────────────────────────────────────────────
# best_model.h5 was saved with Keras 2.10.0.
# Direct load_model() fails on Keras 3 due to DepthwiseConv2D 'groups' param
# and weight naming changes, so we rebuild the architecture and copy weights.

def _weight_sort_key(name):
    # Must match Keras 3 layer.weights order exactly:
    # Conv/Depthwise: kernel | BN: gamma, beta, moving_mean, moving_variance | Dense: kernel, bias
    order = {
        "depthwise_kernel": 0,
        "kernel":           0,
        "gamma":            1,
        "beta":             2,
        "moving_mean":      3,
        "moving_variance":  4,
        "bias":             5,
    }
    for key, priority in order.items():
        if key in name:
            return priority
    return 99

def load_pretrained_model(h5_path):
    base = MobileNetV2(
        input_shape = (*IMG_SHAPE, 3),
        include_top = False,
        pooling     = "avg",
        weights     = None,
    )

    model = Sequential([
        base,
        Dense(128, activation="relu",    name="dense_6"),
        Dropout(0.5,                      name="dropout_4"),
        Dense(128, activation="relu",    name="dense_7"),
        Dropout(0.5,                      name="dropout_5"),
        Dense(39,  activation="softmax", name="dense_8"),
    ], name="Pretrained_MobileNetV2")

    model.build((None, *IMG_SHAPE, 3))

    saved_weights = []
    with h5py.File(h5_path, "r") as f:
        mn_grp = f["model_weights"]["mobilenetv2_1.00_224"]
        for layer in base.layers:
            if layer.name in mn_grp:
                sub = mn_grp[layer.name]
                for wname in sorted(sub.keys(), key=_weight_sort_key):
                    saved_weights.append(np.array(sub[wname]))
        for lname in ["dense_6", "dense_7", "dense_8"]:
            grp = f["model_weights"][lname][lname]
            for wname in sorted(grp.keys(), key=_weight_sort_key):
                saved_weights.append(np.array(grp[wname]))

    model.set_weights(saved_weights)
    model.compile(
        optimizer = "adam",
        loss      = "categorical_crossentropy",
        metrics   = ["accuracy"],
    )
    return model

# ── Class name lookup (built from folder names — no file reads needed) ─────

def build_class_lookup(num_classes):
    """
    Build {index: class_name} from the sorted folder names in VAL_DIR.
    Works even when dataset files are not downloaded (OneDrive placeholders).
    Any index beyond the found folders is labelled 'Unknown_Class_{i}'.
    """
    folders = sorted(os.listdir(VAL_DIR)) if os.path.isdir(VAL_DIR) else []
    lookup  = {i: name for i, name in enumerate(folders)}
    for i in range(len(folders), num_classes):
        lookup[i] = f"Unknown_Class_{i}"
    return lookup

# ── Load test images ───────────────────────────────────────────────────────

def load_test_images():
    filenames = sorted(os.listdir(TEST_DIR))
    images = np.array([
        img_to_array(
            load_img(os.path.join(TEST_DIR, f), target_size=IMG_SHAPE),
            dtype="uint8"
        )
        for f in filenames
    ]) / 255.0
    return images, filenames

# ── Evaluate on test images ────────────────────────────────────────────────

def evaluate_test(model, test_images, test_filenames, class_name_lookup):
    preds        = np.argmax(model.predict(test_images, verbose=0), axis=1)
    pred_classes = [class_name_lookup[i] for i in preds]

    df = pd.DataFrame({
        "Filename"        : test_filenames,
        "Predicted Class" : pred_classes,
    })
    print("\n  Test predictions (33 images):")
    print(df.to_string(index=False))

    # Bar chart of predicted class distribution
    counts = df["Predicted Class"].value_counts()
    plt.figure(figsize=(14, 5))
    plt.bar(counts.index, counts.values, color="seagreen")
    plt.xticks(rotation=45, ha="right")
    plt.title("Pretrained MobileNetV2 — Predicted Class Distribution (Test Set)")
    plt.ylabel("Count")
    plt.tight_layout()
    save_path = os.path.join(PLOTS_DIR, "pretrained_test_predictions.jpg")
    plt.savefig(save_path, dpi=PLOTS_DPI, bbox_inches="tight")
    print(f"\n  Plot saved to: {save_path}")
    plt.show()

# ── Evaluate on validation set (only if dataset is locally available) ──────

def evaluate_validation(model):
    print("\n  Building validation generator ...")
    val_gen = ImageDataGenerator(rescale=1./255).flow_from_directory(
        directory   = VAL_DIR,
        batch_size  = BATCH_SIZE,
        shuffle     = False,
        target_size = IMG_SHAPE,
    )

    class_name_lookup = {idx: name for name, idx in val_gen.class_indices.items()}

    val_loss, val_acc = model.evaluate(val_gen, verbose=1)
    print(f"\n  Val accuracy : {val_acc:.4f}")
    print(f"  Val loss     : {val_loss:.4f}")

    # Confusion matrix
    val_preds   = np.argmax(model.predict(val_gen, verbose=0), axis=1)
    label_names = [class_name_lookup[i] for i in sorted(class_name_lookup)]

    _, ax = plt.subplots(figsize=(20, 16))
    ConfusionMatrixDisplay(
        confusion_matrix(val_gen.classes, val_preds),
        display_labels=label_names,
    ).plot(ax=ax, xticks_rotation="vertical")
    plt.title("Pretrained MobileNetV2 — Confusion Matrix (Validation Set)")
    plt.tight_layout()
    save_path = os.path.join(PLOTS_DIR, "pretrained_confusion_matrix.jpg")
    plt.savefig(save_path, dpi=PLOTS_DPI, bbox_inches="tight")
    print(f"  Confusion matrix saved to: {save_path}")
    plt.show()

    return val_acc, val_loss, class_name_lookup

# ── Model info ─────────────────────────────────────────────────────────────

def print_model_info(model):
    print("\n  Model      :", model.name)
    print("  Input      :", model.input_shape)
    print("  Output     :", model.output_shape)
    print("  Parameters :", f"{model.count_params():,}")
    print("  Classes    : 39")

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  Loading pretrained model ...")
    print("=" * 55)
    model = load_pretrained_model(PRETRAINED_PATH)
    print("  Model loaded successfully.")
    print_model_info(model)

    # ── Test images (always available) ────────────────────────────────────
    print("\n" + "=" * 55)
    print("  Test Image Evaluation")
    print("=" * 55)
    test_images, test_filenames = load_test_images()
    class_name_lookup = build_class_lookup(num_classes=39)
    evaluate_test(model, test_images, test_filenames, class_name_lookup)

    # ── Validation set (only if files are locally downloaded) ─────────────
    print("\n" + "=" * 55)
    print("  Validation Set Evaluation")
    print("=" * 55)
    if val_dataset_available():
        evaluate_validation(model)
    else:
        print("\n  Validation dataset files are not available locally.")
        print("  This usually means the dataset is stored in OneDrive")
        print("  but not yet downloaded to disk.")
        print("\n  To fix: right-click the dataset folder in File Explorer")
        print("  and select 'Always keep on this device' to sync it.")
        print("\n  Skipping validation evaluation.")
