#!/usr/bin/env python3
"""
Forensix / Criminal Eye — FS2K Pair Alignment & Preprocessing
Standardizes photo-sketch pairs to 512x512 resolution, normalizes sketch lineart
for ControlNet conditioning, and generates unified attribute manifests.
Outputs to:
  ai-service/datasets/processed/FS2K/aligned/
  ai-service/datasets/processed/FS2K/normalized/
  ai-service/datasets/processed/FS2K/metadata/
"""

import os
import sys
import json
import argparse
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
from PIL import Image, ImageOps, ImageFilter

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"

RAW_FS2K = DATASETS_DIR / "raw" / "FS2K"
PROCESSED_FS2K = DATASETS_DIR / "processed" / "FS2K"

ALIGNED_DIR = PROCESSED_FS2K / "aligned"
NORMALIZED_DIR = PROCESSED_FS2K / "normalized"
METADATA_DIR = PROCESSED_FS2K / "metadata"
MANIFESTS_DIR = PROCESSED_FS2K / "manifests"


def resolve_pair_paths(fs2k_dir: Path, img_name: str) -> tuple[Optional[Path], Optional[Path]]:
    photo_path = fs2k_dir / "photo" / f"{img_name}.jpg"
    if not photo_path.is_file():
        return None, None

    parts = img_name.split("/")
    sub = parts[0].replace("photo", "sketch")
    fname = parts[1].replace("image", "sketch")

    sketch_jpg = fs2k_dir / "sketch" / sub / f"{fname}.jpg"
    sketch_png = fs2k_dir / "sketch" / sub / f"{fname}.png"

    if sketch_jpg.is_file():
        sketch_path = sketch_jpg
    elif sketch_png.is_file():
        sketch_path = sketch_png
    else:
        sketch_path = None

    return photo_path, sketch_path


def normalize_sketch_lineart(sketch_img: Image.Image) -> Image.Image:
    """
    Normalizes a sketch into clean, high-contrast black-on-white lineart (512x512).
    Applies gentle contrast enhancement and thresholding suitable for ControlNet lineart.
    """
    gray = ImageOps.grayscale(sketch_img)
    # Autocontrast to maximize dynamic range
    contrasted = ImageOps.autocontrast(gray, cutoff=2)
    # Sharpen edges
    sharpened = contrasted.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    return sharpened


def main():
    parser = argparse.ArgumentParser(description="FS2K Pair Alignment & Preprocessing")
    parser.add_argument("--limit", type=int, default=100, help="Number of pairs to process (default: 100)")
    parser.add_argument("--all", action="store_true", help="Process entire dataset (2,104 pairs)")
    args = parser.parse_args()

    ALIGNED_DIR.mkdir(parents=True, exist_ok=True)
    NORMALIZED_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    MANIFESTS_DIR.mkdir(parents=True, exist_ok=True)

    # Load annotations
    with open(RAW_FS2K / "anno_train.json", "r", encoding="utf-8") as f:
        train_items = json.load(f)
    for item in train_items:
        item["split"] = "train"

    with open(RAW_FS2K / "anno_test.json", "r", encoding="utf-8") as f:
        test_items = json.load(f)
    for item in test_items:
        item["split"] = "test"

    all_items = train_items + test_items
    total_available = len(all_items)
    limit = total_available if args.all else min(args.limit, total_available)
    selected_items = all_items[:limit]

    print("================================================================")
    print("FS2K Pair Alignment & Lineart Normalization")
    print(f"Total available: {total_available} | Processing: {limit}")
    print("================================================================")

    t0 = time.time()
    manifest_records: List[Dict[str, Any]] = []
    processed_count = 0

    for idx, item in enumerate(selected_items):
        img_name = item["image_name"]
        photo_p, sketch_p = resolve_pair_paths(RAW_FS2K, img_name)

        if not photo_p or not sketch_p:
            continue

        try:
            # 1. Standardize Photo (512x512 RGB)
            with Image.open(photo_p) as p_img:
                p_rgb = p_img.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
                safe_id = img_name.replace("/", "_")
                aligned_photo_path = ALIGNED_DIR / f"{safe_id}_photo.jpg"
                p_rgb.save(aligned_photo_path, quality=95)

            # 2. Standardize Sketch (512x512 RGB)
            with Image.open(sketch_p) as s_img:
                s_rgb = s_img.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
                aligned_sketch_path = ALIGNED_DIR / f"{safe_id}_sketch.png"
                s_rgb.save(aligned_sketch_path)

                # 3. Compute Normalized Lineart Conditioning
                norm_sketch = normalize_sketch_lineart(s_rgb)
                norm_sketch_path = NORMALIZED_DIR / f"{safe_id}_norm_lineart.png"
                norm_sketch.save(norm_sketch_path)

            # 4. Construct record
            record = {
                "pair_id": safe_id,
                "split": item["split"],
                "style": item.get("style", 0),
                "raw_photo": str(photo_p.relative_to(AI_SERVICE_DIR)),
                "raw_sketch": str(sketch_p.relative_to(AI_SERVICE_DIR)),
                "aligned_photo": str(aligned_photo_path.relative_to(AI_SERVICE_DIR)),
                "aligned_sketch": str(aligned_sketch_path.relative_to(AI_SERVICE_DIR)),
                "normalized_lineart": str(norm_sketch_path.relative_to(AI_SERVICE_DIR)),
                "attributes": {
                    "gender": item.get("gender"),
                    "hair": item.get("hair"),
                    "hair_color": item.get("hair_color"),
                    "smile": item.get("smile"),
                    "earring": item.get("earring"),
                    "frontal_face": item.get("frontal_face")
                }
            }
            manifest_records.append(record)
            processed_count += 1

            if (idx + 1) % 25 == 0 or (idx + 1) == limit:
                print(f"Processed {idx + 1}/{limit} pairs...")

        except Exception as e:
            print(f"Error processing pair {img_name}: {e}")

    elapsed = round(time.time() - t0, 3)

    # Save aligned pairs manifest
    manifest_out = METADATA_DIR / "aligned_manifest.json"
    with open(manifest_out, "w", encoding="utf-8") as mf:
        json.dump({
            "dataset": "FS2K",
            "total_pairs_processed": processed_count,
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "records": manifest_records
        }, mf, indent=2)

    # Save preprocessing summary
    summary_out = MANIFESTS_DIR / "preprocessing_summary.json"
    with open(summary_out, "w", encoding="utf-8") as sf:
        json.dump({
            "dataset": "FS2K",
            "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_processed": processed_count,
            "duration_sec": elapsed,
            "outputs": {
                "aligned_pairs": str(ALIGNED_DIR),
                "normalized_sketches": str(NORMALIZED_DIR),
                "manifest": str(manifest_out)
            }
        }, sf, indent=2)

    print("----------------------------------------------------------------")
    print(f"FS2K Preprocessing completed in {elapsed}s.")
    print(f"Pairs aligned: {processed_count}")
    print(f"Manifest written to: {manifest_out}")
    print(f"Summary written to: {summary_out}")
    print("================================================================")


if __name__ == "__main__":
    main()
