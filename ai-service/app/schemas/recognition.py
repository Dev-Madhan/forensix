from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import BaseResponse
from app.utils.files import validate_storage_reference


class SuspectMatch(BaseModel):
    criminal_id: str = Field(..., description="Unique criminal record identifier")
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence similarity score between 0.0 and 1.0 (Phase 7 pgvector/InsightFace)",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional match metadata such as matching facial landmarks or case notes",
    )


class RecognitionSearchRequest(BaseModel):
    case_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier of the case",
        examples=["case-01JABCDEF1234567"],
    )
    image_reference: str = Field(
        ...,
        description="Secure storage object key or reference for the query sketch/image",
        examples=["cases/case-123/evidence/sketch-456/composite.png"],
    )
    limit: int = Field(
        10,
        ge=1,
        le=100,
        description="Maximum number of candidate matches to retrieve (default: 10, max: 100)",
    )

    @field_validator("case_id", mode="before")
    @classmethod
    def strip_case_id(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("case_id cannot be empty or whitespace-only.")
            return cleaned
        return v

    @field_validator("image_reference", mode="before")
    @classmethod
    def validate_reference(cls, v: str) -> str:
        # Reuses the strict storage reference validator from files.py
        return validate_storage_reference(v)


class RecognitionSearchResponse(BaseResponse):
    case_id: str
    matches: List[SuspectMatch] = Field(
        default_factory=list,
        description="Ranked candidate matches returned by facial recognition search (Phase 7 adapter)",
    )
