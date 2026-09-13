#!/usr/bin/env python3
"""
Forensix / Criminal Eye — Dual-Dataset Forensic LoRA Fine-Tuning Pipeline
Trains a high-capacity low-rank adapter (LoRA, rank=32, alpha=64) on Stable Diffusion 1.5
UNet cross-attention & projection layers using both:
  1. FS2K Forensic Sketch Dataset (2,104 authentic law-enforcement sketches)
  2. CelebAMask-HQ Dataset (30,000 images with 40 granular forensic facial attributes)
"""

from pathlib import Path
from typing import Any
import json
import random
import time
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from tqdm import tqdm
from diffusers import StableDiffusionPipeline
from peft import LoraConfig, get_peft_model
from safetensors.torch import save_file

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
SD15_DIR = MODELS_DIR / "sd15"
FS2K_DIR = BASE_DIR / "datasets" / "raw" / "FS2K"
CELEBA_DIR = BASE_DIR / "datasets" / "raw" / "CelebAMask-HQ"
OUTPUT_LORA_DIR = MODELS_DIR / "lora"
OUTPUT_LORA_DIR.mkdir(parents=True, exist_ok=True)
LORA_FILE = OUTPUT_LORA_DIR / "forensic_sketch_lora.safetensors"

CELEBA_ATTR_MAP = {
    "5_o_Clock_Shadow": "heavy stubble beard, dark 5 o'clock shadow across jaw and chin",
    "Arched_Eyebrows": "arched curved eyebrows with defined brow peak",
    "Bags_Under_Eyes": "sub-orbital eye bags, mature lower eyelid creases",
    "Bald": "bald head, bare scalp",
    "Bangs": "hair bangs falling across forehead",
    "Big_Lips": "full wide lips, broad mouth with prominent vermilion border",
    "Big_Nose": "broad wide nose with expansive nasal bridge and nostrils",
    "Black_Hair": "black hair",
    "Blond_Hair": "blonde light hair",
    "Brown_Hair": "brown hair",
    "Bushy_Eyebrows": "thick bushy dense eyebrows",
    "Chubby": "full rounded chubby cheeks and soft jaw",
    "Double_Chin": "double chin, rounded lower neck tissue",
    "Eyeglasses": "wearing eyeglasses frames resting over eyes and nose bridge",
    "Goatee": "neat goatee beard centered on chin and upper lip",
    "Gray_Hair": "graying hair",
    "High_Cheekbones": "high angular cheekbones",
    "Mustache": "classic neat moustache on upper lip",
    "Narrow_Eyes": "narrow compact eyes, small palpebral eye opening",
    "No_Beard": "clean-shaven face, smooth mandibular jawline without beard",
    "Oval_Face": "oval face shape, balanced cranial proportions with gently tapering chin",
    "Pointy_Nose": "pointed upturned nose, defined sharp nasal tip",
    "Receding_Hairline": "high receding hairline, exposed temporal forehead",
    "Sideburns": "defined lateral sideburns along jaw",
    "Straight_Hair": "straight hair",
    "Wavy_Hair": "wavy textured hair",
    "Wearing_Hat": "wearing athletic cap on head",
}


def build_celeba_forensic_caption(pos_attrs: set[str], is_male: bool, is_young: bool) -> str:
    parts = []
    gender_str = "male" if is_male else "female"
    age_str = "young adult" if is_young else "mature adult"
    parts.append(f"forensic portrait composite of an adult {gender_str}, {age_str}")

    # Inject observable attributes
    for attr, desc in CELEBA_ATTR_MAP.items():
        if attr in pos_attrs:
            parts.append(desc)

    parts.append("police composite drawing, anatomically precise facial features, direct frontal view, centered composition")
    return ", ".join(parts)


