import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.manager.site_content.repository import site_content_repository
from app.models.site_content import SiteContentDocument


class SiteContentBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    page_key: str = Field(..., min_length=1)
    section_key: str = Field(..., min_length=1)
    title: str = ""
    subtitle: str = ""
    description: str = ""
    content: dict[str, Any] = Field(default_factory=dict)
    sort_order: int = 1
    is_active: bool = True


class SiteContentCreate(SiteContentBase):
    pass


class SiteContentUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    page_key: str | None = Field(default=None, min_length=1)
    section_key: str | None = Field(default=None, min_length=1)
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    content: dict[str, Any] | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class SiteContent(SiteContentBase):
    id: str
    updated_by: str
    created_at: datetime
    updated_at: datetime


class SiteContentUseCase:
    # Xử lý nghiệp vụ chính cho module hiện tại.
    def get_content_by_page(self, page_key: str) -> list[SiteContent]:
        site_content_repository.ensure_indexes()
        contents = site_content_repository.get_content_by_page(page_key)
        return [SiteContent(**content) for content in contents]

    # Tạo bản ghi mới sau khi validate payload.
    def create_content(self, payload: SiteContentCreate, admin_email: str) -> SiteContent:
        site_content_repository.ensure_indexes()
        now = self._now()
        content_data = payload.model_dump(exclude_none=True)
        content_data.update(
            {
                "id": str(uuid.uuid4())[:8],
                "updated_by": admin_email,
                "created_at": now,
                "updated_at": now,
            }
        )
        content_doc = SiteContentDocument(**content_data)
        created = site_content_repository.create_content(
            content_doc.model_dump(by_alias=True, exclude_none=True)
        )
        return SiteContent(**created)

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update_content(self, content_id: str, payload: SiteContentUpdate, admin_email: str) -> SiteContent | None:
        site_content_repository.ensure_indexes()
        existing = site_content_repository.get_content_by_id(content_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_by"] = admin_email
            update_data["updated_at"] = self._now()
            existing = site_content_repository.update_content(content_id, update_data)

        return SiteContent(**existing)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete_content(self, content_id: str) -> bool:
        return site_content_repository.delete_content(content_id)

    # Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


site_content_usecase = SiteContentUseCase()
