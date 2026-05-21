# Backend Architecture

## Tổng Quan

Backend cung cấp API cho:

- Auth email/password và Google OAuth.
- Public content cho frontend user zone.
- Admin CRUD blog, category, user và document.
- RAG chatbot qua SSE streaming.

Tech stack:

| Thành phần | Công nghệ |
|------------|-----------|
| API | FastAPI |
| DB | MongoDB |
| Vector DB | MongoDB Atlas Local / Atlas Vector Search |
| RAG | LangChain |
| LLM | OpenAI hoặc Google |
| Auth | JWT HS256, passlib bcrypt |
| Rate limit | SlowAPI |
| Config | pydantic-settings |

## Layer Chính

```text
Client
  -> FastAPI controller
  -> UseCase
  -> Repository
  -> MongoDB
```

Core services:

```text
core/database.py      # Mongo clients
core/vector_store.py  # embedding + MongoDBAtlasVectorSearch
core/rag_chain.py     # retrieve context + LLM streaming
```

## FastAPI App

`app/main.py` tạo app, CORS, SlowAPI limiter và include `api_router`.

CORS hiện cho phép:

```text
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
```

## Auth Flow

```text
POST /api/auth/login
  -> authenticate_user()
  -> create_access_token()
  -> FE lưu token

Protected request
  -> Authorization: Bearer <token>
  -> get_current_user()
  -> require_admin() nếu route admin
```

JWT payload gồm:

```json
{
  "email": "user@gmail.com",
  "name": "User",
  "role": "user",
  "exp": "..."
}
```

## RAG Flow

Upload tài liệu:

```text
POST /api/documents/upload
  -> lưu file local
  -> load PDF/DOCX/TXT
  -> split chunk
  -> embed
  -> lưu vector vào document_vectors
  -> lưu metadata vào documents
```

Chat:

```text
POST /api/chat
  -> tạo/lấy session
  -> lấy lịch sử gần nhất
  -> similarity_search()
  -> prompt + context
  -> stream LLM response
  -> trả text/event-stream
```

## Router Map

| Prefix | Module |
|--------|--------|
| `/api/auth` | Auth |
| `/api/user` | Public content |
| `/api/admin/users` | Admin users |
| `/api/admin/blog` | Admin blog |
| `/api/admin/categories` | Admin categories |
| `/api/documents` | Documents |
| `/api/chat` | Chat |

## Lưu Ý Thiết Kế

- Controller không xử lý trực tiếp MongoDB.
- UseCase chứa schema gần nghiệp vụ và logic chính.
- Repository chỉ biết MongoDB collection.
- Frontend chỉ nên gọi backend thông qua các endpoint `/api/*`.
