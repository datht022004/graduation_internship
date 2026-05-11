# Kiến trúc tổng thể Backend

> Tài liệu này mô tả kiến trúc, nguyên lý thiết kế và luồng hoạt động tổng thể của backend.

---

## 1. Tổng quan hệ thống

**Nova Business RAG Chatbot** là hệ thống backend API phục vụ:

- Website giới thiệu dịch vụ Digital Marketing (SEO, Web Design, Ads)
- Quản trị nội dung (Blog, tài liệu)
- Chatbot tư vấn AI sử dụng RAG (Retrieval-Augmented Generation)

### Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | FastAPI (Python) |
| Database | MongoDB (app data) + MongoDB Atlas Vector Search (vectors) |
| LLM | OpenAI GPT-4.1-mini hoặc Google Gemini |
| Embedding | OpenAI text-embedding-3-small hoặc Google Embedding |
| RAG Framework | LangChain |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Rate Limiting | SlowAPI |
| Config | Pydantic Settings + .env |
| Container | Docker |

---

## 2. Kiến trúc phân tầng (Layered Architecture)

```
┌─────────────────────────────────────────────┐
│               Client (Frontend)             │
└─────────────────┬───────────────────────────┘
                  │ HTTP / SSE
┌─────────────────▼───────────────────────────┐
│          FastAPI Application Layer           │
│  ┌───────────────────────────────────────┐  │
│  │  Middleware: CORS, Rate Limiter       │  │
│  └───────────────┬───────────────────────┘  │
│  ┌───────────────▼───────────────────────┐  │
│  │  Controller Layer (manager/*/ctrl)    │  │
│  │  - Nhận request, validate input      │  │
│  │  - Auth dependency (JWT verify)      │  │
│  │  - Gọi usecase, trả response        │  │
│  └───────────────┬───────────────────────┘  │
│  ┌───────────────▼───────────────────────┐  │
│  │  Usecase Layer (manager/*/usecase)    │  │
│  │  - Business logic thuần              │  │
│  │  - Điều phối giữa các repository    │  │
│  │  - Không biết HTTP                   │  │
│  └───────────────┬───────────────────────┘  │
│  ┌───────────────▼───────────────────────┐  │
│  │  Repository Layer (manager/*/repo)    │  │
│  │  - CRUD trực tiếp MongoDB            │  │
│  │  - Serialize/deserialize document    │  │
│  └───────────────┬───────────────────────┘  │
│  ┌───────────────▼───────────────────────┐  │
│  │  Core Layer (core/*)                  │  │
│  │  - Database connections               │  │
│  │  - Vector store + embedding           │  │
│  │  - RAG chain + LLM                    │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │
    ┌──────────────▼──────────────┐
    │   MongoDB    │  MongoDB     │
    │   (App DB)   │  (Vector DB) │
    └──────────────┴──────────────┘
```

### Nguyên lý thiết kế

1. **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng, không xâm phạm layer khác.
2. **Dependency Rule**: Layer trên phụ thuộc layer dưới, không ngược lại.
3. **Single Responsibility**: Mỗi file trong module chỉ làm một việc.
4. **Interface Segregation**: `interface.py` chứa Pydantic schemas làm contract giữa controller và client.

---

## 3. Luồng khởi động ứng dụng (Lifespan)

```
FastAPI app start
    │
    ├── 1. Tạo thư mục upload (settings.upload_path)
    │
    ├── 2. Khởi tạo Vector Store
    │   ├── Kết nối MongoDB Vector DB
    │   ├── Tạo collection document_vectors
    │   ├── Tạo vector search index (nếu chưa có)
    │   └── Khởi tạo embedding model (OpenAI/Google)
    │
    ├── 3. Khởi tạo Default Users
    │   ├── Tạo admin account (từ .env)
    │   └── Tạo user account demo (từ .env)
    │
    ├── 4. Seed Demo Data
    │   ├── Drop các collection không dùng
    │   └── Seed blog posts mẫu (nếu chưa có)
    │
    └── 5. In thông tin khởi động
        ├── Provider (openai/google)
        ├── LLM model, Embedding model
        ├── MongoDB URIs
        └── Upload directory
```

File: `app/main.py` → hàm `lifespan(app)`

---

## 4. Hệ thống xác thực (Authentication)

### JWT Flow

```
Login/Register/Google OAuth
    → BE xác thực thông tin
    → BE ký JWT bằng SECRET_KEY (HS256)
    → Trả access_token cho FE

FE gửi request
    → Header: Authorization: Bearer <token>
    → BE decode JWT
    → get_current_user() trả UserInfo
    → require_admin() kiểm tra role (nếu cần)
```

### Auth Dependencies (FastAPI Depends)

