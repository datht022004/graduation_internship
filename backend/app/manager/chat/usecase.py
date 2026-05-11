import uuid
from typing import AsyncGenerator

from langchain_core.messages import AIMessage, HumanMessage

from app.core.rag_chain import SOURCES_MARKER, stream_rag_response
from app.manager.chat.repository import chat_repository

MAX_STORED_TURNS = 30
MAX_CONTEXT_TURNS = 4
SIMPLE_GREETING_ANSWERS = {
    "hi",
    "hello",
    "xin chao",
    "xin chào",
    "chao",
    "chào",
    "alo",
}


def _normalize_message(message: str) -> str:
    return " ".join(message.strip().lower().split())


def _get_quick_answer(question: str) -> str | None:
    normalized = _normalize_message(question).strip("!?. ")
    if normalized in SIMPLE_GREETING_ANSWERS:
        return "Xin chào! Tôi có thể hỗ trợ bạn tư vấn SEO, thiết kế website, quảng cáo hoặc đào tạo SEO."
    return None


class ChatUseCase:
    def get_or_create_session(self, session_id: str | None, user_email: str | None = None) -> str:
        if not session_id:
            session_id = str(uuid.uuid4())
        chat_repository.init_session(session_id, user_email)
        return session_id

    def _get_context_history(self, session_id: str, user_email: str | None):
        history = chat_repository.get_session_history(session_id, user_email)
        return history[-(MAX_CONTEXT_TURNS * 2) :]

    def _add_to_history(self, session_id: str, user_email: str | None, question: str, answer: str):
        history = chat_repository.get_session_history(session_id, user_email)
        history.append(HumanMessage(content=question))
        history.append(AIMessage(content=answer))
        if len(history) > MAX_STORED_TURNS * 2:
            history = history[-(MAX_STORED_TURNS * 2) :]
        chat_repository.save_session_history(session_id, history, user_email)
        chat_repository.set_title_if_empty(session_id, user_email, question)

    def list_sessions(self, user_email: str):
        return chat_repository.list_sessions(user_email)

    def get_session_messages(self, session_id: str, user_email: str):
        return chat_repository.get_session_messages(session_id, user_email)

    async def stream_chat(
        self,
        question: str,
        session_id: str,
        user_email: str | None = None,
    ) -> AsyncGenerator[str, None]:
        chat_history = self._get_context_history(session_id, user_email)
        quick_answer = _get_quick_answer(question)

        if quick_answer:
            yield quick_answer
            self._add_to_history(session_id, user_email, question, quick_answer)
            return

        full_answer = []
        async for chunk in stream_rag_response(question, chat_history):
            if chunk.startswith(SOURCES_MARKER):
                yield chunk
            else:
                full_answer.append(chunk)
                yield chunk

        self._add_to_history(session_id, user_email, question, "".join(full_answer))

chat_usecase = ChatUseCase()
