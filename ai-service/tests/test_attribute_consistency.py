"""
Tests for Attribute Consistency Checker and Multi-Pass Refinement.
"""

import tempfile
from pathlib import Path
import numpy as np
from PIL import Image

from app.schemas.taxonomy import AttributeValue, ForensicAttributeSchemaV2
from app.services.attribute_consistency_checker import (
    AttributeConsistencyChecker,
    ConsistencyReport,
    attribute_consistency_checker,
)


def test_consistency_checker_missing_file_graceful():
    schema = ForensicAttributeSchemaV2()
    report = attribute_consistency_checker.evaluate_image(
        image_path="non_existent_file_path_123.png",
        schema=schema,
        generation_id="gen_test_missing",
    )
    assert isinstance(report, ConsistencyReport)
    assert report.generation_id == "gen_test_missing"
    assert report.overall_consistency >= 0.70
    assert report.needs_refinement is False


def test_consistency_checker_contrast_evaluation():
    checker = AttributeConsistencyChecker(threshold=0.75)
    schema = ForensicAttributeSchemaV2(
        face={"face_shape": AttributeValue(value="oval")},
        eyes={"spacing": AttributeValue(value="wide")},
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a low contrast image (flat grey)
        flat_img = Image.new("RGB", (256, 256), color=(128, 128, 128))
        flat_path = Path(tmpdir) / "flat.png"
        flat_img.save(flat_path)

        report_flat = checker.evaluate_image(flat_path, schema, "gen_flat")
        assert report_flat.overall_consistency < 0.75
        assert report_flat.needs_refinement is True
        assert len(report_flat.refinement_reasons) > 0
        assert "cfg_scale_delta" in report_flat.recommendations

        # Create a high contrast forensic-like sketch image
        arr = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
        high_img = Image.fromarray(arr)
        high_path = Path(tmpdir) / "high.png"
        high_img.save(high_path)

        report_high = checker.evaluate_image(high_path, schema, "gen_high")
        assert report_high.overall_consistency >= 0.75
        assert report_high.needs_refinement is False
