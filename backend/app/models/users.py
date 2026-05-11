from __future__ import annotations

from datetime import datetime

from pydantic import Field

from .base import MongoDocument


class UserDocument(MongoDocument):
    email: str
    name: str
    role: str
    password: str | None = None
    auth_providers: list[str] = Field(default_factory=list)
    google_id: str | None = None
    created_at: datetime
