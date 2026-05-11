"""Tests for config, security helpers, and FastAPI app assembly."""

import pytest
from pathlib import Path
from unittest.mock import patch

from app.config import Settings
from app.helpers.security import hash_password, verify_password


# ---------------------------------------------------------------------------
# Config Tests
# ---------------------------------------------------------------------------

class TestConfig:
    def test_defaults(self):
        s = Settings(
            _env_file=None,
            OPENAI_API_KEY="test-key",
        )
        assert s.LLM_PROVIDER == "openai"
        assert s.LLM_MODEL == "gpt-4.1-mini"
        assert s.EMBEDDING_MODEL == "text-embedding-3-small"
        assert s.EMBEDDING_DIMENSIONS == 1536
        assert s.RAG_TOP_K == 4
        assert s.CHUNK_SIZE == 1000
        assert s.CHUNK_OVERLAP == 200
        assert s.ACCESS_TOKEN_EXPIRE_MINUTES == 480
        assert s.MAX_FILE_SIZE_MB == 100

    def test_max_file_size_bytes(self):
        s = Settings(_env_file=None, MAX_FILE_SIZE_MB=50, OPENAI_API_KEY="k")
        assert s.max_file_size_bytes == 50 * 1024 * 1024

    def test_upload_path_creates_directory(self, tmp_path):
        s = Settings(
            _env_file=None,
            UPLOAD_DIR=str(tmp_path / "test_uploads"),
            OPENAI_API_KEY="k",
        )
        path = s.upload_path
        assert path.exists()
        assert path.is_dir()


# ---------------------------------------------------------------------------
# Security Helpers
# ---------------------------------------------------------------------------

class TestSecurity:
    def test_hash_and_verify(self):
        plain = "my_secure_password_123"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed)

    def test_wrong_password_fails(self):
        hashed = hash_password("correct")
        assert not verify_password("wrong", hashed)

    def test_different_hashes_for_same_password(self):
        """bcrypt uses random salt, so hashes differ."""
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2
        assert verify_password("same", h1)
        assert verify_password("same", h2)


# ---------------------------------------------------------------------------
# FastAPI App Assembly
# ---------------------------------------------------------------------------

class TestAppAssembly:
    def test_app_creates_and_routes_exist(self):
        from fastapi import FastAPI
        from app.manager.router import api_router
        from app.helpers.rate_limit import limiter
        from slowapi import _rate_limit_exceeded_handler
        from slowapi.errors import RateLimitExceeded

        app = FastAPI(title="Test")
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        app.include_router(api_router)

        paths = [
            r.path for r in app.routes
            if hasattr(r, "path")
        ]

        # Verify all expected routes
        assert "/api/auth/login" in paths
        assert "/api/auth/register" in paths
        assert "/api/auth/me" in paths
        assert "/api/auth/google" in paths
        assert "/api/admin/blog/posts" in paths
        assert "/api/chat" in paths
        assert "/api/chat/sessions" in paths
        assert "/api/documents" in paths
        assert "/api/documents/upload" in paths
        assert "/api/user/home" in paths
        assert "/api/user/blog" in paths
        assert "/api/user/seo-service" in paths
        assert "/api/user/web-design" in paths
        assert "/api/user/ads" in paths

    def test_health_endpoint(self):
        from fastapi.testclient import TestClient
        from fastapi import FastAPI

        app = FastAPI()

        @app.get("/")
        async def health():
            return {"status": "running", "service": "test"}

        client = TestClient(app)
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "running"

    def test_protected_routes_require_auth(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from app.manager.router import api_router

        app = FastAPI()
        app.include_router(api_router)
        client = TestClient(app)

        # Admin-protected endpoints should return 403
        assert client.get("/api/admin/blog/posts").status_code == 403
        assert client.get("/api/documents").status_code == 403

        # Auth-protected endpoints should return 403
        assert client.post("/api/chat", json={"message": "hi"}).status_code == 403
        assert client.get("/api/auth/me").status_code == 403
