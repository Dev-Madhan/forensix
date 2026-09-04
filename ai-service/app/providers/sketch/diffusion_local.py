# pyright: reportMissingImports=false
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional
import random

from PIL import Image, ImageDraw

from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseSketchProvider
from app.services.geometry_service import geometry_service
from app.utils.errors import ProviderException

settings = get_settings()

# Lazy-loaded optional heavy diffusion dependencies
try:
    import torch  # type: ignore[import-not-found] # pyright: ignore[reportMissingImports]
    from diffusers import ControlNetModel, StableDiffusionControlNetPipeline  # type: ignore[import-not-found] # pyright: ignore[reportMissingImports]
    HAS_DIFFUSION_DEPS = True
except ImportError:
    torch = None  # type: ignore
    ControlNetModel = None  # type: ignore
    StableDiffusionControlNetPipeline = None  # type: ignore
    HAS_DIFFUSION_DEPS = False


class LocalDiffusionProvider(BaseSketchProvider):
    """
    Local forensic sketch synthesis provider using:
    - Stable Diffusion 1.5 (FP16)
    - ControlNet Lineart v1.1
    - CPU offload + attention slicing for NVIDIA RTX 4050 6GB VRAM budget
    """

    def __init__(
        self,
        sd_model_path: Optional[str] = None,
        controlnet_model_path: Optional[str] = None,
        output_dir: Optional[str] = None,
    ):
        self.sd_model_path = Path(sd_model_path or settings.SD_MODEL_PATH)
        self.controlnet_model_path = Path(controlnet_model_path or settings.CONTROLNET_MODEL_PATH)
        self.output_dir = Path(output_dir or settings.OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._pipe: Any = None

    def _ensure_pipeline(self) -> Any:
        """Lazy-load the diffusion pipeline onto GPU with CPU offload."""
        if self._pipe is not None:
            return self._pipe

        if not HAS_DIFFUSION_DEPS or torch is None or ControlNetModel is None or StableDiffusionControlNetPipeline is None:
            raise ProviderException(
                "Missing AI diffusion dependencies (torch, diffusers). "
                "Ensure torch and diffusers are installed in .venv: "
                "pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 && pip install diffusers[torch] transformers accelerate"
            )

        if not self.controlnet_model_path.exists():
            raise ProviderException(
                f"ControlNet model not found at {self.controlnet_model_path}."
            )
        if not self.sd_model_path.exists():
            raise ProviderException(
                f"Stable Diffusion 1.5 model not found at {self.sd_model_path}."
            )

        logger.info(
            f"Loading ControlNet Lineart from {self.controlnet_model_path}...",
            extra={"endpoint": "/api/v1/sketch/generate"},
        )
        controlnet = ControlNetModel.from_pretrained(
            str(self.controlnet_model_path),
            torch_dtype=torch.float16,
        )

        logger.info(
            f"Loading Stable Diffusion 1.5 from {self.sd_model_path} with FP16...",
            extra={"endpoint": "/api/v1/sketch/generate"},
        )
        pipe = StableDiffusionControlNetPipeline.from_pretrained(
            str(self.sd_model_path),
            controlnet=controlnet,
            torch_dtype=torch.float16,
            safety_checker=None,
        )

        if pipe is None:
            raise ProviderException(
                "StableDiffusionControlNetPipeline.from_pretrained() returned None. "
                "Verify that the model files at '{}' are valid and complete (e.g. model_index.json present).".format(
                    self.sd_model_path
                )
            )

        # 6 GB VRAM optimizations
        if torch.cuda.is_available():
            logger.info("Enabling model CPU offload and attention slicing for 6GB VRAM...")
            pipe.enable_model_cpu_offload()
            pipe.enable_attention_slicing()
        else:
            logger.warning("CUDA is not available, falling back to CPU execution.")
            pipe = pipe.to("cpu")

        self._pipe = pipe
        return self._pipe

    def create_conditioning_lineart(
        self,
        attributes: Dict[str, Any],
        resolution: int = 512,
    ) -> Image.Image:
        """
        Creates a high-contrast facial lineart guide using computed forensic geometry anchors.
        This conditioning image is fed into ControlNet Lineart to strictly govern suspect proportions.
        """
        geometry = geometry_service.compute_anchors(attributes, resolution=resolution)
        anchors = geometry.anchors

        # Lineart ControlNet expects high contrast drawing (monochrome)
        # Using white canvas with dark charcoal lines
        canvas = Image.new("RGB", (resolution, resolution), color=(255, 255, 255))
        draw = ImageDraw.Draw(canvas)
        stroke_color = (15, 15, 15)
        stroke_width = max(2, int(resolution / 256))

        # Scale normalized coordinates (0.0 to 1.0) into pixel coordinates
        left_eye_center = (int(anchors.left_eye[0] * resolution), int(anchors.left_eye[1] * resolution))
        right_eye_center = (int(anchors.right_eye[0] * resolution), int(anchors.right_eye[1] * resolution))
        nose_tip = (int(anchors.nose_tip[0] * resolution), int(anchors.nose_tip[1] * resolution))
        mouth_center = (int(anchors.mouth[0] * resolution), int(anchors.mouth[1] * resolution))
        chin = (int(anchors.chin[0] * resolution), int(anchors.chin[1] * resolution))

        # 1. Face contour (jaw, temples, and chin)
        jaw_l = (int(left_eye_center[0] - resolution * 0.12), int(chin[1] - resolution * 0.14))
        jaw_r = (int(right_eye_center[0] + resolution * 0.12), int(chin[1] - resolution * 0.14))
        temple_l = (int(left_eye_center[0] - resolution * 0.14), int(left_eye_center[1] - resolution * 0.10))
        temple_r = (int(right_eye_center[0] + resolution * 0.14), int(right_eye_center[1] - resolution * 0.10))

        # Draw face contour
        draw.line([temple_l, jaw_l, chin, jaw_r, temple_r], fill=stroke_color, width=stroke_width)

        # 2. Eye outlines
        eye_r_x = int(resolution * 0.045)
        eye_r_y = int(resolution * 0.02)

        draw.ellipse(
            [
                (left_eye_center[0] - eye_r_x, left_eye_center[1] - eye_r_y),
                (left_eye_center[0] + eye_r_x, left_eye_center[1] + eye_r_y),
            ],
            outline=stroke_color,
            width=stroke_width,
        )
        draw.ellipse(
            [
                (right_eye_center[0] - eye_r_x, right_eye_center[1] - eye_r_y),
                (right_eye_center[0] + eye_r_x, right_eye_center[1] + eye_r_y),
            ],
            outline=stroke_color,
            width=stroke_width,
        )

        # 3. Eyebrows
        eyebrow_offset_y = int(resolution * 0.038)
        draw.line(
            [
                (left_eye_center[0] - eye_r_x - 4, left_eye_center[1] - eyebrow_offset_y),
                (left_eye_center[0] + eye_r_x + 4, left_eye_center[1] - eyebrow_offset_y - 2),
            ],
            fill=stroke_color,
            width=stroke_width + 1,
        )
        draw.line(
            [
                (right_eye_center[0] - eye_r_x - 4, right_eye_center[1] - eyebrow_offset_y - 2),
                (right_eye_center[0] + eye_r_x + 4, right_eye_center[1] - eyebrow_offset_y),
            ],
            fill=stroke_color,
            width=stroke_width + 1,
        )

        # 4. Nose bridge & tip
        bridge_top = (int((left_eye_center[0] + right_eye_center[0]) / 2), left_eye_center[1])
        draw.line(
            [bridge_top, (bridge_top[0], nose_tip[1] - int(resolution * 0.015)), nose_tip],
            fill=stroke_color,
            width=stroke_width,
        )
        nostril_w = int(resolution * 0.03)
        draw.line(
            [(nose_tip[0] - nostril_w, nose_tip[1] + 2), (nose_tip[0] + nostril_w, nose_tip[1] + 2)],
            fill=stroke_color,
            width=stroke_width,
        )

        # 5. Mouth lines
        mouth_w = int(resolution * 0.07)
        mouth_l = (mouth_center[0] - mouth_w, mouth_center[1])
        mouth_r = (mouth_center[0] + mouth_w, mouth_center[1])
        draw.line([mouth_l, mouth_center, mouth_r], fill=stroke_color, width=stroke_width)

        return canvas

    def build_forensic_prompt(self, attributes: Dict[str, Any]) -> str:
        """Constructs a standardized forensic composite prompt from structured attributes."""
        prompt_parts = [
            "forensic sketch of criminal suspect",
            "police composite drawing",
            "charcoal pencil art",
            "highly detailed pencil sketch",
            "monochrome",
            "neutral lighting",
            "front face portrait",
            "accurate facial proportions",
        ]

        # Inject observable characteristics
        for key, val in attributes.items():
            if isinstance(val, str) and val.lower() not in ("unknown", "none"):
                prompt_parts.append(f"{val} {key.replace('_', ' ')}")
            elif isinstance(val, dict):
                sub_features = [f"{v} {k}" for k, v in val.items() if isinstance(v, str) and v.lower() not in ("unknown", "none")]
                if sub_features:
                    prompt_parts.append(f"{key}: {', '.join(sub_features)}")

        return ", ".join(prompt_parts)

    async def generate_sketch(
        self,
        case_id: str,
        witness_id: str,
        attributes: Dict[str, Any],
        seed: Optional[int] = None,
        resolution: int = 512,
        steps: int = 24,
        control_strength: float = 0.85,
    ) -> Dict[str, Any]:
        """
        Synthesizes a forensic composite sketch conditioned on the facial geometry lineart.
        """
        pipe = self._ensure_pipeline()
        generation_seed = seed if seed is not None else random.randint(100000, 999999)
        
        generator = torch.Generator(device="cpu").manual_seed(generation_seed) if torch is not None else None

        conditioning_lineart = self.create_conditioning_lineart(attributes, resolution=resolution)
        prompt = self.build_forensic_prompt(attributes)
        negative_prompt = (
            "color, saturated, cartoon, anime, 3d render, photo, photorealistic, "
            "deformed, bad eyes, extra eyes, mutated, missing features, blurry"
        )

        logger.info(
            f"Running diffusion inference: case={case_id}, witness={witness_id}, seed={generation_seed}, steps={steps}",
            extra={"endpoint": "/api/v1/sketch/generate"},
        )

        output = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=conditioning_lineart,
            num_inference_steps=steps,
            guidance_scale=7.5,
            controlnet_conditioning_scale=control_strength,
            generator=generator,
        )

        generated_image: Image.Image = output.images[0]

        # Save output image
        case_dir = self.output_dir / case_id
        case_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{witness_id}_{generation_seed}.png"
        output_file = case_dir / filename
        generated_image.save(output_file, format="PNG")

        # Section 35: Save intermediate artifacts for debugging and audit
        try:
            lineart_dir = self.output_dir / "lineart"
            if lineart_dir.exists():
                conditioning_lineart.save(lineart_dir / f"{case_id}_{witness_id}_{generation_seed}_lineart.png", format="PNG")

            sketches_dir = self.output_dir / "sketches"
            if sketches_dir.exists():
                generated_image.save(sketches_dir / f"{case_id}_{witness_id}_{generation_seed}.png", format="PNG")

            meta_dir = self.output_dir / "metadata"
            if meta_dir.exists():
                import json
                import time
                meta_payload = {
                    "case_id": case_id,
                    "witness_id": witness_id,
                    "seed": generation_seed,
                    "steps": steps,
                    "resolution": resolution,
                    "control_strength": control_strength,
                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
                (meta_dir / f"{case_id}_{witness_id}_{generation_seed}.json").write_text(
                    json.dumps(meta_payload, indent=2), encoding="utf-8"
                )
        except Exception as err:
            logger.debug(f"Non-fatal: could not save intermediate artifacts: {err}")

        logger.info(
            f"Forensic sketch saved successfully to {output_file}",
            extra={"endpoint": "/api/v1/sketch/generate"},
        )

        return {
            "url": f"/outputs/{case_id}/{filename}",
            "local_path": str(output_file),
            "content_type": "image/png",
            "seed": generation_seed,
        }
