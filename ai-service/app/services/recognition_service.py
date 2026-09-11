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
        if provider:
            self.provider = provider
        elif settings.FACE_PROVIDER in ("insightface", "insight_face"):
            from app.providers.face.insightface_provider import InsightFaceProvider
            self.provider = InsightFaceProvider()
        elif settings.FACE_PROVIDER == "local_embedder":
            from app.providers.face.local_embedder import LocalFaceRecognitionProvider
            self.provider = LocalFaceRecognitionProvider()
        else:
            self.provider = MockFaceProvider()

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

        query_embedding = None
        if hasattr(self.provider, "extract_embedding") and hasattr(self.provider, "_resolve_image_path"):
            try:
                q_path = self.provider._resolve_image_path(request.image_reference)
                if q_path:
                    query_embedding = self.provider.extract_embedding(q_path)
            except Exception as emb_err:
                logger.debug(f"Could not extract query embedding for reference {request.image_reference}: {emb_err}")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return RecognitionSearchResponse(
            request_id=request_id,
            status="completed",
            case_id=request.case_id,
            matches=matches,
            query_embedding=query_embedding,
            vector_engine="insightface_pgvector",
            processing_time_ms=elapsed_ms,
        )


recognition_service = RecognitionService()
