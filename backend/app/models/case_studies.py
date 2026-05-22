from __future__ import annotations
from datetime import datetime, timezone
from pydantic import Field
from typing import Any
from .base import MongoDocument

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class CaseStudyDocument(MongoDocument):
    id: str
    title: str
    client_industry: str = ""
    challenge: str = ""
    solution: str = ""
    results: list[dict[str, str]] = Field(default_factory=list)
    chart_data: list[int] = Field(default_factory=list)
    service_type: str = "seo"
    is_featured: bool = False
    image_url: str = ""
    sort_order: int = 1
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
