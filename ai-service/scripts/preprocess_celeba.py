#!/usr/bin/env python3
"""
Forensix / Criminal Eye — CelebAMask-HQ Preprocessing & Component Extraction
Extracts facial components, computes normalized geometry anchors, creates 512x512
normalized face crops, and populates the forensic component catalog.
Outputs to:
  ai-service/datasets/processed/CelebAMask-HQ/components/
  ai-service/datasets/processed/CelebAMask-HQ/geometry/
  ai-service/datasets/processed/CelebAMask-HQ/normalized/
  ai-service/datasets/components/
"""

import os
import sys
import json
import argparse
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"

RAW_CELEBA = DATASETS_DIR / "raw" / "CelebAMask-HQ"
PROCESSED_CELEBA = DATASETS_DIR / "processed" / "CelebAMask-HQ"
COMPONENTS_DIR = DATASETS_DIR / "components"

PROCESSED_COMPONENTS = PROCESSED_CELEBA / "components"
PROCESSED_GEOMETRY = PROCESSED_CELEBA / "geometry"
PROCESSED_NORMALIZED = PROCESSED_CELEBA / "normalized"
PROCESSED_MANIFESTS = PROCESSED_CELEBA / "manifests"


def get_mask_path(image_idx: int, component_name: str) -> Optional[Path]:
    folder_idx = image_idx // 2000
    mask_file = RAW_CELEBA / "masks" / str(folder_idx) / f"{image_idx:05d}_{component_name}.png"
    return mask_file if mask_file.is_file() else None


def compute_mask_bbox(mask_arr: np.ndarray, orig_w: int = 1024, orig_h: int = 1024) -> Optional[Tuple[int, int, int, int]]:
    """
    Computes [ymin, xmin, ymax, xmax] scaled to original image dimensions.
    Mask is 512x512, image is 1024x1024.
    """
    coords = np.argwhere(mask_arr > 0)
    if coords.size == 0:
        return None
    ymin, xmin = coords.min(axis=0)
    ymax, xmax = coords.max(axis=0)

    # Scale from 512x512 mask to 1024x1024 image
    scale_y = orig_h / mask_arr.shape[0]
    scale_x = orig_w / mask_arr.shape[1]

    ymin = max(0, int(ymin * scale_y))
    xmin = max(0, int(xmin * scale_x))
    ymax = min(orig_h, int(ymax * scale_y))
    xmax = min(orig_w, int(xmax * scale_x))

    return (ymin, xmin, ymax, xmax)


