#!/usr/bin/env python3
"""
Forensix / Criminal Eye — Research Dataset Validator
Validates data integrity, counts, dimensions, pairing, and metadata
for CelebAMask-HQ and FS2K research datasets.
Outputs report to ai-service/datasets/metadata/validation_report.json
"""

import os
import sys
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"
RAW_DIR = DATASETS_DIR / "raw"
METADATA_DIR = DATASETS_DIR / "metadata"

CELEBA_DIR = RAW_DIR / "CelebAMask-HQ"
FS2K_DIR = RAW_DIR / "FS2K"
REPORT_FILE = METADATA_DIR / "validation_report.json"


def resolve_fs2k_pair_paths(fs2k_dir: Path, img_name: str) -> tuple[Optional[Path], Optional[Path]]:
    """
    Resolves photo and sketch paths for an image_name (e.g. 'photo1/image0110').
    Handles style 1/3 (.jpg) and style 2 (.png).
    """
    photo_path = fs2k_dir / "photo" / f"{img_name}.jpg"
    if not photo_path.is_file():
        photo_path = None

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


def validate_celebamask_hq() -> Dict[str, Any]:
    print("--> Validating CelebAMask-HQ dataset...")
    res: Dict[str, Any] = {
        "dataset": "CelebAMask-HQ",
        "status": "PASSED",
        "checks": {},
        "metrics": {},
        "errors": []
    }

    if not CELEBA_DIR.exists():
        res["status"] = "FAILED"
        res["errors"].append(f"Directory not found: {CELEBA_DIR}")
        return res

    images_dir = CELEBA_DIR / "images"
    masks_dir = CELEBA_DIR / "masks"
    mapping_file = CELEBA_DIR / "CelebA-HQ-to-CelebA-mapping.txt"
    attr_file = CELEBA_DIR / "CelebAMask-HQ-attribute-anno.txt"
    pose_file = CELEBA_DIR / "CelebAMask-HQ-pose-anno.txt"

    # 1. Path existence
    res["checks"]["images_dir_exists"] = images_dir.is_dir()
    res["checks"]["masks_dir_exists"] = masks_dir.is_dir()
    res["checks"]["mapping_file_exists"] = mapping_file.is_file()
    res["checks"]["attribute_anno_exists"] = attr_file.is_file()
    res["checks"]["pose_anno_exists"] = pose_file.is_file()

    # 2. Images count
    image_files = [f for f in os.listdir(images_dir) if f.endswith(".jpg")] if images_dir.exists() else []
    image_count = len(image_files)
    res["metrics"]["total_images"] = image_count
    res["checks"]["image_count_30000"] = (image_count == 30000)
    if image_count != 30000:
        res["errors"].append(f"Expected 30,000 images, found {image_count}")

    # 3. Mask folders & mask counts
    mask_folders = sorted(
        [d for d in os.listdir(masks_dir) if (masks_dir / d).is_dir()],
        key=lambda x: int(x) if x.isdigit() else 999
    )
    res["metrics"]["mask_subdirectories"] = len(mask_folders)
    res["checks"]["mask_subdirs_15"] = (len(mask_folders) == 15)

    total_masks = 0
    sampled_classes = set()
    for folder in mask_folders:
        f_path = masks_dir / folder
        masks_in_folder = [f for f in os.listdir(f_path) if f.endswith(".png")]
        total_masks += len(masks_in_folder)
        for m in masks_in_folder[:20]:
            parts = m.replace(".png", "").split("_", 1)
            if len(parts) == 2:
                sampled_classes.add(parts[1])

    res["metrics"]["total_masks"] = total_masks
    res["metrics"]["detected_component_classes"] = sorted(list(sampled_classes))
    res["checks"]["mask_count_verified"] = (total_masks == 372767)
    if total_masks != 372767:
        res["errors"].append(f"Expected 372,767 masks, found {total_masks}")

    # 4. Spot check image & mask dimensions and readability
    sample_indices = [0, 5000, 10000, 15000, 20000, 25000, 29999]
    sample_img_checks = []
    for idx in sample_indices:
        img_p = images_dir / f"{idx}.jpg"
        if img_p.exists():
            try:
                with Image.open(img_p) as img:
                    sample_img_checks.append({
                        "id": idx,
                        "size": list(img.size),
                        "format": img.format,
                        "readable": True
                    })
            except Exception as e:
                res["errors"].append(f"Corrupted image {img_p}: {e}")
        else:
            res["errors"].append(f"Missing image {img_p}")

    res["metrics"]["sampled_images_checked"] = len(sample_img_checks)
    res["checks"]["image_dimension_1024x1024"] = all(s["size"] == [1024, 1024] for s in sample_img_checks)

    # Spot check sample mask
    sample_mask_p = masks_dir / "0" / "00000_skin.png"
    if sample_mask_p.exists():
        with Image.open(sample_mask_p) as mask:
            res["checks"]["mask_dimension_512x512"] = (list(mask.size) == [512, 512])
    else:
        res["checks"]["mask_dimension_512x512"] = False
        res["errors"].append(f"Sample mask not found: {sample_mask_p}")

    if res["errors"]:
        res["status"] = "FAILED"

    print(f"   [CelebAMask-HQ] Images: {image_count}, Masks: {total_masks}, Subfolders: {len(mask_folders)}, Status: {res['status']}")
    return res


