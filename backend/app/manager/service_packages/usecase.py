import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.service_packages.repository import service_package_repository
from app.models.service_packages import ServicePackageDocument

class ServicePackageBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    service_type: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    summary: str = ""
    points: list[str] = Field(default_factory=list)
    price_label: str = ""
    is_popular: bool = False
    sort_order: int = 1
    is_active: bool = True


class ServicePackageCreate(ServicePackageBase):
    pass

class ServicePackageUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    service_type: str | None = None
    title: str | None = None
    summary: str | None = None
    points: list[str] | None = None
    price_label: str | None = None
    is_popular: bool | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ServicePackage(ServicePackageBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class ServicePackageUseCase:
    def get_all(self) -> list[ServicePackage]:
        service_package_repository.ensure_indexes()
        items = service_package_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [ServicePackage(**item) for item in items]

    def create(self, payload: ServicePackageCreate) -> ServicePackage:
        service_package_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now})
        doc = ServicePackageDocument(**data)
        created = service_package_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return ServicePackage(**created)

    def update(self, item_id: str, payload: ServicePackageUpdate) -> ServicePackage | None:
        service_package_repository.ensure_indexes()
        existing = service_package_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = service_package_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return ServicePackage(**existing)

    def delete(self, item_id: str) -> bool:
        return service_package_repository.delete(item_id)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

service_package_usecase = ServicePackageUseCase()
