import os
from pathlib import Path
from typing import Any, Dict, Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.schemas.geometry import NormalizedGeometry, NormalizedAnchors, CanvasSize

settings = get_settings()


class GeometryService:
    """
    Translates semantic facial attribute tokens (from facial-dataset-data.ts)
    into normalized 2D coordinate anchors for ControlNet Lineart guidance.
    Tokens like 'wide_set_eyes', 'oblong_face_shape', 'aquiline_roman_nose' etc.
    are mapped directly to landmark adjustments.
    """

    def __init__(self):
        self._landmarker: Any = None
        self._mediapipe_checked: bool = False

    def compute_anchors(self, attributes: Dict[str, Any], resolution: int = 512) -> NormalizedGeometry:
        """
        Deterministic normalized geometry anchors computed from structured facial attribute tokens.
        All values are normalized 0.0-1.0 fractions of the canvas dimension.
        """
        # ── Baseline forensic portrait anchors ────────────────────────────────
        left_eye  = [0.36, 0.40]
        right_eye = [0.64, 0.40]
        nose_tip  = [0.50, 0.57]
        mouth     = [0.50, 0.70]
        chin      = [0.50, 0.84]

        # ── Helper: collect all token values from flat attribute dict ─────────
        all_tokens = set()
        for k, v in attributes.items():
            if isinstance(v, str):
                # handle both "almond_eyes" style and "_feature_tokens" list
                for tok in v.split(", "):
                    all_tokens.add(tok.strip())

        def has(*tokens):
            return any(t in all_tokens for t in tokens)

        # ── Eye Spacing ────────────────────────────────────────────────────────
        if has("close_set_eyes"):
            left_eye[0]  += 0.025
            right_eye[0] -= 0.025
        elif has("wide_set_eyes"):
            left_eye[0]  -= 0.025
            right_eye[0] += 0.025

        # ── Eye Vertical Position ──────────────────────────────────────────────
        if has("upturned_eyes"):
            left_eye[1]  -= 0.005
            right_eye[1] -= 0.005
        elif has("downturned_eyes"):
            left_eye[1]  += 0.005
            right_eye[1] += 0.005

        # ── Eye Size (affects orbit radius used by draw code) ─────────────────
        # (passed via metadata; geometry anchors are eye centers)

        # ── Nose Position ─────────────────────────────────────────────────────
        if has("upturned_nose", "pointed_nose", "rounded_nose"):
            nose_tip[1] -= 0.015   # shorter / upturned
        elif has("aquiline_roman_nose", "hawk_beaked_nose"):
            nose_tip[1] += 0.018   # longer / prominent
        elif has("broad_nose", "bulbous_fleshy_nose"):
            nose_tip[1] += 0.010   # slightly lower/wider

        # ── Face Shape → Chin Drop ────────────────────────────────────────────
        face = attributes.get("face_shape", "")
        if has("oblong_face_shape") or "oblong" in face:
            chin[1] += 0.025
        elif has("round_face_shape") or "round" in face:
            chin[1] -= 0.018
        elif has("heart_face_shape") or "heart" in face:
            chin[1] += 0.012   # long narrow chin
        elif has("square_face_shape") or "square" in face:
            chin[1] -= 0.005   # slightly shorter

        # ── Chin → Chin Position Fine-Tune ────────────────────────────────────
        if has("receding_chin", "narrow_chin"):
            chin[1] -= 0.010
        elif has("broad_chin", "square_chin"):
            chin[1] += 0.008

        # ── Mouth Position tracks chin ─────────────────────────────────────────
        # Keep mouth proportionally above the chin
        mouth[1] = chin[1] - 0.14

        return NormalizedGeometry(
            canvas=CanvasSize(width=resolution, height=resolution),
            anchors=NormalizedAnchors(
                left_eye=left_eye,
                right_eye=right_eye,
                nose_tip=nose_tip,
                mouth=mouth,
                chin=chin,
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
