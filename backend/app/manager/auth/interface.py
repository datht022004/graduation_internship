from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "user"


class GoogleLoginRequest(BaseModel):
    google_token: str
    role: str = "user"


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class UserInfo(BaseModel):
    email: str
    name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
