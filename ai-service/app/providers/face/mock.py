from typing import Any, Dict, List
from app.providers.base import BaseFaceProvider
from app.core.logging import logger


class MockFaceProvider(BaseFaceProvider):
    """
    Phase 7 implementation pending: InsightFace embedding extraction & pgvector candidate matching.
    This mock provider simulates similarity search for Phase 6 contract validation.
    """

    async def search_faces(
        self,
        case_id: str,
        image_reference: str,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        logger.info(
            "MockFaceProvider executing face recognition search (Phase 7 implementation pending).",
            extra={"endpoint": "/api/v1/recognition/search"},
        )
        # Returns empty or placeholder candidate list compliant with Phase 7 schema
        return [
            {
                "criminal_id": "crim_mock_placeholder_1",
                "confidence_score": 0.88,
                "metadata": {
                    "_phase_status": "Phase 7 implementation pending",
                    "note": "Candidate match returned by Phase 6 mock adapter.",
                },
            }
        ][:limit]
