import os
from pathlib import Path
from typing import Any, Dict, Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.schemas.geometry import NormalizedGeometry, NormalizedAnchors, CanvasSize

settings = get_settings()


class GeometryService:
    """
    Translates semantic facial attributes (eyes, nose, mouth, jaw) into normalized
    2D/3D coordinate anchors for ControlNet Lineart guidance.
    Complies with Sections 13 and 19 of the Forensix AI Integration Guide.
    """

    def __init__(self):
        self._landmarker: Any = None
        self._mediapipe_checked: bool = False

    def compute_anchors(self, attributes: Dict[str, Any], resolution: int = 512) -> NormalizedGeometry:
        """
        Deterministic normalized geometry anchors computed from structured facial attributes.
        Adheres to Section 13 controlled vocabulary and coordinate anchors.
        """
        # Standard baseline normalized coordinates from guide
        left_eye = [0.36, 0.40]
        right_eye = [0.64, 0.40]
        nose_tip = [0.50, 0.58]
        mouth = [0.50, 0.70]
        chin = [0.50, 0.86]

        # Adjust eye spacing if specified
        eyes = attributes.get("eyes", {})
        if isinstance(eyes, dict):
            spacing = eyes.get("spacing", "normal")
            if spacing == "wide":
                left_eye[0] -= 0.02
                right_eye[0] += 0.02
            elif spacing == "close":
                left_eye[0] += 0.02
                right_eye[0] -= 0.02

        # Adjust nose length if specified
        nose = attributes.get("nose", {})
        if isinstance(nose, dict):
            length = nose.get("length", "medium")
            if length == "long":
                nose_tip[1] += 0.02
            elif length == "short":
                nose_tip[1] -= 0.02

        # Adjust chin position if specified
        face_shape = attributes.get("face_shape", "oval")
        if face_shape == "oblong":
            chin[1] += 0.02
        elif face_shape == "round":
            chin[1] -= 0.02

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
        """Checks if MediaPipe and its model asset are ready for structural conditioning."""
        task_path = Path(settings.MEDIAPIPE_MODEL_PATH)
        if not task_path.exists():
            return False
        try:
            import mediapipe as mp  # noqa: F401
            return True
        except ImportError:
            return False

    def get_landmarker(self) -> Optional[Any]:
        """
        Lazily initializes the MediaPipe Face Landmarker model asset if installed.
        Complies with Section 19 of the Forensix AI Integration Guide.
        """
        if self._landmarker is not None:
            return self._landmarker

        if self._mediapipe_checked:
            return None

        self._mediapipe_checked = True
        task_path = Path(settings.MEDIAPIPE_MODEL_PATH)

        if not task_path.exists():
            logger.info(f"MediaPipe task model not found at {task_path}. Heuristic geometry fallback active.")
            return None

        try:
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            base_options = python.BaseOptions(model_asset_path=str(task_path))
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                num_faces=1,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
            )
            self._landmarker = vision.FaceLandmarker.create_from_options(options)
            logger.info("MediaPipe Face Landmarker initialized successfully.")
            return self._landmarker
        except ImportError:
            logger.info("MediaPipe not installed in environment; using heuristic geometry fallback.")
            return None
        except Exception as e:
            logger.warning(f"Could not initialize MediaPipe Face Landmarker: {e}; falling back to heuristic geometry.")
            return None


geometry_service = GeometryService()
