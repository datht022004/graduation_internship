import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.contact_requests.repository import contact_request_repository
from app.models.contact_requests import ContactRequestDocument

class ContactRequestBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1)
    email: str = ""
    phone: str = ""
    company: str = ""
    service_interest: str = "general"
    message: str = ""
    source: str = ""
    status: str = "new"
    assigned_to: str = ""
    notes: str = ""


class ContactRequestCreate(ContactRequestBase):
    pass

class ContactRequestUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    service_interest: str | None = None
    message: str | None = None
    source: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    notes: str | None = None


class ContactRequest(ContactRequestBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class ContactRequestUseCase:
    def get_all(self) -> list[ContactRequest]:
        contact_request_repository.ensure_indexes()
        items = contact_request_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [ContactRequest(**item) for item in items]

    def create(self, payload: ContactRequestCreate) -> ContactRequest:
        contact_request_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now})
        doc = ContactRequestDocument(**data)
        created = contact_request_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return ContactRequest(**created)

    def update(self, item_id: str, payload: ContactRequestUpdate) -> ContactRequest | None:
        contact_request_repository.ensure_indexes()
        existing = contact_request_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = contact_request_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return ContactRequest(**existing)

    def delete(self, item_id: str) -> bool:
        return contact_request_repository.delete(item_id)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

contact_request_usecase = ContactRequestUseCase()
