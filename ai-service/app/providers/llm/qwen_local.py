import json
import re
from typing import Any, Dict
import httpx
from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider

settings = get_settings()

SYSTEM_PROMPT = """Extract only observable facial characteristics from the witness description.
Return JSON matching the supplied schema.
Do not identify a person.
Do not invent missing attributes.
Use "unknown" when the description is insufficient.

Schema format:
{
  "face_shape": "oval|round|square|oblong|heart|unknown",
  "gender": "male|female|unknown",
  "estimated_age_range": "20-30|30-40|40-50|50+|unknown",
  "eyes": {"shape": "almond|round|narrow", "size": "small|medium|large", "spacing": "close|normal|wide", "tilt": "neutral|upward|downward"},
  "eyebrows": {"thickness": "thin|medium|thick", "shape": "straight|arched"},
  "nose": {"bridge": "straight|convex|concave", "length": "short|medium|long", "width": "narrow|medium|wide", "tip": "pointed|rounded|bulbous"},
  "mouth": {"width": "narrow|medium|wide", "upper_lip": "thin|medium|full", "lower_lip": "thin|medium|full"},
  "jaw": {"width": "narrow|medium|wide", "shape": "angular|rounded"},
  "chin": {"size": "small|medium|large", "shape": "pointed|rounded|square"}
}
"""


def _extract_heuristic_attributes(text: str) -> Dict[str, Any]:
    """Heuristic rule-based fallback when local LLM server is temporarily offline."""
    lower = text.lower()

    # Face shape
    face_shape = "oval"
    for shape in ["round", "square", "oblong", "heart", "oval"]:
        if shape in lower:
            face_shape = shape
            break

    # Gender
    gender = "unknown"
    if any(w in lower for w in ["male", "man", "guy", "gentleman", "he", "his"]):
        gender = "male"
    elif any(w in lower for w in ["female", "woman", "lady", "she", "her"]):
        gender = "female"

    # Eyes
    eye_shape = "almond"
    if "round" in lower:
        eye_shape = "round"
    elif "narrow" in lower or "slit" in lower:
        eye_shape = "narrow"

    eye_spacing = "wide" if "wide" in lower else "close" if "close" in lower else "normal"

    # Nose
    nose_width = "broad" if any(w in lower for w in ["broad", "wide", "large"]) else "narrow" if "narrow" in lower else "medium"
    nose_bridge = "straight"
    if "crooked" in lower or "bent" in lower:
        nose_bridge = "convex"

    # Jaw
    jaw_shape = "angular" if any(w in lower for w in ["sharp", "angular", "square", "chiseled"]) else "rounded"

    return {
        "face_shape": face_shape,
        "gender": gender,
        "estimated_age_range": "25-40",
        "eyes": {
            "shape": eye_shape,
            "size": "medium",
            "spacing": eye_spacing,
            "tilt": "neutral"
        },
        "eyebrows": {
            "thickness": "thick" if "bushy" in lower or "thick" in lower else "thin" if "thin" in lower else "medium",
            "shape": "arched" if "arch" in lower else "straight"
        },
        "nose": {
            "bridge": nose_bridge,
            "length": "medium",
            "width": nose_width,
            "tip": "pointed" if "sharp" in lower else "rounded"
        },
        "mouth": {
            "width": "medium",
            "upper_lip": "medium",
            "lower_lip": "medium"
        },
        "jaw": {
            "width": "wide" if "wide" in lower else "medium",
            "shape": jaw_shape
        },
        "chin": {
            "size": "medium",
            "shape": "square" if "square" in lower else "pointed" if "pointed" in lower else "rounded"
        }
    }


class QwenLocalProvider(BaseLLMProvider):
    """
    Connects to the local llama.cpp server running Qwen2.5-7B on port 8001.
    Provides robust markdown stripping and automatic resilient fallback.
    """

    def __init__(self, base_url: str | None = None, model: str | None = None):
        self.base_url = (base_url or settings.QWEN_BASE_URL).rstrip("/")
        self.model = model or settings.QWEN_MODEL

    async def is_server_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/health")
                return res.status_code == 200
        except Exception:
            return False

    async def extract_facial_attributes(self, description: str) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "temperature": 0.1,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
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
            # Clean possible markdown formatting
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw_content.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
            parsed_json = json.loads(cleaned)

            return {
                "extracted": True,
                "provider": "qwen_local",
                "model": self.model,
                "attributes": parsed_json,
            }
        except Exception as e:
            logger.warning(
                f"Local Qwen server unreachable at {endpoint} ({e}). Utilizing rule-based NLP extraction fallback."
            )
            fallback_attrs = _extract_heuristic_attributes(description)
            return {
                "extracted": True,
                "provider": "qwen_local_fallback",
                "model": "rule_based_nlp_v1",
                "attributes": fallback_attrs,
            }
