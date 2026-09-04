from typing import Dict, List
from pydantic import BaseModel, Field


class CanvasSize(BaseModel):
    width: int = Field(512, description="Canvas pixel width")
    height: int = Field(512, description="Canvas pixel height")


class NormalizedAnchors(BaseModel):
    left_eye: List[float] = Field([0.36, 0.40], description="[x, y] normalized coordinate")
    right_eye: List[float] = Field([0.64, 0.40], description="[x, y] normalized coordinate")
    nose_tip: List[float] = Field([0.50, 0.58], description="[x, y] normalized coordinate")
    mouth: List[float] = Field([0.50, 0.70], description="[x, y] normalized coordinate")
    chin: List[float] = Field([0.50, 0.86], description="[x, y] normalized coordinate")


class NormalizedGeometry(BaseModel):
    canvas: CanvasSize = Field(default_factory=CanvasSize)
    anchors: NormalizedAnchors = Field(default_factory=NormalizedAnchors)
    control_points: Dict[str, List[float]] = Field(
        default_factory=dict,
        description="Fine-grained MediaPipe or heuristic landmark offsets",
    )
