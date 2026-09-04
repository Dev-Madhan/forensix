import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings

TEST_SECRET = "test_ai_service_secret_xyz789"


@pytest.fixture(autouse=True)
def configure_test_environment(monkeypatch):
    """Ensure tests run with a known secret and test settings."""
    settings = get_settings()
    monkeypatch.setattr(settings, "AI_SERVICE_SECRET", TEST_SECRET)
    monkeypatch.setattr(settings, "APP_ENV", "testing")
    monkeypatch.setattr(settings, "ALLOWED_ORIGINS", ["http://localhost:3000"])


@pytest.fixture
def client():
    """Synchronous test client."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers():
    """Default valid authentication headers."""
    return {
        "X-AI-Secret": TEST_SECRET,
        "X-Request-ID": "req_test_fixture_12345",
    }
