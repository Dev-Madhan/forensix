import time
import random
from typing import Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseSketchProvider
from app.providers.sketch.mock import MockSketchProvider
from app.schemas.sketch import SketchGenerateRequest, SketchGenerateResponse, SketchImage
from app.services.geometry_service import geometry_service
from app.utils.errors import ProviderException

settings = get_settings()


class SketchService:
    def __init__(self, provider: Optional[BaseSketchProvider] = None):
        self.provider = provider or MockSketchProvider()

    async def generate_sketch(
        self,
        request: SketchGenerateRequest,
        request_id: str,
    ) -> SketchGenerateResponse:
        start_time = time.perf_counter()
        generation_seed = request.seed if request.seed is not None else random.randint(100000, 999999)

        logger.info(
            f"Generating sketch for case={request.case_id}, witness={request.witness_id}, seed={generation_seed}, res={request.resolution}",
            extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
        )

        try:
            # 1. Compute deterministic normalized geometry anchors for ControlNet Lineart
            geometry = geometry_service.compute_anchors(request.attributes, resolution=request.resolution)

            # 2. Invoke sketch provider with geometry and conditioning parameters
            image_data = await self.provider.generate_sketch(
                case_id=request.case_id,
                witness_id=request.witness_id,
                attributes=request.attributes,
            )
        except Exception as e:
            logger.error(
                f"Error in sketch provider: {str(e)}",
                extra={"request_id": request_id, "error_code": "PROVIDER_ERROR"},
                exc_info=True,
            )
            raise ProviderException("Failed to generate forensic sketch.")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return SketchGenerateResponse(
            request_id=request_id,
            status="completed",
            case_id=request.case_id,
            witness_id=request.witness_id,
            image=SketchImage(
                url=image_data.get("url", ""),
                content_type=image_data.get("content_type", "image/png"),
            ),
            seed=generation_seed,
            metadata={
                "resolution": request.resolution,
                "steps": request.steps,
                "control_strength": request.control_strength,
                "geometry_anchors": geometry.anchors.model_dump(),
                "model": "SD1.5 + ControlNet Lineart (FP16)",
            },
            processing_time_ms=elapsed_ms,
        )


sketch_service = SketchService()

