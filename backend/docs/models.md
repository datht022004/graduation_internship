# MongoDB Document Models

> Tài liệu này mô tả tất cả Pydantic document models trong `app/models/`, ánh xạ trực tiếp với các MongoDB collections.

---

## 1. MongoDocument — Base Class (`models/base.py`)

### Mục đích

Class base cho tất cả document models, xử lý trường `_id` của MongoDB.

### Cấu trúc

```python
class MongoDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",              # Không cho phép field thừa
        populate_by_name=True,       # Cho phép dùng alias hoặc tên Python
        str_strip_whitespace=True,   # Tự động trim whitespace string
    )

    mongo_id: str | None = Field(default=None, alias="_id")
```

### Nguyên lý

- `alias="_id"`: khi serialize bằng `model_dump(by_alias=True)`, field `mongo_id` sẽ thành `_id` — khớp với MongoDB.
- `extra="forbid"`: ngăn chặn dữ liệu thừa bị lưu vào DB.
- Tất cả document model kế thừa class này.

---

## 2. UserDocument (`models/users.py`)

### Collection: `users`

### Cấu trúc

```python
class UserDocument(MongoDocument):
    email: str                                    # Email (unique index)
    name: str                                     # Tên hiển thị
    role: str                                     # "admin" hoặc "user"
    password: str | None = None                   # Bcrypt hash (None cho Google login)
    auth_providers: list[str] = []                # ["password"], ["google"], hoặc cả hai
    google_id: str | None = None                  # Google sub ID
    created_at: datetime                          # Thời gian tạo
```

### Document mẫu trong MongoDB

```json
{
  "_id": "ObjectId",
  "email": "user@gmail.com",
  "password": "$2b$12$...",
  "name": "Enterprise Client",
  "role": "user",
  "auth_providers": ["password"],
  "google_id": null,
  "created_at": "2026-05-09T01:00:00Z"
}
```

### Indexes

| Index | Type | Tạo bởi |
|---|---|---|
| `email` | unique | `auth/repository.py → ensure_indexes()` |

### Sử dụng bởi

- `auth/repository.py` — tạo account
- `auth/usecase.py` — seed default users, register

---

## 3. BlogPostDocument (`models/blog_posts.py`)

### Collection: `blog_posts`

### Cấu trúc

```python
class BlogPostDocument(MongoDocument):
    id: str                          # UUID[:8] do app tạo
    title: str                       # Tiêu đề bài viết
    category: str                    # Chủ đề (vd: "SEO Foundation")
    readTime: str                    # "7 phút đọc"
    excerpt: str                     # Mô tả ngắn
    content: str = ""                # Nội dung HTML đầy đủ
    imageUrl: str = ""               # URL hình ảnh
    author: str = ""                 # Tác giả
    tags: str = ""                   # Tags phân cách bằng dấu phẩy
    isFeatured: bool = False         # Bài viết nổi bật
    createdAt: str                   # ISO datetime string
    updatedAt: str                   # ISO datetime string
```

### Document mẫu trong MongoDB

```json
{
  "_id": "ObjectId",
  "id": "a1b2c3d4",
  "title": "Checklist SEO 2026 cho website dịch vụ",
  "category": "SEO Foundation",
  "readTime": "7 phút đọc",
  "excerpt": "Danh sách 25 hạng mục...",
  "content": "<h2>Checklist nền tảng</h2>...",
  "imageUrl": "https://...",
  "author": "DataZone Editorial",
  "tags": "SEO, Checklist, Website dịch vụ",
  "isFeatured": true,
  "createdAt": "2026-05-09T01:00:00Z",
  "updatedAt": "2026-05-09T01:00:00Z"
}
```

### Indexes

| Index | Type | Tạo bởi |
|---|---|---|
| `id` | unique | `blog/repository.py → ensure_indexes()` |
| `(isFeatured, createdAt)` | compound descending | `blog/repository.py → ensure_indexes()` |

### Lưu ý

- Dùng `id` (UUID[:8]) thay vì `_id` (ObjectId) làm primary key logic.
- `createdAt`/`updatedAt` là ISO string, không phải datetime object.

### Sử dụng bởi

- `blog/usecase.py` — tạo/seed blog posts
- `blog/repository.py` — CRUD operations

---

## 4. CategoryDocument (`models/categories.py`)

### Collection: `categories` (chưa tích hợp đầy đủ)

### Cấu trúc

```python
class CategoryDocument(MongoDocument):
    id: str                                          # UUID[:8]
    name: str                                        # Tên danh mục
    slug: str                                        # URL-friendly slug
    description: str = ""                            # Mô tả
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
```

### Trạng thái

