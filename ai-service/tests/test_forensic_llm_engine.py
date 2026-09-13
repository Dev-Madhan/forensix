import pytest
from app.services.forensic_llm_engine import (
    forensic_llm_engine,
    extract_features_from_prompt,
    TOKEN_FORENSIC_MAP,
    STYLE_DIRECTIVES,
)


def test_example_prompt_feature_extraction():
    """
    Validates extraction of all key attributes from the exact example prompt:
    - Oval face, defined but soft jawline, moderately prominent chin
    - Almond eyes, close-set, deep-set, medium-thick arched eyebrows
    - Straight nose, medium width, defined nostrils, slightly upturned tip
    - Medium-wide mouth, full lips, cupid's bow, neutral closed expression
    - Thin rectangular glasses
    - Short side-parted dark hair, low hairline
    - Clean shaven
    - Black background trigger
    """
    prompt = (
        "White/gray linework on a deep black background. "
        "A male suspect, approximately 28-35 years old, with an oval face shape, "
        "defined but slightly soft jawline, and a moderately prominent chin. "
        "Almond eyes, slightly close-set, deep-set, with naturally arched medium-thick eyebrows. "
        "Straight nose, medium width, defined nostrils, slightly rounded upturned tip. "
        "Medium-wide mouth, full lips, clearly defined Cupid's bow, neutral closed-mouth expression. "
        "Wearing thin rectangular glasses with dark frames. "
        "Short, neat side-parted dark hair with a slightly low hairline. "
        "Clean-shaven, no facial hair. "
        "Frontal view, bilateral symmetry, head and neck and upper shoulders only."
    )

    attrs = extract_features_from_prompt(prompt)

    assert attrs.get("face_shape") == "oval_face_shape"
    assert attrs.get("jawline") == "soft_jawline"
    assert attrs.get("chin") == "moderately_prominent_chin"
    assert "almond" in attrs.get("eyes", "")
    assert attrs.get("eye_spacing") == "close_set_eyes"
    assert attrs.get("eye_depth") == "deep_set_eyes"
    assert attrs.get("eyebrows") == "medium_thick_eyebrows"
    assert "straight" in attrs.get("nose", "")
    assert attrs.get("eyewear") == "thin_rectangular_glasses"
    assert "side_part" in attrs.get("hair", "")
    assert attrs.get("facial_hair") == "clean_shaven"
    assert attrs.get("_inferred_gender") == "Male"
    assert attrs.get("_inferred_age") == "26-35"
    assert attrs.get("_black_background") is True
    assert attrs.get("_inferred_style") == "Monochrome Inversion (Black Background)"


def test_contradiction_resolution_clean_shaven():
    """Explicit clean-shaven directive overrides incidental mention."""
    prompt = "Suspect is clean-shaven with no beard, previously had a stubble."
    attrs = extract_features_from_prompt(prompt)
    assert attrs.get("facial_hair") == "clean_shaven"


def test_short_prompt_enrichment():
    """Very brief prompt triggers SHORT_PROMPT_DEFAULTS."""
    attrs = extract_features_from_prompt("male suspect")
    assert "_default_face_shape" in attrs or "face_shape" in attrs
    assert "_default_eyes" in attrs or "eyes" in attrs


def test_master_prompt_assembly_monochrome_inversion():
    """
    Tests that analyzing the example prompt produces:
    - Dedicated monochrome chalkboard positive prompt with attention weights
    - Strong negative prompt with background suppression
    - Correct CFG scale (12.0)
    - Frontal view symmetry directives
    """
    prompt = (
        "White/gray linework on a deep black background. "
        "A male suspect, approximately 28-35 years old, with an oval face shape, "
        "defined but slightly soft jawline, and a moderately prominent chin. "
        "Almond eyes, slightly close-set, deep-set, with naturally arched medium-thick eyebrows. "
        "Straight nose, medium width, defined nostrils, slightly rounded upturned tip. "
        "Medium-wide mouth, full lips, clearly defined Cupid's bow, neutral closed-mouth expression. "
        "Wearing thin rectangular glasses with dark frames. "
        "Short, neat side-parted dark hair with a slightly low hairline. "
        "Clean-shaven, no facial hair. "
        "Frontal view, bilateral symmetry, head and neck and upper shoulders only."
    )

    result = forensic_llm_engine.analyze(
        attributes={},
        witness_statement=prompt,
        sketch_style="Forensic Graphite (Pencil)",  # Should auto-upgrade to Monochrome Inversion
        camera_angle="frontal",
        age_group="26-35",
        gender="Male",
        detail_level="Master",
    )

    pos = result["positive_prompt"]
    neg = result["negative_prompt"]

    # Must contain critical prompt components
    assert "black background" in pos.lower() or "chalkboard" in pos.lower()
    assert "thin rectangular" in pos.lower() or "glasses" in pos.lower()
    assert "clean-shaven" in pos.lower() or "no beard" in pos.lower()
    assert "oval" in pos.lower()
    assert "almond" in pos.lower()

    # Negative prompt must suppress white/light background for black background mode
    assert "white background" in neg.lower()
    assert "light background" in neg.lower()
    assert "color" in neg.lower()

    # CFG scale for Monochrome Inversion should be 12.0
    assert result["cfg_scale"] == 12.0
    assert result["steps"] >= 45
