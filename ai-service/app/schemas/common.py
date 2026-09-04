from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    request_id: str = Field(..., description="Unique non-sensitive request identifier")
    status: str = Field("completed", description="Status of the request execution")
    processing_time_ms: float = Field(..., description="Elapsed processing time in milliseconds")


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Sanitized human-readable error description")
    request_id: str = Field(..., description="Associated request identifier")
    details: Optional[Dict[str, Any]] = Field(None, description="Optional non-sensitive validation details")


class ErrorResponse(BaseModel):
    error: ErrorDetail
