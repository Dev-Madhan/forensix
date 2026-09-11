import pytest
from app.providers.llm.qwen_local import QwenLocalProvider
from app.providers.sketch.diffusion_local import LocalDiffusionProvider
from app.providers.face.local_embedder import LocalFaceRecognitionProvider


@pytest.mark.asyncio
async def test_qwen_local_fallback_parsing():
    provider = QwenLocalProvider()
    description = (
        "Witness says the suspect was male, roughly 32 years old, sharp oval face shape, "
        "heavy arched dark eyebrows, almond dark brown eyes, straight pointed nose, thin lips, and slight stubble."
    )
    res = await provider.extract_facial_attributes(description)
    assert isinstance(res, dict)
    assert "attributes" in res
    result = res["attributes"]
    assert "gender" in result
    assert result["gender"] == "male"
    assert "face_shape" in result
    assert result["face_shape"] == "oval"
    assert "eyes" in result or "eye_shape" in result


@pytest.mark.asyncio
async def test_diffusion_local_conditioning_and_sketch():
    provider = LocalDiffusionProvider()
    attributes = {
        "gender": "male",
        "face_shape": "oval",
        "eye_shape": "almond",
        "eyebrows": "arched",
        "nose": "straight",
        "lips": "thin",
    }
    lineart = provider.create_conditioning_lineart(attributes, resolution=256)
    assert lineart is not None
    assert lineart.size == (256, 256)

    sketch_res = await provider.generate_sketch(
        case_id="case_pipe_test",
        witness_id="wit_pipe_test",
        attributes=attributes,
        seed=102030,
        resolution=256,
        steps=10,
    )
    assert "url" in sketch_res
    assert "local_path" in sketch_res
    assert sketch_res["seed"] == 102030


@pytest.mark.asyncio
async def test_face_recognition_local_embedder():
    provider = LocalFaceRecognitionProvider()
    # Query with relative path to suspect
    results = await provider.search_faces(
        case_id="case_pipe_test",
        image_reference="public/images/suspects/arun-prakash.jpg",
        limit=2,
    )
    assert isinstance(results, list)
    assert len(results) > 0
    top_match = results[0]
    assert "criminal_id" in top_match
    assert "confidence_score" in top_match
    assert 0.0 <= top_match["confidence_score"] <= 1.0
    assert "metadata" in top_match
