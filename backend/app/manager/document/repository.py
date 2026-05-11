import os
from app.config import settings
from app.core.database import get_db

DOCUMENTS_COLLECTION = "documents"

class DocumentRepository:
    def get_collection(self):
        return get_db()[DOCUMENTS_COLLECTION]

    def get_all_documents(self) -> list[dict]:
        docs = list(self.get_collection().find({}))
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return docs

    def get_document_by_id(self, doc_id: str) -> dict | None:
        doc = self.get_collection().find_one({"id": doc_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    def add_document(self, doc_info: dict):
        self.get_collection().insert_one(doc_info)

    def remove_document(self, doc_id: str):
        self.get_collection().delete_one({"id": doc_id})

    def delete_local_file(self, doc_id: str):
        for file in settings.upload_path.iterdir():
            if file.name.startswith(f"{doc_id}_"):
                os.remove(file)
                break

document_repository = DocumentRepository()
