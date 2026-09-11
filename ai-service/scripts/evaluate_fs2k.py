#!/usr/bin/env python3
"""
Forensix / Criminal Eye — FS2K Cross-Domain Evaluation Benchmark
Computes quantitative evaluation metrics (PSNR, SSIM, L1, Edge Gradient Fidelity)
for paired photo-to-sketch research benchmarks.
Outputs report to:
  ai-service/datasets/metadata/fs2k_evaluation_report.json
"""

import os
import sys
import json
import argparse
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple
import numpy as np
from PIL import Image, ImageOps

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"

RAW_FS2K = DATASETS_DIR / "raw" / "FS2K"
PROCESSED_FS2K = DATASETS_DIR / "processed" / "FS2K"
METADATA_DIR = DATASETS_DIR / "metadata"
REPORT_PATH = METADATA_DIR / "fs2k_evaluation_report.json"


def resolve_pair_paths(fs2k_dir: Path, img_name: str) -> Tuple[Path, Path]:
    photo_path = fs2k_dir / "photo" / f"{img_name}.jpg"
    parts = img_name.split("/")
    sub = parts[0].replace("photo", "sketch")
    fname = parts[1].replace("image", "sketch")

    sketch_jpg = fs2k_dir / "sketch" / sub / f"{fname}.jpg"
    sketch_png = fs2k_dir / "sketch" / sub / f"{fname}.png"
    sketch_path = sketch_jpg if sketch_jpg.is_file() else sketch_png

    return photo_path, sketch_path


def compute_psnr(img1: np.ndarray, img2: np.ndarray) -> float:
    mse = np.mean((img1.astype(np.float64) - img2.astype(np.float64)) ** 2)
    if mse == 0:
        return 100.0
    max_pixel = 255.0
    return float(20 * np.log10(max_pixel / np.sqrt(mse)))


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    """Computes global structural similarity index on grayscale images."""
    if img1.ndim == 3:
        img1 = np.dot(img1[..., :3], [0.2989, 0.5870, 0.1140])
    if img2.ndim == 3:
        img2 = np.dot(img2[..., :3], [0.2989, 0.5870, 0.1140])

    c1 = (0.01 * 255) ** 2
    c2 = (0.03 * 255) ** 2

    mu1 = np.mean(img1)
    mu2 = np.mean(img2)
    sigma1_sq = np.var(img1)
    sigma2_sq = np.var(img2)
    sigma12 = np.cov(img1.flatten(), img2.flatten())[0, 1]

    ssim_val = ((2 * mu1 * mu2 + c1) * (2 * sigma12 + c2)) / ((mu1**2 + mu2**2 + c1) * (sigma1_sq + sigma2_sq + c2))
    return float(np.clip(ssim_val, -1.0, 1.0))


def compute_l1_loss(img1: np.ndarray, img2: np.ndarray) -> float:
    return float(np.mean(np.abs(img1.astype(np.float64) - img2.astype(np.float64))) / 255.0)


def compute_edge_gradient_correlation(img1: np.ndarray, img2: np.ndarray) -> float:
    """Computes edge structure correlation using simple Sobel horizontal/vertical gradients."""
    g1 = img1 if img1.ndim == 2 else np.dot(img1[..., :3], [0.2989, 0.5870, 0.1140])
    g2 = img2 if img2.ndim == 2 else np.dot(img2[..., :3], [0.2989, 0.5870, 0.1140])

    grad1_x = np.diff(g1, axis=1)
    grad2_x = np.diff(g2, axis=1)

    v1 = grad1_x.flatten()
    v2 = grad2_x.flatten()

    std1 = np.std(v1)
    std2 = np.std(v2)
    if std1 == 0 or std2 == 0:
        return 0.0

    corr = np.corrcoef(v1, v2)[0, 1]
    return float(np.nan_to_num(corr, nan=0.0))


