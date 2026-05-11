from pydantic import BaseModel

class DocumentInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    uploaded_at: str

class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total: int

class UploadResponse(BaseModel):
    message: str
    document: DocumentInfo

class DeleteResponse(BaseModel):
    message: str
    document_id: str
