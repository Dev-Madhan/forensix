"""
Script 2: Extract Face Attributes
Extracts facial attribute taxonomies conforming to ForensicAttributeSchemaV2
from raw dataset annotations or landmark geometries.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.logging import logger
from app.schemas.taxonomy import AttributeValue, ForensicAttributeSchemaV2, VALID_VALUES


def extract_attributes_from_metadata(meta: Dict[str, Any]) -> ForensicAttributeSchemaV2:
    """Converts raw dataset metadata (CelebA or FS2K style) into ForensicAttributeSchemaV2."""
    schema = ForensicAttributeSchemaV2()

    # Face shape / skin
    gender_val = "male" if meta.get("Male", 0) == 1 else "female" if "Male" in meta else meta.get("gender", "unknown")
    face_shape = meta.get("face_shape", "oval")
    schema.face["face_shape"] = AttributeValue(value=face_shape, confidence=0.90, source="explicit")
    schema.face["skin_tone"] = AttributeValue(value=meta.get("skin_tone", "medium"), confidence=0.85, source="inferred")

    # Eyes
    schema.eyes["shape"] = AttributeValue(value=meta.get("eye_shape", "almond"), confidence=0.88, source="explicit")
    schema.eyes["spacing"] = AttributeValue(value=meta.get("eye_spacing", "normal"), confidence=0.85, source="explicit")
    if "eye_color" in meta:
        schema.eyes["color"] = AttributeValue(value=meta["eye_color"], confidence=0.90, source="explicit")

    # Eyebrows
    schema.eyebrows["thickness"] = AttributeValue(
        value="thick" if meta.get("Bushy_Eyebrows", 0) == 1 else meta.get("eyebrow_thickness", "medium"),
        confidence=0.88,
        source="explicit",
    )
    schema.eyebrows["shape"] = AttributeValue(
        value="arched" if meta.get("Arched_Eyebrows", 0) == 1 else meta.get("eyebrow_shape", "straight"),
        confidence=0.88,
        source="explicit",
    )

    # Nose
    schema.nose["bridge"] = AttributeValue(value=meta.get("nose_bridge", "straight"), confidence=0.85, source="explicit")
    schema.nose["width"] = AttributeValue(
        value="wide" if meta.get("Big_Nose", 0) == 1 else meta.get("nose_width", "medium"),
        confidence=0.85,
        source="explicit",
    )
    schema.nose["tip"] = AttributeValue(
        value="pointed" if meta.get("Pointy_Nose", 0) == 1 else meta.get("nose_tip", "rounded"),
        confidence=0.85,
        source="explicit",
    )

    # Mouth & Lips
    schema.mouth["upper_lip"] = AttributeValue(
        value="full" if meta.get("Big_Lips", 0) == 1 else meta.get("upper_lip", "medium"),
        confidence=0.85,
        source="explicit",
    )
    schema.mouth["lower_lip"] = AttributeValue(value=meta.get("lower_lip", "medium"), confidence=0.85, source="explicit")

    # Jaw & Chin
    schema.jaw["shape"] = AttributeValue(value=meta.get("jaw_shape", "angular"), confidence=0.85, source="explicit")
    schema.chin["shape"] = AttributeValue(value=meta.get("chin_shape", "square"), confidence=0.85, source="explicit")

    # Hair
    hair_color = "black"
    if meta.get("Black_Hair", 0) == 1:
        hair_color = "black"
    elif meta.get("Blond_Hair", 0) == 1:
        hair_color = "blonde"
    elif meta.get("Brown_Hair", 0) == 1:
        hair_color = "dark brown"
    elif meta.get("Gray_Hair", 0) == 1:
        hair_color = "gray"

    hair_texture = "wavy" if meta.get("Wavy_Hair", 0) == 1 else meta.get("hair_texture", "straight")
    schema.hair["color"] = AttributeValue(value=hair_color, confidence=0.90, source="explicit")
    schema.hair["texture"] = AttributeValue(value=hair_texture, confidence=0.88, source="explicit")

    # Facial Hair
    f_type = "none"
    if meta.get("Mustache", 0) == 1:
        f_type = "mustache"
    elif meta.get("Goatee", 0) == 1:
        f_type = "goatee"
    elif meta.get("No_Beard", 0) == 0 and gender_val == "male":
        f_type = "beard"
    schema.facial_hair["type"] = AttributeValue(value=f_type, confidence=0.88, source="explicit")

    # Eyeglasses
    if meta.get("Eyeglasses", 0) == 1 or meta.get("glasses") is True:
        schema.distinctive_features.append(AttributeValue(value="glasses", confidence=0.95, source="explicit"))

    return schema


def main():
    parser = argparse.ArgumentParser(description="Extract attributes into ForensicAttributeSchemaV2.")
    parser.add_argument("--annotations", type=str, default="datasets/processed/celeba/attributes_aligned.json")
    parser.add_argument("--output", type=str, default="datasets/processed/taxonomy_attributes.json")
    args = parser.parse_args()

    ann_path = Path(args.annotations)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not ann_path.exists():
        logger.warning(f"Annotations file not found at {ann_path}; generating synthetic sample attributes.")
        sample_data = {"sample_001.jpg": {"face_shape": "oval", "Male": 1, "Big_Nose": 1, "Eyeglasses": 1}}
    else:
        sample_data = json.loads(ann_path.read_text(encoding="utf-8"))

    results = {}
    for img_name, meta in sample_data.items():
        v2_schema = extract_attributes_from_metadata(meta)
        results[img_name] = v2_schema.model_dump()

    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    logger.info(f"Wrote {len(results)} structured attribute schemas to {out_path}.")


if __name__ == "__main__":
    main()
