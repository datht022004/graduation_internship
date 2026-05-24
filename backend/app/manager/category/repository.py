import re

from app.core.database import get_db

CATEGORIES_COLLECTION = "categories"
BLOG_POSTS_COLLECTION = "blog_posts"


class CategoryRepository:
    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[CATEGORIES_COLLECTION]

    # Trả dữ liệu public cho tab Blog.
    def get_blog_collection(self):
        return get_db()[BLOG_POSTS_COLLECTION]

    # Tạo index cần thiết để truy vấn nhanh và tránh trùng dữ liệu.
    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)
        self.get_collection().create_index("slug", unique=True)
        self.get_collection().create_index("name")

    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all_categories(self) -> list[dict]:
        categories = list(self.get_collection().find({}).sort("name", 1))
        return [self._normalize(category) for category in categories]

    # Lấy danh sách bản ghi có phân trang/lọc khi cần.
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

    # Đếm số bản ghi phù hợp điều kiện truy vấn.
    def count_matching_categories(self, name: str = "") -> int:
        return self.get_collection().count_documents(self._build_search_query(name))

    # Tìm một bản ghi theo id.
    def get_category_by_id(self, category_id: str) -> dict | None:
        category = self.get_collection().find_one({"id": category_id})
        if not category:
            return None
        return self._normalize(category)

    # Tìm category theo tên.
    def get_category_by_name(self, name: str) -> dict | None:
        category = self.get_collection().find_one({"name": name})
        if not category:
            return None
        return self._normalize(category)

    # Kiểm tra slug đã tồn tại hay chưa.
    def slug_exists(self, slug: str, exclude_id: str | None = None) -> bool:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        return self.get_collection().count_documents(query) > 0

    # Tạo bản ghi mới sau khi validate payload.
    def create_category(self, category_data: dict) -> dict:
        self.get_collection().insert_one(category_data)
        return self.get_category_by_id(category_data["id"])

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update_category(self, category_id: str, category_data: dict) -> dict | None:
        self.get_collection().update_one({"id": category_id}, {"$set": category_data})
        return self.get_category_by_id(category_id)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete_category(self, category_id: str) -> bool:
        result = self.get_collection().delete_one({"id": category_id})
        return result.deleted_count > 0

    # Đếm số bản ghi phù hợp điều kiện truy vấn.
    def count_categories(self) -> int:
        return self.get_collection().count_documents({})

    # Đếm số bản ghi phù hợp điều kiện truy vấn.
    def count_posts_by_category(self, category_name: str) -> int:
        return self.get_blog_collection().count_documents({"category": category_name})

    # Đổi tên category trong các bài viết liên quan.
    def rename_posts_category(self, old_name: str, new_name: str):
        self.get_blog_collection().update_many(
            {"category": old_name},
            {"$set": {"category": new_name}},
        )

    # Thêm nhiều bản ghi cùng lúc khi seed dữ liệu.
    def insert_many(self, categories: list[dict]):
        if categories:
            self.get_collection().insert_many(categories)

    # Chuẩn hóa dữ liệu từ MongoDB sang format trả về API.
    def _normalize(self, category: dict) -> dict:
        category["_id"] = str(category["_id"])
        return category

    # Tạo dữ liệu phụ trợ nội bộ từ input hiện tại.
    def _build_search_query(self, name: str = "") -> dict:
        cleaned = name.strip()
        if not cleaned:
            return {}
        return {"name": {"$regex": re.escape(cleaned), "$options": "i"}}


category_repository = CategoryRepository()
