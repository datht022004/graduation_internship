import os
from app.config import settings
from app.core.database import get_db

DOCUMENTS_COLLECTION = "documents"

class DocumentRepository:
    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[DOCUMENTS_COLLECTION]

    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all_documents(self) -> list[dict]:
        docs = list(self.get_collection().find({}).sort("uploaded_at", -1))
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return docs

    # Lấy danh sách bản ghi có phân trang/lọc khi cần.
    def list_documents(self, skip: int = 0, limit: int = 10) -> list[dict]:
        docs = list(
            self.get_collection()
            .find({})
            .sort("uploaded_at", -1)
            .skip(skip)
            .limit(limit)
        )
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return docs

    # Đếm số bản ghi phù hợp điều kiện truy vấn.
    def count_documents(self) -> int:
        return self.get_collection().count_documents({})

    # Tìm một bản ghi theo id.
    def get_document_by_id(self, doc_id: str) -> dict | None:
        doc = self.get_collection().find_one({"id": doc_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
    def add_document(self, doc_info: dict):
        self.get_collection().insert_one(doc_info)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def remove_document(self, doc_id: str):
        self.get_collection().delete_one({"id": doc_id})

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete_local_file(self, doc_id: str):
        for file in settings.upload_path.iterdir():
            if file.name.startswith(f"{doc_id}_"):
                os.remove(file)
                break

document_repository = DocumentRepository()