def process_sample(image_idx: int) -> Optional[Dict[str, Any]]:
    img_path = RAW_CELEBA / "images" / f"{image_idx}.jpg"
    if not img_path.is_file():
        return None

    try:
        with Image.open(img_path) as img:
            img = img.convert("RGB")
            w, h = img.size

            # 1. Normalized 512x512 image
            norm_img = img.resize((512, 512), Image.Resampling.LANCZOS)
            norm_out_path = PROCESSED_NORMALIZED / f"{image_idx:05d}_norm.jpg"
            norm_img.save(norm_out_path, quality=95)

            # 2. Extract masks & bounding boxes
            components = ["l_eye", "r_eye", "l_brow", "r_brow", "nose", "mouth", "u_lip", "l_lip", "skin"]
            mask_data: Dict[str, np.ndarray] = {}
            bboxes: Dict[str, List[int]] = {}

            for comp in components:
                m_path = get_mask_path(image_idx, comp)
                if m_path:
                    with Image.open(m_path) as m_img:
                        m_arr = np.array(m_img)
                        if m_arr.ndim == 3:
                            m_arr = m_arr[:, :, 0]
                        if np.any(m_arr > 0):
                            mask_data[comp] = m_arr
                            bbox = compute_mask_bbox(m_arr, w, h)
                            if bbox:
                                bboxes[comp] = list(bbox)

            # 3. Crop and save component cutouts
            crops_saved = {}
            for comp_name, bbox in bboxes.items():
                ymin, xmin, ymax, xmax = bbox
                if ymax > ymin and xmax > xmin:
                    crop = img.crop((xmin, ymin, xmax, ymax))
                    category = "eyes" if "eye" in comp_name else "eyebrows" if "brow" in comp_name else "noses" if comp_name == "nose" else "mouths" if "lip" in comp_name or comp_name == "mouth" else "face_shapes"
                    
                    target_dir = PROCESSED_COMPONENTS / category
                    target_dir.mkdir(parents=True, exist_ok=True)
                    crop_filename = f"{image_idx:05d}_{comp_name}.png"
                    crop.save(target_dir / crop_filename)
                    crops_saved[comp_name] = f"{category}/{crop_filename}"

            # 4. Compute Normalized Geometry Anchors matching Criminal Eye coordinate space
            # Anchor definitions: left_eye, right_eye, nose_tip, mouth, chin
            anchors: Dict[str, List[float]] = {}

            # Left eye (image left = subject right in viewer coordinates, x ~ 0.36, y ~ 0.40)
            if "r_eye" in bboxes:
                ymin, xmin, ymax, xmax = bboxes["r_eye"]
                anchors["left_eye"] = [round(((xmin + xmax) / 2) / w, 4), round(((ymin + ymax) / 2) / h, 4)]
            elif "l_eye" in bboxes:
                ymin, xmin, ymax, xmax = bboxes["l_eye"]
                anchors["left_eye"] = [round(((xmin + xmax) / 2) / w, 4), round(((ymin + ymax) / 2) / h, 4)]
            else:
                anchors["left_eye"] = [0.36, 0.40]

            # Right eye (x ~ 0.64, y ~ 0.40)
            if "l_eye" in bboxes and "r_eye" in bboxes:
                ymin, xmin, ymax, xmax = bboxes["l_eye"]
                anchors["right_eye"] = [round(((xmin + xmax) / 2) / w, 4), round(((ymin + ymax) / 2) / h, 4)]
            else:
                anchors["right_eye"] = [0.64, 0.40]

            # Nose tip (x ~ 0.50, y ~ 0.58)
            if "nose" in bboxes:
                ymin, xmin, ymax, xmax = bboxes["nose"]
                anchors["nose_tip"] = [round(((xmin + xmax) / 2) / w, 4), round(ymax / h, 4)]
            else:
                anchors["nose_tip"] = [0.50, 0.58]

            # Mouth center (x ~ 0.50, y ~ 0.70)
            mouth_keys = [k for k in ["mouth", "u_lip", "l_lip"] if k in bboxes]
            if mouth_keys:
                all_ymin = min(bboxes[k][0] for k in mouth_keys)
                all_xmin = min(bboxes[k][1] for k in mouth_keys)
                all_ymax = max(bboxes[k][2] for k in mouth_keys)
                all_xmax = max(bboxes[k][3] for k in mouth_keys)
                anchors["mouth"] = [round(((all_xmin + all_xmax) / 2) / w, 4), round(((all_ymin + all_ymax) / 2) / h, 4)]
            else:
                anchors["mouth"] = [0.50, 0.70]

            # Chin / Jawline anchor (x ~ 0.50, y ~ 0.86)
            if "skin" in bboxes:
                ymin, xmin, ymax, xmax = bboxes["skin"]
                anchors["chin"] = [round(((xmin + xmax) / 2) / w, 4), round(ymax / h, 4)]
            else:
                anchors["chin"] = [0.50, 0.86]

            # Write geometry JSON
            geom_data = {
                "image_id": image_idx,
                "canvas": {"width": 512, "height": 512},
                "anchors": anchors,
                "bboxes": bboxes,
                "crops": crops_saved
            }
            geom_out_path = PROCESSED_GEOMETRY / f"{image_idx:05d}_geom.json"
            with open(geom_out_path, "w", encoding="utf-8") as gf:
                json.dump(geom_data, gf, indent=2)

            return geom_data

    except Exception as e:
        print(f"Error processing image {image_idx}: {e}")
        return None


