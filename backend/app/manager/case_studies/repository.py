from app.core.database import get_db

COLLECTION_NAME = "case_studies"

class CaseStudyRepository:
    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[COLLECTION_NAME]

    # Tạo index cần thiết để truy vấn nhanh và tránh trùng dữ liệu.
    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)

    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all(self) -> list[dict]:
        items = list(self.get_collection().find({}))
        return [self._normalize(item) for item in items]

    # Tìm một bản ghi theo id.
    def get_by_id(self, item_id: str) -> dict | None:
        item = self.get_collection().find_one({"id": item_id})
        if not item:
            return None
        return self._normalize(item)

    # Tạo bản ghi mới sau khi validate payload.
    def create(self, data: dict) -> dict:
        self.get_collection().insert_one(data)
        return self.get_by_id(data["id"])

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update(self, item_id: str, data: dict) -> dict | None:
        self.get_collection().update_one({"id": item_id}, {"$set": data})
        return self.get_by_id(item_id)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete(self, item_id: str) -> bool:
        result = self.get_collection().delete_one({"id": item_id})
        return result.deleted_count > 0

    # Chuẩn hóa dữ liệu từ MongoDB sang format trả về API.
    def _normalize(self, item: dict) -> dict:
        item["_id"] = str(item["_id"])
        return item

case_study_repository = CaseStudyRepository()
