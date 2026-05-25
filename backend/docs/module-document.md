# Module Document

Module Document quản lý tài liệu dùng làm kho tri thức cho RAG chatbot.

## Vị trí code chính

```text
backend/app/manager/document/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Admin API upload/list/delete document |
| `usecase.py` | Đọc file, tách chunk, index vector, lưu metadata |
| `repository.py` | CRUD collection `documents`, xóa file local |

Các file liên quan:

| Path | Vai trò |
|------|---------|
| `backend/app/core/vector_store.py` | Thêm/xóa chunk trong MongoDB Vector Search |
| `backend/app/core/rag_chain.py` | Chatbot truy vấn các chunk đã index |
| `backend/app/models/documents.py` | Schema `DocumentDocument` |
| `frontend/src/zones/admin/pages/AdminDocumentsPage.jsx` | Trang quản lý tài liệu |
| `frontend/src/zones/admin/components/DocumentUploader.jsx` | Upload file |
| `frontend/src/zones/admin/components/DocumentList.jsx` | Danh sách/xóa tài liệu |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API upload | FastAPI `UploadFile`, multipart form |
| File loaders | `PyPDFLoader`, `Docx2txtLoader`, `TextLoader` |
| Chunking | LangChain `RecursiveCharacterTextSplitter` |
| Embedding | OpenAI hoặc Google theo `LLM_PROVIDER` |
| Vector DB | MongoDB Atlas Vector Search |
| Metadata DB | MongoDB collection `documents` |
| Auth | Admin Bearer |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| POST | `/api/documents/upload` | Admin Bearer | Upload và index tài liệu |
| GET | `/api/documents` | Admin Bearer | List tài liệu có phân trang |
| DELETE | `/api/documents/{doc_id}` | Admin Bearer | Xóa tài liệu và vector chunks |

Query list:

| Query | Ý nghĩa |
|-------|---------|
| `page` | Trang |
| `pageSize` | Số item mỗi trang |

## Luồng upload và index

```text
Admin chọn file PDF/DOCX/TXT
  -> FE gửi multipart POST /api/documents/upload
  -> controller kiểm tra extension và max size
  -> usecase lưu file vào UPLOAD_DIR với prefix doc_id
  -> chọn loader theo loại file
  -> loader đọc nội dung thành documents
  -> RecursiveCharacterTextSplitter tách chunk
  -> gắn metadata doc_id, filename, file_type
  -> add_documents_to_store()
  -> embedding model tạo vector
  -> lưu chunk vào document_vectors
  -> lưu metadata vào documents
```

File hợp lệ:

- `pdf`
- `docx`
- `doc`
- `txt`

Giới hạn dung lượng lấy từ `MAX_FILE_SIZE_MB`.

## Luồng xóa

```text
Admin xóa document
  -> DELETE /api/documents/{doc_id}
  -> tìm metadata trong documents
  -> delete_documents_from_store(doc_id)
  -> xóa file local có prefix {doc_id}_
  -> xóa document metadata
```

Vector chunk bị xóa bằng điều kiện:

- `doc_id`
- hoặc `metadata.doc_id`

## Dữ liệu MongoDB

Collection metadata:

```text
documents
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | Document id 8 ký tự |
| `filename` | Tên file gốc |
| `file_type` | `pdf`, `docx`, `txt` |
| `file_size` | Dung lượng byte |
| `chunk_count` | Số chunk đã tạo |
| `uploaded_at` | Thời điểm upload |

Collection vector:

```text
document_vectors
```

Mỗi chunk lưu content, embedding và metadata. Đây là dữ liệu được `rag_chain.py` truy vấn khi user chat.

## Cấu hình quan trọng

| Biến | Ý nghĩa |
|------|---------|
| `UPLOAD_DIR` | Thư mục lưu file upload local |
| `MAX_FILE_SIZE_MB` | Dung lượng upload tối đa |
| `CHUNK_SIZE` | Kích thước chunk |
| `CHUNK_OVERLAP` | Độ overlap |
| `VECTOR_MONGODB_URI` | MongoDB vector |
| `VECTOR_INDEX_NAME` | Tên vector search index |
| `EMBEDDING_MODEL` | Model embedding |

## Lưu ý vận hành

- Document là nguồn dữ liệu chính cho chatbot RAG.
- Nếu upload thành công metadata nhưng vector DB lỗi, usecase sẽ xóa file local và ném lỗi.
- Cần API key embedding hợp lệ theo provider hiện tại.
