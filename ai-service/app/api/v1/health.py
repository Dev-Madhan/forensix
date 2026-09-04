from typing import Any, Dict
from fastapi import APIRouter, status
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/health", tags=["Health & Readiness"])


@router.get(
    "",
    summary="Liveness check",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, Any],
)
async def health_check() -> Dict[str, Any]:
    """
    Proves that the AI service is alive and listening.
    Does not perform expensive external calls.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
    }


@router.get(
    "/ready",
    summary="Readiness check",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, Any],
)
async def readiness_check() -> Dict[str, Any]:
    """
    Checks that the AI service dependencies and configuration are ready for traffic.
    """
    return {
        "status": "ready",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "providers": {
            "llm": settings.LLM_PROVIDER,
            "sketch": settings.SKETCH_PROVIDER,
            "face": settings.FACE_PROVIDER,
        },
    }