def build_fs2k_caption(item: dict) -> str:
    gender = "male" if item.get("gender", 1) == 1 else "female"
    hair_len = "short cropped hair" if item.get("hair", 1) == 1 else "natural medium flow hair"
    expr = "neutral expression" if item.get("smile", 0) == 0 else "subtle expression"
    return (
        f"authentic police forensic composite sketch, fine 2B graphite pencil cross-hatching, "
        f"official law enforcement forensic drawing, monochrome pencil portrait of a {gender} suspect, "
        f"{hair_len}, {expr}, clean paper background, sharp anatomical facial contours, paper grain texture"
    )


class DualForensicDataset(Dataset):
    """
    Balanced multimodal dataset interleaving authentic FS2K forensic sketches
    with 40-attribute CelebAMask-HQ high-resolution facial portraits.
    """

    def __init__(self, fs2k_dir: Path, celeba_dir: Path, tokenizer, size: int = 512, max_celeba: int = 3000):
        self.size = size
        self.tokenizer = tokenizer
        self.samples = []

        # 1. Load FS2K sketches
        fs2k_entries = []
        for anno in ["anno_train.json", "anno_test.json"]:
            p = fs2k_dir / anno
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    fs2k_entries.extend(json.load(f))

        for item in fs2k_entries:
            img_name = item.get("image_name", "")
            parts = img_name.split("/")
            if len(parts) == 2:
                sub = parts[0].replace("photo", "sketch")
                fname = parts[1].replace("image", "sketch")
                s_jpg = fs2k_dir / "sketch" / sub / f"{fname}.jpg"
                s_png = fs2k_dir / "sketch" / sub / f"{fname}.png"
                p = s_jpg if s_jpg.exists() else (s_png if s_png.exists() else None)
                if p:
                    self.samples.append({
                        "type": "fs2k",
                        "path": p,
                        "caption": build_fs2k_caption(item),
                    })

        fs2k_count = len(self.samples)
        print(f"Loaded {fs2k_count} authentic FS2K forensic sketches.")

        # 2. Load CelebAMask-HQ attribute annotations
        celeba_anno_file = celeba_dir / "CelebAMask-HQ-attribute-anno.txt"
        celeba_img_dir = celeba_dir / "images"
        celeba_samples = []

        if celeba_anno_file.exists() and celeba_img_dir.exists():
            with open(celeba_anno_file, "r", encoding="utf-8") as f:
                f.readline()  # count line
                header = f.readline().strip().split()
                for line in f:
                    parts = line.strip().split()
                    if len(parts) < len(header) + 1:
                        continue
                    img_file = parts[0]
                    vals = [int(x) for x in parts[1:]]
                    pos = {header[i] for i, v in enumerate(vals) if v == 1}

                    img_p = celeba_img_dir / img_file
                    if img_p.exists():
                        is_male = "Male" in pos
                        is_young = "Young" in pos
                        caption = build_celeba_forensic_caption(pos, is_male, is_young)
                        celeba_samples.append({
                            "type": "celeba",
                            "path": img_p,
                            "caption": caption,
                        })
                        if len(celeba_samples) >= max_celeba:
                            break

            print(f"Loaded {len(celeba_samples)} attribute-conditioned CelebAMask-HQ facial portraits.")
            self.samples.extend(celeba_samples)

        random.seed(42)
        random.shuffle(self.samples)
        print(f"Total unified dual-domain forensic training samples: {len(self.samples)}")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        item = self.samples[index]
        img = Image.open(item["path"]).convert("RGB")
        img = img.resize((self.size, self.size), Image.Resampling.LANCZOS)

        arr = np.array(img).astype(np.float32) / 127.5 - 1.0
        tensor = torch.from_numpy(arr).permute(2, 0, 1)

        input_ids = self.tokenizer(
            item["caption"],
            padding="max_length",
            truncation=True,
            max_length=self.tokenizer.model_max_length,
            return_tensors="pt",
        ).input_ids[0]

        return {"pixel_values": tensor, "input_ids": input_ids}


