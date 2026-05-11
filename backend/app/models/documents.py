from __future__ import annotations

from .base import MongoDocument


class DocumentDocument(MongoDocument):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    uploaded_at: str
