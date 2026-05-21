# Document API

Tất cả endpoint cần admin token.

## GET `/api/documents`

Query:

| Param | Mặc định |
|-------|----------|
| `page` | `1` |
| `pageSize` | `10` |

Response:

```json
{
  "documents": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

## POST `/api/documents/upload`

Request:

```text
multipart/form-data
file=<pdf/doc/docx/txt>
```

Response:

```json
{
  "message": "Upload successful: doc.txt (1 chunks)",
  "document": {
    "id": "...",
    "filename": "doc.txt",
    "file_type": "txt",
    "file_size": 100,
    "chunk_count": 1,
    "uploaded_at": "..."
  }
}
```

Error thường gặp:

- `400`: file type không hỗ trợ
- `413`: file quá lớn
- `500`: lỗi parse/embed/index

## DELETE `/api/documents/{doc_id}`

Response:

```json
{
  "message": "Document deleted successfully.",
  "document_id": "..."
}
```

Không tìm thấy trả `404`.
