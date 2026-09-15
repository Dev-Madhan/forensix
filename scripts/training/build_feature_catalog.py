"""
Script 3: Build Feature Catalog
Indexes component catalog elements (eyes, nose, mouth, jaw, chin, hair)
from dataset landmarks and masks, producing the catalog JSON used for composite assembly.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.logging import logger
from app.schemas.taxonomy import VALID_VALUES


def build_catalog() -> Dict[str, List[Dict[str, Any]]]:
    """Builds a structured feature catalog organized by component domain."""
    catalog: Dict[str, List[Dict[str, Any]]] = {}

    for domain, attrs in VALID_VALUES.items():
        catalog[domain] = []
        for attr_key, allowed_vals in attrs.items():
            for val in allowed_vals:
                component_id = f"{val}_{attr_key[:3]}"
                catalog[domain].append({
                    "id": component_id,
                    "name": f"{val.capitalize()} ({attr_key.replace('_', ' ')})",
                    "attribute": attr_key,
                    "value": val,
                    "thumbnail": f"/thumbnails/{domain}/{component_id}.png",
                    "gender_bias": "neutral",
                    "compatible_styles": [
                        "Forensic Graphite (Pencil)",
                        "Realistic Charcoal",
                        "Digital Identi-Kit (Lineart)",
                    ],
                })

    return catalog


def main():
    parser = argparse.ArgumentParser(description="Build forensic feature catalog for composite assembly.")
    parser.add_argument("--output", type=str, default="datasets/processed/feature_catalog.json")
    args = parser.parse_args()

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    cat = build_catalog()
    out_path.write_text(json.dumps(cat, indent=2), encoding="utf-8")
    total_features = sum(len(v) for v in cat.values())
    logger.info(f"Built feature catalog with {total_features} components across {len(cat)} domains -> {out_path}")


if __name__ == "__main__":
    main()
