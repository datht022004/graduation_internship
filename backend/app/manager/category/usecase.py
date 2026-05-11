import re
import unicodedata
import uuid
from datetime import datetime, timezone

from app.manager.blog.repository import blog_repository
from app.manager.category.interface import Category, CategoryCreate, CategoryUpdate
from app.manager.category.repository import category_repository
from app.models import CategoryDocument


class CategoryUseCase:
    def get_all_categories(self) -> list[Category]:
        category_repository.ensure_indexes()
        categories = category_repository.get_all_categories()
        return [self._with_post_count(category) for category in categories]

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
        if category_repository.count_categories() > 0:
            return

        names = []
        for post in blog_repository.get_all_posts():
            category = post.get("category")
            if category and category not in names:
                names.append(category)

        if not names:
            names = ["SEO Foundation", "Website CRO", "Ads Optimization"]

        now = self._now()
        categories = []
        for name in names:
            category_doc = CategoryDocument(
                id=str(uuid.uuid4())[:8],
                name=name,
                slug=self._unique_slug(name),
                description="",
                created_at=now,
                updated_at=now,
            )
            categories.append(category_doc.model_dump(by_alias=True, exclude_none=True))
        category_repository.insert_many(categories)

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
