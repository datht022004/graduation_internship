from __future__ import annotations
from datetime import datetime, timezone
from pydantic import Field
from .base import MongoDocument

# Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class ServicePackageDocument(MongoDocument):
    id: str
    service_type: str # "seo" | "web-design" | "ads"
    title: str
    summary: str = ""
    points: list[str] = Field(default_factory=list)
    price_label: str = ""
    is_popular: bool = False
    sort_order: int = 1
    is_active: bool = True
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
