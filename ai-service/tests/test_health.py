def test_health_endpoint_returns_ok(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "criminal-eye-ai"
    assert "X-Request-ID" in response.headers


def test_readiness_endpoint_returns_ready(client):
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ready"
    assert data.get("service") == "criminal-eye-ai"
    assert "providers" in data
    assert data["providers"].get("llm") == "mock"
    assert "X-Request-ID" in response.headers
