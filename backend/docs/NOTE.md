# Backend Project Structure

> Tài liệu này mô tả cấu trúc thư mục thực tế của backend, cập nhật theo code hiện tại.

---

## Tổng quan cấu trúc thư mục

```
backend/
├── .env                        # Biến môi trường (không commit)
├── .env.example                # Mẫu biến môi trường
├── .gitignore
├── Dockerfile
├── requirements.txt
├── README.md
│
├── data/
│   └── documents/              # Thư mục lưu file tài liệu upload
│
├── docs/                       # Tài liệu kỹ thuật dự án
│   ├── NOTE.md                 # Cấu trúc thư mục (file này)
│   ├── PLAN.md                 # Kế hoạch triển khai ban đầu
│   ├── architecture.md         # Kiến trúc tổng thể và nguyên lý thiết kế
│   ├── core.md                 # Module core: database, vector store, RAG chain
│   ├── helpers.md              # Module helpers: CRUD, security, seed, rate limit
│   ├── models.md               # Tất cả MongoDB document models
│   │
│   ├── module-auth.md          # ★ Module Auth: cấu trúc 4 file + CRUD + ví dụ
│   ├── module-blog.md          # ★ Module Blog: cấu trúc 4 file + CRUD + ví dụ
│   ├── module-chat.md          # ★ Module Chat: SSE streaming + session + ví dụ
│   ├── module-document.md      # ★ Module Document: upload pipeline + ví dụ
│   ├── module-user.md          # ★ Module User: public API + ví dụ
│   │
│   ├── login.md                # Auth API chi tiết (request/response/JWT)
│   ├── blog.md                 # Blog API chi tiết
│   ├── rag-chat.md             # RAG Chat flow tổng quan
│   ├── document.md             # Document API tóm tắt
│   ├── chat.md                 # Chat API tóm tắt
│   ├── user.md                 # User API tóm tắt
│   └── usecases.md             # Danh sách Use Case hệ thống
│
├── tests/                      # Unit tests
│   ├── test_auth.py
│   ├── test_blog.py
│   ├── test_chat.py
│   ├── test_config_and_app.py
│   └── test_models.py
│
└── app/                        # Source code chính
    ├── __init__.py
    ├── main.py                 # Entry point - FastAPI app, lifespan, CORS
    ├── config.py               # Pydantic Settings đọc .env
    │
    ├── config/                 # (placeholder - chưa sử dụng)
    ├── constants/              # (placeholder - chưa sử dụng)
    ├── database/               # (placeholder - chưa sử dụng)
    ├── handlers/               # (placeholder - chưa sử dụng)
    ├── middleware/              # (placeholder - chưa sử dụng)
    │
    ├── core/                   # Tầng hạ tầng cốt lõi
    │   ├── __init__.py
    │   ├── database.py         # Kết nối MongoDB (app DB + vector DB)
    │   ├── vector_store.py     # MongoDB Atlas Vector Search + Embedding
    │   └── rag_chain.py        # LangChain RAG chain + LLM streaming
    │
    ├── helpers/                # Hàm tiện ích dùng chung
    │   ├── __init__.py
    │   ├── crud.py             # BaseCrudRepository - CRUD generic cho MongoDB
    │   ├── security.py         # Hash/verify password bằng bcrypt
    │   ├── seed.py             # Seed dữ liệu demo khi khởi động
    │   └── rate_limit.py       # SlowAPI rate limiter
    │
    ├── models/                 # Pydantic MongoDB Document models
    │   ├── __init__.py         # Export tất cả models
    │   ├── base.py             # MongoDocument base class
    │   ├── users.py            # UserDocument
    │   ├── blog_posts.py       # BlogPostDocument
    │   ├── categories.py       # CategoryDocument
    │   ├── chat_sessions.py    # ChatSessionDocument
    │   ├── documents.py        # DocumentDocument
    │   └── document_vectors.py # VectorDocument
    │
    └── manager/                # Các module nghiệp vụ chính
        ├── router.py           # Tổng hợp tất cả route → /api/*
        │
        ├── auth/               # Module xác thực
        │   ├── controller.py   # POST /login, /register, /google, GET /me
        │   ├── usecase.py      # JWT, authenticate, register, Google OAuth
        │   ├── repository.py   # CRUD users collection
        │   └── interface.py    # Pydantic request/response schemas
        │
        ├── blog/               # Module quản lý blog
        │   ├── controller.py   # CRUD blog posts (admin only)
        │   ├── usecase.py      # Business logic + seed default posts
        │   ├── repository.py   # CRUD blog_posts collection
        │   └── interface.py    # Pydantic blog schemas
        │
        ├── chat/               # Module RAG chatbot
        │   ├── controller.py   # POST /chat, GET /sessions
        │   ├── usecase.py      # Session management + stream chat
        │   ├── repository.py   # CRUD chat_sessions collection
        │   └── interface.py    # ChatRequest, ChatResponse schemas
        │
        ├── document/           # Module quản lý tài liệu RAG
        │   ├── controller.py   # Upload, list, delete documents
        │   ├── usecase.py      # Upload → parse → chunk → embed → index
        │   ├── repository.py   # CRUD documents collection + local file
        │   └── interface.py    # DocumentInfo, UploadResponse schemas
        │
        └── user/               # Module public cho khách hàng
            ├── controller.py   # GET /home, /seo-service, /web-design, /ads, /blog
            └── usecase.py      # Gom dữ liệu public trả về FE
```

## Pattern chung của mỗi module trong `manager/`

Mỗi module nghiệp vụ gồm **4 file** theo Clean Architecture:

| File | Vai trò |
|---|---|
| `controller.py` | Nhận HTTP request → gọi usecase → trả HTTP response |
| `usecase.py` | Xử lý business logic, điều phối giữa các repository |
| `repository.py` | Tương tác trực tiếp với MongoDB (CRUD operations) |
| `interface.py` | Pydantic schemas cho request/response (DTO) |

**Ngoại lệ**: module `user/` không có `repository.py` và `interface.py` vì chỉ đọc dữ liệu từ các module khác.

## Flow xử lý request

```
Client Request
    → CORS Middleware
        → Rate Limiter (nếu có)
            → Controller (nhận request)
                → Auth Dependency (JWT verify)
                    → Usecase (business logic)
                        → Repository (query MongoDB)
                            → MongoDB
```

## Singleton instances

Mỗi module tạo singleton instance ở cuối file:

```python
# repository.py
auth_repository = AuthRepository()

# usecase.py
auth_usecase = AuthUseCase()
```

Controller import trực tiếp instance này thay vì Dependency Injection container.
