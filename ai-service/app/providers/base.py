from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseLLMProvider(ABC):
    """Abstract interface for LLM facial attribute extraction."""

    @abstractmethod
    async def extract_facial_attributes(self, description: str) -> Dict[str, Any]:
        """
        Parses natural language witness statement into structured facial attributes.
        Actual implementation belongs to Phase 7.
        """
        pass


class BaseSketchProvider(ABC):
    """Abstract interface for diffusion forensic sketch generation."""

    @abstractmethod
    async def generate_sketch(
        self,
        case_id: str,
        witness_id: str,
        attributes: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Synthesizes forensic composite sketch from facial attributes.
        Actual diffusion model belongs to Phase 7.
        """
        pass


class BaseFaceProvider(ABC):
    """Abstract interface for facial embedding & similarity recognition."""

    @abstractmethod
    async def search_faces(
        self,
        case_id: str,
        image_reference: str,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Searches candidate suspect records matching the query image embedding.
        InsightFace & pgvector similarity search belong to Phase 7.
        """
        pass
