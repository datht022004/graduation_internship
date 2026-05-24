from datetime import datetime, timezone

from langchain_core.messages import messages_from_dict, messages_to_dict

from app.core.database import get_db
from app.models import ChatSessionDocument

CHAT_COLLECTION = "chat_sessions"


# Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
def _now():
    return datetime.now(timezone.utc)


# Chuyển LangChain message thành item lưu được trong MongoDB.
def _message_to_item(message):
    role = "user" if message.get("type") == "human" else "assistant"
    return {
        "role": role,
        "content": message.get("data", {}).get("content", ""),
    }


class ChatRepository:
    # Lấy Mongo collection tương ứng với repository hiện tại.
    def get_collection(self):
        return get_db()[CHAT_COLLECTION]

    # Tạo filter MongoDB theo session và user hiện tại.
    def _query(self, session_id: str, user_email: str | None = None):
        query = {"session_id": session_id}
        if user_email:
            query["user_email"] = user_email
        return query

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
    def get_session_history(self, session_id: str, user_email: str | None = None) -> list:
        session = self.get_collection().find_one(self._query(session_id, user_email))
        if session and "history" in session:
            return messages_from_dict(session["history"])
        return []

    # Ghi lại lịch sử chat của một session.
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

    # Tạo session chat rỗng nếu chưa tồn tại.
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

    # Đặt tiêu đề session từ câu hỏi đầu tiên nếu chưa có.
    def set_title_if_empty(self, session_id: str, user_email: str | None, title: str):
        self.get_collection().update_one(
            {
                **self._query(session_id, user_email),
                "$or": [{"title": ""}, {"title": {"$exists": False}}],
            },
            {"$set": {"title": title[:80], "updated_at": _now()}},
        )

    # Lấy danh sách bản ghi có phân trang/lọc khi cần.
    def list_sessions(self, user_email: str, limit: int = 20):
        sessions = self.get_collection().find(
            {"user_email": user_email},
            {"_id": 0, "session_id": 1, "title": 1, "updated_at": 1, "created_at": 1},
        ).sort("updated_at", -1).limit(limit)
        return list(sessions)

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
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

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
    def get_users_with_chats(self):
        pipeline = [
            {"$match": {"user_email": {"$ne": None, "$ne": ""}}},
            {"$group": {
                "_id": "$user_email",
                "session_count": {"$sum": 1},
                "last_active": {"$max": "$updated_at"}
            }},
            {"$sort": {"last_active": -1}}
        ]
        results = list(self.get_collection().aggregate(pipeline))
        return [
            {
                "email": r["_id"],
                "session_count": r["session_count"],
                "last_active": r["last_active"]
            }
            for r in results
        ]

    # Lấy danh sách bản ghi có phân trang/lọc khi cần.
    def list_sessions_for_admin(self, user_email: str):
        sessions = self.get_collection().find(
            {"user_email": user_email},
            {"_id": 0, "session_id": 1, "title": 1, "updated_at": 1, "created_at": 1},
        ).sort("updated_at", -1)
        return list(sessions)

    # Thao tác trực tiếp với MongoDB cho module hiện tại.
    def get_session_messages_admin(self, session_id: str):
        session = self.get_collection().find_one(
            {"session_id": session_id},
            {"_id": 0, "session_id": 1, "title": 1, "history": 1, "updated_at": 1, "created_at": 1, "user_email": 1},
        )
        if not session:
            return None
        return {
            **session,
            "messages": [_message_to_item(message) for message in session.get("history", [])],
        }

chat_repository = ChatRepository()
