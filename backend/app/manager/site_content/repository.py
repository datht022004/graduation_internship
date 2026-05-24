from app.core.database import get_db

SITE_CONTENT_COLLECTION = "site_content"


class SiteContentRepository:
    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[SITE_CONTENT_COLLECTION]

    # Tạo index cần thiết để truy vấn nhanh và tránh trùng dữ liệu.
    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)
        self.get_collection().create_index("page_key")
        self.get_collection().create_index("section_key")

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
    def get_content_by_page(self, page_key: str) -> list[dict]:
        contents = list(
            self.get_collection()
            .find({"page_key": page_key})
            .sort("sort_order", 1)
        )
        return [self._normalize(content) for content in contents]

    # Tìm một bản ghi theo id.
    def get_content_by_id(self, content_id: str) -> dict | None:
        content = self.get_collection().find_one({"id": content_id})
        if not content:
            return None
        return self._normalize(content)

    # Tạo bản ghi mới sau khi validate payload.
    def create_content(self, content_data: dict) -> dict:
        self.get_collection().insert_one(content_data)
        return self.get_content_by_id(content_data["id"])

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update_content(self, content_id: str, content_data: dict) -> dict | None:
        self.get_collection().update_one({"id": content_id}, {"$set": content_data})
        return self.get_content_by_id(content_id)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete_content(self, content_id: str) -> bool:
        result = self.get_collection().delete_one({"id": content_id})
        return result.deleted_count > 0

    # Thêm nhiều bản ghi cùng lúc khi seed dữ liệu.
    def insert_many(self, contents: list[dict]):
        if contents:
            self.get_collection().insert_many(contents)

    # Chuẩn hóa dữ liệu từ MongoDB sang format trả về API.
    def _normalize(self, content: dict) -> dict:
        content["_id"] = str(content["_id"])
        return content


site_content_repository = SiteContentRepository()
