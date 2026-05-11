from __future__ import annotations

from datetime import datetime, timezone

from pydantic import Field

from .base import MongoDocument


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class CategoryDocument(MongoDocument):
    id: str
    name: str
    slug: str
    description: str = ""
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
