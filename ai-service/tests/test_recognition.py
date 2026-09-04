def test_recognition_search_success(client, auth_headers):
    payload = {
        "case_id": "case_test_003",
        "image_reference": "cases/case_test_003/sketches/composite_1.png",
        "limit": 5,
    }
    response = client.post("/api/v1/recognition/search", json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert data["case_id"] == "case_test_003"
    assert "matches" in data
    assert isinstance(data["matches"], list)
    assert data["processing_time_ms"] >= 0


def test_recognition_unauthorized_rejected(client):
    payload = {
        "case_id": "case_test_003",
        "image_reference": "cases/case_test_003/sketches/composite_1.png",
    }
    response = client.post("/api/v1/recognition/search", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_recognition_path_traversal_rejected(client, auth_headers):
    # Attempting directory traversal
    payload = {
        "case_id": "case_test_003",
        "image_reference": "../../etc/passwd",
    }
    response = client.post("/api/v1/recognition/search", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_recognition_absolute_path_rejected(client, auth_headers):
    # Attempting absolute path
    payload = {
        "case_id": "case_test_003",
        "image_reference": "/var/data/image.png",
    }
    response = client.post("/api/v1/recognition/search", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"


def test_recognition_invalid_limit_rejected(client, auth_headers):
    payload = {
        "case_id": "case_test_003",
        "image_reference": "cases/case_test_003/sketches/composite_1.png",
        "limit": 500,  # exceeds max of 100
    }
    response = client.post("/api/v1/recognition/search", json=payload, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_REQUEST"
