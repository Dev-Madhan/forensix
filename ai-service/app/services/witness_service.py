import time
from typing import Optional
from app.core.config import get_settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.providers.llm.mock import MockLLMProvider
from app.providers.llm.qwen_local import QwenLocalProvider
from app.schemas.witness import WitnessProcessRequest, WitnessProcessResponse
from app.utils.errors import ProviderException

settings = get_settings()


class WitnessService:
    def __init__(self, provider: Optional[BaseLLMProvider] = None):
        if provider:
            self.provider = provider
        elif settings.LLM_PROVIDER == "qwen_local":
            self.provider = QwenLocalProvider()
        else:
            self.provider = MockLLMProvider()


    async def process_statement(
        self,
        request: WitnessProcessRequest,
        request_id: str,
    ) -> WitnessProcessResponse:
        start_time = time.perf_counter()
        logger.info(
            f"Processing witness statement for case={request.case_id}, witness={request.witness_id}",
            extra={"endpoint": "/api/v1/witness/process", "request_id": request_id},
        )

        try:
            attributes = await self.provider.extract_facial_attributes(request.description)
        except Exception as e:
            logger.error(
                f"Error in LLM provider while extracting attributes: {str(e)}",
                extra={"request_id": request_id, "error_code": "PROVIDER_ERROR"},
                exc_info=True,
            )
            raise ProviderException("Failed to extract facial attributes from statement.")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return WitnessProcessResponse(
            request_id=request_id,
            status="completed",
            case_id=request.case_id,
            witness_id=request.witness_id,
            attributes=attributes,
            processing_time_ms=elapsed_ms,
        )


witness_service = WitnessService()
