"""Single confidence curve comparing Custom CNN vs Pretrained MobileNetV2."""
import os
import numpy as np
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

from inference import LeafDiseasePredictor, PretrainedMobileNetV2Predictor

PLOTS_DIR = os.path.join(ROOT, "plots")
TEST_DIR  = os.path.join(ROOT, "dataset", "test", "test")
os.makedirs(PLOTS_DIR, exist_ok=True)

# ── Load models ────────────────────────────────────────────────────────────

print("Loading models ...")
cnn = LeafDiseasePredictor()
cnn.load()

pt = PretrainedMobileNetV2Predictor()
pt.load()

# ── Run inference on all test images ──────────────────────────────────────

test_files = sorted(
    f for f in os.listdir(TEST_DIR)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
)

print(f"Running on {len(test_files)} test images ...")

cnn_confs, pt_confs, short_names = [], [], []

for fname in test_files:
    path = os.path.join(TEST_DIR, fname)
    _, conf, _ = cnn.predict_path(path)
    cnn_confs.append(conf)
    _, conf, _ = pt.predict_path(path)
    pt_confs.append(conf)
    short_names.append(fname.replace(".JPG", "").replace(".jpg", ""))

cnn_arr = np.array(cnn_confs)
pt_arr  = np.array(pt_confs)

# Sort both by CNN confidence (low to high)
sort_idx     = np.argsort(cnn_arr)
x            = np.arange(1, len(test_files) + 1)
cnn_sorted   = cnn_arr[sort_idx]
pt_sorted    = pt_arr[sort_idx]
labels_sorted = [short_names[i] for i in sort_idx]

# ── Plot ───────────────────────────────────────────────────────────────────

fig, ax = plt.subplots(figsize=(16, 6))

ax.plot(x, cnn_sorted, color="steelblue",  linewidth=2.5, marker="o",
        markersize=6, label=f"Custom CNN      (mean={cnn_arr.mean():.2f})")
ax.plot(x, pt_sorted,  color="darkorange", linewidth=2.5, marker="s",
        markersize=6, linestyle="--", label=f"Pretrained MobileNetV2  (mean={pt_arr.mean():.2f})")

ax.fill_between(x, cnn_sorted, pt_sorted,
                where=(cnn_sorted >= pt_sorted),
                alpha=0.15, color="steelblue",  label="CNN more confident")
ax.fill_between(x, cnn_sorted, pt_sorted,
                where=(cnn_sorted < pt_sorted),
                alpha=0.15, color="darkorange", label="Pretrained MV2 more confident")

ax.axhline(0.5, color="gray", linestyle=":", linewidth=1.2, alpha=0.7)
ax.text(0.5, 0.52, "0.5 threshold", color="gray", fontsize=9, transform=ax.get_yaxis_transform())

ax.set_xticks(x)
ax.set_xticklabels(labels_sorted, rotation=45, ha="right", fontsize=8)
ax.set_ylabel("Confidence Score", fontsize=11)
ax.set_ylim(0, 1.1)
ax.set_xlim(0.5, len(test_files) + 0.5)
ax.set_title("Confidence Curve — Custom CNN vs Pretrained MobileNetV2\n"
             "(images sorted by CNN confidence, low to high)",
             fontsize=13, fontweight="bold")
ax.legend(fontsize=10, loc="upper left")

plt.tight_layout()
save_path = os.path.join(PLOTS_DIR, "comparison_confidence_curve.jpg")
plt.savefig(save_path, dpi=150, bbox_inches="tight")
print(f"\nSaved -> {save_path}")
plt.show()
