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

    def list_posts(self, category: str = "", skip: int = 0, limit: int = 10) -> list[dict]:
        query = self._build_list_query(category)
        posts = list(
            self.get_collection()
            .find(query)
            .sort([("isFeatured", -1), ("createdAt", -1)])
            .skip(skip)
            .limit(limit)
        )
        return [self._normalize(post) for post in posts]

    def count_matching_posts(self, category: str = "") -> int:
        return self.get_collection().count_documents(self._build_list_query(category))

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


blog_repository = BlogRepository()
