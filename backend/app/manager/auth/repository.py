from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.models import UserDocument

USERS_COLLECTION = "users"

class AuthRepository:
    def get_collection(self):
        return get_db()[USERS_COLLECTION]

    def ensure_indexes(self):
        self.get_collection().create_index("email", unique=True)

    def get_account_by_email(self, email: str) -> Optional[dict]:
        user = self.get_collection().find_one({"email": email.strip().lower()})
        if user:
            user["_id"] = str(user["_id"])
        return user

    def get_account_by_role(self, role: str) -> Optional[dict]:
        user = self.get_collection().find_one({"role": role})
        if user:
            user["_id"] = str(user["_id"])
        return user

    def create_account(self, user_data: dict) -> str:
        if "email" in user_data:
            user_data["email"] = user_data["email"].strip().lower()
        result = self.get_collection().insert_one(user_data)
        return str(result.inserted_id)

    def attach_google_identity(self, email: str, google_id: str):
        self.get_collection().update_one(
            {"email": email.strip().lower()},
            {
                "$set": {"google_id": google_id},
                "$addToSet": {"auth_providers": "google"},
            },
        )

    def get_or_create_google_account(self, email: str, name: str, role: str, google_id: str) -> dict:
        account = self.get_account_by_email(email)
        if account:
            if not account.get("google_id"):
                self.attach_google_identity(email, google_id)
                account["google_id"] = google_id
            return account

        user_data = {
            "email": email.strip().lower(),
            "name": name,
            "role": role,
            "password": None,
            "google_id": google_id,
            "auth_providers": ["google"],
            "created_at": datetime.now(timezone.utc),
        }
        user_doc = UserDocument(**user_data)
        self.create_account(user_doc.model_dump(by_alias=True, exclude_none=True))
        return self.get_account_by_email(email)

auth_repository = AuthRepository()
