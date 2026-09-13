"""
Forensic Prompt Quality Scorer
================================
Evaluates how completely a user prompt or structured attribute set covers the
8 core anatomical domains needed for a pixel-accurate forensic composite.

Scoring:
  - 8 domains × 12.5 points each = 100 points maximum
  - Score < 50  → "short" prompt: auto-enrichment with neutral defaults
  - Score 50–79 → "medium" prompt: normal parse + standard CFG
  - Score 80+   → "long/detailed" prompt: chunk-weighted embeddings + Master CFG boost

Used by SketchService before calling ForensicLLMEngine.analyze() to:
  1. Log completeness to the API response dossier
  2. Inject SHORT_PROMPT_DEFAULTS for under-specified inputs
  3. Select optimal inference parameter profile
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple


# ── Domain coverage keywords ──────────────────────────────────────────────────
# Each domain maps to: (regex_patterns_list, display_name)
DOMAIN_COVERAGE: List[Tuple[str, str, List[str]]] = [
    (
        "face_shape",
        "Face Shape / Cranial Structure",
        [r"\b(oval|round|square|oblong|heart|diamond|long face|face shape)\b"],
    ),
    (
        "eye_region",
        "Eye Region (eyes + eyebrows)",
        [
            r"\b(almond|round eyes|narrow eyes|close[- ]set|wide[- ]set|deep[- ]set|"
            r"thick eyebrow|thin eyebrow|arched eyebrow|bushy|naturally arched|eyebrow|eye shape)\b"
        ],
    ),
    (
        "nose",
        "Nose",
        [
            r"\b(straight nose|aquiline|roman nose|upturned|broad nose|narrow nose|"
            r"pointed nose|nostrils|nose bridge|nasal)\b"
        ],
    ),
    (
        "mouth_lips",
        "Mouth / Lips",
        [
            r"\b(full lips|thin lips|wide mouth|narrow mouth|cupid.{0,5}bow|"
            r"upper lip|lower lip|mouth width|lip|philtrum)\b"
        ],
    ),
    (
        "hair",
        "Hair / Hairline",
        [
            r"\b(short hair|long hair|medium hair|side[- ]part|buzz cut|fade|"
            r"bald|hairline|dark hair|curly|wavy|afro|hair)\b"
        ],
    ),
    (
        "skin_age",
        "Skin Texture / Age Markers",
        [
            r"\b(\d{1,2}[-–]\d{1,2}[\s-]year[- ]old|approximately \d+|"
            r"young adult|middle[- ]aged|clean[- ]shaven|wrinkle|smooth skin|"
            r"no beard|no facial hair|stubble|beard|aged)\b"
        ],
    ),
    (
        "accessories",
        "Accessories (glasses, headwear)",
        [
            r"\b(glasses|spectacles|eyeglasses|sunglasses|cap|hat|beanie|"
            r"hood|rectangular frame|wire[- ]rim|horn[- ]rim)\b"
        ],
    ),
    (
        "pose_style",
        "Pose / Rendering Style",
        [
            r"\b(front.{0,10}facing|frontal|profile|side view|three[- ]quarter|"
            r"linework|forensic|police composite|black background|monochrome|"
            r"graphite|sketch|pencil|chalkboard)\b"
        ],
    ),
]


class PromptQualityScorer:
    """
    Scores prompt completeness and routes inference parameters.

    Usage:
        scorer = PromptQualityScorer()
        result = scorer.score(witness_statement, structured_attrs)
        # result.score       → 0–100 completeness score
        # result.tier        → "short" | "medium" | "detailed"
        # result.missing     → list of missing domain names
        # result.enrichments → dict of auto-injected neutral defaults
    """

    # Short-prompt neutral enrichment defaults
    SHORT_PROMPT_DEFAULTS: Dict[str, str] = {
        "face_shape":  "oval_face_shape",
        "eyes":        "almond_eyes",
        "eye_spacing": "normal_set_eyes",
        "nose":        "straight_nose",
        "mouth":       "medium_lips",
        "neck":        "medium_neck",
        "expression":  "neutral_closed_expression",
        "camera":      "frontal",
    }

    def score(
        self,
        witness_statement: Optional[str],
        structured_attrs: Optional[Dict[str, Any]] = None,
    ) -> "QualityResult":
        """
        Evaluates prompt completeness across 8 anatomical domains.
        Also checks structured_attrs (UI selections) to augment scoring.
        """
        text = (witness_statement or "").lower()
        attrs_text = " ".join(
            str(v).lower()
            for k, v in (structured_attrs or {}).items()
            if not k.startswith("_") and isinstance(v, str)
        )
        combined = f"{text} {attrs_text}"

        covered: List[str] = []
        missing: List[str] = []

        for domain_key, domain_name, patterns in DOMAIN_COVERAGE:
            matched = any(re.search(p, combined, re.IGNORECASE) for p in patterns)
            if matched:
                covered.append(domain_name)
            else:
                missing.append(domain_name)

        score = round((len(covered) / len(DOMAIN_COVERAGE)) * 100)

        # Word count for prompt length classification
        word_count = len(text.split()) if text else 0

        if score < 50 or word_count < 15:
            tier = "short"
        elif score < 80 or word_count < 80:
            tier = "medium"
        else:
            tier = "detailed"

        # Auto-enrichments for short prompts only for missing domains
        DOMAIN_TO_DEFAULT_KEYS = {
            "Face Shape / Cranial Structure": {"face_shape"},
            "Eye Region (eyes + eyebrows)": {"eyes", "eye_spacing"},
            "Nose": {"nose"},
            "Mouth / Lips": {"mouth"},
            "Pose / Rendering Style": {"camera"},
        }
        excluded_keys = set(structured_attrs or {})
        for c_dom in covered:
            excluded_keys.update(DOMAIN_TO_DEFAULT_KEYS.get(c_dom, set()))

        enrichments: Dict[str, str] = {}
        if tier == "short":
            enrichments = {
                k: v for k, v in self.SHORT_PROMPT_DEFAULTS.items()
                if k not in excluded_keys
            }

        return QualityResult(
            score=score,
            tier=tier,
            covered_domains=covered,
            missing_domains=missing,
            enrichments=enrichments,
            word_count=word_count,
        )

    def get_inference_params(self, result: "QualityResult", sketch_style: str) -> Dict[str, Any]:
        """
        Returns suggested inference parameter overrides based on prompt tier.

        - short   → standard CFG (prompt is simple, higher CFG may over-constrain)
        - medium  → standard CFG + standard steps
        - detailed → Master CFG hint (high detail prompt warrants more steps)
        """
        # Import lazily to avoid circular dependency
        from app.providers.sketch.diffusion_local import STYLE_CFG_TABLE, STYLE_STEPS_TABLE

        base_cfg   = STYLE_CFG_TABLE.get(sketch_style, 9.0)
        base_steps = STYLE_STEPS_TABLE.get(sketch_style, {}).get("Standard", 28)

        if result.tier == "detailed":
            # Push steps to Master level for detailed prompts
            master_steps = STYLE_STEPS_TABLE.get(sketch_style, {}).get("Master", 45)
            return {"cfg_override": base_cfg, "steps_override": master_steps, "detail_level": "Master"}
        elif result.tier == "short":
            return {"cfg_override": base_cfg * 0.9, "steps_override": base_steps, "detail_level": "Standard"}
        else:
            return {"cfg_override": base_cfg, "steps_override": base_steps, "detail_level": "Standard"}


class QualityResult:
    """Result from PromptQualityScorer.score()"""
    def __init__(
        self,
        score: int,
        tier: str,
        covered_domains: List[str],
        missing_domains: List[str],
        enrichments: Dict[str, str],
        word_count: int,
    ):
        self.score            = score
        self.tier             = tier
        self.covered_domains  = covered_domains
        self.missing_domains  = missing_domains
        self.enrichments      = enrichments
        self.word_count       = word_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "tier": self.tier,
            "prompt_completeness_score": self.score,
            "prompt_tier": self.tier,
            "word_count": self.word_count,
            "covered_domains": self.covered_domains,
            "missing_domains": self.missing_domains,
            "domain_breakdown": {d_name: (d_name in self.covered_domains) for _, d_name, _ in DOMAIN_COVERAGE},
            "enrichments_applied": list(self.enrichments.keys()),
        }


prompt_quality_scorer = PromptQualityScorer()
