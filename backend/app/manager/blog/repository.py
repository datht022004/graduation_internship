import re
import unicodedata

from app.core.database import get_db

BLOG_POSTS_COLLECTION = "blog_posts"


class BlogRepository:
    def get_collection(self):
        return get_db()[BLOG_POSTS_COLLECTION]

    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)
        self.get_collection().create_index([("isFeatured", -1), ("createdAt", -1)])

    def get_all_posts(self) -> list[dict]:
        posts = list(
            self.get_collection().find({}).sort(
                [("isFeatured", -1), ("createdAt", -1)]
            )
        )
        return [self._normalize(post) for post in posts]

    def list_posts(self, category: str = "", search: str = "", skip: int = 0, limit: int = 10) -> list[dict]:
        query = self._build_list_query(category)
        posts = list(
            self.get_collection()
            .find(query)
            .sort([("isFeatured", -1), ("createdAt", -1)])
        )
        matched_posts = self._filter_by_search([self._normalize(post) for post in posts], search)
        return matched_posts[skip : skip + limit]

    def count_matching_posts(self, category: str = "", search: str = "") -> int:
        query = self._build_list_query(category)
        if not search.strip():
            return self.get_collection().count_documents(query)
        posts = list(
            self.get_collection()
            .find(query)
            .sort([("isFeatured", -1), ("createdAt", -1)])
        )
        return len(self._filter_by_search([self._normalize(post) for post in posts], search))

    def get_post_by_id(self, post_id: str) -> dict | None:
        post = self.get_collection().find_one({"id": post_id})
        if not post:
            return None
        return self._normalize(post)

    def create_post(self, post_data: dict) -> dict:
        self.get_collection().insert_one(post_data)
        return self.get_post_by_id(post_data["id"])

    def update_post(self, post_id: str, post_data: dict) -> dict | None:
        self.get_collection().update_one({"id": post_id}, {"$set": post_data})
        return self.get_post_by_id(post_id)

    def delete_post(self, post_id: str) -> bool:
        result = self.get_collection().delete_one({"id": post_id})
        return result.deleted_count > 0

    def count_posts(self) -> int:
        return self.get_collection().count_documents({})

    def insert_many(self, posts: list[dict]):
        if posts:
            self.get_collection().insert_many(posts)

    def _normalize(self, post: dict) -> dict:
        post["_id"] = str(post["_id"])
        return post

    def _build_list_query(self, category: str = "") -> dict:
        cleaned_category = category.strip()
        if not cleaned_category:
            return {}
        return {"category": cleaned_category}

    def _filter_by_search(self, posts: list[dict], search: str = "") -> list[dict]:
        cleaned_search = search.strip().lower()
        if not cleaned_search:
            return posts

        slug_search = self._create_slug(cleaned_search)
        filtered = []
        for post in posts:
            title = post.get("title", "").lower()
            slug = (post.get("slug") or self._create_slug(post.get("title", ""))).lower()
            if cleaned_search in title or cleaned_search in slug or slug_search in slug:
                filtered.append(post)
        return filtered

    def _create_slug(self, value: str) -> str:
        slug = unicodedata.normalize("NFD", value.strip().lower())
        slug = "".join(char for char in slug if unicodedata.category(char) != "Mn")
        slug = slug.replace("đ", "d")
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        return slug.strip("-")


blog_repository = BlogRepository()
