import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.company_profile.repository import company_profile_repository
from app.models.company_profile import CompanyProfileDocument

class CompanyProfileBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    section_key: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    subtitle: str = ""
    description: str = ""
    color: str = ""
    icon: str = ""
    sort_order: int = 1
    is_active: bool = True


class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    section_key: str | None = None
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    color: str | None = None
    icon: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CompanyProfile(CompanyProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class CompanyProfileUseCase:
    def get_all(self) -> list[CompanyProfile]:
        company_profile_repository.ensure_indexes()
        items = company_profile_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [CompanyProfile(**item) for item in items]

    def create(self, payload: CompanyProfileCreate) -> CompanyProfile:
        company_profile_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now})
        doc = CompanyProfileDocument(**data)
        created = company_profile_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return CompanyProfile(**created)

    def update(self, item_id: str, payload: CompanyProfileUpdate) -> CompanyProfile | None:
        company_profile_repository.ensure_indexes()
        existing = company_profile_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = company_profile_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return CompanyProfile(**existing)

    def delete(self, item_id: str) -> bool:
        return company_profile_repository.delete(item_id)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

company_profile_usecase = CompanyProfileUseCase()
