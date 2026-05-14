import re

from app.core.database import get_db

USERS_COLLECTION = "users"


class UserRepository:
    def get_collection(self):
        return get_db()[USERS_COLLECTION]

    def ensure_indexes(self):
        self.get_collection().create_index("email", unique=True)
        self.get_collection().create_index("role")
        self.get_collection().create_index("name")

    def list_users(self, search: str = "", role: str = "", skip: int = 0, limit: int = 10) -> list[dict]:
        users = list(
            self.get_collection()
            .find(self._build_query(search=search, role=role))
            .sort([("created_at", -1), ("email", 1)])
            .skip(skip)
            .limit(limit)
        )
        return [self._normalize(user) for user in users]

    def count_matching_users(self, search: str = "", role: str = "") -> int:
        return self.get_collection().count_documents(self._build_query(search=search, role=role))

    def get_user_by_email(self, email: str) -> dict | None:
        user = self.get_collection().find_one({"email": email.strip().lower()})
        if not user:
            return None
        return self._normalize(user)

    def create_user(self, user_data: dict) -> dict:
        user_data["email"] = user_data["email"].strip().lower()
        self.get_collection().insert_one(user_data)
        return self.get_user_by_email(user_data["email"])

    def update_user(self, email: str, user_data: dict) -> dict | None:
        self.get_collection().update_one({"email": email.strip().lower()}, {"$set": user_data})
        return self.get_user_by_email(email)

    def add_auth_provider(self, email: str, provider: str):
        self.get_collection().update_one(
            {"email": email.strip().lower()},
            {"$addToSet": {"auth_providers": provider}},
        )

    def delete_user(self, email: str) -> bool:
        result = self.get_collection().delete_one({"email": email.strip().lower()})
        return result.deleted_count > 0

    def _build_query(self, search: str = "", role: str = "") -> dict:
        query = {}
        cleaned_role = role.strip().lower()
        if cleaned_role:
            query["role"] = cleaned_role

        cleaned_search = search.strip()
        if cleaned_search:
            escaped = re.escape(cleaned_search)
            query["$or"] = [
                {"name": {"$regex": escaped, "$options": "i"}},
                {"email": {"$regex": escaped, "$options": "i"}},
            ]

        return query

    def _normalize(self, user: dict) -> dict:
        user["_id"] = str(user["_id"])
        return user


user_repository = UserRepository()
