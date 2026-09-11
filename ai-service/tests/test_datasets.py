"""
Forensix / Criminal Eye — Dataset Foundation & Preprocessing Test Suite
Validates dataset manifest, splits definitions, validation report,
processed component artifacts, geometry anchors, and evaluation benchmarks.
"""

import json
from pathlib import Path
import pytest
from PIL import Image

AI_SERVICE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"
RAW_DIR = DATASETS_DIR / "raw"
PROCESSED_DIR = DATASETS_DIR / "processed"
METADATA_DIR = DATASETS_DIR / "metadata"
COMPONENTS_DIR = DATASETS_DIR / "components"


def test_dataset_manifest():
    manifest_path = METADATA_DIR / "dataset_manifest.json"
    assert manifest_path.is_file(), f"Missing {manifest_path}"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "datasets" in data
    dataset_names = [d["name"] for d in data["datasets"]]
    assert "CelebAMask-HQ" in dataset_names
    assert "FS2K" in dataset_names
    assert "Criminal Eye Component Dataset" in dataset_names

    celeba = next(d for d in data["datasets"] if d["name"] == "CelebAMask-HQ")
    assert celeba["status"] == "validated"
    assert celeba["total_images"] == 30000
    assert celeba["total_masks"] == 372767

    fs2k = next(d for d in data["datasets"] if d["name"] == "FS2K")
    assert fs2k["status"] == "validated"
    assert fs2k["total_photos"] == 2104
    assert fs2k["total_sketches"] == 2104
    assert fs2k["splits"]["train"] == 1058
    assert fs2k["splits"]["test"] == 1046


def test_splits_schema():
    splits_path = METADATA_DIR / "splits.json"
    assert splits_path.is_file(), f"Missing {splits_path}"

    with open(splits_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "datasets" in data
    assert "FS2K" in data["datasets"]
    assert "CelebAMask-HQ" in data["datasets"]

    fs2k_splits = data["datasets"]["FS2K"]["splits"]
    assert fs2k_splits["train"]["count"] == 1058
    assert fs2k_splits["test"]["count"] == 1046

    celeba_splits = data["datasets"]["CelebAMask-HQ"]["splits"]
    assert celeba_splits["train"]["count"] == 24183
    assert celeba_splits["val"]["count"] == 2993
    assert celeba_splits["test"]["count"] == 2824


def test_validation_report():
    report_path = METADATA_DIR / "validation_report.json"
    assert report_path.is_file(), f"Missing {report_path}"

    with open(report_path, "r", encoding="utf-8") as f:
        report = json.load(f)

    assert report["overall_status"] == "PASSED"
    assert report["all_checks_passed"] is True

    # CelebAMask-HQ verification
    celeba = report["results"]["CelebAMask-HQ"]
    assert celeba["status"] == "PASSED"
    assert celeba["metrics"]["total_images"] == 30000
    assert celeba["metrics"]["total_masks"] == 372767
    assert celeba["metrics"]["mask_subdirectories"] == 15
    assert celeba["checks"]["image_dimension_1024x1024"] is True
    assert celeba["checks"]["mask_dimension_512x512"] is True

    # FS2K verification
    fs2k = report["results"]["FS2K"]
    assert fs2k["status"] == "PASSED"
    assert fs2k["metrics"]["total_photos"] == 2104
    assert fs2k["metrics"]["total_sketches"] == 2104
    assert fs2k["metrics"]["train_items"] == 1058
    assert fs2k["metrics"]["test_items"] == 1046
    assert fs2k["checks"]["all_pairs_resolved_on_disk"] is True


def test_celeba_processed_artifacts():
    proc_dir = PROCESSED_DIR / "CelebAMask-HQ"
    assert (proc_dir / "components").is_dir()
    assert (proc_dir / "geometry").is_dir()
    assert (proc_dir / "normalized").is_dir()

    # Check sample geometry JSON
    sample_geom = proc_dir / "geometry" / "00000_geom.json"
    assert sample_geom.is_file(), "00000_geom.json not found"

    with open(sample_geom, "r", encoding="utf-8") as f:
        geom = json.load(f)

    assert "anchors" in geom
    anchors = geom["anchors"]
    for key in ["left_eye", "right_eye", "nose_tip", "mouth", "chin"]:
        assert key in anchors
        coord = anchors[key]
        assert len(coord) == 2
        assert 0.0 <= coord[0] <= 1.0
        assert 0.0 <= coord[1] <= 1.0

    # Check sample normalized image
    sample_norm = proc_dir / "normalized" / "00000_norm.jpg"
    assert sample_norm.is_file()
    with Image.open(sample_norm) as img:
        assert img.size == (512, 512)


def test_fs2k_processed_artifacts():
    proc_dir = PROCESSED_DIR / "FS2K"
    assert (proc_dir / "aligned").is_dir()
    assert (proc_dir / "normalized").is_dir()
    assert (proc_dir / "metadata").is_dir()

    manifest_path = proc_dir / "metadata" / "aligned_manifest.json"
    assert manifest_path.is_file()

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["total_pairs_processed"] >= 100
    assert len(manifest["records"]) >= 100

    first_record = manifest["records"][0]
    assert "aligned_photo" in first_record
    assert "aligned_sketch" in first_record
    assert "normalized_lineart" in first_record

    aligned_p = AI_SERVICE_DIR / first_record["aligned_photo"]
    assert aligned_p.is_file()
    with Image.open(aligned_p) as p_img:
        assert p_img.size == (512, 512)


def test_fs2k_evaluation_report():
    eval_path = METADATA_DIR / "fs2k_evaluation_report.json"
    assert eval_path.is_file(), f"Missing {eval_path}"

    with open(eval_path, "r", encoding="utf-8") as f:
        report = json.load(f)

    assert report["pairs_evaluated"] >= 100
    metrics = report["aggregate_metrics"]
    assert metrics["mean_psnr_db"] > 0.0
    assert -1.0 <= metrics["mean_ssim"] <= 1.0
    assert 0.0 <= metrics["mean_l1_loss"] <= 1.0


def test_curated_component_taxonomy():
    categories = ["eyebrows", "eyes", "face_shapes", "jaws", "mouths", "noses"]
    for cat in categories:
        cat_dir = COMPONENTS_DIR / cat
        assert cat_dir.is_dir(), f"Missing taxonomy folder {cat_dir}"
        # Check files inside
        files = list(cat_dir.glob("*.png"))
        sub_files = list(cat_dir.glob("*/*.png"))
        assert len(files) + len(sub_files) > 0, f"No reference images found in {cat_dir}"
