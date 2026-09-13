from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CanvasSize(BaseModel):
    width: int = Field(512, description="Canvas pixel width")
    height: int = Field(512, description="Canvas pixel height")


class NormalizedAnchors(BaseModel):
    """Extended forensic facial landmark set for richer lineart conditioning."""
    # Core landmarks (original)
    left_eye: List[float] = Field([0.36, 0.40], description="[x, y] normalized coordinate")
    right_eye: List[float] = Field([0.64, 0.40], description="[x, y] normalized coordinate")
    nose_tip: List[float] = Field([0.50, 0.58], description="[x, y] normalized coordinate")
    mouth: List[float] = Field([0.50, 0.70], description="[x, y] normalized coordinate")
    chin: List[float] = Field([0.50, 0.86], description="[x, y] normalized coordinate")

    # Extended landmarks (new — for richer lineart)
    nasion: List[float] = Field([0.50, 0.34], description="Nasal bridge top (nasion)")
    brow_ridge_left: List[float] = Field([0.36, 0.36], description="Left supraorbital brow ridge")
    brow_ridge_right: List[float] = Field([0.64, 0.36], description="Right supraorbital brow ridge")
    cheekbone_left: List[float] = Field([0.25, 0.52], description="Left zygomatic arch peak")
    cheekbone_right: List[float] = Field([0.75, 0.52], description="Right zygomatic arch peak")
    philtrum: List[float] = Field([0.50, 0.65], description="Philtrum center (between nose and mouth)")
    ear_left_top: List[float] = Field([0.18, 0.38], description="Left ear superior attachment")
    ear_left_bot: List[float] = Field([0.18, 0.58], description="Left ear inferior attachment")
    ear_right_top: List[float] = Field([0.82, 0.38], description="Right ear superior attachment")
    ear_right_bot: List[float] = Field([0.82, 0.58], description="Right ear inferior attachment")
    clavicle_left: List[float] = Field([0.32, 0.97], description="Left clavicle / shoulder line")
    clavicle_right: List[float] = Field([0.68, 0.97], description="Right clavicle / shoulder line")

    # Facial thirds horizontal lines (y-coordinates only, span full width)
    thirds_hairline_y: Optional[float] = Field(0.18, description="Hairline horizontal (upper third)")
    thirds_brow_y: Optional[float] = Field(0.38, description="Brow line horizontal (middle third)")
    thirds_nose_base_y: Optional[float] = Field(0.62, description="Nose base horizontal (lower third)")


class NormalizedGeometry(BaseModel):
    canvas: CanvasSize = Field(default_factory=CanvasSize)
    anchors: NormalizedAnchors = Field(default_factory=NormalizedAnchors)
    control_points: Dict[str, List[float]] = Field(
        default_factory=dict,
        description="Fine-grained MediaPipe or heuristic landmark offsets",
    )
