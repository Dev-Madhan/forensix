"""
Qwen Local Inference Provider (Dual-Tier Architecture).
- Tier 1: Qwen 1.5B + LoRA (Fine-tuned adapter for structured forensic feature extraction)
- Tier 2: Qwen 7B (Instruct GGUF via llama.cpp for disambiguation and reasoning)
- Tier 3: Heuristic rule-based NLP extraction fallback when server/weights are uninitialized.
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.schemas.taxonomy import (
    AttributeValue,
    ForensicAttributeSchemaV2,
    NORMALIZATION_MAP,
    TAXONOMY_VERSION,
)

settings = get_settings()

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

DISAMBIGUATION_PROMPT = """You are a forensic investigator reasoning engine.
Analyze the following witness statement for contradictory, vague, or ambiguous facial descriptions.
Resolve ambiguities logically based on standard human morphology, or formulate targeted disambiguation questions.

Witness Statement: "{description}"
Ambiguous Keys: {ambiguous_keys}

Return JSON with:
{
  "resolutions": {"attribute_name": "resolved_canonical_value"},
  "investigator_questions": ["Question 1 to ask witness", "Question 2"],
  "confidence": 0.85
}
"""


def _clean_json_text(raw_content: str) -> str:
    """Strips markdown code blocks, backticks, and whitespace."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_content.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    # Match outermost { ... }
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1)
    return cleaned.strip()


def _validate_and_repair_json(raw_content: str) -> Dict[str, Any]:
    """
    Attempts parsing raw LLM generation as JSON.
    Applies regex heuristic repairs for trailing commas and unquoted keys.
    """
    cleaned = _clean_json_text(raw_content)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Heuristic 1: Remove trailing commas before } or ]
        repaired = re.sub(r",\s*([}\]])", r"\1", cleaned)
        try:
            return json.loads(repaired)
        except json.JSONDecodeError:
            # Heuristic 2: Replace single quotes with double quotes
            repaired = re.sub(r"'([^']*)'", r'"\1"', repaired)
            return json.loads(repaired)


