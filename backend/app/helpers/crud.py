from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.core.database import get_db


class BaseCrudRepository:
    """Generic CRUD repository for MongoDB collections."""

    # Khởi tạo helper/class với cấu hình ban đầu.
    def __init__(self, collection_name: str):
        self.collection_name = collection_name

    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[self.collection_name]

    # Chuyển document MongoDB sang dict dùng được ở response.
    def _serialize(self, doc: dict) -> dict:
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc

    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all(self) -> list[dict]:
        docs = list(self.get_collection().find({}))
        return [self._serialize(doc) for doc in docs]

    # Tìm một bản ghi theo id.
    def get_by_id(self, doc_id: str) -> Optional[dict]:
        doc = self.get_collection().find_one({"_id": ObjectId(doc_id)})
        return self._serialize(doc) if doc else None

    # Tạo bản ghi mới sau khi validate payload.
    def create(self, data: dict) -> dict:
        data["created_at"] = datetime.now(timezone.utc)
        result = self.get_collection().insert_one(data)
        data["id"] = str(result.inserted_id)
        data.pop("_id", None)
        return data

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update(self, doc_id: str, data: dict) -> Optional[dict]:
        data["updated_at"] = datetime.now(timezone.utc)
        result = self.get_collection().find_one_and_update(
            {"_id": ObjectId(doc_id)},
            {"$set": data},
            return_document=True,
        )
        return self._serialize(result) if result else None

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete(self, doc_id: str) -> bool:
        result = self.get_collection().delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count > 0
