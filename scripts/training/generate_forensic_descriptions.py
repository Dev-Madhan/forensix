"""
Script 4: Generate Forensic Descriptions
Synthesizes naturalistic witness statements from structured taxonomy annotations,
introducing realistic witness speech patterns, colloquialisms, and ambiguity variations.
"""

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.logging import logger
from app.schemas.taxonomy import ForensicAttributeSchemaV2


TEMPLATES_OPENING = [
    "I got a clear look at the suspect. He was a {gender}, maybe around {age_range}.",
    "The person who ran was a {gender} in their {age_range}.",
    "Witness reported a {gender} suspect, approximately {age_range} years old.",
    "I remember his face clearly. He was a {gender}, about {age_range}.",
]

TEMPLATES_FACE = [
    "He had a noticeably {face_shape} face shape with {cheekbones} cheekbones.",
    "His face was distinctly {face_shape}.",
    "The suspect had an {face_shape} shaped head and {skin_tone} complexion.",
]

TEMPLATES_EYES = [
    "His eyes were {eye_shape} and {eye_color}, set {eye_spacing} apart with {eyebrow_thickness} eyebrows.",
    "He had {eye_spacing} {eye_shape} {eye_color} eyes under {eyebrow_thickness} arched brows.",
    "I remember his eyes—they looked {eye_shape} and {eye_color}.",
]

TEMPLATES_NOSE_MOUTH = [
    "He had a {nose_length} {nose_bridge} nose and {upper_lip} lips.",
    "His nose was {nose_bridge} with a {nose_tip} tip. Mouth seemed {mouth_width}.",
    "Notable {nose_bridge} bridge on the nose, pretty {upper_lip} lips.",
]

TEMPLATES_HAIR = [
    "He had {hair_length} {hair_texture} {hair_color} hair.",
    "His hair was {hair_length} and {hair_texture}, colored {hair_color}.",
    "Short hair, mostly {hair_color} and {hair_texture}.",
]

TEMPLATES_FACIAL_HAIR = [
    "He was sporting a {facial_hair}.",
    "I noticed he had {facial_hair}.",
    "He had some {facial_hair} on his chin.",
    "He was clean-shaven, no facial hair.",
]


def generate_description_from_schema(schema: ForensicAttributeSchemaV2) -> str:
    """Combines modular templates to generate a realistic witness description."""
    parts = []

    gender = schema.get_value("face", "gender", "male")
    age = schema.get_value("face", "estimated_age_range", "30s")
    parts.append(random.choice(TEMPLATES_OPENING).format(gender=gender, age_range=age))

    face_shape = schema.get_value("face", "face_shape", "oval")
    cheekbones = schema.get_value("face", "cheekbones", "subtle")
    skin_tone = schema.get_value("face", "skin_tone", "medium")
    parts.append(random.choice(TEMPLATES_FACE).format(
        face_shape=face_shape, cheekbones=cheekbones, skin_tone=skin_tone
    ))

    eye_shape = schema.get_value("eyes", "shape", "almond")
    eye_color = schema.get_value("eyes", "color", "dark brown")
    eye_spacing = schema.get_value("eyes", "spacing", "normal")
    eyebrow_thickness = schema.get_value("eyebrows", "thickness", "medium")
    parts.append(random.choice(TEMPLATES_EYES).format(
        eye_shape=eye_shape, eye_color=eye_color, eye_spacing=eye_spacing, eyebrow_thickness=eyebrow_thickness
    ))

    nose_bridge = schema.get_value("nose", "bridge", "straight")
    nose_length = schema.get_value("nose", "length", "medium")
    nose_tip = schema.get_value("nose", "tip", "rounded")
    mouth_width = schema.get_value("mouth", "width", "medium")
    upper_lip = schema.get_value("mouth", "upper_lip", "medium")
    parts.append(random.choice(TEMPLATES_NOSE_MOUTH).format(
        nose_bridge=nose_bridge, nose_length=nose_length, nose_tip=nose_tip,
        mouth_width=mouth_width, upper_lip=upper_lip
    ))

    hair_length = schema.get_value("hair", "length", "short")
    hair_texture = schema.get_value("hair", "texture", "straight")
    hair_color = schema.get_value("hair", "color", "black")
    parts.append(random.choice(TEMPLATES_HAIR).format(
        hair_length=hair_length, hair_texture=hair_texture, hair_color=hair_color
    ))

    f_hair = schema.get_value("facial_hair", "type", "none")
    if f_hair and f_hair not in ("none", "clean-shaven"):
        parts.append(f"He definitely had a {f_hair}.")
    elif f_hair == "clean-shaven":
        parts.append("He was clean-shaven.")

    for feat in schema.distinctive_features:
        parts.append(f"He was also wearing {feat.value}.")

    return " ".join(parts)


def main():
    parser = argparse.ArgumentParser(description="Generate natural language witness statements.")
    parser.add_argument("--input", type=str, default="datasets/processed/taxonomy_attributes.json")
    parser.add_argument("--output", type=str, default="datasets/processed/synthetic_statements.json")
    args = parser.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not in_path.exists():
        logger.info(f"Input attributes file {in_path} not found. Creating sample statements.")
        raw_items = {"sample_001": ForensicAttributeSchemaV2(
            face={"face_shape": {"value": "oval"}},
            eyes={"shape": {"value": "almond"}},
            nose={"bridge": {"value": "aquiline"}},
        ).model_dump()}
    else:
        raw_items = json.loads(in_path.read_text(encoding="utf-8"))

    results = []
    for item_id, attr_dict in raw_items.items():
        v2 = ForensicAttributeSchemaV2.from_v1_dict(attr_dict)
        statement = generate_description_from_schema(v2)
        results.append({
            "id": item_id,
            "statement": statement,
            "ground_truth_taxonomy": v2.model_dump(),
        })

    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    logger.info(f"Generated {len(results)} forensic witness statements -> {out_path}")


if __name__ == "__main__":
    main()
