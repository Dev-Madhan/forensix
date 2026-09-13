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
        if provider:
            self.provider = provider
        elif settings.SKETCH_PROVIDER == "diffusion_local":
            from app.providers.sketch.diffusion_local import LocalDiffusionProvider
            self.provider = LocalDiffusionProvider()
        else:
            self.provider = MockSketchProvider()

    async def generate_sketch(
        self,
        request: SketchGenerateRequest,
        request_id: str,
    ) -> SketchGenerateResponse:
        start_time = time.perf_counter()
        generation_seed = request.seed if request.seed is not None else random.randint(100000, 999999)

        logger.info(
            f"Generating sketch for case={request.case_id}, witness={request.witness_id}, seed={generation_seed}, res={request.resolution}, angle={request.camera_angle}, style={request.sketch_style}",
            extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
        )

        try:
            # 0. Prompt Quality Scoring & Short-Prompt Enrichment
            from app.services.prompt_quality_scorer import prompt_quality_scorer
            quality_result = prompt_quality_scorer.score(
                witness_statement=request.prompt,
                structured_attrs=request.attributes,
            )
            logger.info(
                f"Prompt quality score={quality_result.score}/100, tier={quality_result.tier}, "
                f"missing={quality_result.missing_domains}",
                extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
            )

            # Merge auto-enrichments into attributes for short prompts
            enriched_attributes = dict(request.attributes)
            for attr_key, token_val in quality_result.enrichments.items():
                if attr_key not in enriched_attributes:
                    enriched_attributes[f"_enriched_{attr_key}"] = token_val

            # 1. Execute LLM Feature Reasoning & Demographic Analysis
            from app.services.forensic_llm_engine import forensic_llm_engine
            llm_result = forensic_llm_engine.analyze(
                attributes=enriched_attributes,
                sketch_style=request.sketch_style,
                camera_angle=request.camera_angle,
                age_group=request.age_group,
                gender=request.gender,
                ethnicity=request.ethnicity,
                lighting_mood=request.lighting_mood,
                detail_level=request.detail_level,
                witness_statement=request.prompt,
            )

            effective_attributes = llm_result.get("effective_attributes", enriched_attributes)

            # 2. Compute deterministic normalized geometry anchors with perspective angle awareness
            geometry = geometry_service.compute_anchors(
                effective_attributes,
                resolution=request.resolution,
                camera_angle=request.camera_angle,
            )

            # 3. Invoke sketch provider with geometry and conditioning parameters
            if hasattr(self.provider, "generate_sketch"):
                import inspect
                sig = inspect.signature(self.provider.generate_sketch)
                kwargs = {
                    "case_id": request.case_id,
                    "witness_id": request.witness_id,
                    "attributes": effective_attributes,
                }
                if "seed" in sig.parameters:
                    kwargs["seed"] = generation_seed
                if "resolution" in sig.parameters:
                    kwargs["resolution"] = request.resolution
                if "steps" in sig.parameters:
                    kwargs["steps"] = llm_result.get("steps", request.steps)
                if "camera_angle" in sig.parameters:
                    kwargs["camera_angle"] = request.camera_angle
                if "sketch_style" in sig.parameters:
                    kwargs["sketch_style"] = request.sketch_style
                if "age_group" in sig.parameters:
                    kwargs["age_group"] = request.age_group
                if "gender" in sig.parameters:
                    kwargs["gender"] = request.gender
                if "ethnicity" in sig.parameters:
                    kwargs["ethnicity"] = request.ethnicity
                if "lighting_mood" in sig.parameters:
                    kwargs["lighting_mood"] = request.lighting_mood
                if "detail_level" in sig.parameters:
                    kwargs["detail_level"] = request.detail_level
                if "prompt" in sig.parameters:
                    kwargs["prompt"] = request.prompt
                if "positive_prompt" in sig.parameters:
                    kwargs["positive_prompt"] = llm_result.get("positive_prompt")
                if "negative_prompt" in sig.parameters:
                    kwargs["negative_prompt"] = llm_result.get("negative_prompt")
                if "cfg_scale" in sig.parameters:
                    kwargs["cfg_scale"] = llm_result.get("cfg_scale", 7.5)

                image_data = await self.provider.generate_sketch(**kwargs)
            else:
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
            llm_analysis=llm_result.get("llm_analysis"),
            metadata={
                "schema_version": "2.0",
                "llm_engine": "ForensicLLMEngine-v2",
                "diffusion_model": "stable-diffusion-v1-5",
                "sketch_style": request.sketch_style,
                "camera_angle": request.camera_angle,
                "age_group": request.age_group,
                "gender": request.gender,
                "detail_level": request.detail_level,
                "resolution": request.resolution,
                "steps": llm_result.get("steps", request.steps),
                "cfg_scale": llm_result.get("cfg_scale", 8.5),
                "geometry_anchors": geometry.anchors.model_dump(),
                "model": "SD1.5 + Rank-64 Forensic LoRA v2 (FP16, DDIM, no ControlNet)",
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "prompt_quality": quality_result.to_dict(),
            },
            processing_time_ms=elapsed_ms,
        )


sketch_service = SketchService()

