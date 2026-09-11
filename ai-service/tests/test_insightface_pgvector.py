import math
from pathlib import Path
import pytest
import numpy as np

from app.providers.face.insightface_provider import InsightFaceProvider
from app.schemas.recognition import RecognitionSearchRequest, RecognitionSearchResponse
from app.services.recognition_service import RecognitionService


def test_insightface_provider_instantiation():
    provider = InsightFaceProvider()
    assert provider is not None
    assert provider.model_root is not None


def test_insightface_extract_embedding_512d():
    provider = InsightFaceProvider()
    # Test on existing suspect image
    image_path = Path("../public/images/suspects/arun-prakash.jpg")
    if not image_path.exists():
        image_path = Path("public/images/suspects/arun-prakash.jpg")

    assert image_path.exists(), f"Suspect image {image_path} must exist for testing"

    emb = provider.extract_embedding(image_path)
    assert emb is not None, "Failed to extract embedding from valid suspect image"
    assert len(emb) == 512, f"Embedding must be 512-dimensional ArcFace vector, got {len(emb)}"

    # Verify unit normalization (L2 norm should be ~1.0 for cosine similarity / pgvector)
    norm = math.sqrt(sum(x * x for x in emb))
    assert abs(norm - 1.0) < 1e-3, f"Embedding must be unit-normalized, got norm={norm}"


@pytest.mark.asyncio
async def test_insightface_search_faces_ranked_scores():
    provider = InsightFaceProvider()
    image_path = "public/images/suspects/arun-prakash.jpg"

    matches = await provider.search_faces(
        case_id="case_pgvector_test",
        image_reference=image_path,
        limit=4,
    )

    assert len(matches) > 0, "Matches list should not be empty"
    assert len(matches) <= 4, "Matches count should respect limit"

    # Verify scores are sorted in descending order
    scores = [m["confidence_score"] for m in matches]
    assert scores == sorted(scores, reverse=True), "Candidates must be ranked by descending confidence"

    # Verify candidate metadata
    for m in matches:
        assert "criminal_id" in m
        assert 0.0 <= m["confidence_score"] <= 1.0
        assert "metadata" in m
        assert "name" in m["metadata"]


@pytest.mark.asyncio
async def test_recognition_service_returns_query_embedding_and_engine():
    provider = InsightFaceProvider()
    service = RecognitionService(provider=provider)

    req = RecognitionSearchRequest(
        case_id="case_pgvector_001",
        image_reference="public/images/suspects/arun-prakash.jpg",
        limit=5,
    )

    response = await service.search_suspects(req, request_id="req_test_pgvector")

    assert isinstance(response, RecognitionSearchResponse)
    assert response.status == "completed"
    assert response.case_id == "case_pgvector_001"
    assert response.vector_engine == "insightface_pgvector"
    assert response.query_embedding is not None
    assert len(response.query_embedding) == 512


def test_pgvector_cosine_distance_simulation():
    # Simulate pgvector cosine operator <=> and similarity: 1 - (v1 <=> v2)
    # Cosine distance = 1 - (dot(u, v) / (norm(u)*norm(v)))
    v1 = np.random.randn(512).astype(np.float32)
    v1 /= np.linalg.norm(v1)

    # Identical vector
    cos_dist_self = 1.0 - float(np.dot(v1, v1))
    sim_score_self = 1.0 - cos_dist_self
    assert abs(sim_score_self - 1.0) < 1e-5

    # Orthogonal vector
    v2 = np.random.randn(512).astype(np.float32)
    v2 -= v1 * np.dot(v1, v2)
    v2 /= np.linalg.norm(v2)
    cos_dist_ortho = 1.0 - float(np.dot(v1, v2))
    sim_score_ortho = 1.0 - cos_dist_ortho
    assert abs(sim_score_ortho - 0.0) < 1e-5
