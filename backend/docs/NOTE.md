# Backend Project Structure

Backend là FastAPI API cho hệ thống RAG chatbot tư vấn dịch vụ Digital Marketing.

## Cấu Trúc Chính

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── core/
│   │   ├── database.py
│   │   ├── vector_store.py
│   │   └── rag_chain.py
│   ├── helpers/
│   │   ├── crud.py
│   │   ├── rate_limit.py
│   │   ├── security.py
│   │   └── seed.py
│   ├── manager/
│   │   ├── router.py
│   │   ├── auth/
│   │   ├── blog/
│   │   ├── category/
│   │   ├── chat/
│   │   ├── document/
│   │   └── user/
│   └── models/
├── data/documents/
├── docs/
├── scripts/
├── tests/
├── Dockerfile
├── README.md
└── requirements.txt
```

## Module Backend Hiện Có

| Module | Vai trò |
|--------|---------|
| `auth` | Login, register, Google login, JWT, dependency user/admin |
| `blog` | Admin CRUD blog post, public blog list |
| `category` | Admin CRUD category, chặn xóa category đang được blog dùng |
| `chat` | Chat RAG SSE, chat sessions |
| `document` | Upload/list/delete tài liệu RAG |
| `user` | Public content endpoints và admin user CRUD |

Mỗi module trong `manager/*` đang dùng 3 file chính:

```text
controller.py   # HTTP routes, request/response, Depends
usecase.py      # business logic, Pydantic schemas gần use case
repository.py   # MongoDB CRUD
```

Không có `interface.py` riêng trong code hiện tại. Pydantic request/response models đang đặt trong `controller.py` hoặc `usecase.py`.

## API Prefix

Tất cả API nghiệp vụ được mount qua:

```text
app/manager/router.py
```

Prefix chung:

```text
/api
```

Health check:

```text
GET /
```

## Database

Backend dùng 2 MongoDB connection:

| Connection | Env | Dùng cho |
|------------|-----|----------|
| App DB | `APP_MONGODB_URI` | users, blog_posts, categories, chat_sessions, documents |
| Vector DB | `VECTOR_MONGODB_URI` | document_vectors và vector search |

## Startup

`app/main.py` dùng lifespan để:

1. Tạo thư mục upload.
2. Khởi tạo vector store nếu đủ cấu hình.
3. Seed admin/user mặc định.
4. Seed blog/categories demo.

Nếu vector store hoặc DB chưa sẵn sàng, app log warning/error nhưng vẫn cố gắng khởi động để các endpoint còn lại có thể chạy.

## Test

Test hiện có:

```text
tests/test_auth.py
tests/test_blog.py
tests/test_chat.py
tests/test_config_and_app.py
tests/test_models.py
```

Lệnh chạy:

```bash
../.venv/bin/python -m pytest -q tests
```
