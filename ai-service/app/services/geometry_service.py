import os
from pathlib import Path
from typing import Any, Dict, Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.schemas.geometry import NormalizedGeometry, NormalizedAnchors, CanvasSize

settings = get_settings()


class GeometryService:
    """
    Translates semantic facial attribute tokens into normalized 2D coordinate anchors
    for lineart guidance and conditioning.

    v2 changes:
    - Extended NormalizedAnchors: nasion, brow ridges, cheekbones, philtrum,
      ear attachment points, clavicle line, facial thirds y-coordinates
    - Token-driven adjustments cascade correctly to derived points
    """

    def __init__(self):
        self._landmarker: Any = None
        self._mediapipe_checked: bool = False

    def compute_anchors(
        self,
        attributes: Dict[str, Any],
        resolution: int = 512,
        camera_angle: str = "frontal",
    ) -> NormalizedGeometry:
        """
        Deterministic normalized geometry anchors computed from structured facial attribute tokens
        and camera perspective angle (frontal, three_quarter, profile).
        All values are normalized 0.0–1.0 fractions of the canvas dimension.
        """
        # ── Baseline forensic portrait anchors by perspective ─────────────────
        if camera_angle == "profile":
            left_eye         = [0.48, 0.40]
            right_eye        = [0.48, 0.40]   # Single visible eye in profile
            nose_tip         = [0.68, 0.55]
            mouth            = [0.62, 0.69]
            chin             = [0.63, 0.83]
            nasion           = [0.56, 0.33]
            brow_ridge_left  = [0.48, 0.35]
            brow_ridge_right = [0.48, 0.35]
            cheekbone_left   = [0.45, 0.50]
            cheekbone_right  = [0.58, 0.50]
            philtrum         = [0.64, 0.64]
            ear_left_top     = [0.28, 0.37]
            ear_left_bot     = [0.28, 0.57]
            ear_right_top    = [0.28, 0.37]
            ear_right_bot    = [0.28, 0.57]
            clavicle_left    = [0.22, 0.97]
            clavicle_right   = [0.55, 0.97]
        elif camera_angle == "three_quarter":
            left_eye         = [0.38, 0.40]
            right_eye        = [0.61, 0.41]
            nose_tip         = [0.55, 0.57]
            mouth            = [0.53, 0.70]
            chin             = [0.52, 0.84]
            nasion           = [0.50, 0.33]
            brow_ridge_left  = [0.38, 0.35]
            brow_ridge_right = [0.61, 0.36]
            cheekbone_left   = [0.28, 0.52]
            cheekbone_right  = [0.70, 0.52]
            philtrum         = [0.54, 0.65]
            ear_left_top     = [0.22, 0.37]
            ear_left_bot     = [0.22, 0.57]
            ear_right_top    = [0.76, 0.38]
            ear_right_bot    = [0.76, 0.58]
            clavicle_left    = [0.28, 0.97]
            clavicle_right   = [0.72, 0.97]
        else:
            # Symmetrical 0° frontal mugshot
            left_eye         = [0.36, 0.40]
            right_eye        = [0.64, 0.40]
            nose_tip         = [0.50, 0.58]
            mouth            = [0.50, 0.70]
            chin             = [0.50, 0.86]
            nasion           = [0.50, 0.32]
            brow_ridge_left  = [0.36, 0.36]
            brow_ridge_right = [0.64, 0.36]
            cheekbone_left   = [0.24, 0.52]
            cheekbone_right  = [0.76, 0.52]
            philtrum         = [0.50, 0.65]
            ear_left_top     = [0.17, 0.37]
            ear_left_bot     = [0.17, 0.57]
            ear_right_top    = [0.83, 0.37]
            ear_right_bot    = [0.83, 0.57]
            clavicle_left    = [0.30, 0.97]
            clavicle_right   = [0.70, 0.97]

        # Facial thirds y-coordinates (span full canvas width)
        thirds_hairline_y  = 0.18
        thirds_brow_y      = 0.38
        thirds_nose_base_y = 0.62

        # ── Helper: collect all token values ──────────────────────────────────
        all_tokens: set = set()
        for k, v in attributes.items():
            if isinstance(v, str):
                for tok in v.split(","):
                    t = tok.strip().lower()
                    all_tokens.add(t)
            elif isinstance(v, dict):
                for subk, subv in v.items():
                    if isinstance(subv, str):
                        for tok in subv.split(","):
                            t = tok.strip().lower()
                            all_tokens.add(t)
                            if k == "eyes" or "eye" in subk:
                                all_tokens.add(f"{t}_set_eyes")
                            all_tokens.add(f"{t}_{subk.lower()}")
                            all_tokens.add(f"{k.lower()}_{subk.lower()}_{t}")

        def has(*tokens):
            return any(t in all_tokens for t in tokens)

        # ── Eye Spacing (frontal/3/4 only) ────────────────────────────────────
        if camera_angle != "profile":
            eyes_attr = attributes.get("eyes", {})
            eyes_spacing = eyes_attr.get("spacing") if isinstance(eyes_attr, dict) else None
            if has("close_set_eyes") or eyes_spacing in ("close", "narrow"):
                left_eye[0]          += 0.025
                right_eye[0]         -= 0.025
                brow_ridge_left[0]   += 0.025
                brow_ridge_right[0]  -= 0.025
            elif has("wide_set_eyes") or eyes_spacing == "wide":
                left_eye[0]          -= 0.025
                right_eye[0]         += 0.025
                brow_ridge_left[0]   -= 0.025
                brow_ridge_right[0]  += 0.025

        # ── Eye Vertical Position ─────────────────────────────────────────────
        if has("upturned_eyes"):
            left_eye[1]  -= 0.005
            right_eye[1] -= 0.005
        elif has("downturned_eyes"):
            left_eye[1]  += 0.005
            right_eye[1] += 0.005

        # ── Deep-set eyes: brow ridge closer to eye ───────────────────────────
        if has("deep_set_eyes"):
            brow_ridge_left[1]  = left_eye[1]  - 0.025
            brow_ridge_right[1] = right_eye[1] - 0.025

        # ── High/Low hairline → thirds adjustment ─────────────────────────────
        if has("low_hairline", "slightly_low_hairline"):
            thirds_hairline_y -= 0.03
        elif has("high_hairline"):
            thirds_hairline_y += 0.04

        # ── High cheekbones: move cheekbone anchors upward ────────────────────
        if has("high_cheekbones"):
            cheekbone_left[1]  -= 0.02
            cheekbone_right[1] -= 0.02

        # ── Nose Position & Projection ────────────────────────────────────────
        if has("upturned_nose", "pointed_nose", "rounded_nose", "slightly_upturned_tip"):
            nose_tip[1] -= 0.015
            if camera_angle == "profile":
                nose_tip[0] -= 0.02
        elif has("aquiline_roman_nose", "hawk_beaked_nose"):
            nose_tip[1] += 0.018
            if camera_angle == "profile":
                nose_tip[0] += 0.03
        elif has("broad_nose", "bulbous_fleshy_nose"):
            nose_tip[1] += 0.010

        # Nasion tracks nose_tip horizontally
        nasion[0] = nose_tip[0]

        # ── Face Shape → Chin Drop ────────────────────────────────────────────
        face = attributes.get("face_shape", "")
        if has("oblong_face_shape") or "oblong" in face:
            chin[1] += 0.025
            thirds_nose_base_y += 0.010
        elif has("round_face_shape") or "round" in face:
            chin[1] -= 0.018
        elif has("heart_face_shape") or "heart" in face:
            chin[1] += 0.012
        elif has("square_face_shape") or "square" in face:
            chin[1] -= 0.005

        # ── Chin Fine-Tune ────────────────────────────────────────────────────
        if has("receding_chin", "narrow_chin"):
            chin[1] -= 0.010
            if camera_angle == "profile":
                chin[0] -= 0.03
        elif has("broad_chin", "square_chin", "moderately_prominent_chin"):
            chin[1] += 0.008
            if camera_angle == "profile":
                chin[0] += 0.02

        # ── Mouth & Philtrum track chin ───────────────────────────────────────
        mouth[1]    = chin[1] - 0.16
        philtrum[1] = mouth[1] - 0.05
        thirds_nose_base_y = max(thirds_nose_base_y, nose_tip[1] + 0.03)

        return NormalizedGeometry(
            canvas=CanvasSize(width=resolution, height=resolution),
            anchors=NormalizedAnchors(
                left_eye=left_eye,
                right_eye=right_eye,
                nose_tip=nose_tip,
                mouth=mouth,
                chin=chin,
                nasion=nasion,
                brow_ridge_left=brow_ridge_left,
                brow_ridge_right=brow_ridge_right,
                cheekbone_left=cheekbone_left,
                cheekbone_right=cheekbone_right,
                philtrum=philtrum,
                ear_left_top=ear_left_top,
                ear_left_bot=ear_left_bot,
                ear_right_top=ear_right_top,
                ear_right_bot=ear_right_bot,
                clavicle_left=clavicle_left,
                clavicle_right=clavicle_right,
                thirds_hairline_y=thirds_hairline_y,
                thirds_brow_y=thirds_brow_y,
                thirds_nose_base_y=thirds_nose_base_y,
            ),
        )

    def compute_anchors_v2(
        self,
        schema: Any,
        resolution: int = 512,
        camera_angle: str = "frontal",
    ) -> NormalizedGeometry:
        """
        Forensic Geometry Engine v2.0.
        Computes anchor coordinates with confidence weighting and normalized domain values
        from ForensicAttributeSchemaV2.
        """
        from app.schemas.taxonomy import ForensicAttributeSchemaV2

        if isinstance(schema, ForensicAttributeSchemaV2):
            v2_schema = schema
        elif isinstance(schema, dict):
            v2_schema = ForensicAttributeSchemaV2.from_v1_dict(schema)
        else:
            v2_schema = ForensicAttributeSchemaV2()

        # ── Baseline forensic portrait anchors by perspective ─────────────────
        if camera_angle == "profile":
            left_eye         = [0.48, 0.40]
            right_eye        = [0.48, 0.40]
            nose_tip         = [0.68, 0.55]
            mouth            = [0.62, 0.69]
            chin             = [0.63, 0.83]
            nasion           = [0.56, 0.33]
            brow_ridge_left  = [0.48, 0.35]
            brow_ridge_right = [0.48, 0.35]
            cheekbone_left   = [0.45, 0.50]
            cheekbone_right  = [0.58, 0.50]
            philtrum         = [0.64, 0.64]
            ear_left_top     = [0.28, 0.37]
            ear_left_bot     = [0.28, 0.57]
            ear_right_top    = [0.28, 0.37]
            ear_right_bot    = [0.28, 0.57]
            clavicle_left    = [0.22, 0.97]
            clavicle_right   = [0.55, 0.97]
        elif camera_angle == "three_quarter":
            left_eye         = [0.38, 0.40]
            right_eye        = [0.61, 0.41]
            nose_tip         = [0.55, 0.57]
            mouth            = [0.53, 0.70]
            chin             = [0.52, 0.84]
            nasion           = [0.50, 0.33]
            brow_ridge_left  = [0.38, 0.35]
            brow_ridge_right = [0.61, 0.36]
            cheekbone_left   = [0.28, 0.52]
            cheekbone_right  = [0.70, 0.52]
            philtrum         = [0.54, 0.65]
            ear_left_top     = [0.22, 0.37]
            ear_left_bot     = [0.22, 0.57]
            ear_right_top    = [0.76, 0.38]
            ear_right_bot    = [0.76, 0.58]
            clavicle_left    = [0.28, 0.97]
            clavicle_right   = [0.72, 0.97]
        else:
            left_eye         = [0.36, 0.40]
            right_eye        = [0.64, 0.40]
            nose_tip         = [0.50, 0.58]
            mouth            = [0.50, 0.70]
            chin             = [0.50, 0.86]
            nasion           = [0.50, 0.32]
            brow_ridge_left  = [0.36, 0.36]
            brow_ridge_right = [0.64, 0.36]
            cheekbone_left   = [0.24, 0.52]
            cheekbone_right  = [0.76, 0.52]
            philtrum         = [0.50, 0.65]
            ear_left_top     = [0.17, 0.37]
            ear_left_bot     = [0.17, 0.57]
            ear_right_top    = [0.83, 0.37]
            ear_right_bot    = [0.83, 0.57]
            clavicle_left    = [0.30, 0.97]
            clavicle_right   = [0.70, 0.97]

        thirds_hairline_y  = 0.18
        thirds_brow_y      = 0.38
        thirds_nose_base_y = 0.62

        # ── Eye Spacing with confidence weighting ─────────────────────────────
        if camera_angle != "profile":
            spacing_attr = v2_schema.get_attr("eyes", "spacing")
            if spacing_attr and spacing_attr.source != "unknown":
                conf = spacing_attr.confidence
                val = spacing_attr.normalized or spacing_attr.value
                if val in ("close", "narrow"):
                    delta = 0.025 * conf
                    left_eye[0] += delta
                    right_eye[0] -= delta
                    brow_ridge_left[0] += delta
                    brow_ridge_right[0] -= delta
                elif val == "wide":
                    delta = 0.025 * conf
                    left_eye[0] -= delta
                    right_eye[0] += delta
                    brow_ridge_left[0] -= delta
                    brow_ridge_right[0] += delta

        # ── Eye Vertical Tilt ─────────────────────────────────────────────────
        tilt_attr = v2_schema.get_attr("eyes", "tilt")
        if tilt_attr and tilt_attr.source != "unknown":
            conf = tilt_attr.confidence
            val = tilt_attr.normalized or tilt_attr.value
            if val in ("upward", "upturned"):
                left_eye[1] -= 0.005 * conf
                right_eye[1] -= 0.005 * conf
            elif val in ("downward", "downturned"):
                left_eye[1] += 0.005 * conf
                right_eye[1] += 0.005 * conf

        # ── Cheekbones ────────────────────────────────────────────────────────
        cheek_attr = v2_schema.get_attr("face", "cheekbones")
        if cheek_attr and cheek_attr.source != "unknown":
            conf = cheek_attr.confidence
            val = cheek_attr.normalized or cheek_attr.value
            if val in ("high", "prominent"):
                cheekbone_left[1] -= 0.02 * conf
                cheekbone_right[1] -= 0.02 * conf

        # ── Nose Tip & Projection ─────────────────────────────────────────────
        tip_attr = v2_schema.get_attr("nose", "tip")
        if tip_attr and tip_attr.source != "unknown":
            conf = tip_attr.confidence
            val = tip_attr.normalized or tip_attr.value
            if val in ("pointed", "upturned", "rounded"):
                nose_tip[1] -= 0.015 * conf
                if camera_angle == "profile":
                    nose_tip[0] -= 0.02 * conf
            elif val in ("bulbous", "broad"):
                nose_tip[1] += 0.010 * conf

        # ── Face Shape & Chin ─────────────────────────────────────────────────
        shape_attr = v2_schema.get_attr("face", "face_shape")
        if shape_attr and shape_attr.source != "unknown":
            conf = shape_attr.confidence
            val = shape_attr.normalized or shape_attr.value
            if val in ("oblong", "long"):
                chin[1] += 0.025 * conf
                thirds_nose_base_y += 0.010 * conf
            elif val == "round":
                chin[1] -= 0.018 * conf
            elif val == "heart":
                chin[1] += 0.012 * conf
            elif val == "square":
                chin[1] -= 0.005 * conf

        chin_attr = v2_schema.get_attr("chin", "shape")
        if chin_attr and chin_attr.source != "unknown":
            conf = chin_attr.confidence
            val = chin_attr.normalized or chin_attr.value
            if val in ("receding", "narrow"):
                chin[1] -= 0.010 * conf
                if camera_angle == "profile":
                    chin[0] -= 0.03 * conf
            elif val in ("broad", "square", "protruding"):
                chin[1] += 0.008 * conf
                if camera_angle == "profile":
                    chin[0] += 0.02 * conf

        mouth[1] = chin[1] - 0.16
        philtrum[1] = mouth[1] - 0.05
        nasion[0] = nose_tip[0]
        thirds_nose_base_y = max(thirds_nose_base_y, nose_tip[1] + 0.03)

        return NormalizedGeometry(
            canvas=CanvasSize(width=resolution, height=resolution),
            anchors=NormalizedAnchors(
                left_eye=left_eye,
                right_eye=right_eye,
                nose_tip=nose_tip,
                mouth=mouth,
                chin=chin,
                nasion=nasion,
                brow_ridge_left=brow_ridge_left,
                brow_ridge_right=brow_ridge_right,
                cheekbone_left=cheekbone_left,
                cheekbone_right=cheekbone_right,
                philtrum=philtrum,
                ear_left_top=ear_left_top,
                ear_left_bot=ear_left_bot,
                ear_right_top=ear_right_top,
                ear_right_bot=ear_right_bot,
                clavicle_left=clavicle_left,
                clavicle_right=clavicle_right,
                thirds_hairline_y=thirds_hairline_y,
                thirds_brow_y=thirds_brow_y,
                thirds_nose_base_y=thirds_nose_base_y,
            ),
        )

    def is_mediapipe_available(self) -> bool:
        task_path = Path(settings.MEDIAPIPE_MODEL_PATH)
        if not task_path.exists():
            return False
        try:
            import mediapipe as mp  # noqa: F401
            return True
        except ImportError:
            return False

    def get_landmarker(self) -> Optional[Any]:
        if self._landmarker is not None:
            return self._landmarker
        if self._mediapipe_checked:
            return None
        self._mediapipe_checked = True
        task_path = Path(settings.MEDIAPIPE_MODEL_PATH)
        if not task_path.exists():
            logger.info(f"MediaPipe task model not found at {task_path}. Heuristic geometry active.")
            return None
        try:
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision
            base_options = python.BaseOptions(model_asset_path=str(task_path))
            options = vision.FaceLandmarkerOptions(
                base_options=base_options, num_faces=1,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
            )
            self._landmarker = vision.FaceLandmarker.create_from_options(options)
            logger.info("MediaPipe Face Landmarker initialized.")
            return self._landmarker
        except ImportError:
            return None
        except Exception as e:
            logger.warning(f"MediaPipe init failed: {e}")
            return None


geometry_service = GeometryService()