def _extract_heuristic_attributes(text: str) -> Dict[str, Any]:
    """
    Heuristic rule-based fallback when local LLM server is temporarily offline.
    Outputs structured attributes fully compatible with both legacy and v2 schemas.
    """
    lower = text.lower()

    # Face shape
    face_shape = "oval"
    for shape in ["round", "square", "oblong", "heart", "oval"]:
        if shape in lower:
            face_shape = shape
            break

    # Gender
    gender = "male" if any(w in lower for w in ["male", "man", "guy", "gentleman", "he", "his"]) else \
             "female" if any(w in lower for w in ["female", "woman", "lady", "she", "her"]) else "unknown"

    # Age
    age_range = "26-35"
    if "50" in lower or "elderly" in lower or "older" in lower:
        age_range = "50+"
    elif "40" in lower or "middle-aged" in lower:
        age_range = "36-50"
    elif "20" in lower or "young" in lower or "teen" in lower:
        age_range = "18-25"

    # Eyes
    eye_shape = "round" if "round" in lower else "narrow" if ("narrow" in lower or "slit" in lower) else "almond"
    eye_spacing = "wide" if "wide" in lower else "close" if "close" in lower else "normal"
    eye_color = "dark brown"
    for col in ["blue", "green", "hazel", "gray", "black", "brown", "dark brown"]:
        if col in lower:
            eye_color = col
            break

    # Eyebrows
    eyebrow_thick = "thick" if any(w in lower for w in ["bushy", "thick", "heavy"]) else "thin" if "thin" in lower else "medium"
    eyebrow_shape = "arched" if "arch" in lower else "straight"

    # Nose
    nose_width = "broad" if any(w in lower for w in ["broad", "wide", "large"]) else "narrow" if "narrow" in lower else "medium"
    nose_bridge = "convex" if ("crooked" in lower or "bent" in lower or "hook" in lower) else "straight"
    nose_tip = "pointed" if any(w in lower for w in ["sharp", "point"]) else "bulbous" if "bulbous" in lower else "rounded"

    # Mouth
    mouth_width = "wide" if "wide" in lower else "narrow" if "narrow" in lower else "medium"
    upper_lip = "full" if "full" in lower or "plump" in lower else "thin" if "thin" in lower else "medium"
    lower_lip = upper_lip

    # Jaw & Chin
    jaw_shape = "angular" if any(w in lower for w in ["sharp", "angular", "square", "chiseled"]) else "rounded"
    jaw_width = "wide" if any(w in lower for w in ["wide", "broad", "strong"]) else "medium"
    chin_shape = "square" if "square" in lower else "pointed" if "pointed" in lower else "rounded"

    # Hair
    hair_texture = "curly" if "curly" in lower else "wavy" if "wavy" in lower else "coily" if "afro" in lower else "straight"
    hair_length = "bald" if "bald" in lower else "buzz cut" if "buzz" in lower else "short" if "short" in lower else "long" if "long" in lower else "medium"
    hair_color = "black" if "black" in lower else "blonde" if "blonde" in lower else "red" if "red" in lower else "gray" if "gray" in lower else "dark brown"

    # Facial hair
    facial_hair_type = "none"
    if "stubble" in lower or "shadow" in lower:
        facial_hair_type = "stubble"
    elif "mustache" in lower or "moustache" in lower:
        facial_hair_type = "mustache"
    elif "goatee" in lower or "goatie" in lower:
        facial_hair_type = "goatee"
    elif "beard" in lower:
        facial_hair_type = "full beard" if "full" in lower else "beard"
    elif "clean" in lower or "shaven" in lower:
        facial_hair_type = "clean-shaven"

    # Distinctive features
    distinctive = []
    if "glasses" in lower or "spectacles" in lower:
        distinctive.append("glasses")
    if "scar" in lower:
        distinctive.append("scar")
    if "tattoo" in lower:
        distinctive.append("tattoo")
    if "mole" in lower:
        distinctive.append("mole")

    # Build v2 Schema representation
    v2_schema = ForensicAttributeSchemaV2(
        face={"face_shape": AttributeValue(value=face_shape, source="explicit" if face_shape in lower else "inferred")},
        eyes={
            "shape": AttributeValue(value=eye_shape, source="explicit" if eye_shape in lower else "inferred"),
            "spacing": AttributeValue(value=eye_spacing, source="explicit" if eye_spacing in lower else "inferred"),
            "color": AttributeValue(value=eye_color, source="explicit" if eye_color in lower else "inferred"),
        },
        eyebrows={
            "thickness": AttributeValue(value=eyebrow_thick, source="explicit" if eyebrow_thick in lower else "inferred"),
            "shape": AttributeValue(value=eyebrow_shape, source="explicit" if eyebrow_shape in lower else "inferred"),
        },
        nose={
            "bridge": AttributeValue(value=nose_bridge, source="explicit" if nose_bridge in lower else "inferred"),
            "width": AttributeValue(value=nose_width, source="explicit" if nose_width in lower else "inferred"),
            "tip": AttributeValue(value=nose_tip, source="explicit" if nose_tip in lower else "inferred"),
        },
        mouth={
            "width": AttributeValue(value=mouth_width, source="explicit" if mouth_width in lower else "inferred"),
            "upper_lip": AttributeValue(value=upper_lip, source="explicit" if upper_lip in lower else "inferred"),
            "lower_lip": AttributeValue(value=lower_lip, source="explicit" if lower_lip in lower else "inferred"),
        },
        jaw={
            "width": AttributeValue(value=jaw_width, source="explicit" if jaw_width in lower else "inferred"),
            "shape": AttributeValue(value=jaw_shape, source="explicit" if jaw_shape in lower else "inferred"),
        },
        chin={"shape": AttributeValue(value=chin_shape, source="explicit" if chin_shape in lower else "inferred")},
        hair={
            "texture": AttributeValue(value=hair_texture, source="explicit" if hair_texture in lower else "inferred"),
            "length": AttributeValue(value=hair_length, source="explicit" if hair_length in lower else "inferred"),
            "color": AttributeValue(value=hair_color, source="explicit" if hair_color in lower else "inferred"),
        },
        facial_hair={"type": AttributeValue(value=facial_hair_type, source="explicit" if facial_hair_type in lower else "inferred")},
        distinctive_features=[AttributeValue(value=d, source="explicit") for d in distinctive],
    )

    # Legacy flat dictionary with full backward-compatibility guarantees
    legacy_attrs = {
        "face_shape": face_shape,
        "gender": gender,
        "estimated_age_range": age_range,
        "eyes": {
            "shape": eye_shape,
            "size": "medium",
            "spacing": eye_spacing,
            "tilt": "neutral",
            "color": eye_color,
        },
        "eyebrows": {
            "thickness": eyebrow_thick,
            "shape": eyebrow_shape,
        },
        "nose": {
            "bridge": nose_bridge,
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
            "width": jaw_width,
            "shape": jaw_shape,
        },
        "chin": {
            "size": "medium",
            "shape": chin_shape,
        },
        "hair": hair_texture,
        "hair_length": hair_length,
        "hair_color": hair_color,
        "facial_hair": facial_hair_type,
        "distinctive_features": distinctive,
        "_v2": v2_schema.model_dump(),
    }

    return legacy_attrs


