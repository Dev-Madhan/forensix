def test_auth_via_bearer_token(client):
    headers = {
        "Authorization": "Bearer test_ai_service_secret_xyz789",
    }
    payload = {
        "case_id": "case_test_sec",
        "witness_id": "wit_test_sec",
        "description": "Witness saw male suspect wearing black leather jacket.",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=headers)
    assert response.status_code == 200


def test_auth_with_wrong_secret_rejected(client):
    headers = {
        "X-AI-Secret": "wrong_secret_value",
    }
    payload = {
        "case_id": "case_test_sec",
        "witness_id": "wit_test_sec",
        "description": "Witness saw male suspect wearing black leather jacket.",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_cors_preflight_headers(client):
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_error_response_sanitizes_internals(client, auth_headers, monkeypatch):
    from app.services.witness_service import witness_service

    async def raise_internal_error(*args, **kwargs):
        raise RuntimeError("Database connection password=secret123 failed at /var/forensix/db.py")

    monkeypatch.setattr(witness_service.provider, "extract_facial_attributes", raise_internal_error)

    payload = {
        "case_id": "case_test_sec",
        "witness_id": "wit_test_sec",
        "description": "Witness statement causing internal exception for testing.",
    }
    response = client.post("/api/v1/witness/process", json=payload, headers=auth_headers)

    # Must be controlled error response
    assert response.status_code in (500, 502)
    data = response.json()
    assert "error" in data
    # Ensure sensitive leaked strings are not returned
    error_str = str(data)
    assert "password=secret123" not in error_str
    assert "/var/forensix/db.py" not in error_str
    assert "Traceback" not in error_str
