from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.manager.chat.interface import ChatRequest
from app.manager.auth.interface import UserInfo
from app.manager.auth.usecase import get_current_user
from app.manager.chat.usecase import chat_usecase
from app.core.rag_chain import SOURCES_MARKER

router = APIRouter(prefix="/chat", tags=["RAG Chat"])


def _format_sse(data: str, event: str | None = None) -> str:
    lines = []
    if event:
        lines.append(f"event: {event}")
    for line in str(data).splitlines() or [""]:
        lines.append(f"data: {line}")
    return "\n".join(lines) + "\n\n"


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


@router.get("/sessions")
async def list_chat_sessions(user: UserInfo = Depends(get_current_user)):
    return {"sessions": chat_usecase.list_sessions(user.email)}


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
