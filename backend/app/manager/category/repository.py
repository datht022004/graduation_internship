import re

from app.core.database import get_db

CATEGORIES_COLLECTION = "categories"
BLOG_POSTS_COLLECTION = "blog_posts"


class CategoryRepository:
    def get_collection(self):
        return get_db()[CATEGORIES_COLLECTION]

    def get_blog_collection(self):
        return get_db()[BLOG_POSTS_COLLECTION]

    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)
        self.get_collection().create_index("slug", unique=True)
        self.get_collection().create_index("name")

    def get_all_categories(self) -> list[dict]:
        categories = list(self.get_collection().find({}).sort("name", 1))
        return [self._normalize(category) for category in categories]

    def list_categories(self, name: str = "", skip: int = 0, limit: int = 10) -> list[dict]:
        query = self._build_search_query(name)
        categories = list(
            self.get_collection()
            .find(query)
            .sort("name", 1)
            .skip(skip)
            .limit(limit)
        )
        return [self._normalize(category) for category in categories]

    def count_matching_categories(self, name: str = "") -> int:
        return self.get_collection().count_documents(self._build_search_query(name))

    def get_category_by_id(self, category_id: str) -> dict | None:
        category = self.get_collection().find_one({"id": category_id})
        if not category:
            return None
        return self._normalize(category)

    def get_category_by_name(self, name: str) -> dict | None:
        category = self.get_collection().find_one({"name": name})
        if not category:
            return None
        return self._normalize(category)

    def slug_exists(self, slug: str, exclude_id: str | None = None) -> bool:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        return self.get_collection().count_documents(query) > 0

    def create_category(self, category_data: dict) -> dict:
        self.get_collection().insert_one(category_data)
        return self.get_category_by_id(category_data["id"])

    def update_category(self, category_id: str, category_data: dict) -> dict | None:
        self.get_collection().update_one({"id": category_id}, {"$set": category_data})
        return self.get_category_by_id(category_id)

    def delete_category(self, category_id: str) -> bool:
        result = self.get_collection().delete_one({"id": category_id})
        return result.deleted_count > 0

    def count_categories(self) -> int:
        return self.get_collection().count_documents({})

    def count_posts_by_category(self, category_name: str) -> int:
        return self.get_blog_collection().count_documents({"category": category_name})

    def rename_posts_category(self, old_name: str, new_name: str):
        self.get_blog_collection().update_many(
            {"category": old_name},
            {"$set": {"category": new_name}},
        )

    def insert_many(self, categories: list[dict]):
        if categories:
            self.get_collection().insert_many(categories)

    def _normalize(self, category: dict) -> dict:
        category["_id"] = str(category["_id"])
        return category

    def _build_search_query(self, name: str = "") -> dict:
        cleaned = name.strip()
        if not cleaned:
            return {}
        return {"name": {"$regex": re.escape(cleaned), "$options": "i"}}


category_repository = CategoryRepository()
