from typing import Any, Dict
from app.providers.base import BaseSketchProvider
from app.core.logging import logger


class MockSketchProvider(BaseSketchProvider):
    """
    Phase 7 implementation pending: Diffusion model forensic sketch generation.
    This mock provider simulates sketch synthesis for Phase 6 contract validation.
    Reuses the Phase 5 secure storage key convention.
    """

    async def generate_sketch(
        self,
        case_id: str,
        witness_id: str,
        attributes: Dict[str, Any],
    ) -> Dict[str, Any]:
        logger.info(
            "MockSketchProvider executing sketch synthesis (Phase 7 implementation pending).",
            extra={"endpoint": "/api/v1/sketch/generate"},
        )
        # In Phase 5 convention: cases/{caseId}/sketches/{sketchId}/composite.png
        storage_key = f"cases/{case_id}/sketches/{witness_id}_composite.png"
        return {
            "url": f"/storage/{storage_key}",
            "content_type": "image/png",
            "_phase_status": "Phase 7 implementation pending",
        }
