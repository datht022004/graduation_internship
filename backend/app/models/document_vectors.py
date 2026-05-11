from __future__ import annotations

from typing import Any

from pydantic import ConfigDict

from .base import MongoDocument


class VectorDocument(MongoDocument):
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    embedding: list[float] | None = None
    doc_id: str | None = None
    filename: str | None = None
    file_type: str | None = None
    metadata: dict[str, Any] | None = None
    text: str | None = None