def validate_fs2k() -> Dict[str, Any]:
    print("--> Validating FS2K dataset...")
    res: Dict[str, Any] = {
        "dataset": "FS2K",
        "status": "PASSED",
        "checks": {},
        "metrics": {},
        "errors": []
    }

    if not FS2K_DIR.exists():
        res["status"] = "FAILED"
        res["errors"].append(f"Directory not found: {FS2K_DIR}")
        return res

    photo_dir = FS2K_DIR / "photo"
    sketch_dir = FS2K_DIR / "sketch"
    train_file = FS2K_DIR / "anno_train.json"
    test_file = FS2K_DIR / "anno_test.json"

    # 1. Path existence
    res["checks"]["photo_dir_exists"] = photo_dir.is_dir()
    res["checks"]["sketch_dir_exists"] = sketch_dir.is_dir()
    res["checks"]["anno_train_exists"] = train_file.is_file()
    res["checks"]["anno_test_exists"] = test_file.is_file()

    # 2. Photo & sketch files count
    photo_subdirs = ["photo1", "photo2", "photo3"]
    sketch_subdirs = ["sketch1", "sketch2", "sketch3"]

    total_photos = 0
    photo_breakdown = {}
    for sub in photo_subdirs:
        sub_p = photo_dir / sub
        count = len([f for f in os.listdir(sub_p) if f.lower().endswith((".jpg", ".jpeg", ".png"))]) if sub_p.exists() else 0
        photo_breakdown[sub] = count
        total_photos += count

    total_sketches = 0
    sketch_breakdown = {}
    for sub in sketch_subdirs:
        sub_p = sketch_dir / sub
        count = len([f for f in os.listdir(sub_p) if f.lower().endswith((".jpg", ".jpeg", ".png"))]) if sub_p.exists() else 0
        sketch_breakdown[sub] = count
        total_sketches += count

    res["metrics"]["photo_counts"] = photo_breakdown
    res["metrics"]["total_photos"] = total_photos
    res["metrics"]["sketch_counts"] = sketch_breakdown
    res["metrics"]["total_sketches"] = total_sketches
    res["checks"]["total_photos_2104"] = (total_photos == 2104)
    res["checks"]["total_sketches_2104"] = (total_sketches == 2104)

    # 3. Load & validate official annotation JSON splits
    try:
        with open(train_file, "r", encoding="utf-8") as f:
            train_items = json.load(f)
        with open(test_file, "r", encoding="utf-8") as f:
            test_items = json.load(f)
    except Exception as e:
        res["status"] = "FAILED"
        res["errors"].append(f"Failed to parse annotations: {e}")
        return res

    train_count = len(train_items)
    test_count = len(test_items)
    total_anno = train_count + test_count

    res["metrics"]["train_items"] = train_count
    res["metrics"]["test_items"] = test_count
    res["metrics"]["total_annotated_pairs"] = total_anno

    res["checks"]["train_split_1058"] = (train_count == 1058)
    res["checks"]["test_split_1046"] = (test_count == 1046)
    res["checks"]["total_split_2104"] = (total_anno == 2104)

    # 4. Verify pair file resolution on disk
    missing_photos = 0
    missing_sketches = 0
    required_attr_keys = {"hair", "hair_color", "gender", "style", "smile", "frontal_face"}
    schema_compliant = True

    all_items = train_items + test_items
    for item in all_items:
        img_name = item.get("image_name", "")
        photo_p, sketch_p = resolve_fs2k_pair_paths(FS2K_DIR, img_name)

        if photo_p is None:
            missing_photos += 1
        if sketch_p is None:
            missing_sketches += 1

        if not required_attr_keys.issubset(item.keys()):
            schema_compliant = False

    res["metrics"]["missing_photo_files"] = missing_photos
    res["metrics"]["missing_sketch_files"] = missing_sketches
    res["checks"]["all_pairs_resolved_on_disk"] = (missing_photos == 0 and missing_sketches == 0)
    res["checks"]["attributes_schema_compliant"] = schema_compliant

    if missing_photos > 0 or missing_sketches > 0:
        res["errors"].append(f"Missing pairs on disk: {missing_photos} photos, {missing_sketches} sketches")

    # 5. Readability spot check
    sample_item = train_items[0]
    sample_photo_p, sample_sketch_p = resolve_fs2k_pair_paths(FS2K_DIR, sample_item["image_name"])

    try:
        if sample_photo_p and sample_sketch_p:
            with Image.open(sample_photo_p) as p_img:
                res["metrics"]["sample_photo_size"] = list(p_img.size)
            with Image.open(sample_sketch_p) as s_img:
                res["metrics"]["sample_sketch_size"] = list(s_img.size)
            res["checks"]["samples_readable"] = True
        else:
            res["checks"]["samples_readable"] = False
            res["errors"].append("Could not find sample pair files")
    except Exception as e:
        res["checks"]["samples_readable"] = False
        res["errors"].append(f"Failed opening sample pair: {e}")

    if res["errors"]:
        res["status"] = "FAILED"

    print(f"   [FS2K] Photos: {total_photos}, Sketches: {total_sketches}, Train: {train_count}, Test: {test_count}, Status: {res['status']}")
    return res


