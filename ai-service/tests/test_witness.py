def test_witness_process_success(client, auth_headers):
    payload = {
        "case_id": "case_test_001",
        "witness_id": "wit_test_001",
        "description": "Male suspect, approximately 35 years old, athletic build, short dark hair, wearing a dark blue hoodie.",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert data["case_id"] == "case_test_001"
    assert data["witness_id"] == "wit_test_001"
    assert "attributes" in data
    assert isinstance(data["attributes"], dict)
    assert data["processing_time_ms"] >= 0
    assert data["request_id"] == auth_headers["X-Request-ID"]


def test_witness_missing_description_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_001",
        "witness_id": "wit_test_001",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_witness_empty_description_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_001",
        "witness_id": "wit_test_001",
        "description": "   ",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_witness_too_short_description_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_001",
        "witness_id": "wit_test_001",
        "description": "tall guy",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_witness_oversized_description_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_001",
        "witness_id": "wit_test_001",
        "description": "A" * 5001,
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_witness_missing_case_id_rejected(client, auth_headers):
    payload = {
        "case_id": "",
        "witness_id": "wit_test_001",
        "description": "Valid witness description of suspect.",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"
