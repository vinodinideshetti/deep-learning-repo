"""Run inference on one image using all available models and print comparison."""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

from inference import MultiModelPredictor, MODEL_DIR


def first_image_path() -> str:
    test_flat = os.path.join(ROOT, "dataset", "test", "test")
    if os.path.isdir(test_flat):
        for name in sorted(os.listdir(test_flat)):
            if name.lower().endswith((".jpg", ".jpeg", ".png")):
                path = os.path.join(test_flat, name)
                if os.path.isfile(path):
                    return path
    from inference import resolve_train_dir
    valid_root = os.path.join(os.path.dirname(resolve_train_dir()), "valid")
    if os.path.isdir(valid_root):
        for dirpath, _, files in os.walk(valid_root):
            for name in sorted(files):
                if name.lower().endswith((".jpg", ".jpeg", ".png")):
                    path = os.path.join(dirpath, name)
                    if os.path.isfile(path):
                        return path
    raise FileNotFoundError("No sample image found under dataset/test/test or valid/.")


def print_comparison(results: list, img_path: str) -> None:
    W_MODEL = 30
    W_CLASS = 42
    W_CONF  = 10
    SEP     = "-" * (W_MODEL + W_CLASS + W_CONF + 4)

    print()
    print(f"  Image : {img_path}")
    print()
    print(f"  {'Model':<{W_MODEL}} {'Predicted Class':<{W_CLASS}} {'Confidence':>{W_CONF}}")
    print(f"  {SEP}")
    for r in results:
        if r["status"] == "ok":
            print(f"  {r['model']:<{W_MODEL}} {r['predicted_class']:<{W_CLASS}} {r['confidence']:>{W_CONF}.4f}")
        else:
            print(f"  {r['model']:<{W_MODEL}} ERROR: {r['error']}")
    print(f"  {SEP}")

    # Top-3 breakdown per model
    print()
    for r in results:
        if r["status"] != "ok":
            continue
        print(f"  {r['model']} -Top 3 predictions:")
        for i, t in enumerate(r["top3"], 1):
            bar = "#" * int(t["confidence"] * 20)
            print(f"    {i}. {t['class']:<42} {t['confidence']:.4f}  {bar}")
        print()


def main() -> int:
    img_path = sys.argv[1] if len(sys.argv) > 1 else None

    print()
    print("=" * 60)
    print("  Plant Leaf Disease Detection - Model Comparison")
    print("=" * 60)
    print()
    print("  Loading models ...")
    multi = MultiModelPredictor()
    multi.load()

    if not multi._loaded:
        print("\n  No models available. Train or provide model files first.", file=sys.stderr)
        return 1

    if img_path is None:
        try:
            img_path = first_image_path()
        except FileNotFoundError as e:
            print(f"\n  {e}", file=sys.stderr)
            return 1

    results = multi.predict_path(img_path)
    print_comparison(results, img_path)

    # Highlight agreement
    classes = [r["predicted_class"] for r in results if r["status"] == "ok"]
    if len(set(classes)) == 1:
        print(f"  All models agree: {classes[0]}")
    else:
        print(f"  Models disagree -check top-3 above for details.")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
