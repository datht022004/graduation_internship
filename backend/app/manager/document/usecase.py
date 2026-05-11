import uuid
import os
from datetime import datetime, timezone

from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.core.vector_store import add_documents_to_store, delete_documents_from_store
from app.manager.document.interface import DocumentInfo
from app.manager.document.repository import document_repository
from app.models import DocumentDocument


class DocumentUseCase:
    def get_all_documents(self) -> list[DocumentInfo]:
        docs = document_repository.get_all_documents()
        return [DocumentInfo(**doc) for doc in docs]

    def _get_loader(self, file_path: str, file_type: str):
        if file_type == "pdf":
            return PyPDFLoader(file_path)
        elif file_type == "docx":
            return Docx2txtLoader(file_path)
        elif file_type == "txt":
            return TextLoader(file_path, encoding="utf-8")
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    def _detect_file_type(self, filename: str) -> str:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        type_map = {
            "pdf": "pdf",
            "docx": "docx",
            "doc": "docx",
            "txt": "txt",
            "text": "txt",
        }
        if ext not in type_map:
            raise ValueError(
                f"File type .{ext} is not supported. Supported types: PDF, DOCX, TXT."
            )
        return type_map[ext]

    async def upload_and_index_document(
        self,
        file_content: bytes,
        filename: str,
    ) -> DocumentInfo:
        file_type = self._detect_file_type(filename)

        doc_id = str(uuid.uuid4())[:8]
        safe_filename = f"{doc_id}_{filename}"
        file_path = settings.upload_path / safe_filename

        with open(file_path, "wb") as f:
            f.write(file_content)

        try:
            loader = self._get_loader(str(file_path), file_type)
            raw_documents = loader.load()

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP,
                separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            )
            chunks = text_splitter.split_documents(raw_documents)

            for chunk in chunks:
                chunk.metadata.update(
                    {
                        "doc_id": doc_id,
                        "filename": filename,
                        "file_type": file_type,
                    }
                )

            add_documents_to_store(chunks)

            doc_info = DocumentInfo(
                id=doc_id,
                filename=filename,
                file_type=file_type,
                file_size=len(file_content),
                chunk_count=len(chunks),
                uploaded_at=datetime.now(timezone.utc).isoformat(),
            )
            doc_doc = DocumentDocument(**doc_info.model_dump())
            document_repository.add_document(
                doc_doc.model_dump(by_alias=True, exclude_none=True)
            )

            return doc_info

        except Exception as e:
            if file_path.exists():
                os.remove(file_path)
            raise e

    def delete_document(self, doc_id: str) -> bool:
        doc_entry = document_repository.get_document_by_id(doc_id)

        if not doc_entry:
            return False

        delete_documents_from_store(doc_id)
        document_repository.delete_local_file(doc_id)
        document_repository.remove_document(doc_id)

        return True

document_usecase = DocumentUseCase()