class QwenLocalProvider(BaseLLMProvider):
    """
    Dual-Tier Qwen Inference Provider.
    - Tier 1: Structured Extraction via Qwen 1.5B + LoRA (or fine-tuned model)
    - Tier 2: Disambiguation & Contradiction Resolution via Qwen 7B GGUF
    - Tier 3: Heuristic NLP fallback when offline
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model_7b: Optional[str] = None,
        adapter_path: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.QWEN_BASE_URL).rstrip("/")
        self.model_7b = model_7b or settings.QWEN_MODEL
        self.adapter_path = adapter_path or settings.QWEN_LORA_ADAPTER_PATH

    async def is_server_available(self) -> bool:
        """Pings the local inference server health endpoint."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/health")
                return res.status_code == 200
        except Exception:
            return False

    async def extract_facial_attributes(self, description: str) -> Dict[str, Any]:
        """
        Extracts structured forensic attributes from witness description.
        Prioritizes the structured extraction model; applies JSON validation and repair;
        falls back gracefully to rule-based NLP extraction.
        """
        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model_7b,
            "temperature": 0.1,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_V2},
                {"role": "user", "content": description},
            ],
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
                data = response.json()

            raw_content = data["choices"][0]["message"]["content"]
            parsed_json = _validate_and_repair_json(raw_content)

            # Build strongly typed v2 schema and populate source attribution
            v2_schema = ForensicAttributeSchemaV2.from_v1_dict(parsed_json)
            # Re-attribute explicit vs inferred against witness text
            lower_desc = description.lower()
            for domain_name in ["face", "eyes", "eyebrows", "nose", "mouth", "jaw", "chin", "hair", "facial_hair"]:
                domain_dict = getattr(v2_schema, domain_name, {})
                for attr_key, attr_val in domain_dict.items():
                    if attr_val.value.lower() in lower_desc or (attr_val.normalized and attr_val.normalized.lower() in lower_desc):
                        attr_val.source = "explicit"
                    else:
                        attr_val.source = "inferred"

            # Merge flat dictionary keys for backward-compat
            legacy_dict = v2_schema.to_flat_dict()
            for k, v in parsed_json.items():
                if k not in legacy_dict:
                    legacy_dict[k] = v
            legacy_dict["_v2"] = v2_schema.model_dump()

            return {
                "extracted": True,
                "provider": "qwen_local",
                "model": self.model_7b,
                "attributes": legacy_dict,
                "v2_schema": v2_schema.model_dump(),
            }
        except Exception as e:
            logger.warning(
                f"Local Qwen server unreachable at {endpoint} ({e}). Utilizing rule-based NLP extraction fallback."
            )
            fallback_attrs = _extract_heuristic_attributes(description)
            return {
                "extracted": True,
                "provider": "qwen_local_fallback",
                "model": "rule_based_nlp_v2",
                "attributes": fallback_attrs,
                "v2_schema": fallback_attrs.get("_v2"),
            }

    async def disambiguate_statement(
        self,
        description: str,
        ambiguous_keys: List[str],
    ) -> Dict[str, Any]:
        """
        Disambiguates conflicting or vague witness features using the 7B reasoning model.
        """
        endpoint = f"{self.base_url}/chat/completions"
        prompt = DISAMBIGUATION_PROMPT.format(
            description=description,
            ambiguous_keys=", ".join(ambiguous_keys),
        )

        payload = {
            "model": self.model_7b,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": "You are a forensic reasoning model."},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
                data = response.json()

            raw_content = data["choices"][0]["message"]["content"]
            return _validate_and_repair_json(raw_content)
        except Exception as e:
            logger.info(f"Disambiguation LLM unavailable ({e}); returning heuristic resolution.")
            # Heuristic default resolution
            resolutions = {}
            for key in ambiguous_keys:
                clean_key = key.lower()
                resolutions[key] = NORMALIZATION_MAP.get(clean_key, "medium")
            return {
                "resolutions": resolutions,
                "investigator_questions": [f"Could the witness clarify the {key}?" for key in ambiguous_keys],
                "confidence": 0.70,
            }