def main():
    print("================================================================")
    print("Forensix Research Datasets Automated Validation")
    print("================================================================")

    start_time = time.time()
    celeba_res = validate_celebamask_hq()
    fs2k_res = validate_fs2k()
    duration = round(time.time() - start_time, 3)

    overall_status = "PASSED" if (celeba_res["status"] == "PASSED" and fs2k_res["status"] == "PASSED") else "FAILED"

    report = {
        "project": "Criminal Eye / Forensix AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "execution_duration_sec": duration,
        "overall_status": overall_status,
        "all_checks_passed": (overall_status == "PASSED"),
        "results": {
            "CelebAMask-HQ": celeba_res,
            "FS2K": fs2k_res
        },
        "summary": {
            "total_face_images": celeba_res["metrics"].get("total_images", 0),
            "total_component_masks": celeba_res["metrics"].get("total_masks", 0),
            "total_photo_sketch_pairs": fs2k_res["metrics"].get("total_photos", 0),
            "official_splits": {
                "CelebAMask-HQ": {"total": 30000, "train": 24183, "val": 2993, "test": 2824},
                "FS2K": {"total": 2104, "train": 1058, "test": 1046}
            }
        }
    }

    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("----------------------------------------------------------------")
    print(f"Validation completed in {duration}s. Report written to:")
    print(f"  {REPORT_FILE}")
    print(f"Overall Status: {overall_status}")
    print("================================================================")

    if overall_status != "PASSED":
        sys.exit(1)


if __name__ == "__main__":
    main()
