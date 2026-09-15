import json
import random
import time
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseSketchProvider
from app.providers.sketch.mock import MockSketchProvider
from app.schemas.sketch import SketchGenerateRequest, SketchGenerateResponse, SketchImage
from app.schemas.taxonomy import ForensicAttributeSchemaV2
from app.services.attribute_consistency_checker import attribute_consistency_checker
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
        generation_id = f"gen_{uuid4().hex[:12]}"
        generation_seed = request.seed if request.seed is not None else random.randint(100000, 999999)

        logger.info(
            f"Generating sketch [{generation_id}]: mode={request.mode}, case={request.case_id}, "
            f"witness={request.witness_id}, seed={generation_seed}, res={request.resolution}, "
            f"angle={request.camera_angle}, style={request.sketch_style}",
            extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
        )

        try:
            # 0. Mode Routing & Attribute Preparation
            effective_attributes: Dict[str, Any] = {}
            quality_result = None

            if request.mode == "PROMPT_GENERATION":
                # Prompt Mode: Enrich short prompts and analyze statement narrative
                from app.services.prompt_quality_scorer import prompt_quality_scorer
                quality_result = prompt_quality_scorer.score(
                    witness_statement=request.prompt,
                    structured_attrs=request.attributes or {},
                )
                logger.info(
                    f"Prompt quality score={quality_result.score}/100, tier={quality_result.tier}, "
                    f"missing={quality_result.missing_domains}",
                    extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
                )

                enriched_attributes = dict(request.attributes or {})
                for attr_key, token_val in quality_result.enrichments.items():
                    if attr_key not in enriched_attributes:
                        enriched_attributes[f"_enriched_{attr_key}"] = token_val

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

            else:
                # Dataset Composite Mode: Assemble explicit component selections
                composite_attrs = dict(request.attributes or {})
                if request.components:
                    for comp_type, comp_id in request.components.items():
                        # Parse component ID (e.g. 'almond_01' -> 'almond')
                        val_clean = comp_id.split("_")[0] if "_" in comp_id else comp_id
                        composite_attrs[comp_type] = val_clean
                        if comp_type == "eyes":
                            composite_attrs["eye_shape"] = val_clean
                        elif comp_type == "nose":
                            composite_attrs["nose_tip"] = val_clean

                from app.services.forensic_llm_engine import forensic_llm_engine
                llm_result = forensic_llm_engine.analyze(
                    attributes=composite_attrs,
                    sketch_style=request.sketch_style,
                    camera_angle=request.camera_angle,
                    age_group=request.age_group,
                    gender=request.gender,
                    ethnicity=request.ethnicity,
                    lighting_mood=request.lighting_mood,
                    detail_level=request.detail_level,
                    witness_statement=None,
                )
                effective_attributes = llm_result.get("effective_attributes", composite_attrs)

            # 1. Compute Deterministic Normalized Geometry Anchors v2
            v2_schema = ForensicAttributeSchemaV2.from_v1_dict(effective_attributes)
            geometry = geometry_service.compute_anchors_v2(
                schema=v2_schema,
                resolution=request.resolution,
                camera_angle=request.camera_angle,
            )

            # 2. Synthesis execution helper
            async def _run_synthesis(
                current_seed: int,
                cfg_val: float,
                steps_val: int,
                ctrl_strength: float,
            ) -> Dict[str, Any]:
                if hasattr(self.provider, "generate_sketch"):
                    import inspect
                    sig = inspect.signature(self.provider.generate_sketch)
                    kwargs: Dict[str, Any] = {
                        "case_id": request.case_id,
                        "witness_id": request.witness_id,
                        "attributes": effective_attributes,
                    }
                    if "seed" in sig.parameters:
                        kwargs["seed"] = current_seed
                    if "resolution" in sig.parameters:
                        kwargs["resolution"] = request.resolution
                    if "steps" in sig.parameters:
                        kwargs["steps"] = steps_val
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
                        kwargs["cfg_scale"] = cfg_val
                    if "control_strength" in sig.parameters:
                        kwargs["control_strength"] = ctrl_strength

                    return await self.provider.generate_sketch(**kwargs)
                else:
                    return await self.provider.generate_sketch(
                        case_id=request.case_id,
                        witness_id=request.witness_id,
                        attributes=effective_attributes,
                    )

            # 3. Initial Generation Pass (Pass 1)
            initial_cfg = float(llm_result.get("cfg_scale", 8.5))
            initial_steps = int(llm_result.get("steps", request.steps))
            initial_ctrl = float(request.control_strength)

            image_data = await _run_synthesis(
                current_seed=generation_seed,
                cfg_val=initial_cfg,
                steps_val=initial_steps,
                ctrl_strength=initial_ctrl,
            )

            # 4. Post-Generation Attribute Consistency Evaluation
            img_local_path = image_data.get("local_path", "")
            consistency_report = attribute_consistency_checker.evaluate_image(
                image_path=img_local_path,
                schema=v2_schema,
                generation_id=generation_id,
            )
            logger.info(
                f"Consistency pass 1: score={consistency_report.overall_consistency:.3f}, "
                f"needs_refinement={consistency_report.needs_refinement}",
                extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
            )

            # 5. Multi-Pass Refinement Loop
            refinement_passes_executed = 0
            max_passes = max(1, settings.MAX_REFINEMENT_PASSES)

            if consistency_report.needs_refinement and max_passes > 1:
                refinement_passes_executed += 1
                logger.info(
                    f"Executing automated refinement pass {refinement_passes_executed} for {generation_id}: "
                    f"reasons={consistency_report.refinement_reasons}",
                    extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
                )
                refined_cfg = initial_cfg + consistency_report.recommendations.get("cfg_scale_delta", 0.50)
                refined_steps = initial_steps + consistency_report.recommendations.get("steps_delta", 4)
                refined_ctrl = consistency_report.recommendations.get("adjust_control_strength", initial_ctrl)
                refined_seed = generation_seed + 1

                image_data = await _run_synthesis(
                    current_seed=refined_seed,
                    cfg_val=refined_cfg,
                    steps_val=refined_steps,
                    ctrl_strength=refined_ctrl,
                )
                generation_seed = refined_seed

                # Re-evaluate consistency after refinement
                consistency_report = attribute_consistency_checker.evaluate_image(
                    image_path=image_data.get("local_path", ""),
                    schema=v2_schema,
                    generation_id=generation_id,
                )
                logger.info(
                    f"Consistency after pass {refinement_passes_executed + 1}: "
                    f"score={consistency_report.overall_consistency:.3f}",
                    extra={"endpoint": "/api/v1/sketch/generate", "request_id": request_id},
                )

            # 6. Persist Complete Audit Metadata JSON
            try:
                meta_dir = Path(settings.OUTPUT_METADATA_DIR)
                meta_dir.mkdir(parents=True, exist_ok=True)
                audit_meta = {
                    "generation_id": generation_id,
                    "case_id": request.case_id,
                    "witness_id": request.witness_id,
                    "mode": request.mode,
                    "seed": generation_seed,
                    "resolution": request.resolution,
                    "steps": initial_steps,
                    "sketch_style": request.sketch_style,
                    "camera_angle": request.camera_angle,
                    "consistency_score": consistency_report.overall_consistency,
                    "domain_consistency_scores": consistency_report.domain_scores,
                    "refinement_passes": refinement_passes_executed,
                    "refinement_reasons": consistency_report.refinement_reasons,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "effective_attributes": v2_schema.model_dump(),
                }
                (meta_dir / f"{generation_id}.json").write_text(
                    json.dumps(audit_meta, indent=2), encoding="utf-8"
                )
            except Exception as meta_err:
                logger.debug(f"Non-fatal: could not save audit metadata: {meta_err}")

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
            generation_id=generation_id,
            mode=request.mode,
            consistency_score=consistency_report.overall_consistency,
            refinement_passes=refinement_passes_executed,
            image=SketchImage(
                url=image_data.get("url", ""),
                content_type=image_data.get("content_type", "image/png"),
            ),
            seed=generation_seed,
            llm_analysis=llm_result.get("llm_analysis"),
            metadata={
                "schema_version": "2.0",
                "generation_id": generation_id,
                "mode": request.mode,
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
                "consistency_score": consistency_report.overall_consistency,
                "refinement_passes": refinement_passes_executed,
                "model": "SD1.5 + Rank-64 Forensic LoRA v2 + ControlNet Lineart",
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "prompt_quality": quality_result.to_dict() if quality_result else None,
            },
            processing_time_ms=elapsed_ms,
        )


sketch_service = SketchService()
