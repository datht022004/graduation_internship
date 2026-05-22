from __future__ import annotations
from datetime import datetime, timezone
from pydantic import Field
from .base import MongoDocument

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class TestimonialDocument(MongoDocument):
    id: str
    client_name: str
    client_position: str = ""
    client_company: str = ""
    client_avatar: str = ""
    content: str
    rating: int = 5
    service_type: str = "seo"
    is_active: bool = True
    created_at: datetime = Field(default_factory=_utcnow)
