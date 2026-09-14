#!/usr/bin/env python3
"""
Forensix — Qwen Forensic SFT Training Script
============================================
Supervised fine-tuning (SFT) script using Hugging Face TRL and PEFT LoRA
to train a language model on synthetic witness statements paired with
ground-truth 40-attribute CelebAMask-HQ forensic JSON schemas.

Optimized for 6GB VRAM (NVIDIA RTX 4050 Laptop):
  - Model: Qwen/Qwen2.5-1.5B-Instruct (or Qwen/Qwen2.5-3B-Instruct)
  - Method: LoRA (rank=16, alpha=32, target_modules: q_proj, k_proj, v_proj, o_proj)
  - Precision: FP16 / BF16 with gradient checkpointing
  - Batch size: 1 with gradient accumulation 8

Usage:
    cd ai-service
    .venv/Scripts/python scripts/train_qwen_forensic_sft.py ^
        --model_id Qwen/Qwen2.5-1.5B-Instruct ^
        --dataset_path datasets/processed/llm_sft_train.jsonl ^
        --output_dir models/qwen_forensic_adapter ^
        --max_steps 500 ^
        --learning_rate 2e-4
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATASET = BASE_DIR / "datasets" / "processed" / "llm_sft_train.jsonl"
DEFAULT_OUTPUT = BASE_DIR / "models" / "qwen_forensic_adapter"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune Qwen on forensic witness statements using LoRA.")
    parser.add_argument("--model_id", default="Qwen/Qwen2.5-1.5B-Instruct", type=str, help="Hugging Face model ID or local path.")
    parser.add_argument("--dataset_path", default=str(DEFAULT_DATASET), type=str, help="Path to llm_sft_train.jsonl")
    parser.add_argument("--output_dir", default=str(DEFAULT_OUTPUT), type=str, help="Output directory for LoRA adapter.")
    parser.add_argument("--max_steps", default=500, type=int, help="Maximum training steps.")
    parser.add_argument("--batch_size", default=1, type=int, help="Per-device batch size.")
    parser.add_argument("--gradient_accumulation_steps", default=8, type=int, help="Gradient accumulation steps.")
    parser.add_argument("--learning_rate", default=2e-4, type=float, help="Learning rate.")
    parser.add_argument("--rank", default=16, type=int, help="LoRA rank.")
    parser.add_argument("--max_seq_length", default=512, type=int, help="Max sequence length.")
    parser.add_argument("--dry_run", action="store_true", help="Validate setup without full training.")
    return parser.parse_args()


def formatting_prompts_func(example: dict, tokenizer: Any) -> str:
    """Formats chat messages into chat template strings."""
    messages = example["messages"]
    return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    dataset_path = Path(args.dataset_path)
    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {dataset_path}. Run generate_forensic_training_data.py first!"
        )

    print(f"[Forensic SFT] Loading dataset from: {dataset_path}")
    raw_dataset = load_dataset("json", data_files=str(dataset_path), split="train")
    print(f"[Forensic SFT] Dataset loaded with {len(raw_dataset)} training examples.")

    if args.dry_run:
        print("[Forensic SFT] Dry run complete. Dataset is verified and ready for training.")
        return

    print(f"[Forensic SFT] Loading tokenizer and model: {args.model_id}")
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    device_map = "auto" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        torch_dtype=torch_dtype,
        device_map=device_map,
        trust_remote_code=True,
    )

    # Enable gradient checkpointing to conserve VRAM on RTX 4050 6GB
    if hasattr(model, "gradient_checkpointing_enable"):
        model.gradient_checkpointing_enable()

    peft_config = LoraConfig(
        r=args.rank,
        lora_alpha=args.rank * 2,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )

    training_args = SFTConfig(
        output_dir=str(output_dir),
        max_steps=args.max_steps,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        learning_rate=args.learning_rate,
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        fp16=torch.cuda.is_available(),
        max_length=args.max_seq_length,
        dataset_text_field=None,
        packing=False,
        report_to="none",
    )

    import inspect
    sig = inspect.signature(SFTTrainer.__init__).parameters
    tokenizer_kwargs = {"processing_class": tokenizer} if "processing_class" in sig else {"tokenizer": tokenizer}

    trainer = SFTTrainer(
        model=model,
        train_dataset=raw_dataset,
        peft_config=peft_config,
        args=training_args,
        **tokenizer_kwargs,
    )

    print("[Forensic SFT] Starting training loop...")
    trainer.train()

    print(f"[Forensic SFT] Saving fine-tuned LoRA adapter to: {output_dir}")
    trainer.model.save_pretrained(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    print("[Forensic SFT] Training complete!")


if __name__ == "__main__":
    main()
