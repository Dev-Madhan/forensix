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
    from diffusers import (  # type: ignore[import-not-found] # pyright: ignore[reportMissingImports]
        StableDiffusionPipeline,
        DDIMScheduler,
        StableDiffusionImg2ImgPipeline,
        ControlNetModel,
        StableDiffusionControlNetPipeline,
    )
    HAS_DIFFUSION_DEPS = True
except ImportError:
    torch = None  # type: ignore
    StableDiffusionPipeline = None  # type: ignore
    DDIMScheduler = None  # type: ignore
    StableDiffusionImg2ImgPipeline = None  # type: ignore
    ControlNetModel = None  # type: ignore
    StableDiffusionControlNetPipeline = None  # type: ignore
    HAS_DIFFUSION_DEPS = False

# ---------------------------------------------------------------------------
# Per-style CFG scale table — higher CFG = crisper linework enforcement
# ---------------------------------------------------------------------------
STYLE_CFG_TABLE: Dict[str, float] = {
    "Forensic Graphite (Pencil)":            9.0,
    "Realistic Charcoal":                    8.5,
    "Digital Identi-Kit (Lineart)":          10.0,
    "Color Age-Progressed":                  7.5,
    "Monochrome Inversion (Black Background)": 12.0,
}

# Per-style step table keyed by (style, detail_level)
STYLE_STEPS_TABLE: Dict[str, Dict[str, int]] = {
    "Forensic Graphite (Pencil)":            {"Standard": 28, "Master": 45, "Draft": 16},
    "Realistic Charcoal":                    {"Standard": 28, "Master": 45, "Draft": 16},
    "Digital Identi-Kit (Lineart)":          {"Standard": 30, "Master": 48, "Draft": 18},
    "Color Age-Progressed":                  {"Standard": 28, "Master": 45, "Draft": 16},
    "Monochrome Inversion (Black Background)": {"Standard": 35, "Master": 50, "Draft": 20},
}


