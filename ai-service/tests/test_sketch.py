def test_sketch_generate_success(client, auth_headers):
    payload = {
        "case_id": "case_test_002",
        "witness_id": "wit_test_002",
        "attributes": {
            "gender": "female",
            "age_range": "25-30",
            "hair": "straight blonde",
            "eye_color": "green",
        },
    }
    response = client.post("/api/v1/sketch/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert data["case_id"] == "case_test_002"
    assert data["witness_id"] == "wit_test_002"
    assert "image" in data
    assert "url" in data["image"]
    assert data["image"]["content_type"] == "image/png"
    assert data["processing_time_ms"] >= 0


def test_sketch_generate_with_llm_analysis_and_controls(client, auth_headers):
    payload = {
        "case_id": "case_llm_001",
        "witness_id": "wit_llm_001",
        "attributes": {
            "face_shape": "square_face_shape",
            "jawline": "wide_jawline",
            "chin": "square_chin",
            "eyes": "almond_eyes",
            "nose": "straight_nose",
            "hair": "short_cropped_hair",
        },
        "sketch_style": "Realistic Charcoal",
        "camera_angle": "three_quarter",
        "age_group": "50+",
        "gender": "Male",
        "detail_level": "Master",
        "prompt": "Suspect had a strong jawline and noticeable forehead wrinkles",
    }
    response = client.post("/api/v1/sketch/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert "llm_analysis" in data
    analysis = data["llm_analysis"]
    assert analysis is not None
    assert analysis["confidence_score"] >= 90.0
    assert analysis["perspective_parameters"]["angle"] == "three_quarter"
    assert len(analysis["age_markers"]) > 0
    assert data["metadata"]["sketch_style"] == "Realistic Charcoal"
    assert data["metadata"]["camera_angle"] == "three_quarter"
    assert data["metadata"]["age_group"] == "50+"


def test_sketch_generate_with_glasses_eyewear(client, auth_headers):
    payload = {
        "case_id": "case_test_glasses",
        "witness_id": "wit_test_glasses",
        "attributes": {
            "face_shape": "oval_face_shape",
            "eyes": "round_eyes",
            "eyewear": "thin_wire_rim_glasses",
            "glasses": "thin_wire_rim_glasses",
        },
        "sketch_style": "Forensic Graphite (Pencil)",
        "camera_angle": "frontal",
        "age_group": "26-35",
        "gender": "Male",
    }
    response = client.post("/api/v1/sketch/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    analysis = data["llm_analysis"]
    assert analysis is not None
    # Check that eyewear was recognized and integrated into traits and reasoning
    assert any("eyewear" in trait.lower() or "glasses" in trait.lower() for trait in analysis["morphological_traits"])
    assert "glasses" in analysis["reasoning"].lower() or "eyewear" in analysis["reasoning"].lower() or "wire" in analysis["reasoning"].lower()


def test_sketch_unauthorized_rejected(client):
    payload = {
        "case_id": "case_test_002",
        "witness_id": "wit_test_002",
        "attributes": {"gender": "female"},
    }
    # Send without auth headers
    response = client.post("/api/v1/sketch/generate", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_sketch_invalid_attributes_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_002",
        "witness_id": "wit_test_002",
        "attributes": "not_a_dictionary",
    }
    response = client.post("/api/v1/sketch/generate", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_sketch_missing_witness_id_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_002",
        "attributes": {"gender": "female"},
    }
    response = client.post("/api/v1/sketch/generate", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"
