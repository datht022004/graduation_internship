from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import Field

from .base import MongoDocument


# Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SiteContentDocument(MongoDocument):
    id: str
    page_key: str
    section_key: str
    title: str = ""
    subtitle: str = ""
    description: str = ""
    content: dict[str, Any] = Field(default_factory=dict)
    sort_order: int = 1
    is_active: bool = True
    updated_by: str = ""
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
