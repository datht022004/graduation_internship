from app.core.database import get_db

COLLECTION_NAME = "testimonials"

class TestimonialRepository:
    def get_collection(self):
        return get_db()[COLLECTION_NAME]

    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)

    def get_all(self) -> list[dict]:
        items = list(self.get_collection().find({}))
        return [self._normalize(item) for item in items]

    def get_by_id(self, item_id: str) -> dict | None:
        item = self.get_collection().find_one({"id": item_id})
        if not item:
            return None
        return self._normalize(item)

    def create(self, data: dict) -> dict:
        self.get_collection().insert_one(data)
        return self.get_by_id(data["id"])

    def update(self, item_id: str, data: dict) -> dict | None:
        self.get_collection().update_one({"id": item_id}, {"$set": data})
        return self.get_by_id(item_id)

    def delete(self, item_id: str) -> bool:
        result = self.get_collection().delete_one({"id": item_id})
        return result.deleted_count > 0

    def _normalize(self, item: dict) -> dict:
        item["_id"] = str(item["_id"])
        return item

testimonial_repository = TestimonialRepository()
