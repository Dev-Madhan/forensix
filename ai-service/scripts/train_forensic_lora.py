#!/usr/bin/env python3
"""
Forensix Rank-64 Dual-Style Forensic LoRA Training Script
===========================================================
Trains a Rank-64 LoRA adapter on Stable Diffusion 1.5 using:
  - FS2K dataset (forensic pencil sketches)
  - CelebAMask-HQ dataset (high-quality face portraits with segmentation labels)

Two complementary styles are trained jointly:
  - 50% graphite-on-white (traditional forensic sketch style)
  - 50% white-linework-on-black (chalkboard / monochrome inversion style)
    → Created by inverting FS2K sketch images via PIL.ImageOps.invert()

Validation: auto-generates the reference example prompt every 200 steps
and saves the output image for visual inspection.

Usage:
    cd ai-service
    .venv/Scripts/python scripts/train_forensic_lora.py ^
        --output_dir models/lora ^
        --lora_name forensic_sketch_lora_v4.safetensors ^
        --max_train_steps 1500 ^
        --rank 32 ^
        --learning_rate 5e-5 ^
        --batch_size 1 ^
        --gradient_accumulation_steps 4 ^
        --mixed_precision fp16 ^
        --seed 42
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# ── Validate environment before importing heavy deps ──────────────────────────
try:
    import torch
    import torch.nn.functional as F
    from torch.utils.data import Dataset, DataLoader
    from torchvision import transforms
    from PIL import Image, ImageOps, ImageFilter
    import numpy as np
    from diffusers import (
        StableDiffusionPipeline,
        DDIMScheduler,
        UNet2DConditionModel,
    )
    from transformers import CLIPTokenizer
    from peft import LoraConfig, get_peft_model_state_dict
    from accelerate import Accelerator
    from accelerate.utils import set_seed
    from tqdm.auto import tqdm
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install training deps: pip install accelerate transformers diffusers[torch] torchvision peft tqdm")
    sys.exit(1)

# ── Root paths ────────────────────────────────────────────────────────────────
SCRIPT_DIR     = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASETS_DIR   = AI_SERVICE_DIR / "datasets" / "raw"
FS2K_DIR       = DATASETS_DIR / "FS2K"
CELEBA_DIR     = DATASETS_DIR / "CelebAMask-HQ"
# Models live in ai-service/models/ (same directory as the app config)
MODELS_DIR     = AI_SERVICE_DIR / "models"
SD15_DIR       = MODELS_DIR / "sd15"

# Reference prompt for periodic validation generation
VALIDATION_PROMPT = (
    "(single person:1.6), (solo:1.6), (single face:1.6), "
    "(forensic chalkboard composite sketch:1.6), (crisp monochrome white and light grey chalk pencil linework:1.5) "
    "on (solid pitch black background:1.8), (law enforcement forensic identification sketch:1.5), "
    "direct frontal mugshot view, direct forward gaze. "
    "(oval-shaped face:1.3), (soft gentle jawline:1.2), (moderately prominent rounded chin:1.3), "
    "(high prominent cheekbones:1.4). "
    "(medium-sized almond-shaped eyes:1.35), (close-set eyes:1.35), (deep-set eyes:1.4), "
    "(medium-thick naturally arched eyebrows:1.3). "
    "(straight medium-width nose:1.35), (defined nostrils:1.2), (slightly rounded upturned nasal tip:1.3). "
    "(medium-wide mouth:1.3), (full voluminous lips:1.3), (clearly defined Cupid's bow upper lip:1.4), "
    "(neutral closed-mouth expression:1.4). "
    "(wearing thin rectangular eyeglasses:1.45), slim dark wire rectangular frames. "
    "(short neat side-parted dark hair:1.4), (slightly low hairline:1.3). "
    "(clean-shaven face:1.5), forensic facial composite of an adult male, aged 26 to 35."
)
VALIDATION_NEGATIVE = (
    "(two faces:2.0), (multiple faces:2.0), (two people:2.0), (dual image:2.0), (side by side:2.0), "
    "(diptych:2.0), (split image:2.0), (twin:2.0), (duplicate:2.0), (cloned face:2.0), (multiple people:2.0), "
    "(white background:2.0), (light background:2.0), color, photorealistic, 3d render, "
    "beard, mustache, stubble, watermark, text"
)

VALIDATION_PROMPT_COLOR = (
    "(single person:1.6), (solo:1.6), (single face:1.6), (only one person:1.6), (centered frontal portrait:1.5), "
    "<forensic_color> authentic forensic colored composite portrait, realistic human skin tone, "
    "natural demographic skin pigmentation, realistic hair color, lifelike studio lighting, "
    "police composite identification portrait, direct frontal mugshot view, direct forward gaze, "
    "(oval-shaped face:1.3), (medium-sized almond-shaped eyes:1.35), (straight medium-width nose:1.35), "
    "(medium-wide mouth:1.3), (short neat side-parted dark hair:1.4), (clean-shaven face:1.5), "
    "forensic facial composite of an adult female, mature older suspect aged 50 and above, "
    "deep transverse forehead wrinkles, pronounced nasolabial folds, aging skin texture"
)
VALIDATION_NEGATIVE_COLOR = (
    "(two faces:2.0), (multiple faces:2.0), (two people:2.0), (dual image:2.0), (side by side:2.0), "
    "(diptych:2.0), (split image:2.0), (twin:2.0), (twins:2.0), (duplicate:2.0), (cloned face:2.0), (before and after:2.0), "
    "(comparison:2.0), (double portrait:2.0), (extra head:2.0), (two heads:2.0), multiple people, "
    "cartoon, anime, 3d render, flat monochrome, black and white, grayscale, desaturated, deformed, bad anatomy"
)


# ── Style caption generators ──────────────────────────────────────────────────

def make_graphite_caption(subject_desc: str) -> str:
    return (
        f"(single person:1.6), (solo:1.6), (single face:1.6), <forensic_graphite> authentic forensic graphite sketch, "
        f"sharp 2B pencil linework, fine cross-hatching shading, monochrome graphite on clean white background, {subject_desc}"
    )


def make_chalkboard_caption(subject_desc: str) -> str:
    return (
        f"(single person:1.6), (solo:1.6), (single face:1.6), <forensic_chalkboard> forensic chalkboard composite sketch, "
        f"crisp monochrome white and light grey chalk pencil linework on solid pitch black background, "
        f"law enforcement forensic identification sketch, {subject_desc}"
    )


def make_color_caption(subject_desc: str) -> str:
    return (
        f"(single person:1.6), (solo:1.6), (single face:1.6), (only one person:1.6), (centered frontal portrait:1.5), "
        f"<forensic_color> authentic forensic colored composite portrait, realistic human skin tone, "
        f"natural demographic skin pigmentation, realistic hair color, lifelike studio lighting, "
        f"law enforcement composite identification portrait, {subject_desc}"
    )


# ── Dataset class ─────────────────────────────────────────────────────────────

class ForensicLoRADataset(Dataset):
    """
    Loads image-caption pairs from FS2K and CelebAMask-HQ.
    50% of samples are the original graphite style,
    50% are the inverted (white-on-black) chalkboard style.
    """

    def __init__(
        self,
        resolution: int = 512,
        fs2k_dir: Path = FS2K_DIR,
        celeba_dir: Path = CELEBA_DIR,
        max_samples: int = 5000,
        seed: int = 42,
    ):
        self.resolution = resolution
        self.rng = random.Random(seed)
        self.samples: List[Dict[str, Any]] = []

        self.transform = transforms.Compose([
            transforms.Resize((resolution, resolution)),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ])

        self._load_fs2k(fs2k_dir)
        self._load_celeba_hq(celeba_dir)
        self.rng.shuffle(self.samples)
        if len(self.samples) > max_samples:
            self.samples = self.samples[:max_samples]

        print(f"[Dataset] Loaded {len(self.samples)} total training samples.")

    def _load_fs2k(self, fs2k_dir: Path) -> None:
        """Load FS2K sketch images with auto-generated captions."""
        sketch_dir = fs2k_dir / "sketch"
        if not sketch_dir.exists():
            for candidate in [fs2k_dir / "train" / "sketch", fs2k_dir]:
                if candidate.exists():
                    sketch_dir = candidate
                    break

        if not sketch_dir.exists():
            print(f"[WARN] FS2K sketch directory not found at {fs2k_dir}. Skipping FS2K.")
            return

        sketch_paths = list(sketch_dir.rglob("*.jpg")) + list(sketch_dir.rglob("*.png"))
        print(f"[Dataset] Found {len(sketch_paths)} FS2K sketch images.")

        for path in sketch_paths:
            # Graphite (original)
            self.samples.append({
                "image_path": str(path),
                "invert": False,
                "caption": make_graphite_caption("forensic composite portrait of an adult subject"),
            })
            # Chalkboard (inverted)
            self.samples.append({
                "image_path": str(path),
                "invert": True,
                "caption": make_chalkboard_caption("forensic composite portrait of an adult subject"),
            })

    def _load_celeba_hq(self, celeba_dir: Path) -> None:
        """Load CelebAMask-HQ images with attribute-conditioned multimodal captions."""
        processed_jsonl = AI_SERVICE_DIR / "datasets" / "processed" / "diffusion_train.jsonl"
        if processed_jsonl.exists():
            print(f"[Dataset] Loading attribute-conditioned captions from {processed_jsonl}...")
            with open(processed_jsonl, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        record = json.loads(line)
                        p = Path(record["image_path"])
                        if p.exists():
                            cap = record["caption"]
                            style = record.get("style", "graphite")
                            is_color = (style == "color_age")
                            inv = (style == "chalkboard")
                            self.samples.append({
                                "image_path": str(p),
                                "invert": inv,
                                "is_color": is_color,
                                "caption": cap,
                                "is_photo_reference": True,
                            })
                    except Exception:
                        continue
            print(f"[Dataset] Loaded {len(self.samples)} attribute-conditioned samples.")
            return

        img_dir = celeba_dir / "CelebA-HQ-img"
        if not img_dir.exists():
            for candidate in [celeba_dir / "images", celeba_dir]:
                if candidate.exists():
                    img_dir = candidate
                    break

        if not img_dir.exists():
            print(f"[WARN] CelebAMask-HQ image directory not found at {celeba_dir}. Skipping CelebA-HQ.")
            return

        img_paths = sorted(list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png")))[:5000]
        print(f"[Dataset] Found {len(img_paths)} CelebA-HQ images.")

        for i, path in enumerate(img_paths):
            roll = i % 10
            is_color = (roll >= 7)
            inv = (4 <= roll < 7)
            if is_color:
                cap = make_color_caption("forensic composite portrait of an adult subject")
            elif inv:
                cap = make_chalkboard_caption("forensic composite portrait of an adult subject")
            else:
                cap = make_graphite_caption("forensic composite portrait of an adult subject")
            self.samples.append({
                "image_path": str(path),
                "invert": inv,
                "is_color": is_color,
                "caption": cap,
                "is_photo_reference": True,
            })

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> Dict[str, Any]:
        sample = self.samples[index]
        img = Image.open(sample["image_path"]).convert("RGB")

        # Photo references:
        # - If is_color: retain original RGB color photo (Color Age-Progressed style)
        # - If monochrome: convert to high-fidelity pencil sketch via Canny Edge Detection
        if sample.get("is_photo_reference") and not sample.get("is_color", False):
            try:
                import cv2
                # Convert to cv2 grayscale
                cv_img = np.array(img)
                gray = cv2.cvtColor(cv_img, cv2.COLOR_RGB2GRAY)
                # Canny edge detection
                edges = cv2.Canny(gray, 50, 150)
                # Dilate to thicken lines slightly
                kernel = np.ones((2, 2), np.uint8)
                edges = cv2.dilate(edges, kernel, iterations=1)
                # Invert edges (black lines on white background)
                sketch = cv2.bitwise_not(edges)
                img = Image.fromarray(sketch).convert("RGB")
            except ImportError:
                # Fallback to PIL if cv2 missing
                from PIL import ImageFilter, ImageEnhance
                gray = img.convert("L")
                edges = gray.filter(ImageFilter.FIND_EDGES)
                enhancer = ImageEnhance.Contrast(edges)
                edges = enhancer.enhance(2.0)
                img = ImageOps.invert(edges).convert("RGB")

        if sample.get("invert", False):
            img = ImageOps.invert(img)

        pixel_values = self.transform(img)
        return {
            "pixel_values": pixel_values,
            "caption": sample["caption"],
        }


# ── LoRA injection helper ─────────────────────────────────────────────────────

def inject_lora_into_unet(unet: Any, rank: int = 64) -> None:
    """Injects PEFT LoRA adapter into UNet attention projection layers."""
    lora_config = LoraConfig(
        r=rank,
        lora_alpha=rank,
        init_lora_weights="gaussian",
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
    )
    unet.add_adapter(lora_config)


# ── Validation generation ─────────────────────────────────────────────────────

def _run_validation(
    unet: Any, vae: Any, text_encoder: Any, tokenizer: Any,
    scheduler: Any, device: Any, step: int, output_dir: Path,
) -> None:
    """Generate validation images for both chalkboard and color forensic styles."""
    try:
        unet.eval()
        pipeline_cls: Any = StableDiffusionPipeline
        pipe: Any = pipeline_cls(
            vae=vae, text_encoder=text_encoder, tokenizer=tokenizer,
            unet=unet, scheduler=scheduler, safety_checker=None,
            feature_extractor=None, requires_safety_checker=False,
        ).to(device)
        autocast_ctx: Any = torch.autocast(device.type if hasattr(device, "type") else "cuda", dtype=torch.float16)
        val_dir = output_dir / "validation"
        val_dir.mkdir(exist_ok=True)

        # 1. Chalkboard validation
        with torch.no_grad(), autocast_ctx:
            out_chalk = pipe(
                prompt=VALIDATION_PROMPT,
                negative_prompt=VALIDATION_NEGATIVE,
                num_inference_steps=20,
                guidance_scale=10.0,
                height=512, width=512,
                generator=torch.Generator(device="cpu").manual_seed(42),
            )
        chalk_file = val_dir / f"step_{step:05d}_chalk.png"
        out_chalk.images[0].save(chalk_file)

        # 2. Color Age-Progressed single-person validation
        with torch.no_grad(), autocast_ctx:
            out_color = pipe(
                prompt=VALIDATION_PROMPT_COLOR,
                negative_prompt=VALIDATION_NEGATIVE_COLOR,
                num_inference_steps=20,
                guidance_scale=7.5,
                height=512, width=512,
                generator=torch.Generator(device="cpu").manual_seed(42),
            )
        color_file = val_dir / f"step_{step:05d}_color.png"
        out_color.images[0].save(color_file)

        print(f"  [Validation] Saved → {chalk_file.name} and {color_file.name}")
        del pipe
    except Exception as err:
        print(f"  [Validation] Skipped at step {step}: {err}")
    finally:
        unet.train()


# ── Training loop ─────────────────────────────────────────────────────────────

def train(args: argparse.Namespace) -> None:
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision,
    )
    set_seed(args.seed)

    # Resolve to an absolute Path so HuggingFace hub treats it as a local
    # filesystem path (not a repo ID) — critical for paths that contain spaces.
    sd_path = Path(args.sd_model_path).resolve()
    if not sd_path.exists():
        print(f"[ERROR] SD1.5 model directory not found: {sd_path}")
        print("Tip: download with `huggingface-cli download runwayml/stable-diffusion-v1-5 --local-dir models/sd15`")
        sys.exit(1)

    print(f"[Train] SD1.5 model path  : {sd_path}")
    print(f"[Train] LoRA rank         : {args.rank}")
    print(f"[Train] Learning rate     : {args.learning_rate}")
    print(f"[Train] Max steps         : {args.max_train_steps}")
    print(f"[Train] Output dir        : {args.output_dir}")

    # Load the full pipeline with variant="fp16" so diffusers correctly resolves
    # model.fp16.safetensors weight files, then extract individual components.
    print("[Train] Loading SD1.5 pipeline components (fp16 variant)...")
    pipe: Any = StableDiffusionPipeline.from_pretrained(
        str(sd_path),
        torch_dtype=torch.float16,
        variant="fp16",
        safety_checker=None,
    )
    if pipe is None:
        raise RuntimeError(f"Failed to load StableDiffusionPipeline from {sd_path}")

    # Swap to DDIM scheduler for crisper linework
    pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)

    tokenizer    = pipe.tokenizer
    text_encoder = pipe.text_encoder
    vae          = pipe.vae
    unet         = pipe.unet
    scheduler: Any = pipe.scheduler
    del pipe  # free the pipeline wrapper; we hold component refs directly

    # Freeze base weights; only LoRA layers train
    vae.requires_grad_(False)
    text_encoder.requires_grad_(False)
    unet.requires_grad_(False)

    weight_dtype = torch.float32
    if accelerator.mixed_precision == "fp16":
        weight_dtype = torch.float16
    elif accelerator.mixed_precision == "bf16":
        weight_dtype = torch.bfloat16

    inject_lora_into_unet(unet, rank=args.rank)

    # For mixed-precision (fp16), PyTorch GradScaler requires trainable parameters to be in float32
    if args.mixed_precision == "fp16":
        for param in unet.parameters():
            if param.requires_grad:
                param.data = param.data.to(torch.float32)

    lora_params = [p for p in unet.parameters() if p.requires_grad]

    optimizer = torch.optim.AdamW(
        lora_params,
        lr=args.learning_rate,
        weight_decay=1e-2,
    )

    dataset    = ForensicLoRADataset(resolution=512, max_samples=args.max_samples, seed=args.seed)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)

    from transformers import get_cosine_schedule_with_warmup
    lr_scheduler = get_cosine_schedule_with_warmup(
        optimizer,
        num_warmup_steps=100,
        num_training_steps=args.max_train_steps,
    )

    unet, optimizer, dataloader, lr_scheduler = accelerator.prepare(
        unet, optimizer, dataloader, lr_scheduler
    )
    vae          = vae.to(accelerator.device, dtype=weight_dtype)
    text_encoder = text_encoder.to(accelerator.device, dtype=weight_dtype)

    global_step = 0
    losses: List[float] = []
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"[Train] Training started (total trainable parameters: {sum(p.numel() for p in lora_params):,})...")
    unet.train()

    progress_bar = tqdm(
        total=args.max_train_steps,
        desc="Training LoRA",
        disable=not accelerator.is_local_main_process,
    )

    while global_step < args.max_train_steps:
        for batch in dataloader:
            with accelerator.accumulate(unet):
                pixel_values = batch["pixel_values"].to(accelerator.device, dtype=weight_dtype)
                captions     = batch["caption"]

                # Encode to latent space
                latents = vae.encode(pixel_values).latent_dist.sample()
                latents = latents * vae.config.scaling_factor

                noise         = torch.randn_like(latents)
                timesteps     = torch.randint(
                    0, scheduler.config.num_train_timesteps,
                    (latents.shape[0],), device=latents.device,
                ).long()
                noisy_latents = scheduler.add_noise(latents, noise, timesteps)

                text_inputs = tokenizer(
                    list(captions),
                    padding="max_length",
                    max_length=77,
                    truncation=True,
                    return_tensors="pt",
                ).to(accelerator.device)
                encoder_hidden_states = text_encoder(text_inputs.input_ids)[0].to(dtype=weight_dtype)

                noise_pred = unet(noisy_latents.to(dtype=weight_dtype), timesteps, encoder_hidden_states).sample
                loss       = F.mse_loss(noise_pred.float(), noise.float(), reduction="mean")

                accelerator.backward(loss)
                if accelerator.sync_gradients:
                    accelerator.clip_grad_norm_(lora_params, 1.0)
                optimizer.step()
                lr_scheduler.step()
                optimizer.zero_grad()

            # Checks if the accelerator has performed an optimization step
            if accelerator.sync_gradients:
                global_step += 1
                losses.append(loss.item())
                progress_bar.update(1)
                progress_bar.set_postfix({"loss": f"{loss.item():.4f}", "lr": f"{lr_scheduler.get_last_lr()[0]:.1e}"})

                # Checkpoint saving every 500 steps
                if global_step % 500 == 0 and accelerator.is_main_process:
                    unwrapped = accelerator.unwrap_model(unet)
                    ckpt_dict = get_peft_model_state_dict(unwrapped)
                    ckpt_name = f"checkpoint_step_{global_step}.safetensors"
                    try:
                        save_lora_fn: Any = getattr(StableDiffusionPipeline, "save_lora_weights")
                        save_lora_fn(
                            save_directory=output_dir,
                            unet_lora_layers=ckpt_dict,
                            weight_name=ckpt_name,
                            safe_serialization=True,
                        )
                    except Exception:
                        pass

                # Validation every 200 steps
                if global_step % 200 == 0 and accelerator.is_main_process:
                    unwrapped = accelerator.unwrap_model(unet)
                    _run_validation(unwrapped, vae, text_encoder, tokenizer, scheduler,
                                    accelerator.device, global_step, output_dir)

                if global_step >= args.max_train_steps:
                    break

    progress_bar.close()

    # ── Save LoRA weights ─────────────────────────────────────────────────────
    if accelerator.is_main_process:
        accelerator.wait_for_everyone()
        unwrapped_unet = accelerator.unwrap_model(unet)
        peft_state_dict = get_peft_model_state_dict(unwrapped_unet)
        save_path = output_dir / args.lora_name

        try:
            save_lora_fn: Any = getattr(StableDiffusionPipeline, "save_lora_weights")
            save_lora_fn(
                save_directory=output_dir,
                unet_lora_layers=peft_state_dict,
                weight_name=args.lora_name,
                safe_serialization=True,
            )
            print(f"[Train] LoRA weights saved to {save_path} (safetensors)")
        except Exception as save_err:
            print(f"[WARN] Diffusers save failed ({save_err}), falling back to direct safetensors save...")
            try:
                from safetensors.torch import save_file
                save_file(peft_state_dict, str(save_path))
                print(f"[Train] LoRA weights saved to {save_path} (direct safetensors)")
            except Exception as e2:
                pt_path = str(save_path).replace(".safetensors", ".pt")
                torch.save(peft_state_dict, pt_path)
                print(f"[Train] LoRA weights saved to {pt_path} (pytorch format)")

        log = {"steps": global_step, "final_loss": losses[-1] if losses else None, "rank": args.rank}
        (output_dir / "training_log.json").write_text(json.dumps(log, indent=2))
        print("[Train] Done.")


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Forensix Forensic LoRA v4 Training Script (Rank-32, Perfect Styles)")
    p.add_argument("--sd_model_path",               default=str(SD15_DIR),                       type=str)
    p.add_argument("--output_dir",                  default=str(MODELS_DIR / "lora"),             type=str)
    p.add_argument("--lora_name",                   default="forensic_sketch_lora_v4.safetensors", type=str)
    p.add_argument("--rank",                        default=32,   type=int,   help="LoRA rank (32 recommended)")
    p.add_argument("--learning_rate",               default=5e-5, type=float)
    p.add_argument("--batch_size",                  default=1,    type=int)
    p.add_argument("--gradient_accumulation_steps", default=4,    type=int)
    p.add_argument("--max_train_steps",             default=1500, type=int)
    p.add_argument("--max_samples",                 default=5000, type=int)
    p.add_argument("--mixed_precision",             default="fp16", type=str, choices=["no", "fp16", "bf16"])
    p.add_argument("--seed",                        default=42,   type=int)
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train(args)
