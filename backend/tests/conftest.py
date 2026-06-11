"""Shared pytest fixtures.

Forces the offline-friendly configuration (no Gemini, in-memory store) so the
full API surface can be exercised without any GCP credentials.
"""

import sys
from unittest.mock import MagicMock

# Mock google.genai and google.genai.types if not installed to allow offline testing
try:
    import google.genai
except ImportError:
    genai_mock = MagicMock()
    sys.modules["google.genai"] = genai_mock
    sys.modules["google.genai.types"] = MagicMock()
    try:
        import google
        google.genai = genai_mock  # type: ignore
    except ImportError:
        google_mock = MagicMock()
        google_mock.genai = genai_mock
        sys.modules["google"] = google_mock

import pytest
from app import config, deps
from app.main import create_app
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("USE_GEMINI", "false")
    monkeypatch.setenv("USE_FIRESTORE", "false")

    # Settings and repository are cached singletons — clear them so the env
    # overrides above take effect for this test.
    config.get_settings.cache_clear()
    deps.get_repository.cache_clear()

    with TestClient(create_app()) as test_client:
        yield test_client

    config.get_settings.cache_clear()
    deps.get_repository.cache_clear()
