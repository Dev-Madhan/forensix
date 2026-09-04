from fastapi import APIRouter, Depends, Request, status
from app.core.security import verify_service_secret
from app.schemas.sketch import SketchGenerateRequest, SketchGenerateResponse
from app.schemas.common import ErrorResponse
from app.services.sketch_service import sketch_service

router = APIRouter(prefix="/sketch", tags=["Forensic Sketch Generation"])


def get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "req_unknown")


@router.post(
    "/generate",
    summary="Generate forensic composite sketch from facial attributes",
    status_code=status.HTTP_200_OK,
    response_model=SketchGenerateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid Request / Validation Failed"},
        401: {"model": ErrorResponse, "description": "Unauthorized / Missing Secret"},
        500: {"model": ErrorResponse, "description": "Internal Processing Error"},
        502: {"model": ErrorResponse, "description": "Provider Error"},
    },
    dependencies=[Depends(verify_service_secret)],
)
async def generate_sketch(
    payload: SketchGenerateRequest,
    request: Request,
) -> SketchGenerateResponse:
    """
    Synthesizes a forensic composite sketch from structured facial attributes.
    Reuses the Phase 5 secure storage architecture.
    """
    request_id = get_request_id(request)
    return await sketch_service.generate_sketch(payload, request_id)
