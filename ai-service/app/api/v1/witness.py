from fastapi import APIRouter, Depends, Request, status
from app.core.security import verify_service_secret
from app.schemas.witness import WitnessProcessRequest, WitnessProcessResponse
from app.schemas.common import ErrorResponse
from app.services.witness_service import witness_service

router = APIRouter(prefix="/witness", tags=["Witness Processing"])


def get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "req_unknown")


@router.post(
    "/process",
    summary="Process witness statement into facial attributes",
    status_code=status.HTTP_200_OK,
    response_model=WitnessProcessResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid Request / Validation Failed"},
        401: {"model": ErrorResponse, "description": "Unauthorized / Missing Secret"},
        500: {"model": ErrorResponse, "description": "Internal Processing Error"},
        502: {"model": ErrorResponse, "description": "Provider Error"},
    },
    dependencies=[Depends(verify_service_secret)],
)
async def process_witness(
    payload: WitnessProcessRequest,
    request: Request,
) -> WitnessProcessResponse:
    """
    Accepts a witness description and returns structured facial attributes.
    Protected by server-to-server authentication.
    """
    request_id = get_request_id(request)
    return await witness_service.process_statement(payload, request_id)
