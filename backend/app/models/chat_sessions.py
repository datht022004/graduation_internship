from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from .base import MongoDocument


class ChatSessionDocument(MongoDocument):
    session_id: str
    user_email: str | None = None
    title: str = ""
    history: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
