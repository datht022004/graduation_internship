"""Tests for auth module: interface, usecase, repository."""

import pytest
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
from pydantic import ValidationError

from app.manager.auth.interface import (
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserInfo,
)
from app.manager.auth.usecase import AuthUseCase, get_current_user, require_admin


# ---------------------------------------------------------------------------
# Interface / Schema Tests
# ---------------------------------------------------------------------------

class TestAuthInterfaces:
    def test_login_request_defaults(self):
        req = LoginRequest(email="test@test.com", password="pass123")
        assert req.role == "user"

    def test_login_request_admin(self):
        req = LoginRequest(email="admin@test.com", password="pass", role="admin")
        assert req.role == "admin"

    def test_register_request(self):
        req = RegisterRequest(name="Dat", email="dat@test.com", password="123456")
        assert req.name == "Dat"
        assert req.email == "dat@test.com"

    def test_register_request_missing_fields(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="dat@test.com")  # missing name & password

    def test_google_login_request(self):
        req = GoogleLoginRequest(google_token="token123", role="user")
        assert req.google_token == "token123"

    def test_user_info(self):
        info = UserInfo(email="u@test.com", name="User", role="user")
        assert info.email == "u@test.com"

    def test_login_response(self):
        resp = LoginResponse(
            access_token="jwt-token",
            user=UserInfo(email="u@t.com", name="U", role="user"),
        )
        assert resp.token_type == "bearer"
        assert resp.access_token == "jwt-token"


# ---------------------------------------------------------------------------
# UseCase Tests
# ---------------------------------------------------------------------------

class TestAuthUseCase:
    @pytest.fixture
    def usecase(self):
        return AuthUseCase()

    def test_create_and_decode_token(self, usecase):
        data = {"email": "test@test.com", "name": "Test", "role": "user"}
        token = usecase.create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

        payload = usecase.decode_token(token)
        assert payload["email"] == "test@test.com"
        assert payload["role"] == "user"
        assert "exp" in payload

    def test_decode_invalid_token_raises(self, usecase):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            usecase.decode_token("invalid.jwt.token")
        assert exc_info.value.status_code == 401

    @patch("app.manager.auth.usecase.auth_repository")
    def test_authenticate_user_success(self, mock_repo, usecase):
        from app.helpers.security import hash_password
        hashed = hash_password("correct_password")
        mock_repo.get_account_by_email.return_value = {
            "email": "user@test.com",
            "name": "User",
            "role": "user",
            "password": hashed,
        }
        result = usecase.authenticate_user("user@test.com", "correct_password", "user")
        assert result is not None
        assert result["email"] == "user@test.com"

    @patch("app.manager.auth.usecase.auth_repository")
    def test_authenticate_user_wrong_password(self, mock_repo, usecase):
        from app.helpers.security import hash_password
        mock_repo.get_account_by_email.return_value = {
            "email": "user@test.com",
            "name": "User",
            "role": "user",
            "password": hash_password("correct"),
        }
        result = usecase.authenticate_user("user@test.com", "wrong", "user")
        assert result is None

    @patch("app.manager.auth.usecase.auth_repository")
    def test_authenticate_user_wrong_role(self, mock_repo, usecase):
        from app.helpers.security import hash_password
        mock_repo.get_account_by_email.return_value = {
            "email": "user@test.com",
            "name": "User",
            "role": "user",
            "password": hash_password("pass"),
        }
        result = usecase.authenticate_user("user@test.com", "pass", "admin")
        assert result is None

    @patch("app.manager.auth.usecase.auth_repository")
    def test_authenticate_user_not_found(self, mock_repo, usecase):
        mock_repo.get_account_by_email.return_value = None
        result = usecase.authenticate_user("nobody@test.com", "pass", "user")
        assert result is None

    @patch("app.manager.auth.usecase.auth_repository")
    def test_register_manual_user_success(self, mock_repo, usecase):
        mock_repo.get_account_by_email.side_effect = [
            None,  # first call: check if exists → not found
            {"email": "new@test.com", "name": "New", "role": "user"},  # second call: return created
        ]
        result = usecase.register_manual_user("New", "new@test.com", "password123")
        assert result is not None
        assert result["email"] == "new@test.com"

    @patch("app.manager.auth.usecase.auth_repository")
    def test_register_manual_user_duplicate(self, mock_repo, usecase):
        mock_repo.get_account_by_email.return_value = {"email": "dup@test.com"}
        result = usecase.register_manual_user("Dup", "dup@test.com", "password123")
        assert result is None


# ---------------------------------------------------------------------------
# Dependency Tests
# ---------------------------------------------------------------------------

class TestAuthDependencies:
    @pytest.mark.asyncio
    async def test_get_current_user_valid_token(self):
        usecase = AuthUseCase()
        token = usecase.create_access_token(
            {"email": "u@t.com", "name": "User", "role": "user"}
        )
        mock_creds = MagicMock()
        mock_creds.credentials = token

        user = await get_current_user(mock_creds)
        assert user.email == "u@t.com"
        assert user.role == "user"

    @pytest.mark.asyncio
    async def test_require_admin_passes_for_admin(self):
        admin_info = UserInfo(email="admin@t.com", name="Admin", role="admin")
        result = await require_admin(admin_info)
        assert result.role == "admin"

    @pytest.mark.asyncio
    async def test_require_admin_rejects_user(self):
        from fastapi import HTTPException
        user_info = UserInfo(email="u@t.com", name="User", role="user")
        with pytest.raises(HTTPException) as exc_info:
            await require_admin(user_info)
        assert exc_info.value.status_code == 403
