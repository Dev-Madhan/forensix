from fastapi import APIRouter, Depends, Request, status
from app.core.security import verify_service_secret
from app.schemas.recognition import RecognitionSearchRequest, RecognitionSearchResponse
from app.schemas.common import ErrorResponse
from app.services.recognition_service import recognition_service

router = APIRouter(prefix="/recognition", tags=["Face Recognition & Search"])


def get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "req_unknown")


@router.post(
    "/search",
    summary="Search suspect candidates by forensic sketch/image reference",
    status_code=status.HTTP_200_OK,
    response_model=RecognitionSearchResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid Request / Traversal Attempt"},
        401: {"model": ErrorResponse, "description": "Unauthorized / Missing Secret"},
        500: {"model": ErrorResponse, "description": "Internal Processing Error"},
        502: {"model": ErrorResponse, "description": "Provider Error"},
    },
    dependencies=[Depends(verify_service_secret)],
)
async def search_recognition(
    payload: RecognitionSearchRequest,
    request: Request,
) -> RecognitionSearchResponse:
    """
    Submits a secure image reference and returns ranked candidate matches.
    Protected by server-to-server authentication.
    """
    request_id = get_request_id(request)
    return await recognition_service.search_suspects(payload, request_id)
