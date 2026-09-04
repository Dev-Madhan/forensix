import json
from typing import Any, Dict
import httpx
from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.utils.errors import ProviderException

settings = get_settings()

SYSTEM_PROMPT = """Extract only observable facial characteristics from the witness description.
Return JSON matching the supplied schema.
Do not identify a person.
Do not invent missing attributes.
Use "unknown" when the description is insufficient.

Schema format:
{
  "face_shape": "oval|round|square|oblong|heart|unknown",
  "eyes": {"shape": "almond|round|narrow", "size": "small|medium|large", "spacing": "close|normal|wide", "tilt": "neutral|upward|downward"},
  "eyebrows": {"thickness": "thin|medium|thick", "shape": "straight|arched"},
  "nose": {"bridge": "straight|convex|concave", "length": "short|medium|long", "width": "narrow|medium|wide", "tip": "pointed|rounded|bulbous"},
  "mouth": {"width": "narrow|medium|wide", "upper_lip": "thin|medium|full", "lower_lip": "thin|medium|full"},
  "jaw": {"width": "narrow|medium|wide", "shape": "angular|rounded"},
  "chin": {"size": "small|medium|large", "shape": "pointed|rounded|square"}
}
"""


class QwenLocalProvider(BaseLLMProvider):
    """
    Connects to the local llama.cpp server running Qwen3-8B Q4_K_M on port 8001.
    Complies with Section 4 and Section 9 of the Forensix AI Integration Guide.
    """

    def __init__(self, base_url: str | None = None, model: str | None = None):
        self.base_url = (base_url or settings.QWEN_BASE_URL).rstrip("/")
        self.model = model or settings.QWEN_MODEL

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
            parsed_json = json.loads(raw_content)

            return {
                "extracted": True,
                "provider": "qwen_local",
                "attributes": parsed_json,
            }
        except Exception as e:
            logger.error(
                f"Failed to query local Qwen model at {endpoint}: {str(e)}",
                extra={"error_code": "PROVIDER_ERROR"},
                exc_info=True,
            )
            raise ProviderException(
                f"Local Qwen model error: Could not connect to llama.cpp at {self.base_url}. Ensure llama.cpp is running on port 8001."
            )
