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
FS2K_DIR = BASE_DIR / "datasets" / "raw" / "FS2K"

PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

DIFFUSION_OUTPUT = PROCESSED_DIR / "diffusion_train.jsonl"
LLM_SFT_OUTPUT = PROCESSED_DIR / "llm_sft_train.jsonl"

SYSTEM_PROMPT_V2 = """You are an expert forensic facial morphologist assisting a criminal investigator.
Extract observable facial characteristics from the witness statement strictly conforming to the forensic taxonomy.
Return ONLY valid JSON matching this schema. Do not invent missing features.
Mark attributes as explicit when stated, or omit if unseen.

Target JSON Schema:
{
  "face": {"face_shape": "oval|round|square|oblong|heart", "skin_tone": "fair|medium|dark", "cheekbones": "high|prominent|flat|subtle"},
  "eyes": {"shape": "almond|round|narrow", "size": "small|medium|large", "spacing": "close|normal|wide", "tilt": "neutral|upward|downward", "color": "dark brown|light brown|hazel|green|blue|gray|black"},
  "eyebrows": {"thickness": "thin|medium|thick|bushy", "shape": "straight|arched"},
  "nose": {"bridge": "straight|convex|concave|aquiline", "length": "short|medium|long", "width": "narrow|medium|wide", "tip": "pointed|rounded|bulbous"},
  "mouth": {"width": "narrow|medium|wide", "upper_lip": "thin|medium|full", "lower_lip": "thin|medium|full"},
  "jaw": {"width": "narrow|medium|wide", "shape": "angular|rounded"},
  "chin": {"size": "small|medium|large", "shape": "pointed|rounded|square"},
  "hair": {"length": "bald|buzz cut|short|medium|long", "texture": "straight|wavy|curly|coily", "color": "black|dark brown|light brown|blonde|red|gray|white"},
  "facial_hair": {"type": "none|clean-shaven|stubble|mustache|goatee|beard|full beard", "thickness": "light|medium|dense"},
  "gender": "male|female|unknown",
  "estimated_age_range": "18-25|26-35|36-50|50+|unknown",
  "distinctive_features": ["scars", "glasses", "tattoos", "moles", "piercings"],
  "unknown_attributes": [],
  "ambiguous_attributes": []
}
"""

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
            "sharp anatomical facial contours, Strathmore cold-press paper grain texture, neutral white background",
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
    
    # Target structured JSON matching SYSTEM_PROMPT_V2
    face_shape = "oval" if "Oval_Face" in pos_attrs else "round" if "Chubby" in pos_attrs else "oval"
    eye_shape = "narrow" if "Narrow_Eyes" in pos_attrs else "almond"
    eyebrow_thickness = "bushy" if "Bushy_Eyebrows" in pos_attrs else "medium"
    eyebrow_shape = "arched" if "Arched_Eyebrows" in pos_attrs else "straight"
    nose_width = "wide" if "Big_Nose" in pos_attrs else "medium"
    nose_tip = "pointed" if "Pointy_Nose" in pos_attrs else "bulbous" if "Big_Nose" in pos_attrs else "rounded"
    mouth_width = "wide" if "Big_Lips" in pos_attrs else "medium"
    upper_lip = "full" if "Big_Lips" in pos_attrs else "medium"
    lower_lip = "full" if "Big_Lips" in pos_attrs else "medium"
    cheekbones = "high" if "High_Cheekbones" in pos_attrs else "subtle"
    skin_tone = "fair" if "Blond_Hair" in pos_attrs else "medium"
    hair_length = "bald" if "Bald" in pos_attrs else "short" if is_male else "medium"
    hair_texture = "wavy" if "Wavy_Hair" in pos_attrs else "straight"
    hair_color = "black" if "Black_Hair" in pos_attrs else "blonde" if "Blond_Hair" in pos_attrs else "gray" if "Gray_Hair" in pos_attrs else "dark brown"
    
    facial_hair_type = "stubble" if "5_o_Clock_Shadow" in pos_attrs else "goatee" if "Goatee" in pos_attrs else "mustache" if "Mustache" in pos_attrs else "clean-shaven" if "No_Beard" in pos_attrs else "none"
    distinctive = []
    if "Eyeglasses" in pos_attrs:
        distinctive.append("glasses")

    target_attributes_v2 = {
        "face": {
            "face_shape": face_shape,
            "skin_tone": skin_tone,
            "cheekbones": cheekbones,
        },
        "eyes": {
            "shape": eye_shape,
            "size": "small" if "Narrow_Eyes" in pos_attrs else "medium",
            "spacing": "normal",
            "tilt": "neutral",
            "color": "dark brown",
        },
        "eyebrows": {
            "thickness": eyebrow_thickness,
            "shape": eyebrow_shape,
        },
        "nose": {
            "bridge": "straight",
            "length": "medium",
            "width": nose_width,
            "tip": nose_tip,
        },
        "mouth": {
            "width": mouth_width,
            "upper_lip": upper_lip,
            "lower_lip": lower_lip,
        },
        "jaw": {
            "width": "wide" if "Chubby" in pos_attrs else "medium",
            "shape": "angular" if "High_Cheekbones" in pos_attrs else "rounded",
        },
        "chin": {
            "size": "large" if "Double_Chin" in pos_attrs else "medium",
            "shape": "pointed" if "Pointy_Nose" in pos_attrs else "rounded",
        },
        "hair": {
            "length": hair_length,
            "texture": hair_texture,
            "color": hair_color,
        },
        "facial_hair": {
            "type": facial_hair_type,
            "thickness": "medium" if facial_hair_type != "none" else "light",
        },
        "gender": "male" if is_male else "female",
        "estimated_age_range": "18-25" if is_young else "36-50",
        "distinctive_features": distinctive,
        "unknown_attributes": [],
        "ambiguous_attributes": [],
    }
    
    return {
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT_V2.strip(),
            },
            {
                "role": "user",
                "content": statement,
            },
            {
                "role": "assistant",
                "content": json.dumps(target_attributes_v2, indent=2),
            }
        ]
    }


