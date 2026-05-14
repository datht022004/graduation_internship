import re
import unicodedata
import uuid
from math import ceil
from datetime import datetime, timezone

from app.manager.category.interface import Category, CategoryCreate, CategoryListResponse, CategoryUpdate
from app.manager.category.repository import category_repository
from app.models import CategoryDocument

DEFAULT_SITE_CATEGORIES = [
    {
        "name": "Home",
        "description": "Nội dung tổng quan và giới thiệu chính trên trang chủ.",
    },
    {
        "name": "Dịch vụ SEO",
        "description": "Bài viết liên quan tới dịch vụ SEO, audit, content và tăng trưởng organic.",
    },
    {
        "name": "Thiết kế website",
        "description": "Bài viết về thiết kế website, landing page, UX/UI và tối ưu chuyển đổi.",
    },
    {
        "name": "Quảng cáo +",
        "description": "Bài viết về quảng cáo đa kênh, performance marketing và tối ưu ngân sách.",
    },
    {
        "name": "Blog",
        "description": "Tin tức, playbook và kiến thức chung cho doanh nghiệp.",
    },
]

LEGACY_CATEGORY_RENAMES = {
    "SEO Foundation": "Dịch vụ SEO",
    "SEO Local": "Dịch vụ SEO",
    "SEO Audit": "Dịch vụ SEO",
    "SEO Content": "Dịch vụ SEO",
    "Content Strategy": "Dịch vụ SEO",
    "Website CRO": "Thiết kế website",
    "CRO": "Thiết kế website",
    "Ads Optimization": "Quảng cáo +",
    "Analytics": "Quảng cáo +",
    "Social Content": "Quảng cáo +",
}


class CategoryUseCase:
    def get_all_categories(self) -> list[Category]:
        category_repository.ensure_indexes()
        categories = category_repository.get_all_categories()
        return [self._with_post_count(category) for category in categories]

    def list_categories(self, name: str = "", page: int = 1, page_size: int = 10) -> CategoryListResponse:
        category_repository.ensure_indexes()
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        total = category_repository.count_matching_categories(name)
        total_pages = ceil(total / page_size) if total else 1
        safe_page = min(page, total_pages)
        skip = (safe_page - 1) * page_size
        categories = category_repository.list_categories(name=name, skip=skip, limit=page_size)

        return CategoryListResponse(
            items=[self._with_post_count(category) for category in categories],
            total=total,
            page=safe_page,
            pageSize=page_size,
            totalPages=total_pages,
        )

    def create_category(self, payload: CategoryCreate) -> Category:
        category_repository.ensure_indexes()
        now = self._now()
        name = payload.name.strip()
        category_data = {
            "id": str(uuid.uuid4())[:8],
            "name": name,
            "slug": self._unique_slug(name),
            "description": payload.description.strip(),
            "created_at": now,
            "updated_at": now,
        }
        category_doc = CategoryDocument(**category_data)
        category = category_repository.create_category(
            category_doc.model_dump(by_alias=True, exclude_none=True)
        )
        return self._with_post_count(category)

    def update_category(self, category_id: str, payload: CategoryUpdate) -> Category | None:
        category_repository.ensure_indexes()
        existing = category_repository.get_category_by_id(category_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            if "name" in update_data:
                update_data["name"] = update_data["name"].strip()
                update_data["slug"] = self._unique_slug(update_data["name"], exclude_id=category_id)
            if "description" in update_data:
                update_data["description"] = update_data["description"].strip()
            update_data["updated_at"] = self._now()
            existing = category_repository.update_category(category_id, update_data)

        return self._with_post_count(existing)

    def delete_category(self, category_id: str) -> str:
        existing = category_repository.get_category_by_id(category_id)
        if not existing:
            return "not_found"
        if category_repository.count_posts_by_category(existing["name"]) > 0:
            return "in_use"
        return "deleted" if category_repository.delete_category(category_id) else "not_found"

    def seed_default_categories(self):
        category_repository.ensure_indexes()
        self._migrate_legacy_categories()

        now = self._now()
        categories = []
        existing_names = {category["name"] for category in category_repository.get_all_categories()}

        for category in DEFAULT_SITE_CATEGORIES:
            if category["name"] in existing_names:
                continue

            category_doc = CategoryDocument(
                id=str(uuid.uuid4())[:8],
                name=category["name"],
                slug=self._unique_slug(category["name"]),
                description=category["description"],
                created_at=now,
                updated_at=now,
            )
            categories.append(category_doc.model_dump(by_alias=True, exclude_none=True))
        category_repository.insert_many(categories)

    def _migrate_legacy_categories(self):
        now = self._now()
        descriptions = {
            category["name"]: category["description"]
            for category in DEFAULT_SITE_CATEGORIES
        }

        for old_name, new_name in LEGACY_CATEGORY_RENAMES.items():
            category_repository.rename_posts_category(old_name, new_name)
            legacy_category = category_repository.get_category_by_name(old_name)
            if not legacy_category:
                continue

            existing_target = category_repository.get_category_by_name(new_name)
            if existing_target:
                category_repository.delete_category(legacy_category["id"])
                continue

            category_repository.update_category(
                legacy_category["id"],
                {
                    "name": new_name,
                    "slug": self._unique_slug(new_name, exclude_id=legacy_category["id"]),
                    "description": descriptions.get(new_name, legacy_category.get("description", "")),
                    "updated_at": now,
                },
            )

    def _with_post_count(self, category: dict) -> Category:
        return Category(
            **category,
            postCount=category_repository.count_posts_by_category(category["name"]),
        )

    def _unique_slug(self, name: str, exclude_id: str | None = None) -> str:
        base_slug = self._create_slug(name)
        slug = base_slug
        suffix = 2
        while category_repository.slug_exists(slug, exclude_id=exclude_id):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def _create_slug(self, value: str) -> str:
        slug = unicodedata.normalize("NFD", value.strip().lower())
        slug = "".join(char for char in slug if unicodedata.category(char) != "Mn")
        slug = slug.replace("đ", "d")
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        slug = slug.strip("-")
        return slug or "danh-muc"

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


category_usecase = CategoryUseCase()
