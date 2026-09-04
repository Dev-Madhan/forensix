from typing import Any, Dict
from app.schemas.geometry import NormalizedGeometry, NormalizedAnchors, CanvasSize


class GeometryService:
    """
    Translates semantic facial attributes (eyes, nose, mouth, jaw) into normalized
    2D/3D coordinate anchors for ControlNet Lineart guidance.
    Complies with Section 5 of the Forensix AI Integration Guide.
    """

    def compute_anchors(self, attributes: Dict[str, Any], resolution: int = 512) -> NormalizedGeometry:
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


geometry_service = GeometryService()
