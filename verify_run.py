"""Smoke test: dataset paths, one batch from generators, SavedModel inference."""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

import numpy as np
import tensorflow as tf

BASE_DIR = os.path.join(
    ROOT,
    "dataset",
    "New Plant Diseases Dataset(Augmented)",
    "New Plant Diseases Dataset(Augmented)",
)
TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR = os.path.join(BASE_DIR, "valid")
TEST_DIR = os.path.join(ROOT, "dataset", "test", "test")
IMG_SHAPE = (256, 256)
BATCH_SIZE = 8

def main():
    assert os.path.isdir(TRAIN_DIR), TRAIN_DIR
    assert os.path.isdir(VAL_DIR), VAL_DIR
    assert os.path.isdir(TEST_DIR), TEST_DIR

    from tensorflow.keras.preprocessing.image import ImageDataGenerator

    gen = ImageDataGenerator(rescale=1.0 / 255)
    train_flow = gen.flow_from_directory(
        TRAIN_DIR, target_size=IMG_SHAPE, batch_size=BATCH_SIZE, class_mode="categorical"
    )
    x, y = next(train_flow)
    assert x.shape == (BATCH_SIZE, *IMG_SHAPE, 3)
    assert y.shape == (BATCH_SIZE, train_flow.num_classes)
    print("Train batch OK:", x.shape, "classes:", train_flow.num_classes)

    m = tf.saved_model.load(os.path.join(ROOT, "models", "plant_leaf_disease_detector"))
    fn = m.signatures["serving_default"]
    # Input name varies; pass tensor dict from concrete function
    input_key = list(fn.structured_input_signature[1].keys())[0]
    inp = tf.convert_to_tensor(x[:1], dtype=tf.float32)
    out = fn(**{input_key: inp})
    out_tensor = list(out.values())[0]
    print("Inference OK:", out_tensor.shape)

    test_files = [f for f in os.listdir(TEST_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    print("Test images:", len(test_files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
