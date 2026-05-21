# Backend Plan / Current Status

## Trạng Thái Hiện Tại

Backend đã có các phần chính:

- FastAPI app, CORS, SlowAPI.
- Auth email/password, register, Google login.
- JWT dependencies cho user/admin.
- Public content endpoints cho frontend user zone.
- Admin CRUD blog.
- Admin CRUD categories.
- Admin CRUD users.
- Document upload/list/delete cho RAG.
- Chat RAG SSE + chat sessions.
- MongoDB app DB + MongoDB vector DB.
- Unit tests cho auth, blog, chat, config/app và models.

## Việc Đã Hoàn Thành

| Nhóm | Trạng thái |
|------|------------|
| App startup | Done |
| Config `.env` | Done |
| MongoDB connection | Done |
| Auth/JWT | Done |
| Admin default user | Done |
| User default account | Done |
| Blog CRUD | Done |
| Category CRUD | Done |
| User management | Done |
| Document RAG upload | Done |
| Chat SSE | Done |
| RAG pipeline | Done |
| Tests | 72 tests hiện đang pass trong lần kiểm tra gần nhất |

## Việc Có Thể Làm Tiếp

1. Thêm persistent content thật cho home/SEO/web design/ads thay vì trả mảng rỗng.
2. Thêm dedicated tests cho category và admin user endpoints.
3. Chuẩn hóa error response tiếng Việt/tiếng Anh.
4. Thêm migration hoặc seed script rõ hơn cho production.
5. Thêm API health detail cho DB/vector store.
6. Thêm logging structured thay vì `print`.
7. Thêm pagination/search tests cho blog/users/documents.

## Checklist Trước Khi Chạy App

```bash
docker compose up -d mongodb mongodb-vector
cd backend
../.venv/bin/python -m pytest -q tests
uvicorn app.main:app --reload --port 8000
```

## Env Cần Có

```env
APP_MONGODB_URI=...
VECTOR_MONGODB_URI=...
MONGODB_DB_NAME=rag_chatbot
SECRET_KEY=...
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_OAUTH_CLIENT_ID=...
```