class LocalDiffusionProvider(BaseSketchProvider):
    """
    Local forensic sketch synthesis provider using:
    - Stable Diffusion 1.5 (FP16)
    - Rank-32 Dual-Dataset Forensic LoRA (FS2K + CelebAMask-HQ)
    - LLM-synthesised prompts with corroborated attention weighting
    - Camera-perspective directives (frontal view) — no ControlNet/lineart conditioning
    - CPU offload + attention slicing for NVIDIA RTX 4050 6GB VRAM budget
    """

    def __init__(
        self,
        sd_model_path: Optional[str] = None,
        output_dir: Optional[str] = None,
    ):
        base_ai_dir = Path(__file__).resolve().parents[3]
        sd_path = Path(sd_model_path or settings.SD_MODEL_PATH)
        if not sd_path.exists():
            for alt in [base_ai_dir / "models" / "sd15", Path("ai-service/models/sd15")]:
                if alt.exists():
                    sd_path = alt
                    break
        self.sd_model_path = sd_path

        out_path = Path(output_dir or settings.OUTPUT_DIR)
        if not out_path.is_absolute() and not out_path.exists():
            out_path = base_ai_dir / "outputs"
        self.output_dir = out_path
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._pipe: Any = None
        self._lora_active: bool = False
        self._controlnet_active: bool = False

    def _ensure_pipeline(self) -> Any:
        """
        Lazy-load diffusion pipeline onto GPU with CPU offload.
        Attempts StableDiffusionControlNetPipeline first; falls back gracefully to vanilla SD1.5.
        """
        if self._pipe is not None:
            return self._pipe

        if not HAS_DIFFUSION_DEPS or torch is None or StableDiffusionPipeline is None:
            raise ProviderException(
                "Missing AI diffusion dependencies (torch, diffusers). "
                "Ensure torch and diffusers are installed in .venv: "
                "pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 && pip install diffusers[torch] transformers accelerate"
            )

        if not self.sd_model_path.exists():
            raise ProviderException(
                f"Stable Diffusion 1.5 model not found at {self.sd_model_path}."
            )

        pipe = None
        self._controlnet_active = False

        # Attempt ControlNet Lineart pipeline initialization
        if getattr(settings, "CONTROLNET_ENABLED", True) and ControlNetModel is not None and StableDiffusionControlNetPipeline is not None:
            cnet_candidates = [
                self.sd_model_path.parent / "controlnet" / "lineart",
                Path(settings.CONTROLNET_MODEL_PATH),
                Path(__file__).resolve().parents[3] / "models" / "controlnet" / "lineart",
                Path("ai-service/models/controlnet/lineart"),
            ]
            cnet_path = next((p for p in cnet_candidates if p.exists()), None)
            if cnet_path:
                try:
                    logger.info(f"Loading ControlNet Lineart model from {cnet_path}...")
                    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
                    cnet_model = ControlNetModel.from_pretrained(
                        str(cnet_path),
                        torch_dtype=dtype,
                    )
                    logger.info(f"Loading StableDiffusionControlNetPipeline from {self.sd_model_path}...")
                    pipe = StableDiffusionControlNetPipeline.from_pretrained(
                        str(self.sd_model_path),
                        controlnet=cnet_model,
                        torch_dtype=dtype,
                        variant="fp16" if dtype == torch.float16 else None,
                        safety_checker=None,
                    )
                    self._controlnet_active = True
                    logger.info("StableDiffusionControlNetPipeline successfully initialized with Lineart guidance.")
                except Exception as cnet_err:
                    logger.warning(
                        f"ControlNet initialization failed ({cnet_err}). Gracefully falling back to vanilla StableDiffusionPipeline."
                    )
                    pipe = None
                    self._controlnet_active = False

        # Fallback to standard StableDiffusionPipeline
        if pipe is None:
            logger.info(
                f"Loading Stable Diffusion 1.5 (vanilla) from {self.sd_model_path} with FP16...",
                extra={"endpoint": "/api/v1/sketch/generate"},
            )
            pipe = StableDiffusionPipeline.from_pretrained(
                str(self.sd_model_path),
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                variant="fp16" if torch.cuda.is_available() else None,
                safety_checker=None,
            )
            self._controlnet_active = False

        if pipe is None:
            raise ProviderException(
                "Diffusion pipeline from_pretrained() returned None. "
                "Verify that model files at '{}' are complete.".format(self.sd_model_path)
            )

        # Switch to DDIM scheduler — crisper monochrome linework vs default PNDM
        if DDIMScheduler is not None:
            try:
                pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
                logger.info("Switched to DDIM scheduler for forensic edge sharpness.")
            except Exception as sched_err:
                logger.warning(f"Could not switch to DDIM scheduler: {sched_err}")

        # 6 GB VRAM optimizations
        if torch.cuda.is_available():
            logger.info("Enabling model CPU offload and attention slicing for 6GB VRAM...")
            pipe.enable_model_cpu_offload()
            pipe.enable_attention_slicing()
        else:
            logger.warning("CUDA is not available, falling back to CPU execution.")
            pipe = pipe.to("cpu")

        # Load trained forensic LoRA adapter if available (prefers v3 if trained, then v2)
        self._lora_version: str = "none"
        lora_candidates = [
            self.sd_model_path.parent / "lora" / "forensic_sketch_lora_v3.safetensors",
            self.sd_model_path.parent / "lora" / "forensic_sketch_lora_v2.safetensors",
            self.sd_model_path.parent / "lora" / "forensic_sketch_lora.safetensors",
            Path("models/lora/forensic_sketch_lora_v3.safetensors"),
            Path("models/lora/forensic_sketch_lora_v2.safetensors"),
            Path("models/lora/forensic_sketch_lora.safetensors"),
            Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora_v3.safetensors",
            Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora_v2.safetensors",
            Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora.safetensors",
        ]
        for lp in lora_candidates:
            if lp.exists():
                try:
                    logger.info(f"Loading trained forensic LoRA weights from {lp}...")
                    pipe.load_lora_weights(str(lp.parent), weight_name=lp.name)
                    self._lora_active = True
                    self._lora_version = "v3" if "v3" in lp.name else ("v2" if "v2" in lp.name else "v1")
                    logger.info(f"Forensic LoRA ({self._lora_version}) successfully loaded into diffusion pipeline.")
                    break
                except Exception as lora_err:
                    try:
                        pipe.load_lora_weights(str(lp.parent))
                        self._lora_active = True
                        self._lora_version = "v3" if "v3" in lp.name else ("v2" if "v2" in lp.name else "v1")
                        logger.info(f"Loaded forensic LoRA adapter directory from {lp.parent}")
                        break
                    except Exception as err2:
                        logger.warning(f"Failed to load LoRA weights from {lp}: {lora_err} / {err2}")

        self._pipe = pipe
        return self._pipe

    def _encode_prompt_with_chunks(
        self,
        pipe: Any,
        prompt: str,
        negative_prompt: str,
    ) -> tuple[Any, Any]:
        """
        Encodes long prompts beyond the 77-token CLIP limit by slicing into 75-token
        sub-chunks (plus BOS/EOS) and combining their hidden state embeddings.

        v2 improvement: uses **weighted mean pooling** across chunks so that earlier
        (higher-priority) style and anatomy blocks carry more attention weight than
        later filler phrases. This corrects the previous simple concatenation which
        gave equal weight to all chunks regardless of semantic importance.
        """
        tokenizer = pipe.tokenizer
        text_encoder = pipe.text_encoder
        device = getattr(pipe, "_execution_device", "cuda" if torch.cuda.is_available() else "cpu")

        def get_chunks(text: str) -> list[Any]:
            tokens = tokenizer(text, truncation=False, return_tensors="pt").input_ids[0]
            core_tokens = tokens[1:-1] if len(tokens) > 1 else torch.tensor([], dtype=torch.long)
            chunks = []
            if len(core_tokens) == 0:
                sub = torch.tensor([tokenizer.bos_token_id, tokenizer.eos_token_id], dtype=torch.long)
                pad = torch.full((77 - len(sub),), tokenizer.pad_token_id, dtype=torch.long)
                chunks.append(torch.cat([sub, pad]))
            else:
                for i in range(0, len(core_tokens), 75):
                    sub = core_tokens[i : i + 75]
                    sub = torch.cat([torch.tensor([tokenizer.bos_token_id]), sub, torch.tensor([tokenizer.eos_token_id])])
                    if len(sub) < 77:
                        pad = torch.full((77 - len(sub),), tokenizer.pad_token_id, dtype=torch.long)
                        sub = torch.cat([sub, pad])
                    chunks.append(sub)
            return chunks

        p_chunks = get_chunks(prompt)
        n_chunks = get_chunks(negative_prompt)
        max_chunks = max(len(p_chunks), len(n_chunks), 1)

        empty_chunk = torch.cat([
            torch.tensor([tokenizer.bos_token_id, tokenizer.eos_token_id], dtype=torch.long),
            torch.full((75,), tokenizer.pad_token_id, dtype=torch.long),
        ])
        while len(p_chunks) < max_chunks:
            p_chunks.append(empty_chunk)
        while len(n_chunks) < max_chunks:
            n_chunks.append(empty_chunk)

        p_tensor = torch.stack(p_chunks).to(device)
        n_tensor = torch.stack(n_chunks).to(device)

        with torch.no_grad():
            p_embeds_stack = text_encoder(p_tensor)[0]   # (max_chunks, 77, 768)
            n_embeds_stack = text_encoder(n_tensor)[0]

        if max_chunks == 1:
            # Single chunk — no pooling needed
            return p_embeds_stack[0:1], n_embeds_stack[0:1]

        # Weighted mean pooling: earlier chunks (style + anatomy) weighted higher
        # Weight decays linearly from 1.0 (first chunk) to 0.55 (last chunk)
        weights = torch.linspace(1.0, 0.55, steps=max_chunks, device=device)  # (max_chunks,)
        w_sum = weights.sum()
        p_embeds = (p_embeds_stack * weights.view(-1, 1, 1)).sum(dim=0, keepdim=True) / w_sum  # (1, 77, 768)
        n_embeds = (n_embeds_stack * weights.view(-1, 1, 1)).sum(dim=0, keepdim=True) / w_sum

        return p_embeds, n_embeds

    def create_conditioning_lineart(
        self,
        attributes: Dict[str, Any],
        resolution: int = 512,
        camera_angle: str = "frontal",
    ) -> Image.Image:
        """
        Creates a high-contrast facial lineart guide using computed forensic geometry anchors.
        Supports Frontal (0°), Three-Quarter (45°), and Lateral Profile (90°) perspectives.
        This conditioning image is fed into ControlNet Lineart to strictly govern suspect proportions.
        """
        geometry = geometry_service.compute_anchors(attributes, resolution=resolution, camera_angle=camera_angle)
        anchors = geometry.anchors

        is_black_bg = bool(
            attributes.get("_black_background")
            or attributes.get("sketch_style") == "Monochrome Inversion (Black Background)"
            or "black background" in str(attributes.get("sketch_style", "")).lower()
            or "chalkboard" in str(attributes.get("sketch_style", "")).lower()
        )
        bg_color = (15, 15, 15) if is_black_bg else (255, 255, 255)
        stroke_color = (220, 220, 220) if is_black_bg else (15, 15, 15)

        canvas = Image.new("RGB", (resolution, resolution), color=bg_color)
        draw = ImageDraw.Draw(canvas)
        stroke_width = max(2, int(resolution / 256))

        # Check if eyewear / glasses are selected in attributes
        eyewear_token: Optional[str] = None
        for k in ("eyewear", "glasses", "accessories"):
            if k in attributes and isinstance(attributes[k], str) and attributes[k].strip().lower() not in ("", "none"):
                eyewear_token = attributes[k].strip().lower()
                break
        if not eyewear_token and "_feature_tokens" in attributes and isinstance(attributes["_feature_tokens"], str):
            for t in attributes["_feature_tokens"].split(","):
                clean = t.strip().lower()
                if any(x in clean for x in ("glasses", "sunglasses", "eyewear", "spectacles")):
                    eyewear_token = clean
                    break

        is_sunglasses = bool(eyewear_token and any(x in eyewear_token for x in ("sunglasses", "dark", "tinted")))
        is_horn = bool(eyewear_token and any(x in eyewear_token for x in ("horn", "thick")))
        is_aviator = bool(eyewear_token and "aviator" in eyewear_token)
        is_rectangular = bool(eyewear_token and "rectangular" in eyewear_token)
        is_browline = bool(eyewear_token and any(x in eyewear_token for x in ("browline", "clubmaster")))
        g_stroke = stroke_width + 2 if (is_horn or is_browline) else max(2, stroke_width)

        if camera_angle == "profile":
            # ─────────────────────────────────────────────────────────────────
            # LATERAL PROFILE (90°) LINEART
            # ─────────────────────────────────────────────────────────────────
            nose_px = (int(anchors.nose_tip[0] * resolution), int(anchors.nose_tip[1] * resolution))
            chin_px = (int(anchors.chin[0] * resolution), int(anchors.chin[1] * resolution))
            eye_px  = (int(anchors.left_eye[0] * resolution), int(anchors.left_eye[1] * resolution))
            mouth_px = (int(anchors.mouth[0] * resolution), int(anchors.mouth[1] * resolution))

            # Continuous cranial and facial profile silhouette
            profile_pts = [
                (int(resolution * 0.32), int(resolution * 0.16)),  # Crown / top skull
                (int(resolution * 0.44), int(resolution * 0.18)),  # Upper forehead
                (int(resolution * 0.52), int(resolution * 0.28)),  # Forehead slope
                (int(resolution * 0.54), int(resolution * 0.37)),  # Supraorbital brow ridge
                (int(resolution * 0.50), int(resolution * 0.42)),  # Nasion indent
                nose_px,                                           # Nasal tip projection
                (int(resolution * 0.54), int(resolution * 0.62)),  # Subnasale / philtrum
                (int(mouth_px[0] + resolution * 0.02), int(mouth_px[1] - resolution * 0.02)), # Upper lip vermilion
                (int(mouth_px[0] - resolution * 0.02), mouth_px[1]),                          # Oral commissure
                (int(mouth_px[0] + resolution * 0.01), int(mouth_px[1] + resolution * 0.03)), # Lower lip vermilion
                (int(resolution * 0.53), int(chin_px[1] - resolution * 0.04)),               # Labiomental groove
                chin_px,                                           # Chin mental apex
                (int(resolution * 0.45), int(chin_px[1] + resolution * 0.02)),  # Under chin
                (int(resolution * 0.32), int(resolution * 0.68)),  # Mandible angle
                (int(resolution * 0.30), int(resolution * 0.88)),  # Anterior neck
            ]
            draw.line(profile_pts, fill=stroke_color, width=stroke_width)

            # Posterior cranial curve and neck
            occiput_pts = [
                (int(resolution * 0.32), int(resolution * 0.16)),  # Crown
                (int(resolution * 0.20), int(resolution * 0.24)),  # Parietal slope
                (int(resolution * 0.14), int(resolution * 0.40)),  # Occipital prominence
                (int(resolution * 0.16), int(resolution * 0.58)),  # Nuchal indent
                (int(resolution * 0.20), int(resolution * 0.78)),  # Posterior neck
                (int(resolution * 0.22), int(resolution * 0.96)),  # Lower neck
            ]
            draw.line(occiput_pts, fill=stroke_color, width=stroke_width)

            # Profile Eye (Wedge < shaped)
            pw = int(resolution * 0.035)
            ph = int(resolution * 0.018)
            draw.line([
                (eye_px[0] - pw, eye_px[1] - ph),
                (eye_px[0] + pw, eye_px[1]),
                (eye_px[0] - pw, eye_px[1] + ph),
                (eye_px[0] - pw, eye_px[1] - ph),
            ], fill=stroke_color, width=stroke_width)
            # Profile pupil
            draw.ellipse([eye_px[0] - 3, eye_px[1] - 3, eye_px[0] + 3, eye_px[1] + 3], fill=stroke_color)

            # Profile Eyebrow
            draw.line([
                (eye_px[0] - pw - 4, eye_px[1] - ph - 8),
                (eye_px[0] + pw + 2, eye_px[1] - ph - 12),
            ], fill=stroke_color, width=stroke_width + 1)

            # Single Profile Ear
            ear_x = int(resolution * 0.28)
            ear_y = int(resolution * 0.48)
            draw.arc(
                [ear_x - int(resolution * 0.04), ear_y - int(resolution * 0.07), ear_x + int(resolution * 0.04), ear_y + int(resolution * 0.07)],
                100, 320, fill=stroke_color, width=stroke_width
            )

            # Profile Glasses (Lens rim in front of eye, nose bridge to nasion, temple arm to ear)
            if eyewear_token:
                gp_w = int(resolution * 0.024)
                gp_h = int(resolution * 0.046) if not is_rectangular else int(resolution * 0.035)
                draw.ellipse([eye_px[0] - gp_w, eye_px[1] - gp_h, eye_px[0] + gp_w, eye_px[1] + gp_h], outline=stroke_color, width=g_stroke)
                draw.line([(eye_px[0] + gp_w, eye_px[1]), (int(resolution * 0.50), eye_px[1] + 2)], fill=stroke_color, width=stroke_width)
                draw.line([(eye_px[0], eye_px[1] - int(gp_h * 0.45)), (ear_x + 6, ear_y - 10)], fill=stroke_color, width=stroke_width + 1)
                if is_sunglasses:
                    draw.ellipse([eye_px[0] - gp_w + 1, eye_px[1] - gp_h + 1, eye_px[0] + gp_w - 1, eye_px[1] + gp_h - 1], fill=(120, 120, 120))

        elif camera_angle == "three_quarter":
            # ─────────────────────────────────────────────────────────────────
            # THREE-QUARTER (45°) OBLIQUE LINEART
            # ─────────────────────────────────────────────────────────────────
            left_eye_center = (int(anchors.left_eye[0] * resolution), int(anchors.left_eye[1] * resolution))
            right_eye_center = (int(anchors.right_eye[0] * resolution), int(anchors.right_eye[1] * resolution))
            nose_tip = (int(anchors.nose_tip[0] * resolution), int(anchors.nose_tip[1] * resolution))
            mouth_center = (int(anchors.mouth[0] * resolution), int(anchors.mouth[1] * resolution))
            chin = (int(anchors.chin[0] * resolution), int(anchors.chin[1] * resolution))

            # Contralateral asymmetric jaw and closed cranial contour
            temple_l = (int(left_eye_center[0] - resolution * 0.09), int(left_eye_center[1] - resolution * 0.12))
            jaw_l    = (int(left_eye_center[0] - resolution * 0.06), int(chin[1] - resolution * 0.16))
            jaw_r    = (int(right_eye_center[0] + resolution * 0.14), int(chin[1] - resolution * 0.12))
            temple_r = (int(right_eye_center[0] + resolution * 0.12), int(right_eye_center[1] - resolution * 0.10))
            crown    = (int((left_eye_center[0] * 0.35) + (right_eye_center[0] * 0.65)), int(right_eye_center[1] - resolution * 0.26))
            parietal_l = (int(left_eye_center[0] - resolution * 0.04), int(left_eye_center[1] - resolution * 0.20))
            parietal_r = (int(right_eye_center[0] + resolution * 0.08), int(right_eye_center[1] - resolution * 0.18))
            head_pts = [temple_l, jaw_l, chin, jaw_r, temple_r, parietal_r, crown, parietal_l, temple_l]
            draw.line(head_pts, fill=stroke_color, width=stroke_width)

            # Neck lines
            draw.line([(int(jaw_l[0] + resolution * 0.04), jaw_l[1]), (int(jaw_l[0] + resolution * 0.04), int(resolution * 0.98))], fill=stroke_color, width=stroke_width)
            draw.line([(int(jaw_r[0] - resolution * 0.04), jaw_r[1]), (int(jaw_r[0] - resolution * 0.04), int(resolution * 0.98))], fill=stroke_color, width=stroke_width)

            # Far eye (foreshortened, narrower horizontal width)
            eye_r_x_far = int(resolution * 0.032)
            eye_r_y = int(resolution * 0.02)
            draw.ellipse([left_eye_center[0] - eye_r_x_far, left_eye_center[1] - eye_r_y, left_eye_center[0] + eye_r_x_far, left_eye_center[1] + eye_r_y], outline=stroke_color, width=stroke_width)

            # Near eye (standard size)
            eye_r_x_near = int(resolution * 0.046)
            draw.ellipse([right_eye_center[0] - eye_r_x_near, right_eye_center[1] - eye_r_y, right_eye_center[0] + eye_r_x_near, right_eye_center[1] + eye_r_y], outline=stroke_color, width=stroke_width)

            # Eyebrows
            draw.line([(left_eye_center[0] - eye_r_x_far - 2, left_eye_center[1] - int(resolution * 0.035)), (left_eye_center[0] + eye_r_x_far + 2, left_eye_center[1] - int(resolution * 0.038))], fill=stroke_color, width=stroke_width + 1)
            draw.line([(right_eye_center[0] - eye_r_x_near - 3, right_eye_center[1] - int(resolution * 0.040)), (right_eye_center[0] + eye_r_x_near + 4, right_eye_center[1] - int(resolution * 0.035))], fill=stroke_color, width=stroke_width + 1)

            # Angled nose bridge and tip
            bridge_top = (int((left_eye_center[0] * 0.4) + (right_eye_center[0] * 0.6)), left_eye_center[1])
            draw.line([bridge_top, (nose_tip[0] - int(resolution * 0.01), nose_tip[1] - int(resolution * 0.015)), nose_tip], fill=stroke_color, width=stroke_width)
            draw.line([(nose_tip[0] - int(resolution * 0.02), nose_tip[1] + 2), (nose_tip[0] + int(resolution * 0.03), nose_tip[1] + 2)], fill=stroke_color, width=stroke_width)

            # Angled mouth
            mouth_w_l = int(resolution * 0.05)
            mouth_w_r = int(resolution * 0.08)
            draw.line([(mouth_center[0] - mouth_w_l, mouth_center[1]), (mouth_center[0] + mouth_w_r, mouth_center[1])], fill=stroke_color, width=stroke_width)

            # Near ear outline
            ear_x = int(right_eye_center[0] + resolution * 0.14)
            ear_y = int(right_eye_center[1] + resolution * 0.08)
            draw.arc([ear_x - 12, ear_y - 25, ear_x + 12, ear_y + 25], 260, 100, fill=stroke_color, width=stroke_width)

            # Three-Quarter Glasses (Foreshortened far frame, full near frame, bridge, temple arm)
            if eyewear_token:
                gw_far = int(resolution * 0.046)
                gw_near = int(resolution * 0.075)
                gh = int(resolution * 0.045) if not is_rectangular else int(resolution * 0.035)
                box_l = [left_eye_center[0] - gw_far, left_eye_center[1] - gh, left_eye_center[0] + gw_far, left_eye_center[1] + gh]
                box_r = [right_eye_center[0] - gw_near, right_eye_center[1] - gh, right_eye_center[0] + gw_near, right_eye_center[1] + gh]
                draw.rounded_rectangle(box_l, radius=int(resolution * 0.015), outline=stroke_color, width=g_stroke)
                draw.rounded_rectangle(box_r, radius=int(resolution * 0.02), outline=stroke_color, width=g_stroke)
                draw.line([(box_l[2], left_eye_center[1] - 2), (box_r[0], right_eye_center[1] - 2)], fill=stroke_color, width=max(2, stroke_width + 1))
                draw.line([(box_r[2], right_eye_center[1] - 3), (ear_x, ear_y)], fill=stroke_color, width=stroke_width)
                if is_browline:
                    draw.line([(box_l[0], box_l[1]), (box_l[2], box_l[1])], fill=stroke_color, width=stroke_width + 3)
                    draw.line([(box_r[0], box_r[1]), (box_r[2], box_r[1])], fill=stroke_color, width=stroke_width + 3)
                if is_sunglasses:
                    draw.rounded_rectangle([b + 1 for b in box_l[:2]] + [b - 1 for b in box_l[2:]], radius=int(resolution * 0.015), fill=(120, 120, 120))
                    draw.rounded_rectangle([b + 1 for b in box_r[:2]] + [b - 1 for b in box_r[2:]], radius=int(resolution * 0.02), fill=(120, 120, 120))

        else:
            # ─────────────────────────────────────────────────────────────────
            # SYMMETRICAL FRONTAL (0°) LINEART  — v2: full forensic skull grid
            # ─────────────────────────────────────────────────────────────────
            left_eye_center  = (int(anchors.left_eye[0] * resolution),  int(anchors.left_eye[1] * resolution))
            right_eye_center = (int(anchors.right_eye[0] * resolution), int(anchors.right_eye[1] * resolution))
            nose_tip         = (int(anchors.nose_tip[0] * resolution),  int(anchors.nose_tip[1] * resolution))
            mouth_center     = (int(anchors.mouth[0] * resolution),     int(anchors.mouth[1] * resolution))
            chin             = (int(anchors.chin[0] * resolution),      int(anchors.chin[1] * resolution))
            nasion           = (int(anchors.nasion[0] * resolution),    int(anchors.nasion[1] * resolution))
            cbkl             = (int(anchors.cheekbone_left[0] * resolution),  int(anchors.cheekbone_left[1] * resolution))
            cbkr             = (int(anchors.cheekbone_right[0] * resolution), int(anchors.cheekbone_right[1] * resolution))
            philtrum_pt      = (int(anchors.philtrum[0] * resolution),  int(anchors.philtrum[1] * resolution))
            elt              = (int(anchors.ear_left_top[0] * resolution),  int(anchors.ear_left_top[1] * resolution))
            elb              = (int(anchors.ear_left_bot[0] * resolution),  int(anchors.ear_left_bot[1] * resolution))
            ert              = (int(anchors.ear_right_top[0] * resolution), int(anchors.ear_right_top[1] * resolution))
            erb              = (int(anchors.ear_right_bot[0] * resolution), int(anchors.ear_right_bot[1] * resolution))
            clav_l           = (int(anchors.clavicle_left[0] * resolution),  int(anchors.clavicle_left[1] * resolution))
            clav_r           = (int(anchors.clavicle_right[0] * resolution), int(anchors.clavicle_right[1] * resolution))
            hy               = anchors.thirds_hairline_y or 0.18
            by               = anchors.thirds_brow_y or 0.38
            nby              = anchors.thirds_nose_base_y or 0.62
            hairline_y_px    = int(hy * resolution)
            brow_y_px        = int(by * resolution)
            nose_base_y_px   = int(nby * resolution)

            # Check headwear
            has_headwear = False
            for k in ("headwear", "hat", "cap"):
                if k in attributes and isinstance(attributes[k], str) and attributes[k].strip().lower() not in ("", "none"):
                    has_headwear = True
                    break
            if not has_headwear and "_feature_tokens" in attributes and isinstance(attributes["_feature_tokens"], str):
                for t in attributes["_feature_tokens"].split(","):
                    clean = t.strip().lower()
                    if any(x in clean for x in ("cap", "hat", "beanie", "hood")):
                        has_headwear = True
                        break

            # ── A. FORENSIC PROPORTIONAL GRID (very faint / thin guide lines) ──
            grid_color = stroke_color  # same color, thinner stroke
            gw = max(1, stroke_width - 1)
            mid_x = int(resolution * 0.50)

            # Midsagittal vertical axis (bilateral symmetry line)
            draw.line([(mid_x, int(resolution * 0.06)), (mid_x, int(resolution * 0.96))],
                      fill=grid_color, width=gw)

            # Frankfurt horizontal plane (eye-level guide)
            eye_y = int((left_eye_center[1] + right_eye_center[1]) / 2)
            draw.line([(int(resolution * 0.06), eye_y), (int(resolution * 0.94), eye_y)],
                      fill=grid_color, width=gw)

            # Facial thirds horizontal guides (hairline / brow / nose base)
            if not has_headwear:
                draw.line([(int(resolution * 0.18), hairline_y_px), (int(resolution * 0.82), hairline_y_px)],
                          fill=grid_color, width=gw)
            draw.line([(int(resolution * 0.10), brow_y_px), (int(resolution * 0.90), brow_y_px)],
                      fill=grid_color, width=gw)
            draw.line([(int(resolution * 0.10), nose_base_y_px), (int(resolution * 0.90), nose_base_y_px)],
                      fill=grid_color, width=gw)

            # ── B. OUTER CRANIAL CONTOUR ──────────────────────────────────────
            jaw_l    = (int(left_eye_center[0]  - resolution * 0.12), int(chin[1] - resolution * 0.14))
            jaw_r    = (int(right_eye_center[0] + resolution * 0.12), int(chin[1] - resolution * 0.14))
            temple_l = (int(left_eye_center[0]  - resolution * 0.14), int(left_eye_center[1]  - resolution * 0.10))
            temple_r = (int(right_eye_center[0] + resolution * 0.14), int(right_eye_center[1] - resolution * 0.10))
            crown    = (mid_x, int(left_eye_center[1] - resolution * 0.28))
            parietal_l = (int(left_eye_center[0]  - resolution * 0.08), int(left_eye_center[1] - resolution * 0.20))
            parietal_r = (int(right_eye_center[0] + resolution * 0.08), int(right_eye_center[1] - resolution * 0.20))
            chin_w = int(resolution * 0.035)
            chin_l = (int(chin[0] - chin_w), chin[1])
            chin_r = (int(chin[0] + chin_w), chin[1])

            if has_headwear:
                draw.line([temple_l, jaw_l, chin_l, chin_r, jaw_r, temple_r],
                          fill=stroke_color, width=stroke_width)
            else:
                draw.line([temple_l, jaw_l, chin_l, chin_r, jaw_r, temple_r,
                           parietal_r, crown, parietal_l, temple_l],
                          fill=stroke_color, width=stroke_width)

            # ── C. HAIRLINE ARC ───────────────────────────────────────────────
            hair_token: Optional[str] = None
            for k in ("hair", "hairline", "hair_style", "hairstyle"):
                if k in attributes and isinstance(attributes[k], str) and attributes[k].strip().lower() not in ("", "none"):
                    hair_token = attributes[k].strip().lower()
                    break
            if not hair_token and "_feature_tokens" in attributes and isinstance(attributes["_feature_tokens"], str):
                for t in attributes["_feature_tokens"].split(","):
                    clean = t.strip().lower()
                    if any(x in clean for x in ("hair", "hairline", "cropped", "buzz", "bald", "side_part")):
                        hair_token = clean
                        break
            is_bald = bool(hair_token and any(x in hair_token for x in ("bald", "shaved head", "no hair")))
            is_side_part = bool(hair_token and "side_part" in hair_token)

            if not is_bald and not has_headwear:
                is_receding = bool(hair_token and "receding" in hair_token)
                hl_y = int(left_eye_center[1] - resolution * (0.18 if is_receding else 0.15))
                draw.arc(
                    [int(temple_l[0] + resolution * 0.02), hl_y,
                     int(temple_r[0] - resolution * 0.02), int(left_eye_center[1])],
                    195, 345, fill=stroke_color, width=stroke_width
                )
                # Side-part guide: short diagonal arc from hairline center offset
                if is_side_part:
                    part_x = mid_x + int(resolution * 0.05)  # slightly right of center
                    draw.arc(
                        [part_x - int(resolution * 0.06), hl_y - int(resolution * 0.04),
                         part_x + int(resolution * 0.06), hl_y + int(resolution * 0.04)],
                        200, 340, fill=stroke_color, width=gw
                    )

            # ── D. NECK & CLAVICLE / SHOULDER LINE ───────────────────────────
            neck_w   = int(resolution * 0.09)
            neck_l_x = int(chin[0] - neck_w)
            neck_r_x = int(chin[0] + neck_w)
            draw.line([(neck_l_x, int(chin[1] - resolution * 0.03)),
                       (clav_l[0], clav_l[1])], fill=stroke_color, width=stroke_width)
            draw.line([(neck_r_x, int(chin[1] - resolution * 0.03)),
                       (clav_r[0], clav_r[1])], fill=stroke_color, width=stroke_width)
            # Clavicle / shoulder horizontal
            draw.line([clav_l, clav_r], fill=stroke_color, width=stroke_width)

            # ── E. CHEEKBONE ARCS ─────────────────────────────────────────────
            cbk_w = int(resolution * 0.06)
            cbk_h = int(resolution * 0.025)
            draw.arc([cbkl[0] - cbk_w, cbkl[1] - cbk_h, cbkl[0] + cbk_w, cbkl[1] + cbk_h],
                     200, 340, fill=stroke_color, width=gw)
            draw.arc([cbkr[0] - cbk_w, cbkr[1] - cbk_h, cbkr[0] + cbk_w, cbkr[1] + cbk_h],
                     200, 340, fill=stroke_color, width=gw)

            # ── F. EAR OUTLINES (bilateral, frontal = half-ellipse) ───────────
            ear_h = int((elb[1] - elt[1]) // 2)
            ear_w = int(resolution * 0.025)
            ear_mid_l = ((elt[0] + elb[0]) // 2, (elt[1] + elb[1]) // 2)
            ear_mid_r = ((ert[0] + erb[0]) // 2, (ert[1] + erb[1]) // 2)
            draw.arc([ear_mid_l[0] - ear_w, ear_mid_l[1] - ear_h,
                      ear_mid_l[0] + ear_w, ear_mid_l[1] + ear_h],
                     90, 270, fill=stroke_color, width=stroke_width)
            draw.arc([ear_mid_r[0] - ear_w, ear_mid_r[1] - ear_h,
                      ear_mid_r[0] + ear_w, ear_mid_r[1] + ear_h],
                     270, 90, fill=stroke_color, width=stroke_width)

            # ── G. EYE OUTLINES ───────────────────────────────────────────────
            eye_r_x = int(resolution * 0.045)
            eye_r_y = int(resolution * 0.02)
            draw.ellipse([left_eye_center[0]  - eye_r_x, left_eye_center[1]  - eye_r_y,
                          left_eye_center[0]  + eye_r_x, left_eye_center[1]  + eye_r_y],
                         outline=stroke_color, width=stroke_width)
            draw.ellipse([right_eye_center[0] - eye_r_x, right_eye_center[1] - eye_r_y,
                          right_eye_center[0] + eye_r_x, right_eye_center[1] + eye_r_y],
                         outline=stroke_color, width=stroke_width)

            # ── H. EYEBROWS ───────────────────────────────────────────────────
            eyebrow_offset_y = int(resolution * 0.038)
            draw.line([(left_eye_center[0]  - eye_r_x - 4, left_eye_center[1]  - eyebrow_offset_y),
                       (left_eye_center[0]  + eye_r_x + 4, left_eye_center[1]  - eyebrow_offset_y - 2)],
                      fill=stroke_color, width=stroke_width + 1)
            draw.line([(right_eye_center[0] - eye_r_x - 4, right_eye_center[1] - eyebrow_offset_y - 2),
                       (right_eye_center[0] + eye_r_x + 4, right_eye_center[1] - eyebrow_offset_y)],
                      fill=stroke_color, width=stroke_width + 1)

            # ── I. NASAL BRIDGE (two very thin side guides — avoids center seam) ─
            bridge_x_l = nose_tip[0] - int(resolution * 0.015)
            bridge_x_r = nose_tip[0] + int(resolution * 0.015)
            draw.line([(bridge_x_l, nasion[1]), (bridge_x_l, nose_tip[1])],
                      fill=stroke_color, width=max(1, stroke_width - 1))
            draw.line([(bridge_x_r, nasion[1]), (bridge_x_r, nose_tip[1])],
                      fill=stroke_color, width=max(1, stroke_width - 1))

            # ── J. NOSE TIP & NOSTRIL ARCHES ─────────────────────────────────
            nostril_w = int(resolution * 0.025)
            draw.arc(
                [nose_tip[0] - nostril_w, nose_tip[1] - 3, nose_tip[0] + nostril_w, nose_tip[1] + 3],
                0, 180, fill=stroke_color, width=stroke_width
            )
            draw.arc(
                [nose_tip[0] - nostril_w - 4, nose_tip[1] - 6, nose_tip[0] - nostril_w + 2, nose_tip[1] + 2],
                90, 270, fill=stroke_color, width=max(1, stroke_width - 1)
            )
            draw.arc(
                [nose_tip[0] + nostril_w - 2, nose_tip[1] - 6, nose_tip[0] + nostril_w + 4, nose_tip[1] + 2],
                270, 90, fill=stroke_color, width=max(1, stroke_width - 1)
            )

            # ── K. PHILTRUM (two short vertical lines from nose base to upper lip) ─
            phl_x_l = philtrum_pt[0] - int(resolution * 0.012)
            phl_x_r = philtrum_pt[0] + int(resolution * 0.012)
            draw.line([(phl_x_l, int(nose_tip[1] + resolution * 0.015)), (phl_x_l, mouth_center[1] - int(resolution * 0.01))],
                      fill=stroke_color, width=max(1, stroke_width - 1))
            draw.line([(phl_x_r, int(nose_tip[1] + resolution * 0.015)), (phl_x_r, mouth_center[1] - int(resolution * 0.01))],
                      fill=stroke_color, width=max(1, stroke_width - 1))

            # ── L. CUPID'S BOW (upper lip vermilion arc) ─────────────────────
            mouth_w = int(resolution * 0.07)
            cb_peak_l = (mouth_center[0] - int(mouth_w * 0.4), mouth_center[1] - int(resolution * 0.008))
            cb_peak_r = (mouth_center[0] + int(mouth_w * 0.4), mouth_center[1] - int(resolution * 0.008))
            cb_dip    = (mouth_center[0], mouth_center[1] - int(resolution * 0.003))
            mouth_l   = (mouth_center[0] - mouth_w, mouth_center[1])
            mouth_r   = (mouth_center[0] + mouth_w, mouth_center[1])
            # Upper lip: commissure → peak → dip → peak → commissure
            draw.line([mouth_l, cb_peak_l, cb_dip, cb_peak_r, mouth_r],
                      fill=stroke_color, width=stroke_width)
            # Lower lip line
            draw.line([mouth_l, mouth_center, mouth_r],
                      fill=stroke_color, width=stroke_width)

            # ── M. GLASSES ────────────────────────────────────────────────────
            if eyewear_token:
                gw_gl = int(resolution * 0.075)
                gh = int(resolution * 0.045) if not is_rectangular else int(resolution * 0.032)
                if is_aviator:
                    gh = int(resolution * 0.055)
                box_l = [left_eye_center[0]  - gw_gl, left_eye_center[1]  - gh,
                         left_eye_center[0]  + gw_gl, left_eye_center[1]  + gh]
                box_r = [right_eye_center[0] - gw_gl, right_eye_center[1] - gh,
                         right_eye_center[0] + gw_gl, right_eye_center[1] + gh]
                frame_radius = int(resolution * 0.008) if is_rectangular else int(resolution * 0.02)
                draw.rounded_rectangle(box_l, radius=frame_radius, outline=stroke_color, width=g_stroke)
                draw.rounded_rectangle(box_r, radius=frame_radius, outline=stroke_color, width=g_stroke)
                # Center bridge
                draw.line([(box_l[2], left_eye_center[1] - 2),
                           (box_r[0], right_eye_center[1] - 2)],
                          fill=stroke_color, width=max(2, stroke_width + 1))
                # Outer temple hinges
                draw.line([(box_l[0], left_eye_center[1] - 3),
                           (box_l[0] - int(resolution * 0.04), left_eye_center[1] - 5)],
                          fill=stroke_color, width=stroke_width)
                draw.line([(box_r[2], right_eye_center[1] - 3),
                           (box_r[2] + int(resolution * 0.04), right_eye_center[1] - 5)],
                          fill=stroke_color, width=stroke_width)
                if is_aviator:
                    draw.line([(left_eye_center[0] - gw_gl + 4, left_eye_center[1] - gh),
                               (right_eye_center[0] + gw_gl - 4, right_eye_center[1] - gh)],
                              fill=stroke_color, width=stroke_width)
                if is_browline:
                    draw.line([(box_l[0], box_l[1]), (box_l[2], box_l[1])], fill=stroke_color, width=stroke_width + 3)
                    draw.line([(box_r[0], box_r[1]), (box_r[2], box_r[1])], fill=stroke_color, width=stroke_width + 3)
                if is_sunglasses:
                    draw.rounded_rectangle([b + 1 for b in box_l[:2]] + [b - 1 for b in box_l[2:]],
                                           radius=frame_radius, fill=(120, 120, 120))
                    draw.rounded_rectangle([b + 1 for b in box_r[:2]] + [b - 1 for b in box_r[2:]],
                                           radius=frame_radius, fill=(120, 120, 120))

        return canvas

    def build_forensic_prompt(self, attributes: Dict[str, Any]) -> str:
        """Constructs a standardized forensic composite prompt from structured attributes."""
        prompt_parts = [
            "forensic facial composite portrait",
            "official police artist sketch",
            "monochrome graphite pencil drawing",
            "clean paper background",
            "neutral studio lighting",
            "demographically balanced facial proportions",
            "accurate facial features",
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

    def _render_procedural_sketch(
        self,
        conditioning_lineart: Image.Image,
        attributes: Dict[str, Any],
        resolution: int = 512,
        seed: int = 123456,
    ) -> Image.Image:
        """
        Renders a high-fidelity procedural forensic pencil sketch fallback
        when diffusion execution is deferred or GPU resources are constrained.
        Adds iris details, facial shading, hairline, and pencil graphite texture.
        """
        sketch = conditioning_lineart.copy().convert("RGB")
        draw = ImageDraw.Draw(sketch)
        rng = random.Random(seed)

        geometry = geometry_service.compute_anchors(attributes, resolution=resolution)
        anchors = geometry.anchors

        left_eye = (int(anchors.left_eye[0] * resolution), int(anchors.left_eye[1] * resolution))
        right_eye = (int(anchors.right_eye[0] * resolution), int(anchors.right_eye[1] * resolution))
        nose_tip = (int(anchors.nose_tip[0] * resolution), int(anchors.nose_tip[1] * resolution))
        mouth_center = (int(anchors.mouth[0] * resolution), int(anchors.mouth[1] * resolution))
        chin = (int(anchors.chin[0] * resolution), int(anchors.chin[1] * resolution))

        # 1. Pupils & irises
        iris_r = int(resolution * 0.018)
        pupil_r = int(resolution * 0.008)
        charcoal = (35, 35, 40)
        iris_shade = (90, 90, 95)
        for eye_c in (left_eye, right_eye):
            draw.ellipse([eye_c[0] - iris_r, eye_c[1] - iris_r, eye_c[0] + iris_r, eye_c[1] + iris_r], fill=iris_shade, outline=charcoal)
            draw.ellipse([eye_c[0] - pupil_r, eye_c[1] - pupil_r, eye_c[0] + pupil_r, eye_c[1] + pupil_r], fill=charcoal)
            # Catchlight
            draw.point((eye_c[0] - 2, eye_c[1] - 2), fill=(255, 255, 255))

        # 2. Nose bridge & nostril shading
        bridge_x = int((left_eye[0] + right_eye[0]) / 2)
        for i in range(12):
            sy = left_eye[1] + int((nose_tip[1] - left_eye[1]) * (i / 12))
            draw.line([(bridge_x - 6, sy), (bridge_x - 1, sy + 1)], fill=(180, 180, 185), width=1)

        # 3. Lips shading
        mouth_w = int(resolution * 0.07)
        draw.line([mouth_center[0] - mouth_w + 4, mouth_center[1] + 3, mouth_center[0] + mouth_w - 4, mouth_center[1] + 3], fill=(120, 120, 125), width=1)

        # 4. Hairline
        hairline_y = int(left_eye[1] - resolution * 0.18)
        draw.arc([bridge_x - int(resolution * 0.22), hairline_y - 20, bridge_x + int(resolution * 0.22), left_eye[1] + 10], 190, 350, fill=charcoal, width=max(2, int(resolution / 200)))

        # 5. Graphite paper texture simulation (subtle grain across canvas)
        pixels = sketch.load()
        if pixels is not None:
            for _ in range(int(resolution * resolution * 0.02)):
                rx = rng.randint(0, resolution - 1)
                ry = rng.randint(0, resolution - 1)
                orig = pixels[rx, ry]
                if orig[0] > 180:  # Only texture the light paper areas
                    jitter = rng.randint(-15, 0)
                    val = max(0, min(255, orig[0] + jitter))
                    pixels[rx, ry] = (val, val, val)

        return sketch

    def _run_hires_fix(
        self,
        pipe: Any,
        base_image: Image.Image,
        positive_prompt: str,
        negative_prompt: str,
        cfg_scale: float,
        seed: int,
        target_resolution: int = 768,
    ) -> Image.Image:
        """
        Optional hi-res fix pass for Master detail level.
        Upscales base 512×512 output via img2img at 768×768 with strength=0.35
        to sharpen fine details (iris striations, cross-hatching) without
        destroying the overall facial structure.
        """
        if StableDiffusionImg2ImgPipeline is None or torch is None:
            return base_image
        try:
            from diffusers import StableDiffusionImg2ImgPipeline as I2IPipe  # type: ignore[import-not-found]
            i2i_pipe = I2IPipe(
                vae=pipe.vae,
                text_encoder=pipe.text_encoder,
                tokenizer=pipe.tokenizer,
                unet=pipe.unet,
                scheduler=pipe.scheduler,
                safety_checker=None,
                feature_extractor=None,
                requires_safety_checker=False,
            )
            if torch.cuda.is_available():
                i2i_pipe.enable_model_cpu_offload()
                i2i_pipe.enable_attention_slicing()
            else:
                i2i_pipe = i2i_pipe.to("cpu")

            upscaled = base_image.resize((target_resolution, target_resolution), Image.LANCZOS)
            generator = torch.Generator(device="cpu").manual_seed(seed)
            p_embeds, n_embeds = self._encode_prompt_with_chunks(i2i_pipe, positive_prompt, negative_prompt)
            result = i2i_pipe(
                image=upscaled,
                prompt_embeds=p_embeds,
                negative_prompt_embeds=n_embeds,
                strength=0.28,
                num_inference_steps=20,
                guidance_scale=cfg_scale,
                generator=generator,
            )
            logger.info(f"Hi-res fix pass complete at {target_resolution}×{target_resolution}.")
            return result.images[0]
        except Exception as err:
            logger.warning(f"Hi-res fix pass failed ({err}); returning base image.")
            return base_image

    async def generate_sketch(
        self,
        case_id: str,
        witness_id: str,
        attributes: Dict[str, Any],
        seed: Optional[int] = None,
        resolution: int = 512,
        steps: int = 28,
        camera_angle: str = "frontal",
        sketch_style: str = "Forensic Graphite (Pencil)",
        age_group: str = "26-35",
        gender: str = "Male",
        ethnicity: Optional[str] = "Unspecified",
        lighting_mood: Optional[str] = "neutral_studio",
        detail_level: Optional[str] = "Standard",
        prompt: Optional[str] = None,
        positive_prompt: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        cfg_scale: float = 9.0,
        control_strength: float = 0.50,
    ) -> Dict[str, Any]:
        """
        Synthesizes a forensic composite sketch using the LLM-engineered prompt and Rank-32
        Dual-Dataset LoRA. No ControlNet/lineart conditioning is used — the camera perspective
        directive (frontal view) embedded in the positive prompt is sufficient to constrain
        the model's geometry. Style, biometric attributes, and corroborated attention weights
        are all injected through the text prompt.
        """
        generation_seed = seed if seed is not None else random.randint(100000, 999999)

        # Build LLM-engineered prompts (positive + negative)
        if not positive_prompt or not negative_prompt:
            from app.services.forensic_llm_engine import forensic_llm_engine
            analysis = forensic_llm_engine.analyze(
                attributes=attributes,
                sketch_style=sketch_style,
                camera_angle=camera_angle,
                age_group=age_group,
                gender=gender,
                ethnicity=ethnicity,
                lighting_mood=lighting_mood,
                detail_level=detail_level,
                witness_statement=prompt,
            )
            final_positive_prompt = analysis["positive_prompt"]
            final_negative_prompt = analysis["negative_prompt"]
            # Use per-style CFG from STYLE_CFG_TABLE, fall back to analysis value
            guidance = STYLE_CFG_TABLE.get(sketch_style, analysis.get("cfg_scale", cfg_scale))
            # Use per-style step count from STYLE_STEPS_TABLE
            _detail = detail_level or "Standard"
            inference_steps = STYLE_STEPS_TABLE.get(sketch_style, {}).get(_detail, analysis.get("steps", steps))
        else:
            final_positive_prompt = positive_prompt
            final_negative_prompt = negative_prompt
            guidance = STYLE_CFG_TABLE.get(sketch_style, cfg_scale)
            _detail = detail_level or "Standard"
            inference_steps = STYLE_STEPS_TABLE.get(sketch_style, {}).get(_detail, steps)

        # Procedural fallback blank canvas (used only if diffusion fails)
        fallback_canvas = Image.new("RGB", (resolution, resolution), color=(245, 245, 240))

        generated_image: Optional[Image.Image] = None
        try:
            pipe = self._ensure_pipeline()
            generator = torch.Generator(device="cpu").manual_seed(generation_seed) if torch is not None else None

            # Dynamic LoRA v3 adapter detection & upgrade:
            # If forensic_sketch_lora_v3.safetensors is available on disk and not yet active, upgrade immediately.
            v3_candidates = [
                self.sd_model_path.parent / "lora" / "forensic_sketch_lora_v3.safetensors",
                Path("models/lora/forensic_sketch_lora_v3.safetensors"),
                Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora_v3.safetensors",
            ]
            v3_path = next((p for p in v3_candidates if p.exists()), None)
            if v3_path and self._lora_version != "v3":
                try:
                    if self._lora_active:
                        pipe.unload_lora_weights()
                    pipe.load_lora_weights(str(v3_path.parent), weight_name=v3_path.name)
                    self._lora_active = True
                    self._lora_version = "v3"
                    logger.info(f"Dynamically upgraded active LoRA adapter to multimodal v3 from {v3_path}")
                except Exception as up_err:
                    logger.warning(f"Could not load LoRA v3: {up_err}")

            # Style-aware LoRA adapter management:
            # - If LoRA v3 is loaded (multimodal: monochrome + color): Keep LoRA active for ALL styles
            # - If legacy LoRA (v1/v2 monochrome only): Unload sketch LoRA for Color Age-Progressed
            is_color_style = bool("color" in sketch_style.lower() or "age-progressed" in sketch_style.lower())
            if is_color_style:
                if self._lora_active and self._lora_version not in ("v3",):
                    try:
                        pipe.unload_lora_weights()
                        self._lora_active = False
                        logger.info("Deactivated legacy monochrome LoRA weights for Color Age-Progressed synthesis.")
                    except Exception:
                        pass
                elif not self._lora_active and self._lora_version == "v3" and v3_path:
                    try:
                        pipe.load_lora_weights(str(v3_path.parent), weight_name=v3_path.name)
                        self._lora_active = True
                        logger.info("Re-activated multimodal LoRA v3 for Color Age-Progressed synthesis.")
                    except Exception:
                        pass
            else:
                if not self._lora_active:
                    lora_candidates = [
                        self.sd_model_path.parent / "lora" / "forensic_sketch_lora_v3.safetensors",
                        self.sd_model_path.parent / "lora" / "forensic_sketch_lora_v2.safetensors",
                        self.sd_model_path.parent / "lora" / "forensic_sketch_lora.safetensors",
                        Path("models/lora/forensic_sketch_lora_v3.safetensors"),
                        Path("models/lora/forensic_sketch_lora_v2.safetensors"),
                        Path("models/lora/forensic_sketch_lora.safetensors"),
                        Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora_v3.safetensors",
                        Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora_v2.safetensors",
                        Path(__file__).resolve().parents[3] / "models" / "lora" / "forensic_sketch_lora.safetensors",
                    ]
                    for lp in lora_candidates:
                        if lp.exists():
                            try:
                                pipe.load_lora_weights(str(lp.parent), weight_name=lp.name)
                                self._lora_active = True
                                self._lora_version = "v3" if "v3" in lp.name else ("v2" if "v2" in lp.name else "v1")
                                logger.info(f"Activated trained forensic LoRA weights ({self._lora_version}) from {lp}")
                                break
                            except Exception:
                                try:
                                    pipe.load_lora_weights(str(lp.parent))
                                    self._lora_active = True
                                    self._lora_version = "v3" if "v3" in lp.name else ("v2" if "v2" in lp.name else "v1")
                                    logger.info(f"Activated trained forensic LoRA adapter from {lp.parent}")
                                    break
                                except Exception:
                                    pass

            is_black_bg = bool(
                attributes.get("_black_background")
                or "black background" in sketch_style.lower()
                or "inversion" in sketch_style.lower()
                or "chalkboard" in sketch_style.lower()
            )
            lora_scale = 1.0 if is_black_bg else (0.80 if is_color_style else (0.85 if "charcoal" in sketch_style.lower() else 0.90))

            if torch is not None and torch.cuda.is_available():
                torch.cuda.empty_cache()

            # Clamp base diffusion resolution to 512 native to avoid multi-head latent splitting
            base_resolution = min(resolution, 512)

            if self._controlnet_active:
                logger.info(
                    f"Running diffusion inference (ControlNet Lineart active): case={case_id}, witness={witness_id}, "
                    f"seed={generation_seed}, steps={inference_steps}, angle={camera_angle}, style={sketch_style}, "
                    f"control_scale={control_strength}, cfg={guidance}, lora_scale={lora_scale}, res={base_resolution}",
                    extra={"endpoint": "/api/v1/sketch/generate"},
                )
            else:
                logger.info(
                    f"Running diffusion inference (vanilla SD): case={case_id}, witness={witness_id}, "
                    f"seed={generation_seed}, steps={inference_steps}, angle={camera_angle}, style={sketch_style}, "
                    f"cfg={guidance}, lora_scale={lora_scale}, res={base_resolution}",
                    extra={"endpoint": "/api/v1/sketch/generate"},
                )

            prompt_embeds, negative_prompt_embeds = self._encode_prompt_with_chunks(
                pipe=pipe,
                prompt=final_positive_prompt,
                negative_prompt=final_negative_prompt,
            )

            pipe_kwargs: Dict[str, Any] = {
                "prompt_embeds": prompt_embeds,
                "negative_prompt_embeds": negative_prompt_embeds,
                "num_inference_steps": inference_steps,
                "guidance_scale": guidance,
                "height": base_resolution,
                "width": base_resolution,
                "generator": generator,
            }
            if self._lora_active and (not is_color_style or self._lora_version == "v3"):
                pipe_kwargs["cross_attention_kwargs"] = {"scale": lora_scale}

            if self._controlnet_active:
                try:
                    conditioning_lineart = self.create_conditioning_lineart(
                        attributes=attributes,
                        resolution=base_resolution,
                        camera_angle=camera_angle,
                    )
                    cnet_kwargs = dict(pipe_kwargs)
                    cnet_kwargs["image"] = conditioning_lineart
                    cnet_kwargs["controlnet_conditioning_scale"] = float(control_strength)
                    output = pipe(**cnet_kwargs)
                except Exception as cnet_runtime_err:
                    logger.warning(
                        f"ControlNet inference runtime failure or OOM ({cnet_runtime_err}). Falling back to vanilla SD pipeline."
                    )
                    if torch is not None and torch.cuda.is_available():
                        torch.cuda.empty_cache()
                    self._pipe = None
                    self._controlnet_active = False
                    vanilla_pipe = self._ensure_pipeline()
                    output = vanilla_pipe(**pipe_kwargs)
            else:
                output = pipe(**pipe_kwargs)

            generated_image = output.images[0]

            # Hi-res fix pass for Master detail level (768×768 refinement)
            if detail_level == "Master":
                logger.info("Running hi-res fix pass at 768×768 for Master detail level...")
                generated_image = self._run_hires_fix(
                    pipe=pipe,
                    base_image=generated_image,
                    positive_prompt=final_positive_prompt,
                    negative_prompt=final_negative_prompt,
                    cfg_scale=guidance,
                    seed=generation_seed,
                    target_resolution=768,
                )

        except Exception as err:
            logger.error(
                f"Diffusion pipeline execution encountered ({err}); using resilient procedural sketch synthesis fallback.",
                exc_info=True,
                extra={"endpoint": "/api/v1/sketch/generate"},
            )
            try:
                anatomical_lineart = self.create_conditioning_lineart(
                    attributes=attributes,
                    resolution=resolution,
                    camera_angle=camera_angle,
                )
            except Exception:
                anatomical_lineart = fallback_canvas

            generated_image = self._render_procedural_sketch(
                conditioning_lineart=anatomical_lineart,
                attributes=attributes,
                resolution=resolution,
                seed=generation_seed,
            )

        # Save output image
        case_dir = self.output_dir / case_id
        case_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{witness_id}_{generation_seed}.png"
        output_file = case_dir / filename
        generated_image.save(output_file, format="PNG")

        # Save intermediate artifacts for debugging and audit
        try:
            sketches_dir = self.output_dir / "sketches"
            sketches_dir.mkdir(parents=True, exist_ok=True)
            generated_image.save(sketches_dir / f"{case_id}_{witness_id}_{generation_seed}.png", format="PNG")

            meta_dir = self.output_dir / "metadata"
            meta_dir.mkdir(parents=True, exist_ok=True)
            import json
            import time
            meta_payload = {
                "case_id": case_id,
                "witness_id": witness_id,
                "seed": generation_seed,
                "steps": steps,
                "resolution": resolution,
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