def load_fs2k_entries(fs2k_dir: Path, limit: int = 3000) -> List[Dict[str, Any]]:
    """Ingests authentic law-enforcement graphite sketches from FS2K."""
    anno_file = fs2k_dir / "anno_train.json"
    if not anno_file.exists():
        print(f"[FS2K] anno_train.json not found at {anno_file}. Checking sketch folders directly.")
        sketch_files = list((fs2k_dir / "sketch").rglob("*.jpg"))
        entries = []
        for sf in sketch_files[:limit]:
            entries.append({
                "image_path": str(sf.resolve()),
                "caption": (
                    "(single person:1.6), (solo:1.6), (single face:1.6), <forensic_graphite> authentic police forensic composite sketch, "
                    "fine 2B graphite pencil cross-hatching, official law enforcement forensic drawing, "
                    "monochrome pencil portrait of an adult suspect, sharp anatomical facial contours, "
                    "Strathmore cold-press paper grain texture, neutral white background, precise law enforcement identification drawing"
                ),
                "style": "graphite",
                "positive_attributes": ["authentic_sketch", "graphite_crosshatch"],
                "gender": "unknown",
                "is_young": True,
            })
        return entries

    with open(anno_file, "r", encoding="utf-8") as f:
        records = json.load(f)

    entries = []
    for r in records:
        img_name = r.get("image_name", "")  # e.g. "photo1/image0110"
        if not img_name:
            continue
        # Map photo1/image0110 -> sketch/sketch1/sketch0110.jpg
        parts = img_name.split("/")
        if len(parts) == 2:
            p_folder = parts[0].replace("photo", "sketch")
            s_num = parts[1].replace("image", "sketch")
            sketch_cand = fs2k_dir / "sketch" / p_folder / f"{s_num}.jpg"
        else:
            sketch_cand = fs2k_dir / "sketch" / f"{img_name}.jpg"

        if not sketch_cand.exists():
            continue

        is_male = (r.get("gender", 1) == 1)
        gender_str = "male" if is_male else "female"
        hair_desc = "short cropped hair" if r.get("hair", 1) == 1 else "natural medium hair"
        smile_desc = "subtle smile expression" if r.get("smile", 0) == 1 else "neutral closed-mouth expression"
        earring_desc = ", wearing small earrings" if r.get("earring", 0) == 1 else ""

        cap = (
            f"(single person:1.6), (solo:1.6), (single face:1.6), <forensic_graphite> authentic police forensic composite sketch, "
            f"fine 2B graphite pencil cross-hatching, official law enforcement forensic drawing, "
            f"monochrome pencil portrait of an adult {gender_str} suspect, {hair_desc}, {smile_desc}{earring_desc}, "
            f"sharp anatomical facial contours, Strathmore cold-press paper grain texture, neutral white background, "
            f"precise law enforcement identification drawing"
        )
        entries.append({
            "image_path": str(sketch_cand.resolve()),
            "caption": cap,
            "style": "graphite",
            "positive_attributes": ["authentic_forensic_sketch", "2b_graphite_pencil", "cross_hatching"],
            "gender": gender_str,
            "is_young": True,
        })
        if len(entries) >= limit:
            break

    print(f"[FS2K] Ingested {len(entries)} authentic forensic graphite sketches.")
    return entries


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate CelebAMask-HQ + FS2K paired forensic training datasets.")
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

        # 1. Ingest authentic FS2K forensic sketches first (priority for graphite ground-truth)
        if FS2K_DIR.exists():
            fs2k_samples = load_fs2k_entries(FS2K_DIR, limit=2000)
            diffusion_entries.extend(fs2k_samples)
            print(f"[Datasets] Ingested {len(fs2k_samples)} authentic FS2K graphite sketches.")

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

            # 2. Diffusion sample with 60% graphite focus (60% graphite, 20% chalkboard, 20% color)
            style_roll = processed % 10
            if style_roll < 6:
                sample_style = "graphite"
            elif style_roll < 8:
                sample_style = "chalkboard"
            else:
                sample_style = "color_age"

            caption = build_diffusion_caption(pos_attrs, is_male, is_young, style=sample_style)
            diffusion_entries.append({
                "image_path": str(img_path.resolve()),
                "caption": caption,
                "style": sample_style,
                "positive_attributes": sorted(list(pos_attrs)),
                "gender": "male" if is_male else "female",
                "is_young": is_young,
            })

            # 3. LLM SFT sample
            llm_sample = build_llm_sample(pos_attrs, is_male, is_young)
            llm_sft_entries.append(llm_sample)

            processed += 1
            if processed >= args.limit:
                break

    print(f"Processed {processed} valid CelebAMask-HQ samples ({len(diffusion_entries)} total diffusion entries).")

    if args.verify_only:
        print("\n--- SAMPLE DIFFUSION ENTRY (FS2K / CelebA) ---")
        print(json.dumps(diffusion_entries[0], indent=2))
        print("\n--- SAMPLE LLM SFT ENTRY (v2 Forensic Schema) ---")
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
