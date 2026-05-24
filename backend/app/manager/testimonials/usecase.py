import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.testimonials.repository import testimonial_repository
from app.models.testimonials import TestimonialDocument

class TestimonialBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    client_name: str = Field(..., min_length=1)
    client_position: str = ""
    client_company: str = ""
    client_avatar: str = ""
    content: str = Field(..., min_length=1)
    rating: int = 5
    service_type: str = "seo"
    is_active: bool = True


class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    client_name: str | None = None
    client_position: str | None = None
    client_company: str | None = None
    client_avatar: str | None = None
    content: str | None = None
    rating: int | None = None
    service_type: str | None = None
    is_active: bool | None = None


class Testimonial(TestimonialBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class TestimonialUseCase:
    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all(self) -> list[Testimonial]:
        testimonial_repository.ensure_indexes()
        items = testimonial_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [Testimonial(**item) for item in items]

    # Tạo bản ghi mới sau khi validate payload.
    def create(self, payload: TestimonialCreate) -> Testimonial:
        testimonial_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now})
        doc = TestimonialDocument(**data)
        created = testimonial_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return Testimonial(**created)

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update(self, item_id: str, payload: TestimonialUpdate) -> Testimonial | None:
        testimonial_repository.ensure_indexes()
        existing = testimonial_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = testimonial_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return Testimonial(**existing)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete(self, item_id: str) -> bool:
        return testimonial_repository.delete(item_id)

    # Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

testimonial_usecase = TestimonialUseCase()
