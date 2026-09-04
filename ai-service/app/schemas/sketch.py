from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import BaseResponse



class SketchImage(BaseModel):
    url: str = Field(..., description="Access URL or storage reference for the generated sketch")
    content_type: str = Field("image/png", description="MIME content type of the sketch image")


class SketchGenerateRequest(BaseModel):
    case_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier of the case",
        examples=["case-01JABCDEF1234567"],
    )
    witness_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier of the witness",
        examples=["wit-01JABCDEF1234567"],
    )
    attributes: Dict[str, Any] = Field(
        ...,
        description="Structured facial attributes parsed from witness statement",
        examples=[{"gender": "male", "face_shape": "oval", "hair": "curly dark brown"}],
    )
    seed: Optional[int] = Field(
        None,
        description="Deterministic generation seed for reproducibility (e.g., 184729)",
        examples=[184729],
    )
    resolution: int = Field(
        512,
        ge=256,
        le=1024,
        description="Pixel resolution of the output sketch (default: 512 for RTX 4050 6GB)",
    )
    steps: int = Field(
        24,
        ge=10,
        le=50,
        description="Inference diffusion steps (default: 24)",
    )
    control_strength: float = Field(
        0.85,
        ge=0.0,
        le=1.0,
        description="ControlNet Lineart structural conditioning weight (default: 0.85)",
    )

    @field_validator("case_id", "witness_id", mode="before")
    @classmethod
    def strip_ids(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Identifier cannot be empty or whitespace-only.")
            return cleaned
        return v

    @field_validator("attributes", mode="before")
    @classmethod
    def validate_attributes(cls, v: Any) -> Dict[str, Any]:
        if not isinstance(v, dict):
            raise ValueError("Attributes must be a valid JSON object/dictionary.")
        return v


class SketchGenerateResponse(BaseResponse):
    case_id: str
    witness_id: str
    image: SketchImage = Field(..., description="Generated forensic sketch image metadata")
    seed: Optional[int] = Field(None, description="Generation seed used for reproducibility")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Model parameters (resolution, steps, control_strength, model version)",
    )

