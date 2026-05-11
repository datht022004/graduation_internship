from datetime import datetime, timezone

from langchain_core.messages import messages_from_dict, messages_to_dict

from app.core.database import get_db
from app.models import ChatSessionDocument

CHAT_COLLECTION = "chat_sessions"


def _now():
    return datetime.now(timezone.utc)


def _message_to_item(message):
    role = "user" if message.get("type") == "human" else "assistant"
    return {
        "role": role,
        "content": message.get("data", {}).get("content", ""),
    }


class ChatRepository:
    def get_collection(self):
        return get_db()[CHAT_COLLECTION]

    def _query(self, session_id: str, user_email: str | None = None):
        query = {"session_id": session_id}
        if user_email:
            query["user_email"] = user_email
        return query

    def get_session_history(self, session_id: str, user_email: str | None = None) -> list:
        session = self.get_collection().find_one(self._query(session_id, user_email))
        if session and "history" in session:
            return messages_from_dict(session["history"])
        return []

    def save_session_history(self, session_id: str, history: list, user_email: str | None = None):
        history_dicts = messages_to_dict(history)
        update = {
            "history": history_dicts,
            "updated_at": _now(),
        }
        if user_email:
            update["user_email"] = user_email
        self.get_collection().update_one(
            self._query(session_id, user_email),
            {"$set": update},
            upsert=True
        )

    def init_session(self, session_id: str, user_email: str | None = None, title: str = ""):
        query = self._query(session_id, user_email)
        session = self.get_collection().find_one(query)
        if session:
            return

        session_doc = ChatSessionDocument(
            session_id=session_id,
            user_email=user_email,
            title=title,
            history=[],
            created_at=_now(),
            updated_at=_now(),
        )
        self.get_collection().insert_one(
            session_doc.model_dump(by_alias=True, exclude_none=True)
        )

    def set_title_if_empty(self, session_id: str, user_email: str | None, title: str):
        self.get_collection().update_one(
            {
                **self._query(session_id, user_email),
                "$or": [{"title": ""}, {"title": {"$exists": False}}],
            },
            {"$set": {"title": title[:80], "updated_at": _now()}},
        )

    def list_sessions(self, user_email: str, limit: int = 20):
        sessions = self.get_collection().find(
            {"user_email": user_email},
            {"_id": 0, "session_id": 1, "title": 1, "updated_at": 1, "created_at": 1},
        ).sort("updated_at", -1).limit(limit)
        return list(sessions)

    def get_session_messages(self, session_id: str, user_email: str):
        session = self.get_collection().find_one(
            self._query(session_id, user_email),
            {"_id": 0, "session_id": 1, "title": 1, "history": 1, "updated_at": 1, "created_at": 1},
        )
        if not session:
            return None

        return {
            **session,
            "messages": [_message_to_item(message) for message in session.get("history", [])],
        }

chat_repository = ChatRepository()
