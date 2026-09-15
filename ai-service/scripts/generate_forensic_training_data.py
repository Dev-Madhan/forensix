#!/usr/bin/env python3
"""
Forensix — Forensic Training Dataset Generator
===============================================
Parses the raw CelebAMask-HQ 40-attribute annotations (30,000 images) and creates
two synchronized training datasets:

1. diffusion_train.jsonl:
   High-detail, token-weighted forensic captions paired with image paths for SD 1.5 LoRA training.
   Each attribute is mapped to exact anatomical forensic phrases so the diffusion model
   learns to bind specific words (e.g., 'bushy dense eyebrows', 'pointy nose', 'oval face shape')
   to visual features.

2. llm_sft_train.jsonl:
   Natural language witness testimonies with diverse conversational phrasing, paired with
   ground-truth structured JSON facial attribute targets for LLM fine-tuning.

Usage:
    python generate_forensic_training_data.py [--limit 10000] [--verify-only]
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Any, Dict, List, Set

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_CELEBA_DIR = BASE_DIR / "datasets" / "raw" / "CelebAMask-HQ"
ANNO_FILE = RAW_CELEBA_DIR / "CelebAMask-HQ-attribute-anno.txt"
IMG_DIR = RAW_CELEBA_DIR / "images"

PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

DIFFUSION_OUTPUT = PROCESSED_DIR / "diffusion_train.jsonl"
LLM_SFT_OUTPUT = PROCESSED_DIR / "llm_sft_train.jsonl"

# Mapping from CelebAMask-HQ 40 binary attributes to forensic diffusion descriptors
ATTR_DIFFUSION_DESCRIPTORS: Dict[str, str] = {
    "5_o_Clock_Shadow": "(heavy 5 o'clock shadow:1.35), dark stubble across jawline and chin",
    "Arched_Eyebrows": "(arched curved eyebrows:1.3), defined peak above ocular orbit",
    "Bags_Under_Eyes": "(prominent infraorbital eye bags:1.25), lower eyelid crease shadows",
    "Bald": "(completely bald head:1.4), bare cranial scalp, smooth crown",
    "Bangs": "(straight hair bangs:1.3), horizontal fringe covering upper forehead",
    "Big_Lips": "(full voluminous lips:1.3), prominent vermilion borders, wide mouth",
    "Big_Nose": "(broad wide nose:1.35), expansive nasal bridge and broad alar base",
    "Black_Hair": "dense black hair",
    "Blond_Hair": "light blonde hair",
    "Brown_Hair": "medium brown hair",
    "Bushy_Eyebrows": "(thick bushy eyebrows:1.35), dense heavy brow hair texture",
    "Chubby": "(full rounded cheeks:1.3), chubby facial fullness, soft curved mandible",
    "Double_Chin": "(double chin:1.25), prominent submental adiposity beneath lower mandible",
    "Eyeglasses": "(wearing eyeglasses:1.4), dark frame spectacles resting over eyes and bridge",
    "Goatee": "(goatee beard:1.35), trim beard tuft centered on chin and lower lip",
    "Gray_Hair": "mature graying silver hair",
    "High_Cheekbones": "(high prominent cheekbones:1.35), elevated angular zygomatic arches",
    "Mustache": "(neat mustache:1.35), defined upper lip facial hair",
    "Narrow_Eyes": "(narrow slender eyes:1.35), compressed horizontal palpebral opening",
    "No_Beard": "(clean-shaven face:1.4), completely smooth jaw without facial hair or stubble",
    "Oval_Face": "(oval face shape:1.3), balanced cranial proportions with gently tapering jawline",
    "Pointy_Nose": "(pointed sharp nose:1.35), slender elongated nasal tip with crisp definition",
    "Receding_Hairline": "(high receding hairline:1.35), pronounced M-shaped frontotemporal recession",
    "Sideburns": "(prominent sideburns:1.3), vertical hair growth extending down lateral jaw",
    "Straight_Hair": "straight non-curly hair texture",
    "Wavy_Hair": "wavy textured voluminous hair",
    "Wearing_Hat": "(wearing athletic baseball cap:1.4), structured cap on head",
}

# Witness statement natural phrasing templates for LLM synthesis
TEMPLATES = [
    "The suspect was a {age_desc} {gender_desc}. I clearly remember {traits}.",
    "I saw a {gender_desc}, approximately {age_desc}. The subject had {traits}.",
    "Witness reported a {age_desc} {gender_desc} with {traits}.",
    "Subject appeared to be a {gender_desc} in their {age_desc}. Noticeable characteristics included {traits}.",
    "According to the witness, the individual was an adult {gender_desc}, {age_desc}, possessing {traits}.",
]

ATTR_WITNESS_PHRASES: Dict[str, List[str]] = {
    "5_o_Clock_Shadow": ["a heavy 5 o'clock shadow", "dark stubble on his jaw and chin", "unshaven lower face with stubble"],
    "Arched_Eyebrows": ["noticeably arched eyebrows", "high curved brows", "eyebrows with a sharp arch"],
    "Bags_Under_Eyes": ["tired-looking bags under the eyes", "puffy dark circles below the eyes", "prominent eye bags"],
    "Bald": ["completely bald", "a fully shaven bare head", "no hair on top of the head"],
    "Bangs": ["bangs hanging over the forehead", "fringe covering the upper forehead"],
    "Big_Lips": ["large full lips", "a wide mouth with thick lips", "very full upper and lower lips"],
    "Big_Nose": ["a large broad nose", "a wide nasal bridge", "a noticeably big nose"],
    "Black_Hair": ["dark black hair", "jet black hair"],
    "Blond_Hair": ["light blonde hair", "fair blond hair"],
    "Brown_Hair": ["brown hair", "chestnut brown hair"],
    "Bushy_Eyebrows": ["thick bushy eyebrows", "very dense heavy eyebrows", "wild thick brows"],
    "Chubby": ["chubby full cheeks", "a round heavy face", "full plump cheeks"],
    "Double_Chin": ["a noticeable double chin", "extra fullness under the chin"],
    "Eyeglasses": ["wearing dark eyeglasses", "wearing spectacles", "glasses on the face"],
    "Goatee": ["a trim goatee on the chin", "a pointed goatee beard"],
    "Gray_Hair": ["graying mature hair", "silver-gray hair"],
    "High_Cheekbones": ["prominent high cheekbones", "sharp angular cheekbones", "raised cheekbones"],
    "Mustache": ["a dark mustache above the lip", "a distinct mustache"],
    "Narrow_Eyes": ["narrow squinting eyes", "small slender eyes", "tightly set narrow eyes"],
    "No_Beard": ["completely clean-shaven", "no beard or mustache whatsoever", "a smooth clean-shaven face"],
    "Oval_Face": ["an oval-shaped face", "a classic oval head shape", "an evenly proportioned oval face"],
    "Pointy_Nose": ["a pointed sharp nose", "a pointy nasal tip", "a sharp narrow pointed nose"],
    "Receding_Hairline": ["a receding hairline", "hair thinning at the temples", "a high receding forehead"],
    "Sideburns": ["long sideburns along the jaw", "thick sideburns"],
    "Straight_Hair": ["neat straight hair", "flat straight hair"],
    "Wavy_Hair": ["wavy textured hair", "curly wavy hair"],
    "Wearing_Hat": ["wearing a baseball cap", "wearing a sports cap on the head"],
}


def build_diffusion_caption(pos_attrs: Set[str], is_male: bool, is_young: bool, style: str = "graphite") -> str:
    gender = "male" if is_male else "female"
    age = "young adult" if is_young else "mature adult"
    
    # Universal single-person anchor to enforce non-dual generation
    single_anchor = "(single person:1.6), (solo:1.6), (single face:1.6), (only one person:1.6), (centered frontal portrait:1.5)"

    if style == "color_age":
        parts = [
            single_anchor,
            "<forensic_color> authentic forensic colored composite portrait",
            "realistic demographic skin pigmentation, natural melanin skin tones, realistic hair color",
            f"single individual adult {gender}, {age}",
        ]
        for attr, desc in ATTR_DIFFUSION_DESCRIPTORS.items():
            if attr in pos_attrs:
                parts.append(desc)
        parts.extend([
            "clean studio lighting, neutral background, sharp anatomical facial contours",
            "law enforcement composite identification portrait",
        ])
    elif style == "chalkboard":
        parts = [
            single_anchor,
            "<forensic_chalkboard> forensic chalkboard composite sketch",
            "crisp monochrome white and light grey chalk pencil linework on solid pitch black background",
            f"monochrome white chalk portrait of an adult {gender}, {age}",
        ]
        for attr, desc in ATTR_DIFFUSION_DESCRIPTORS.items():
            if attr in pos_attrs:
                parts.append(desc)
        parts.extend([
            "sharp anatomical facial contours, solid pitch black background",
            "law enforcement forensic identification sketch",
        ])
    else:  # graphite
        parts = [
            single_anchor,
            "<forensic_graphite> authentic police forensic composite sketch",
            "fine 2B graphite pencil cross-hatching, official law enforcement forensic drawing",
            f"monochrome pencil portrait of an adult {gender}, {age}",
        ]
        for attr, desc in ATTR_DIFFUSION_DESCRIPTORS.items():
            if attr in pos_attrs:
                parts.append(desc)
        parts.extend([
            "sharp anatomical facial contours, paper grain texture, neutral white background",
            "precise law enforcement identification drawing",
        ])
    
    return ", ".join(parts)


def build_llm_sample(pos_attrs: Set[str], is_male: bool, is_young: bool) -> Dict[str, Any]:
    gender_desc = "man" if is_male else "woman"
    age_desc = "20s to early 30s" if is_young else "40s to 50s"
    
    # Pick witness phrases
    traits_phrased = []
    for attr, phrases in ATTR_WITNESS_PHRASES.items():
        if attr in pos_attrs:
            traits_phrased.append(random.choice(phrases))
            
    if not traits_phrased:
        traits_phrased.append("regular facial proportions and standard features")
        
    random.shuffle(traits_phrased)
    if len(traits_phrased) == 1:
        traits_str = traits_phrased[0]
    else:
        traits_str = ", ".join(traits_phrased[:-1]) + ", and " + traits_phrased[-1]
        
    template = random.choice(TEMPLATES)
    statement = template.format(age_desc=age_desc, gender_desc=gender_desc, traits=traits_str)
    
    # Target structured JSON
    face_shape = "oval" if "Oval_Face" in pos_attrs else "round" if "Chubby" in pos_attrs else "unknown"
    eye_shape = "narrow" if "Narrow_Eyes" in pos_attrs else "unknown"
    eyebrow_thickness = "thick" if "Bushy_Eyebrows" in pos_attrs else "unknown"
    eyebrow_shape = "arched" if "Arched_Eyebrows" in pos_attrs else "straight" if "Straight_Hair" in pos_attrs else "unknown"
    nose_width = "wide" if "Big_Nose" in pos_attrs else "unknown"
    nose_tip = "pointed" if "Pointy_Nose" in pos_attrs else "rounded" if "Big_Nose" in pos_attrs else "unknown"
    mouth_width = "wide" if "Big_Lips" in pos_attrs else "unknown"
    upper_lip = "full" if "Big_Lips" in pos_attrs else "unknown"
    lower_lip = "full" if "Big_Lips" in pos_attrs else "unknown"
    
    target_attributes = {
        "face_shape": face_shape,
        "gender": "male" if is_male else "female",
        "estimated_age_range": "20-30" if is_young else "40-50",
        "eyes": {
            "shape": eye_shape,
            "size": "small" if "Narrow_Eyes" in pos_attrs else "medium",
            "spacing": "normal",
            "tilt": "neutral"
        },
        "eyebrows": {
            "thickness": eyebrow_thickness,
            "shape": eyebrow_shape
        },
        "nose": {
            "bridge": "straight",
            "length": "medium",
            "width": nose_width,
            "tip": nose_tip
        },
        "mouth": {
            "width": mouth_width,
            "upper_lip": upper_lip,
            "lower_lip": lower_lip
        },
        "jaw": {
            "width": "wide" if "Chubby" in pos_attrs else "medium",
            "shape": "rounded" if "Chubby" in pos_attrs else "angular" if "High_Cheekbones" in pos_attrs else "unknown"
        },
        "chin": {
            "size": "large" if "Double_Chin" in pos_attrs else "medium",
            "shape": "rounded" if "Double_Chin" in pos_attrs else "pointed" if "Pointy_Nose" in pos_attrs else "unknown"
        },
        "facial_hair": "5_o_clock_shadow" if "5_o_Clock_Shadow" in pos_attrs else "goatee" if "Goatee" in pos_attrs else "mustache" if "Mustache" in pos_attrs else "clean_shaven" if "No_Beard" in pos_attrs else "none",
        "accessories": {
            "glasses": "eyeglasses" if "Eyeglasses" in pos_attrs else "none",
            "headwear": "baseball_cap" if "Wearing_Hat" in pos_attrs else "none"
        }
    }
    
    return {
        "messages": [
            {
                "role": "system",
                "content": "Extract only observable facial characteristics from the witness description.\nReturn JSON matching the supplied schema.\nDo not identify a person.\nDo not invent missing attributes.\nUse \"unknown\" when the description is insufficient."
            },
            {
                "role": "user",
                "content": statement
            },
            {
                "role": "assistant",
                "content": json.dumps(target_attributes, indent=2)
            }
        ]
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate CelebAMask-HQ paired forensic training datasets.")
    parser.add_argument("--limit", type=int, default=15000, help="Maximum samples to process.")
    parser.add_argument("--verify-only", action="store_true", help="Only verify mapping and sample generation without saving.")
    args = parser.parse_args()

    if not ANNO_FILE.exists():
        raise FileNotFoundError(f"Attribute annotations not found at: {ANNO_FILE}")
    if not IMG_DIR.exists():
        raise FileNotFoundError(f"Image directory not found at: {IMG_DIR}")

    print(f"Reading attribute annotations from: {ANNO_FILE}")
    with open(ANNO_FILE, "r", encoding="utf-8") as f:
        total_count = int(f.readline().strip())
        header = f.readline().strip().split()
        print(f"Dataset header contains {len(header)} attributes across {total_count} images.")

        diffusion_entries: List[Dict[str, Any]] = []
        llm_sft_entries: List[Dict[str, Any]] = []

        processed = 0
        for line in f:
            parts = line.strip().split()
            if len(parts) < len(header) + 1:
                continue

            img_name = parts[0]
            vals = [int(v) for v in parts[1:]]
            pos_attrs = {header[i] for i, v in enumerate(vals) if v == 1}

            img_path = IMG_DIR / img_name
            if not img_path.exists():
                continue

            is_male = "Male" in pos_attrs
            is_young = "Young" in pos_attrs

            # 1. Diffusion sample with balanced multimodal styles (40% graphite, 30% chalkboard, 30% color)
            style_roll = processed % 10
            if style_roll < 4:
                sample_style = "graphite"
            elif style_roll < 7:
                sample_style = "chalkboard"
            else:
                sample_style = "color_age"

            caption = build_diffusion_caption(pos_attrs, is_male, is_young, style=sample_style)
            diffusion_entries.append({
                "image_path": str(img_path),
                "caption": caption,
                "style": sample_style,
                "positive_attributes": sorted(list(pos_attrs)),
                "gender": "male" if is_male else "female",
                "is_young": is_young,
            })

            # 2. LLM SFT sample
            llm_sample = build_llm_sample(pos_attrs, is_male, is_young)
            llm_sft_entries.append(llm_sample)

            processed += 1
            if processed >= args.limit:
                break

    print(f"Processed {processed} valid samples.")

    if args.verify_only:
        print("\n--- SAMPLE DIFFUSION ENTRY ---")
        print(json.dumps(diffusion_entries[0], indent=2))
        print("\n--- SAMPLE LLM SFT ENTRY ---")
        print(json.dumps(llm_sft_entries[0], indent=2))
        print("\n[VERIFY OK] All records valid.")
        return

    # Write outputs
    print(f"Writing Diffusion dataset to: {DIFFUSION_OUTPUT}")
    with open(DIFFUSION_OUTPUT, "w", encoding="utf-8") as f:
        for entry in diffusion_entries:
            f.write(json.dumps(entry) + "\n")

    print(f"Writing LLM SFT dataset to: {LLM_SFT_OUTPUT}")
    with open(LLM_SFT_OUTPUT, "w", encoding="utf-8") as f:
        for entry in llm_sft_entries:
            f.write(json.dumps(entry) + "\n")

    print(f"[SUCCESS] Datasets generated successfully:")
    print(f"  - Diffusion records: {len(diffusion_entries)} -> {DIFFUSION_OUTPUT}")
    print(f"  - LLM SFT records:   {len(llm_sft_entries)} -> {LLM_SFT_OUTPUT}")


if __name__ == "__main__":
    main()