def populate_curated_taxonomy():
    """Populates template references into datasets/components/ based on processed components."""
    print("--> Curating representative component templates into datasets/components/...")
    
    # 1. Eyes categories: almond, narrow, round
    for shape in ["almond", "narrow", "round"]:
        target = COMPONENTS_DIR / "eyes" / shape
        target.mkdir(parents=True, exist_ok=True)
        # Check if source crop exists
        for sample_idx in range(5):
            src_l = PROCESSED_COMPONENTS / "eyes" / f"{sample_idx:05d}_l_eye.png"
            if src_l.is_file():
                dest = target / f"eye_ref_{sample_idx}.png"
                if not dest.is_file():
                    with Image.open(src_l) as im:
                        im.save(dest)

    # 2. Noses categories: broad, narrow, straight
    for shape in ["broad", "narrow", "straight"]:
        target = COMPONENTS_DIR / "noses" / shape
        target.mkdir(parents=True, exist_ok=True)
        for sample_idx in range(5):
            src_n = PROCESSED_COMPONENTS / "noses" / f"{sample_idx:05d}_nose.png"
            if src_n.is_file():
                dest = target / f"nose_ref_{sample_idx}.png"
                if not dest.is_file():
                    with Image.open(src_n) as im:
                        im.save(dest)

    # 3. Eyebrows, Mouths, Jaws, Face Shapes
    for cat, comp_key in [("eyebrows", "l_brow"), ("mouths", "mouth"), ("face_shapes", "skin"), ("jaws", "skin")]:
        target = COMPONENTS_DIR / cat
        target.mkdir(parents=True, exist_ok=True)
        for sample_idx in range(5):
            src = PROCESSED_COMPONENTS / ("eyebrows" if cat == "eyebrows" else "mouths" if cat == "mouths" else "face_shapes") / f"{sample_idx:05d}_{comp_key}.png"
            if src.is_file():
                dest = target / f"{cat}_ref_{sample_idx}.png"
                if not dest.is_file():
                    with Image.open(src) as im:
                        im.save(dest)


def main():
    parser = argparse.ArgumentParser(description="CelebAMask-HQ Preprocessing & Component Extraction")
    parser.add_argument("--limit", type=int, default=100, help="Number of images to process (default: 100)")
    parser.add_argument("--start", type=int, default=0, help="Start image index (default: 0)")
    parser.add_argument("--all", action="store_true", help="Process entire dataset (30,000 images)")
    args = parser.parse_args()

    limit = 30000 if args.all else args.limit
    start = args.start
    end = min(30000, start + limit)

    print("================================================================")
    print(f"CelebAMask-HQ Preprocessing & Component Extraction")
    print(f"Range: [{start} -> {end}) | Total to process: {end - start}")
    print("================================================================")

    PROCESSED_COMPONENTS.mkdir(parents=True, exist_ok=True)
    PROCESSED_GEOMETRY.mkdir(parents=True, exist_ok=True)
    PROCESSED_NORMALIZED.mkdir(parents=True, exist_ok=True)
    PROCESSED_MANIFESTS.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    processed_count = 0
    components_extracted_count = 0

    for idx in range(start, end):
        res = process_sample(idx)
        if res:
            processed_count += 1
            components_extracted_count += len(res.get("crops", {}))
        if (idx - start + 1) % 25 == 0 or idx == end - 1:
            print(f"Processed {idx - start + 1}/{end - start} images ({processed_count} succeeded)...")

    # Populate curated taxonomy in datasets/components/
    populate_curated_taxonomy()

    elapsed = round(time.time() - t0, 3)

    summary = {
        "dataset": "CelebAMask-HQ",
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "processed_range": [start, end],
        "total_processed": processed_count,
        "total_component_crops": components_extracted_count,
        "duration_sec": elapsed,
        "outputs": {
            "normalized_crops": str(PROCESSED_NORMALIZED),
            "component_crops": str(PROCESSED_COMPONENTS),
            "geometry_anchors": str(PROCESSED_GEOMETRY),
            "taxonomy_catalog": str(COMPONENTS_DIR)
        }
    }

    summary_path = PROCESSED_MANIFESTS / "preprocessing_summary.json"
    with open(summary_path, "w", encoding="utf-8") as sf:
        json.dump(summary, sf, indent=2)

    print("----------------------------------------------------------------")
    print(f"Completed in {elapsed}s.")
    print(f"Images processed: {processed_count}")
    print(f"Components extracted: {components_extracted_count}")
    print(f"Summary written to: {summary_path}")
    print("================================================================")


if __name__ == "__main__":
    main()
