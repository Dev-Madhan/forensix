"""
Tests for Forensic Facial Taxonomy v2.0 Schema and Mode Exclusivity Validation.
"""

import pytest
from pydantic import ValidationError
from app.schemas.taxonomy import (
    AttributeValue,
    ForensicAttributeSchemaV2,
    FEATURE_WEIGHTS,
    NORMALIZATION_MAP,
    VALID_VALUES,
    TAXONOMY_VERSION,
)
from app.schemas.sketch import SketchGenerateRequest


def test_taxonomy_version_and_weights():
    assert TAXONOMY_VERSION == "2.0"
    assert "face" in FEATURE_WEIGHTS
    assert "eyes" in FEATURE_WEIGHTS
    assert "nose" in FEATURE_WEIGHTS
    assert "mouth" in FEATURE_WEIGHTS
    assert sum(FEATURE_WEIGHTS.values()) == pytest.approx(1.0)


def test_attribute_value_normalization():
    # Test synonym mapping
    val_chubby = AttributeValue(value="chubby")
    assert val_chubby.normalized == "round"
    assert val_chubby.source == "explicit"
    assert val_chubby.confidence == 1.0

    # Test clean-shaven mapping
    val_shaven = AttributeValue(value="clean shaven", confidence=0.85, source="inferred")
    assert val_shaven.normalized == "clean-shaven"
    assert val_shaven.source == "inferred"
    assert val_shaven.confidence == 0.85

    # Test unmapped token
    val_custom = AttributeValue(value="custom_texture")
    assert val_custom.normalized == "custom_texture"


def test_attribute_value_confidence_bounds():
    with pytest.raises(ValidationError):
        AttributeValue(value="oval", confidence=1.5)

    with pytest.raises(ValidationError):
        AttributeValue(value="oval", confidence=-0.1)


def test_forensic_attribute_schema_v2_accessors():
    schema = ForensicAttributeSchemaV2(
        face={"face_shape": AttributeValue(value="chubby", confidence=0.95)},
        eyes={"shape": AttributeValue(value="almond", confidence=0.90)},
        hair={"texture": AttributeValue(value="wavy", confidence=0.80)},
        distinctive_features=[AttributeValue(value="scar on left cheek")],
    )

    # get_attr
    attr = schema.get_attr("face", "face_shape")
    assert attr is not None
    assert attr.value == "chubby"
    assert attr.normalized == "round"

    # get_value (normalized preference)
    assert schema.get_value("face", "face_shape") == "round"
    assert schema.get_value("eyes", "shape") == "almond"
    assert schema.get_value("nose", "bridge", default="straight") == "straight"

    # to_flat_dict
    flat = schema.to_flat_dict()
    assert flat["face_shape"] == "round"
    assert flat["shape"] == "almond"
    assert flat["hair"] == "wavy"
    assert flat["distinctive_features"] == ["scar on left cheek"]


def test_from_v1_dict_backward_compatibility():
    legacy_dict = {
        "face_shape": "angular",
        "eye_shape": "slanted",
        "eyebrow_thickness": "bushy",
        "hair": "afro",
        "facial_hair": "goatie",
        "distinctive_features": ["small mole above lip"],
    }
    schema = ForensicAttributeSchemaV2.from_v1_dict(legacy_dict)

    # Normalization applied
    assert schema.get_value("face", "face_shape") == "square"
    assert schema.get_value("eyes", "shape") == "narrow"
    assert schema.get_value("eyebrows", "thickness") == "thick"
    assert schema.get_value("hair", "texture") == "coily"
    assert schema.get_value("facial_hair", "type") == "goatee"
    assert len(schema.distinctive_features) == 1
    assert schema.distinctive_features[0].value == "small mole above lip"


def test_mode_exclusivity_prompt_generation():
    # Valid prompt generation
    req = SketchGenerateRequest(
        mode="PROMPT_GENERATION",
        case_id="case-101",
        witness_id="wit-101",
        prompt="Witness says suspect has sharp jaw, buzz cut, and thin mustache.",
    )
    assert req.mode == "PROMPT_GENERATION"

    # Missing prompt in PROMPT_GENERATION mode should fail
    with pytest.raises(ValidationError) as exc_info:
        SketchGenerateRequest(
            mode="PROMPT_GENERATION",
            case_id="case-101",
            witness_id="wit-101",
            prompt="",
        )
    assert "prompt" in str(exc_info.value)

    # Components in PROMPT_GENERATION mode should fail (strict exclusivity)
    with pytest.raises(ValidationError) as exc_info:
        SketchGenerateRequest(
            mode="PROMPT_GENERATION",
            case_id="case-101",
            witness_id="wit-101",
            prompt="Suspect had dark eyes",
            components={"eyes": "almond_01"},
        )
    assert "Strict Mode Exclusivity" in str(exc_info.value)


def test_mode_exclusivity_dataset_composite():
    # Valid dataset composite with components
    req = SketchGenerateRequest(
        mode="DATASET_COMPOSITE",
        case_id="case-102",
        witness_id="wit-102",
        components={"eyes": "almond_01", "nose": "straight_02"},
    )
    assert req.mode == "DATASET_COMPOSITE"

    # Valid dataset composite with attributes
    req2 = SketchGenerateRequest(
        mode="DATASET_COMPOSITE",
        case_id="case-102",
        witness_id="wit-102",
        attributes={"face_shape": "oval"},
    )
    assert req2.mode == "DATASET_COMPOSITE"

    # Explicit DATASET_COMPOSITE with prompt must fail (strict exclusivity)
    with pytest.raises(ValidationError) as exc_info:
        SketchGenerateRequest(
            mode="DATASET_COMPOSITE",
            case_id="case-102",
            witness_id="wit-102",
            attributes={"face_shape": "oval"},
            prompt="Suspect had round face",
        )
    assert "Strict Mode Exclusivity" in str(exc_info.value)

    # DATASET_COMPOSITE with neither attributes nor components should fail
    with pytest.raises(ValidationError) as exc_info:
        SketchGenerateRequest(
            mode="DATASET_COMPOSITE",
            case_id="case-102",
            witness_id="wit-102",
            attributes={},
        )
    assert "at least one feature must be selected" in str(exc_info.value)
