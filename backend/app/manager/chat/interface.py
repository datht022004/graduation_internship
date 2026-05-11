from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class SourceInfo(BaseModel):
    filename: str
    page: Optional[int] = None
    content_preview: str = ""


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceInfo] = []
    session_id: str
