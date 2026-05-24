from __future__ import annotations
from datetime import datetime, timezone
from pydantic import Field
from .base import MongoDocument

# Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

class ContactRequestDocument(MongoDocument):
    id: str
    name: str
    email: str = ""
    phone: str = ""
    company: str = ""
    service_interest: str = "general"
    message: str = ""
    source: str = ""
    status: str = "new" # "new" | "contacted" | "converted" | "closed"
    assigned_to: str = ""
    notes: str = ""
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