def main():
    parser = argparse.ArgumentParser(description="FS2K Evaluation Benchmark")
    parser.add_argument("--limit", type=int, default=100, help="Number of test pairs to evaluate (default: 100)")
    parser.add_argument("--all", action="store_true", help="Evaluate entire test split (1,046 pairs)")
    args = parser.parse_args()

    test_file = RAW_FS2K / "anno_test.json"
    if not test_file.is_file():
        print(f"Error: {test_file} not found!")
        sys.exit(1)

    with open(test_file, "r", encoding="utf-8") as f:
        test_items = json.load(f)

    total_test = len(test_items)
    limit = total_test if args.all else min(args.limit, total_test)
    eval_items = test_items[:limit]

    print("================================================================")
    print("Forensix — FS2K Cross-Domain Synthesis Evaluation Benchmark")
    print(f"Total Test Set: {total_test} pairs | Evaluating: {limit} pairs")
    print("================================================================")

    t0 = time.time()
    results: List[Dict[str, Any]] = []
    style_groups: Dict[str, List[Dict[str, float]]] = {"style1": [], "style2": [], "style3": []}

    for idx, item in enumerate(eval_items):
        img_name = item["image_name"]
        photo_p, sketch_p = resolve_pair_paths(RAW_FS2K, img_name)

        if not photo_p.is_file() or not sketch_p.is_file():
            continue

        try:
            with Image.open(photo_p) as p_img, Image.open(sketch_p) as s_img:
                p_arr = np.array(p_img.convert("RGB").resize((512, 512)))
                s_arr = np.array(s_img.convert("RGB").resize((512, 512)))

            psnr = compute_psnr(p_arr, s_arr)
            ssim = compute_ssim(p_arr, s_arr)
            l1 = compute_l1_loss(p_arr, s_arr)
            edge_corr = compute_edge_gradient_correlation(p_arr, s_arr)

            style_code = item.get("style", 0)
            style_key = f"style{style_code + 1}" if isinstance(style_code, int) and style_code in [0, 1, 2] else "style1"

            metrics = {
                "psnr_db": round(psnr, 2),
                "ssim": round(ssim, 4),
                "l1_loss": round(l1, 4),
                "edge_gradient_correlation": round(edge_corr, 4)
            }

            results.append({
                "pair_id": img_name.replace("/", "_"),
                "style": style_key,
                "metrics": metrics
            })

            if style_key in style_groups:
                style_groups[style_key].append(metrics)

            if (idx + 1) % 25 == 0 or (idx + 1) == limit:
                print(f"Evaluated {idx + 1}/{limit} pairs...")

        except Exception as e:
            print(f"Error evaluating pair {img_name}: {e}")

    elapsed = round(time.time() - t0, 3)

    # Compute aggregate metrics
    all_psnr = [r["metrics"]["psnr_db"] for r in results]
    all_ssim = [r["metrics"]["ssim"] for r in results]
    all_l1 = [r["metrics"]["l1_loss"] for r in results]
    all_edge = [r["metrics"]["edge_gradient_correlation"] for r in results]

    def calc_group_means(metrics_list: List[Dict[str, float]]) -> Dict[str, float]:
        if not metrics_list:
            return {"mean_psnr_db": 0.0, "mean_ssim": 0.0, "mean_l1_loss": 0.0, "mean_edge_corr": 0.0}
        return {
            "mean_psnr_db": round(float(np.mean([m["psnr_db"] for m in metrics_list])), 2),
            "mean_ssim": round(float(np.mean([m["ssim"] for m in metrics_list])), 4),
            "mean_l1_loss": round(float(np.mean([m["l1_loss"] for m in metrics_list])), 4),
            "mean_edge_corr": round(float(np.mean([m["edge_gradient_correlation"] for m in metrics_list])), 4)
        }

    report = {
        "project": "Criminal Eye / Forensix AI",
        "benchmark": "FS2K Cross-Domain Photo-Sketch Evaluation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pairs_evaluated": len(results),
        "execution_duration_sec": elapsed,
        "aggregate_metrics": {
            "mean_psnr_db": round(float(np.mean(all_psnr)), 2) if all_psnr else 0.0,
            "mean_ssim": round(float(np.mean(all_ssim)), 4) if all_ssim else 0.0,
            "mean_l1_loss": round(float(np.mean(all_l1)), 4) if all_l1 else 0.0,
            "mean_edge_gradient_correlation": round(float(np.mean(all_edge)), 4) if all_edge else 0.0
        },
        "per_style_breakdown": {
            style: {
                "count": len(items),
                "metrics": calc_group_means(items)
            }
            for style, items in style_groups.items()
        },
        "benchmark_protocol_notes": [
            "Evaluated on 512x512 normalized coordinate space matching ControlNet Lineart canvas",
            "SSIM and edge correlation quantify cross-domain structural preservation between photographs and artist sketches",
            "Serves as the empirical baseline for evaluating future ControlNet + SD1.5 sketch synthesis models"
        ]
    }

    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as rf:
        json.dump(report, rf, indent=2)

    print("----------------------------------------------------------------")
    print(f"Evaluation benchmark finished in {elapsed}s.")
    print(f"Pairs evaluated: {len(results)}")
    print(f"Overall Mean PSNR: {report['aggregate_metrics']['mean_psnr_db']} dB")
    print(f"Overall Mean SSIM: {report['aggregate_metrics']['mean_ssim']}")
    print(f"Overall Mean Edge Correlation: {report['aggregate_metrics']['mean_edge_gradient_correlation']}")
    print(f"Report written to: {REPORT_PATH}")
    print("================================================================")


if __name__ == "__main__":
    main()
