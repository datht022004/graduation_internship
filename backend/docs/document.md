# Document Module

> Module quản lý tài liệu RAG: upload, parse, chunk, embed và quản lý lifecycle.

---

## 1. Cấu trúc file

```
backend/app/manager/document/
├── controller.py   # 3 endpoints (admin only)
├── interface.py    # DocumentInfo, UploadResponse, DeleteResponse
├── repository.py   # CRUD documents + file local
└── usecase.py      # Upload → parse → chunk → embed pipeline
```

## 2. API Endpoints

Prefix: `/api/documents` — yêu cầu admin auth.

| Method | URL | Mô tả |
|---|---|---|
| POST | `/upload` | Upload + index tài liệu (PDF/DOCX/TXT, max 100MB) |
| GET | `/` | Danh sách tất cả tài liệu |
| DELETE | `/{doc_id}` | Xóa tài liệu (metadata + file + vectors) |

## 3. Luồng Upload

```
upload_and_index_document(content, filename)
  1. Detect file type (pdf/docx/txt)
  2. doc_id = uuid4()[:8]
  3. Lưu file → data/documents/{doc_id}_{filename}
  4. Load text: PyPDFLoader / Docx2txtLoader / TextLoader
  5. Split: RecursiveCharacterTextSplitter(1000 chars, 200 overlap)
  6. Gắn metadata: {doc_id, filename, file_type}
  7. Embed + lưu vào vector store (document_vectors)
  8. Lưu metadata vào documents collection
  ⚠ Lỗi bước 4-8 → xóa file đã lưu
```

## 4. Luồng Xóa

```
delete_document(doc_id)
  1. Kiểm tra tồn tại → get_document_by_id
  2. Xóa vectors → delete_documents_from_store
  3. Xóa file local → os.remove(data/documents/{doc_id}_*)
  4. Xóa metadata → remove_document
```

## 5. Repository

Collection: `documents` (App MongoDB). Dùng custom field `id` (UUID[:8]).

## 6. Quan hệ với Chat

Document module index dữ liệu → Chat module search dữ liệu qua vector store.