| Dependency | Mục đích | Dùng ở |
|---|---|---|
| `get_current_user()` | Yêu cầu user đã đăng nhập | Chat, /auth/me |
| `require_admin()` | Yêu cầu role admin | Documents, Blog admin, tất cả /admin/* |

File: `app/manager/auth/usecase.py`

---

## 5. Dual MongoDB Architecture

Hệ thống sử dụng **2 MongoDB instances** riêng biệt:

### App MongoDB (`APP_MONGODB_URI`)

Lưu trữ dữ liệu ứng dụng:

| Collection | Mô tả |
|---|---|
| `users` | Tài khoản người dùng |
| `blog_posts` | Bài viết blog |
| `chat_sessions` | Lịch sử chat |
| `documents` | Metadata tài liệu đã upload |

### Vector MongoDB (`VECTOR_MONGODB_URI`)

Lưu trữ dữ liệu vector cho RAG:

| Collection | Mô tả |
|---|---|
| `document_vectors` | Text chunks + embedding vectors |

Lý do tách riêng: MongoDB Atlas Vector Search yêu cầu cấu hình đặc biệt cho vector index, tách riêng giúp tối ưu performance.

File: `app/core/database.py`

---

## 6. RAG Pipeline

```
                    ┌─────────────────────────────────┐
                    │        Document Upload           │
                    │  (Admin uploads PDF/DOCX/TXT)    │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     Document Loader               │
                    │  PyPDFLoader / Docx2txtLoader /   │
                    │  TextLoader                       │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │    Text Splitter                   │
                    │  RecursiveCharacterTextSplitter   │
                    │  chunk_size=1000                   │
                    │  chunk_overlap=200                 │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     Embedding                     │
                    │  OpenAI text-embedding-3-small    │
                    │  → 1536 dimensions                │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     MongoDB Vector Store          │
                    │  MongoDBAtlasVectorSearch         │
                    │  cosine similarity                │
                    └──────────────────────────────────┘


                    ┌─────────────────────────────────┐
                    │         User Question            │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │    Similarity Search              │
                    │  top_k = 4 chunks                │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │    Prompt Construction            │
                    │  System prompt + context          │
                    │  + chat history + question        │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     LLM Streaming                 │
                    │  GPT-4.1-mini / Gemini            │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     SSE Response                  │
                    │  text/event-stream                │
                    └──────────────────────────────────┘
```

---

## 7. API Routes Overview

Tất cả routes có prefix `/api`:

| Prefix | Module | Auth | Mô tả |
|---|---|---|---|
| `/api/auth/*` | Auth | Public/Bearer | Đăng nhập, đăng ký, Google OAuth |
| `/api/chat` | Chat | Bearer | RAG chatbot streaming |
| `/api/chat/sessions` | Chat | Bearer | Lịch sử chat sessions |
| `/api/documents/*` | Document | Admin | Upload, list, delete tài liệu |
| `/api/admin/blog/*` | Blog | Admin | CRUD blog posts |
| `/api/user/*` | User | Public | Nội dung public cho FE |
| `/` | Health | Public | Health check |

File: `app/manager/router.py`

---

## 8. Cấu hình (Configuration)

Tất cả cấu hình nằm trong `app/config.py` sử dụng `pydantic_settings.BaseSettings`.

### Nhóm cấu hình

| Nhóm | Biến | Mô tả |
|---|---|---|
| LLM | `LLM_PROVIDER`, `LLM_MODEL`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` | Provider và model AI |
| Embedding | `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS` | Model tạo vector |
| RAG | `RAG_TOP_K`, `VECTOR_INDEX_NAME`, `CHUNK_SIZE`, `CHUNK_OVERLAP` | Tham số RAG pipeline |
| MongoDB | `APP_MONGODB_URI`, `VECTOR_MONGODB_URI`, `MONGODB_DB_NAME` | Kết nối database |
| Auth | `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `GOOGLE_OAUTH_CLIENT_ID` | JWT và OAuth |
| Seed | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_EMAIL`, `USER_PASSWORD` | Tài khoản mặc định |
| File | `UPLOAD_DIR`, `MAX_FILE_SIZE_MB` | Upload tài liệu |

---

## 9. CORS Policy

CORS hiện được cấu hình cho development:

```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
```

File: `app/main.py`

---

## 10. Error Handling

- **Rate Limit**: SlowAPI tự trả `429 Too Many Requests`
- **Auth errors**: `401 Unauthorized` hoặc `403 Forbidden`
- **Validation**: FastAPI tự validate Pydantic schemas → `422 Unprocessable Entity`
- **Not found**: Controller trả `404 Not Found`
- **Server errors**: Controller catch exception → `500 Internal Server Error`

Chưa có global error handler riêng (thư mục `handlers/` đang trống).
