from __future__ import annotations
from datetime import datetime, timezone
from pydantic import Field
from .base import MongoDocument

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class CompanyProfileDocument(MongoDocument):
    id: str
    section_key: str # "metrics" | "capabilities" | "info"
    title: str
    subtitle: str = ""
    description: str = ""
    color: str = ""
    icon: str = ""
    sort_order: int = 1
    is_active: bool = True
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
