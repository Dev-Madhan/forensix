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
