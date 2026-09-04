import time
from typing import Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseFaceProvider
from app.providers.face.mock import MockFaceProvider
from app.schemas.recognition import RecognitionSearchRequest, RecognitionSearchResponse, SuspectMatch
from app.utils.errors import ProviderException

settings = get_settings()


class RecognitionService:
    def __init__(self, provider: Optional[BaseFaceProvider] = None):
        self.provider = provider or MockFaceProvider()

    async def search_suspects(
        self,
        request: RecognitionSearchRequest,
        request_id: str,
    ) -> RecognitionSearchResponse:
        start_time = time.perf_counter()
        logger.info(
            f"Executing recognition search for case={request.case_id}, ref={request.image_reference}, limit={request.limit}",
            extra={"endpoint": "/api/v1/recognition/search", "request_id": request_id},
        )

        try:
            raw_matches = await self.provider.search_faces(
                case_id=request.case_id,
                image_reference=request.image_reference,
                limit=request.limit,
            )
            matches = [SuspectMatch(**m) for m in raw_matches]
        except Exception as e:
            logger.error(
                f"Error in face recognition provider: {str(e)}",
                extra={"request_id": request_id, "error_code": "PROVIDER_ERROR"},
                exc_info=True,
            )
            raise ProviderException("Failed to execute facial recognition search.")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return RecognitionSearchResponse(
            request_id=request_id,
            status="completed",
            case_id=request.case_id,
            matches=matches,
            processing_time_ms=elapsed_ms,
        )


recognition_service = RecognitionService()
