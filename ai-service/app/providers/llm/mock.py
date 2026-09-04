from typing import Any, Dict
from app.providers.base import BaseLLMProvider
from app.core.logging import logger


class MockLLMProvider(BaseLLMProvider):
    """
    Phase 7 implementation pending: LLM-based facial attribute extraction.
    This mock provider simulates parsing witness descriptions for Phase 6 contract validation.
    """

    async def extract_facial_attributes(self, description: str) -> Dict[str, Any]:
        logger.info(
            "MockLLMProvider executing attribute extraction (Phase 7 implementation pending).",
            extra={"endpoint": "/api/v1/witness/process"},
        )
        # Standardized placeholder structure for Phase 7 handoff
        return {
            "_phase_status": "Phase 7 implementation pending",
            "extracted": True,
            "raw_length": len(description),
            "attributes": {
                "face_shape": "oval",
                "eyes": {
                    "shape": "almond",
                    "size": "medium",
                    "spacing": "normal",
                    "tilt": "neutral",
                },
                "eyebrows": {
                    "thickness": "medium",
                    "shape": "arched",
                },
                "nose": {
                    "bridge": "straight",
                    "length": "long",
                    "width": "narrow",
                    "tip": "rounded",
                },
                "mouth": {
                    "width": "medium",
                    "upper_lip": "thin",
                    "lower_lip": "medium",
                },
                "jaw": {
                    "width": "medium",
                    "shape": "rounded",
                },
                "chin": {
                    "size": "medium",
                    "shape": "rounded",
                },
            },
        }