def train_dual_lora(
    steps: int = 800,
    batch_size: int = 1,
    gradient_accumulation_steps: int = 2,
    lr: float = 1e-4,
    rank: int = 32,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"=== Starting Dual-Dataset Forensic LoRA Training on {device} (Rank={rank}, Steps={steps}) ===")

    pipe: Any = StableDiffusionPipeline.from_pretrained(
        str(SD15_DIR),
        variant="fp16",
        torch_dtype=torch.float16,
        safety_checker=None,
    )
    if pipe is None:
        raise RuntimeError(f"Failed to load StableDiffusionPipeline from {SD15_DIR}")

    tokenizer = pipe.tokenizer
    text_encoder = pipe.text_encoder.to(device)
    vae = pipe.vae.to(device)
    unet: Any = pipe.unet.to(device)
    noise_scheduler: Any = pipe.scheduler

    text_encoder.requires_grad_(False)
    vae.requires_grad_(False)
    unet.requires_grad_(False)

    # Rank 32 LoRA configuration targeting UNet cross-attention & projection blocks
    lora_config = LoraConfig(
        r=rank,
        lora_alpha=rank * 2,
        target_modules=["to_k", "to_q", "to_v", "to_out.0", "proj_out", "proj_in"],
        lora_dropout=0.04,
        bias="none",
    )
    unet = get_peft_model(unet, lora_config)
    unet.print_trainable_parameters()
    getattr(unet, "enable_gradient_checkpointing", lambda: None)()

    dataset = DualForensicDataset(FS2K_DIR, CELEBA_DIR, tokenizer=tokenizer)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    optimizer = torch.optim.AdamW(unet.parameters(), lr=lr, weight_decay=1e-2)
    lr_scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=steps, eta_min=1e-6)

    unet.train()
    step = 0
    accumulated_loss = 0.0
    start_time = time.time()
    progress_bar = tqdm(total=steps, desc="Training Dual LoRA (Rank 32)")

    data_iter = iter(dataloader)
    optimizer.zero_grad()

    while step < steps:
        try:
            batch = next(data_iter)
        except StopIteration:
            data_iter = iter(dataloader)
            batch = next(data_iter)

        pixel_values = batch["pixel_values"].to(device, dtype=torch.float16)
        input_ids = batch["input_ids"].to(device)

        with torch.no_grad():
            latents = vae.encode(pixel_values).latent_dist.sample()
            latents = latents * vae.config.scaling_factor

            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps, (latents.shape[0],), device=device
            ).long()
            noise = torch.randn_like(latents)
            noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)
            encoder_hidden_states = text_encoder(input_ids)[0]

        model_pred = unet(noisy_latents, timesteps, encoder_hidden_states).sample
        loss = torch.nn.functional.mse_loss(model_pred.float(), noise.float(), reduction="mean")
        loss = loss / gradient_accumulation_steps
        loss.backward()

        accumulated_loss += loss.item()

        if (step + 1) % gradient_accumulation_steps == 0:
            torch.nn.utils.clip_grad_norm_(unet.parameters(), 1.0)
            optimizer.step()
            lr_scheduler.step()
            optimizer.zero_grad()

        step += 1
        progress_bar.update(1)
        progress_bar.set_postfix({"loss": f"{accumulated_loss * gradient_accumulation_steps:.4f}"})
        accumulated_loss = 0.0

    progress_bar.close()
    elapsed = time.time() - start_time
    print(f"Dual-dataset LoRA training completed in {elapsed:.1f}s ({elapsed/60:.2f} min).")

    # Save fine-tuned Rank-32 weights
    unet.save_pretrained(str(OUTPUT_LORA_DIR))
    lora_state_dict = {k: v.cpu() for k, v in unet.state_dict().items() if "lora" in k}
    save_file(lora_state_dict, str(LORA_FILE))
    print(f"Successfully saved high-capacity Rank-32 Forensic LoRA to {LORA_FILE}")


if __name__ == "__main__":
    train_dual_lora(steps=800, batch_size=1, gradient_accumulation_steps=2, lr=1e-4, rank=32)
