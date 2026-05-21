# Module Document

Path:

```text
app/manager/document/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Upload/list/delete routes |
| `usecase.py` | Validate type, save file, load text, split, index |
| `repository.py` | Metadata collection và local file delete |

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/documents` | Admin |
| POST | `/api/documents/upload` | Admin |
| DELETE | `/api/documents/{doc_id}` | Admin |

## Supported Files

```text
pdf, doc, docx, txt
```

Giới hạn size:

```text
settings.MAX_FILE_SIZE_MB
```

Mặc định: `100MB`.

## Response Metadata

```json
{
  "id": "abcd1234",
  "filename": "doc.txt",
  "file_type": "txt",
  "file_size": 123,
  "chunk_count": 1,
  "uploaded_at": "..."
}
```

## Delete

Delete thực hiện:

1. Tìm metadata trong `documents`.
2. Xóa chunks trong `document_vectors`.
3. Xóa local file trong `UPLOAD_DIR`.
4. Xóa metadata.
