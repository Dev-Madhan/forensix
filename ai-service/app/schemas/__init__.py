"""Pydantic schemas for request validation and response serialization."""

from app.schemas.common import ErrorResponse, ErrorDetail
from app.schemas.geometry import CanvasSize, NormalizedAnchors, NormalizedGeometry
from app.schemas.witness import WitnessProcessRequest, WitnessProcessResponse
from app.schemas.sketch import SketchGenerateRequest, SketchGenerateResponse, SketchImage
from app.schemas.recognition import RecognitionSearchRequest, RecognitionSearchResponse

__all__ = [
    "ErrorResponse",
    "ErrorDetail",
    "CanvasSize",
    "NormalizedAnchors",
    "NormalizedGeometry",
    "WitnessProcessRequest",
    "WitnessProcessResponse",
    "SketchGenerateRequest",
    "SketchGenerateResponse",
    "SketchImage",
    "RecognitionSearchRequest",
    "RecognitionSearchResponse",
]
