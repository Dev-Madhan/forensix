"""
Script 5: Build Qwen Dataset
Formats paired witness statements and ForensicAttributeSchemaV2 targets into
standard instruction-tuning formats (Alpaca / ShareGPT) for Qwen 1.5B/7B training.
"""

import argparse
import json
import random
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.logging import logger
from app.providers.llm.qwen_local import SYSTEM_PROMPT_V2


def main():
    parser = argparse.ArgumentParser(description="Build Qwen forensic SFT instruction dataset.")
    parser.add_argument("--input", type=str, default="datasets/processed/synthetic_statements.json")
    parser.add_argument("--output-dir", type=str, default="datasets/processed/qwen_sft")
    parser.add_argument("--val-split", type=float, default=0.10)
    args = parser.parse_args()

    in_path = Path(args.input)
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not in_path.exists():
        logger.warning(f"File {in_path} not found. Generating default synthetic paired samples.")
        samples = [{
            "id": "sample_001",
            "statement": "Male in 30s with oval face, almond brown eyes, straight nose, and stubble.",
            "ground_truth_taxonomy": {
                "face": {"face_shape": {"value": "oval", "confidence": 0.95, "source": "explicit"}},
                "eyes": {"shape": {"value": "almond", "confidence": 0.90, "source": "explicit"}},
                "nose": {"bridge": {"value": "straight", "confidence": 0.85, "source": "explicit"}},
                "facial_hair": {"type": {"value": "stubble", "confidence": 0.90, "source": "explicit"}},
            },
        }]
    else:
        samples = json.loads(in_path.read_text(encoding="utf-8"))

    alpaca_records = []
    sharegpt_records = []

    for item in samples:
        statement = item["statement"]
        target_json_str = json.dumps(item["ground_truth_taxonomy"], indent=2)

        # Alpaca format
        alpaca_records.append({
            "instruction": SYSTEM_PROMPT_V2,
            "input": statement,
            "output": target_json_str,
        })

        # ShareGPT format
        sharegpt_records.append({
            "conversations": [
                {"from": "system", "value": SYSTEM_PROMPT_V2},
                {"from": "human", "value": statement},
                {"from": "gpt", "value": target_json_str},
            ]
        })

    # Train / Val Split
    random.seed(42)
    random.shuffle(alpaca_records)
    val_idx = max(1, int(len(alpaca_records) * args.val_split))
    val_data = alpaca_records[:val_idx]
    train_data = alpaca_records[val_idx:]

    (out_dir / "train_alpaca.json").write_text(json.dumps(train_data, indent=2), encoding="utf-8")
    (out_dir / "val_alpaca.json").write_text(json.dumps(val_data, indent=2), encoding="utf-8")
    (out_dir / "sharegpt_full.json").write_text(json.dumps(sharegpt_records, indent=2), encoding="utf-8")

    logger.info(f"Generated Qwen SFT dataset: {len(train_data)} train, {len(val_data)} val -> {out_dir}")


if __name__ == "__main__":
    main()
