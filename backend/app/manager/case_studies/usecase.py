import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.case_studies.repository import case_study_repository
from app.models.case_studies import CaseStudyDocument

class CaseStudyBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1)
    client_industry: str = ""
    challenge: str = ""
    solution: str = ""
    results: list[dict[str, str]] = Field(default_factory=list)
    chart_data: list[int] = Field(default_factory=list)
    service_type: str = "seo"
    is_featured: bool = False
    image_url: str = ""
    sort_order: int = 1


class CaseStudyCreate(CaseStudyBase):
    pass

class CaseStudyUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = None
    client_industry: str | None = None
    challenge: str | None = None
    solution: str | None = None
    results: list[dict[str, str]] | None = None
    chart_data: list[int] | None = None
    service_type: str | None = None
    is_featured: bool | None = None
    image_url: str | None = None
    sort_order: int | None = None


class CaseStudy(CaseStudyBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class CaseStudyUseCase:
    def get_all(self) -> list[CaseStudy]:
        case_study_repository.ensure_indexes()
        items = case_study_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [CaseStudy(**item) for item in items]

    def create(self, payload: CaseStudyCreate) -> CaseStudy:
        case_study_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now})
        doc = CaseStudyDocument(**data)
        created = case_study_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return CaseStudy(**created)

    def update(self, item_id: str, payload: CaseStudyUpdate) -> CaseStudy | None:
        case_study_repository.ensure_indexes()
        existing = case_study_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = case_study_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return CaseStudy(**existing)

    def delete(self, item_id: str) -> bool:
        return case_study_repository.delete(item_id)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

case_study_usecase = CaseStudyUseCase()
