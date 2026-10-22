"""Generate 2 comparison graphs between Custom CNN and Pretrained MobileNetV2."""
import os
import sys

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

from inference import (
    LeafDiseasePredictor,
    PretrainedMobileNetV2Predictor,
    preprocess_path,
)

PLOTS_DIR = os.path.join(ROOT, "plots")
TEST_DIR  = os.path.join(ROOT, "dataset", "test", "test")
DPI       = 150

os.makedirs(PLOTS_DIR, exist_ok=True)

# ── Load models ────────────────────────────────────────────────────────────

print("Loading Custom CNN ...")
cnn = LeafDiseasePredictor()
cnn.load()

print("Loading Pretrained MobileNetV2 ...")
pt = PretrainedMobileNetV2Predictor()
pt.load()

# ── Run on all test images ─────────────────────────────────────────────────

test_files = sorted(
    f for f in os.listdir(TEST_DIR)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
)

print(f"Running inference on {len(test_files)} test images ...\n")

cnn_labels, cnn_confs = [], []
pt_labels,  pt_confs  = [], []
short_names           = []

for fname in test_files:
    path = os.path.join(TEST_DIR, fname)

    lbl, conf, _ = cnn.predict_path(path)
    cnn_labels.append(lbl)
    cnn_confs.append(conf)

    lbl, conf, _ = pt.predict_path(path)
    pt_labels.append(lbl)
    pt_confs.append(conf)

    short_names.append(fname.replace(".JPG", "").replace(".jpg", ""))

# ── Graph 1: Confidence per test image ────────────────────────────────────
# Grouped bar chart — one group per image, two bars per group

print("Generating Graph 1: Confidence per test image ...")

x      = np.arange(len(test_files))
width  = 0.38
fig, ax = plt.subplots(figsize=(18, 6))

bars1 = ax.bar(x - width / 2, cnn_confs, width, label="Custom CNN",
               color="steelblue", alpha=0.85)
bars2 = ax.bar(x + width / 2, pt_confs,  width, label="Pretrained MobileNetV2",
               color="darkorange", alpha=0.85)

ax.set_xticks(x)
ax.set_xticklabels(short_names, rotation=45, ha="right", fontsize=7.5)
ax.set_ylabel("Confidence Score")
ax.set_ylim(0, 1.12)
ax.set_title("Graph 1 — Prediction Confidence per Test Image\n(Custom CNN vs Pretrained MobileNetV2)",
             fontsize=13, fontweight="bold")
ax.legend(fontsize=11)
ax.axhline(0.5, color="gray", linestyle="--", linewidth=0.8, alpha=0.6)
ax.text(len(test_files) - 0.5, 0.51, "0.5 threshold", color="gray", fontsize=8)

# Colour bars red where models disagree
for i, (cl, pl) in enumerate(zip(cnn_labels, pt_labels)):
    if cl != pl:
        bars1[i].set_edgecolor("red")
        bars1[i].set_linewidth(1.5)
        bars2[i].set_edgecolor("red")
        bars2[i].set_linewidth(1.5)

red_patch = mpatches.Patch(edgecolor="red", facecolor="white",
                            linewidth=1.5, label="Models disagree (red border)")
ax.legend(handles=[
    mpatches.Patch(color="steelblue",   label="Custom CNN"),
    mpatches.Patch(color="darkorange",  label="Pretrained MobileNetV2"),
    red_patch,
], fontsize=10)

plt.tight_layout()
path1 = os.path.join(PLOTS_DIR, "comparison_confidence_per_image.jpg")
plt.savefig(path1, dpi=DPI, bbox_inches="tight")
plt.show()
print(f"  Saved -> {path1}\n")

# ── Graph 2: Predicted class distribution ─────────────────────────────────
# Horizontal bar chart: unique classes predicted by each model

print("Generating Graph 2: Predicted class distribution ...")

from collections import Counter

cnn_counts = Counter(cnn_labels)
pt_counts  = Counter(pt_labels)

# Union of all predicted classes, sorted
all_classes = sorted(set(cnn_counts) | set(pt_counts))

cnn_vals = [cnn_counts.get(c, 0) for c in all_classes]
pt_vals  = [pt_counts.get(c, 0)  for c in all_classes]

y     = np.arange(len(all_classes))
height = 0.38

fig, ax = plt.subplots(figsize=(12, max(6, len(all_classes) * 0.55)))

ax.barh(y + height / 2, cnn_vals, height, label="Custom CNN",
        color="steelblue", alpha=0.85)
ax.barh(y - height / 2, pt_vals,  height, label="Pretrained MobileNetV2",
        color="darkorange", alpha=0.85)

ax.set_yticks(y)
ax.set_yticklabels(all_classes, fontsize=9)
ax.set_xlabel("Number of Test Images Predicted as This Class")
ax.set_title("Graph 2 — Predicted Class Distribution on Test Set\n(Custom CNN vs Pretrained MobileNetV2)",
             fontsize=13, fontweight="bold")
ax.legend(fontsize=11)
ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))

# Annotate bars with counts
for i, (cv, pv) in enumerate(zip(cnn_vals, pt_vals)):
    if cv > 0:
        ax.text(cv + 0.05, i + height / 2, str(cv),
                va="center", fontsize=8, color="steelblue", fontweight="bold")
    if pv > 0:
        ax.text(pv + 0.05, i - height / 2, str(pv),
                va="center", fontsize=8, color="darkorange", fontweight="bold")

# Agreement summary in subtitle
agree = sum(1 for cl, pl in zip(cnn_labels, pt_labels) if cl == pl)
ax.set_xlabel(
    f"Number of Test Images Predicted as This Class\n"
    f"Models agree on {agree}/{len(test_files)} images "
    f"({agree/len(test_files)*100:.0f}%)",
    fontsize=10,
)

plt.tight_layout()
path2 = os.path.join(PLOTS_DIR, "comparison_class_distribution.jpg")
plt.savefig(path2, dpi=DPI, bbox_inches="tight")
plt.show()
print(f"  Saved -> {path2}\n")

# ── Console summary ────────────────────────────────────────────────────────

print("=" * 62)
print(f"  Agreement : {agree}/{len(test_files)} images ({agree/len(test_files)*100:.0f}%)")
print()
print(f"  {'Image':<28} {'Custom CNN':<26} {'Pretrained MobileNetV2'}")
print("  " + "-" * 88)
for fname, cl, cc, pl, pc in zip(short_names, cnn_labels, cnn_confs, pt_labels, pt_confs):
    match = "   " if cl == pl else "[!]"
    print(f"  {match} {fname:<26} {cl:<26} {pl}  ({pc:.2f})")
print("=" * 62)
