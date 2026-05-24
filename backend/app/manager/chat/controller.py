from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.manager.auth.usecase import UserInfo, get_current_user, require_admin
from app.manager.chat.usecase import chat_usecase
from app.manager.chat.repository import chat_repository
from app.core.rag_chain import SOURCES_MARKER

router = APIRouter(prefix="/chat", tags=["RAG Chat"])
admin_router = APIRouter(prefix="/admin/chat", tags=["Admin - Chat History"])


class ChatRequest(BaseModel):
    """Payload gui cau hoi chat, co the tiep tuc mot session cu."""

    message: str
    session_id: str | None = None


# Định dạng payload thành Server-Sent Events cho stream chat.
def _format_sse(data: str, event: str | None = None) -> str:
    lines = []
    if event:
        lines.append(f"event: {event}")
    for line in str(data).splitlines() or [""]:
        lines.append(f"data: {line}")
    return "\n".join(lines) + "\n\n"


# Endpoint chat RAG, trả response dạng SSE stream.
@router.post("")
async def chat(
    request: ChatRequest,
    user: UserInfo = Depends(get_current_user),
):
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    session_id = chat_usecase.get_or_create_session(request.session_id, user.email)

    # Generator stream từng chunk trả lời về client.
    async def event_stream():
        async for chunk in chat_usecase.stream_chat(request.message, session_id, user.email):
            if chunk.startswith(SOURCES_MARKER):
                yield _format_sse(chunk[len(SOURCES_MARKER):], event="sources")
            else:
                yield _format_sse(chunk)
        yield _format_sse(session_id, event="session")
        yield _format_sse("[DONE]", event="done")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# Lấy danh sách bản ghi có phân trang/lọc khi cần.
@router.get("/sessions")
async def list_chat_sessions(user: UserInfo = Depends(get_current_user)):
    return {"sessions": chat_usecase.list_sessions(user.email)}


# Xử lý request API và gọi usecase tương ứng.
@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    user: UserInfo = Depends(get_current_user),
):
    session = chat_usecase.get_session_messages(session_id, user.email)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found.",
        )
    return session

# Xử lý request API và gọi usecase tương ứng.
@admin_router.get("/users")
async def admin_get_users_with_chats(admin: UserInfo = Depends(require_admin)):
    return chat_repository.get_users_with_chats()

# Xử lý request API và gọi usecase tương ứng.
@admin_router.get("/users/{user_email}/sessions")
async def admin_get_user_sessions(user_email: str, admin: UserInfo = Depends(require_admin)):
    return {"sessions": chat_repository.list_sessions_for_admin(user_email)}

# Xử lý request API và gọi usecase tương ứng.
@admin_router.get("/sessions/{session_id}")
async def admin_get_session_detail(session_id: str, admin: UserInfo = Depends(require_admin)):
    session = chat_repository.get_session_messages_admin(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