- Model đã được định nghĩa và export trong `models/__init__.py`.
- Chưa có controller, usecase, repository riêng.
- Dự kiến sử dụng cho phân loại blog posts.

---

## 5. ChatSessionDocument (`models/chat_sessions.py`)

### Collection: `chat_sessions`

### Cấu trúc

```python
class ChatSessionDocument(MongoDocument):
    session_id: str                                  # UUID session
    user_email: str | None = None                    # Email user sở hữu
    title: str = ""                                  # Tiêu đề (câu hỏi đầu tiên)
    history: list[dict[str, Any]] = []               # Lịch sử tin nhắn (LangChain format)
    created_at: datetime
    updated_at: datetime
```

### Document mẫu trong MongoDB

```json
{
  "_id": "ObjectId",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_email": "user@gmail.com",
  "title": "Dịch vụ SEO bên mình có gì?",
  "history": [
    {
      "type": "human",
      "data": { "content": "Dịch vụ SEO bên mình có gì?" }
    },
    {
      "type": "ai",
      "data": { "content": "Dịch vụ SEO của chúng tôi gồm..." }
    }
  ],
  "created_at": "2026-05-09T01:00:00Z",
  "updated_at": "2026-05-09T01:05:00Z"
}
```

### Lưu ý

- `history` lưu theo format LangChain `messages_to_dict()`.
- Giới hạn: tối đa 30 cặp human/AI (`MAX_STORED_TURNS = 30`).
- `title` được set tự động bằng câu hỏi đầu tiên.

### Sử dụng bởi

- `chat/repository.py` — tạo session, lưu/lấy history
- `chat/usecase.py` — quản lý session lifecycle

---

## 6. DocumentDocument (`models/documents.py`)

### Collection: `documents`

### Cấu trúc

```python
class DocumentDocument(MongoDocument):
    id: str                  # UUID[:8]
    filename: str            # Tên file gốc
    file_type: str           # "pdf", "docx", "txt"
    file_size: int           # Kích thước file (bytes)
    chunk_count: int         # Số chunks sau khi split
    uploaded_at: str         # ISO datetime string
```

### Document mẫu trong MongoDB

```json
{
  "_id": "ObjectId",
  "id": "a1b2c3d4",
  "filename": "service-catalog.pdf",
  "file_type": "pdf",
  "file_size": 1048576,
  "chunk_count": 25,
  "uploaded_at": "2026-05-09T01:00:00Z"
}
```

### Lưu ý

- Đây là **metadata** của file đã upload, không phải nội dung file.
- Nội dung file được lưu dưới dạng vectors trong collection `document_vectors`.
- File gốc lưu trên disk tại `data/documents/{doc_id}_{filename}`.

### Sử dụng bởi

- `document/usecase.py` — tạo metadata sau upload
- `document/repository.py` — CRUD operations

---

## 7. VectorDocument (`models/document_vectors.py`)

### Collection: `document_vectors` (trong Vector MongoDB)

### Cấu trúc

```python
class VectorDocument(MongoDocument):
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    embedding: list[float] | None = None    # Vector 1536 chiều
    doc_id: str | None = None               # ID document gốc
    filename: str | None = None             # Tên file gốc
    file_type: str | None = None            # Loại file
    metadata: dict[str, Any] | None = None  # Metadata LangChain
    text: str | None = None                 # Nội dung text chunk
```

### Document mẫu trong MongoDB

```json
{
  "_id": "ObjectId",
  "embedding": [0.0123, -0.0456, ...],
  "text": "Dịch vụ SEO của chúng tôi bao gồm...",
  "metadata": {
    "doc_id": "a1b2c3d4",
    "filename": "service-catalog.pdf",
    "file_type": "pdf",
    "page": 3
  }
}
```

### Lưu ý

- `extra="allow"` vì LangChain có thể thêm fields không lường trước.
- Model này **không được dùng trực tiếp** trong code — LangChain `MongoDBAtlasVectorSearch` tự quản lý serialization.
- Model chỉ để tài liệu hóa cấu trúc collection.

---

## 8. Tổng kết Collections

| Collection | Model | MongoDB | Mô tả |
|---|---|---|---|
| `users` | `UserDocument` | App DB | Tài khoản người dùng |
| `blog_posts` | `BlogPostDocument` | App DB | Bài viết blog |
| `categories` | `CategoryDocument` | App DB | Danh mục blog (chưa tích hợp) |
| `chat_sessions` | `ChatSessionDocument` | App DB | Phiên chat + lịch sử |
| `documents` | `DocumentDocument` | App DB | Metadata tài liệu upload |
| `document_vectors` | `VectorDocument` | Vector DB | Text chunks + embeddings |
