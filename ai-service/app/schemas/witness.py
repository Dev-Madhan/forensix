from typing import Any, Dict
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import BaseResponse


class WitnessProcessRequest(BaseModel):
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
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Detailed natural language witness statement describing the suspect's appearance",
        examples=["Male in his late 30s, sharp jawline, dark brown curly hair, slight scar above left eyebrow."],
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

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Witness description cannot be empty or whitespace-only.")
            if len(cleaned) < 10:
                raise ValueError("Witness description must be at least 10 characters.")
            if len(cleaned) > 5000:
                raise ValueError("Witness description cannot exceed 5000 characters.")
            return cleaned
        return v


class EyeAttributes(BaseModel):
    shape: str = Field("almond", description="almond, round, narrow")
    size: str = Field("medium", description="small, medium, large")
    spacing: str = Field("normal", description="close, normal, wide")
    tilt: str = Field("neutral", description="upward, downward, neutral")


class EyebrowAttributes(BaseModel):
    thickness: str = Field("medium", description="thin, medium, thick")
    shape: str = Field("arched", description="straight, arched")


class NoseAttributes(BaseModel):
    bridge: str = Field("straight", description="straight, convex, concave")
    length: str = Field("medium", description="short, medium, long")
    width: str = Field("medium", description="narrow, medium, wide")
    tip: str = Field("rounded", description="pointed, rounded, bulbous")


class MouthAttributes(BaseModel):
    width: str = Field("medium", description="narrow, medium, wide")
    upper_lip: str = Field("medium", description="thin, medium, full")
    lower_lip: str = Field("medium", description="thin, medium, full")


class JawAttributes(BaseModel):
    width: str = Field("medium", description="narrow, medium, wide")
    shape: str = Field("rounded", description="angular, rounded")


class ChinAttributes(BaseModel):
    size: str = Field("medium", description="small, medium, large")
    shape: str = Field("rounded", description="pointed, rounded, square")


class FacialAttributes(BaseModel):
    face_shape: str = Field("oval", description="oval, round, square, oblong, heart")
    eyes: EyeAttributes = Field(default_factory=EyeAttributes)
    eyebrows: EyebrowAttributes = Field(default_factory=EyebrowAttributes)
    nose: NoseAttributes = Field(default_factory=NoseAttributes)
    mouth: MouthAttributes = Field(default_factory=MouthAttributes)
    jaw: JawAttributes = Field(default_factory=JawAttributes)
    chin: ChinAttributes = Field(default_factory=ChinAttributes)


class WitnessProcessResponse(BaseResponse):
    case_id: str
    witness_id: str
    attributes: Dict[str, Any] = Field(
        default_factory=dict,
        description="Structured facial attributes extracted from description conforming to forensic taxonomy",
    )
    warnings: list[str] = Field(
        default_factory=list,
        description="Non-fatal warnings or unextractable attributes",
    )

