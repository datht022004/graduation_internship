from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.config import settings
from app.helpers.security import hash_password, verify_password
from app.models import UserDocument
from app.manager.auth.interface import UserInfo
from app.manager.auth.repository import auth_repository

ALGORITHM = "HS256"
security = HTTPBearer()


class AuthUseCase:
    def init_default_users(self):
        auth_repository.ensure_indexes()

        admin_email = settings.ADMIN_EMAIL
        if not auth_repository.get_account_by_email(admin_email):
            auth_repository.create_account(
                UserDocument(
                    email=admin_email,
                    password=hash_password(settings.ADMIN_PASSWORD),
                    name="System Administrator",
                    role="admin",
                    auth_providers=["password"],
                    created_at=datetime.now(timezone.utc),
                ).model_dump(by_alias=True, exclude_none=True)
            )

        user_email = settings.USER_EMAIL
        if not auth_repository.get_account_by_email(user_email):
            auth_repository.create_account(
                UserDocument(
                    email=user_email,
                    password=hash_password(settings.USER_PASSWORD),
                    name="Enterprise Client",
                    role="user",
                    auth_providers=["password"],
                    created_at=datetime.now(timezone.utc),
                ).model_dump(by_alias=True, exclude_none=True)
            )

    def register_manual_user(self, name: str, email: str, password: str) -> Optional[dict]:
        normalized_email = email.strip().lower()
        if auth_repository.get_account_by_email(normalized_email):
            return None

        auth_repository.create_account(
            UserDocument(
                email=normalized_email,
                password=hash_password(password),
                name=name.strip(),
                role="user",
                auth_providers=["password"],
                created_at=datetime.now(timezone.utc),
            ).model_dump(by_alias=True, exclude_none=True)
        )
        return auth_repository.get_account_by_email(normalized_email)

    def authenticate_user(self, email: str, password: str, role: str) -> Optional[dict]:
        account = auth_repository.get_account_by_email(email.strip().lower())
        if not account:
            return None
        if account.get("password") and verify_password(password, account["password"]) and account["role"] == role:
            return account
        return None

    def authenticate_google(self, token: str, role: str) -> Optional[dict]:
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except ValueError:
            return None

        email = idinfo.get("email")
        name = idinfo.get("name", email.split("@")[0])
        google_id = idinfo.get("sub")

        if not email:
            return None

        normalized_email = email.strip().lower()
        existing_account = auth_repository.get_account_by_email(normalized_email)

        if role == "admin":
            if not existing_account or existing_account.get("role") != "admin":
                return None
            if not existing_account.get("google_id"):
                auth_repository.attach_google_identity(normalized_email, google_id)
                existing_account["google_id"] = google_id
            return existing_account

        if existing_account and existing_account.get("role") != "user":
            return None

        return auth_repository.get_or_create_google_account(normalized_email, name, "user", google_id)

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )


auth_usecase = AuthUseCase()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserInfo:
    payload = auth_usecase.decode_token(credentials.credentials)
    email = payload.get("email")
    role = payload.get("role")
    name = payload.get("name")
    if not email or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user information.",
        )
    return UserInfo(email=email, name=name or "", role=role)


async def require_admin(
    user: UserInfo = Depends(get_current_user),
) -> UserInfo:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    return user
