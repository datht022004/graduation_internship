from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel

from app.config import settings
from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.document.usecase import DocumentInfo, DocumentListResponse, document_usecase

router = APIRouter(prefix="/documents", tags=["Document Management"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}


class UploadResponse(BaseModel):
    """Response sau khi upload va index tai lieu thanh cong."""

    message: str
    document: DocumentInfo


class DeleteResponse(BaseModel):
    """Response sau khi xoa tai lieu khoi he thong."""

    message: str
    document_id: str


# Nhận file upload, tách chunk và index vào vector store.
@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    admin: UserInfo = Depends(require_admin),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type .{ext} is not supported. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}.",
        )

    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File is too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    try:
        doc_info = await document_usecase.upload_and_index_document(content, file.filename)
        return UploadResponse(
            message=f"Upload successful: {file.filename} ({doc_info.chunk_count} chunks)",
            document=doc_info,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )


# Lấy danh sách bản ghi có phân trang/lọc khi cần.
@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    admin: UserInfo = Depends(require_admin),
):
    return document_usecase.list_documents(page=page, page_size=page_size)


# Xóa bản ghi/tài nguyên theo id/khóa chính.
@router.delete("/{doc_id}", response_model=DeleteResponse)
async def remove_document(
    doc_id: str,
    admin: UserInfo = Depends(require_admin),
):
    success = document_usecase.delete_document(doc_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document not found with ID: {doc_id}",
        )
    return DeleteResponse(
        message="Document deleted successfully.",
        document_id=doc_id,
    )
