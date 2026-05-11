# Nova Business RAG Chatbot - Backend

Backend API cho hệ thống chatbot tư vấn dịch vụ sử dụng RAG (Retrieval Augmented Generation).

## Tech Stack

- **FastAPI** - Web framework
- **LangChain** - RAG orchestration
- **OpenAI** - LLM & Embeddings
- **MongoDB Vector Search** - Vector database
- **JWT** - Xác thực

## Cài đặt

### 1. Tạo virtual environment

```bash
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Cài dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình

```bash
copy .env.example .env
```

Mở file `.env` và thay `OPENAI_API_KEY` bằng API key của bạn.

Các biến RAG chính:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-4.1-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
RAG_TOP_K=4
VECTOR_INDEX_NAME=vector_index
```

### 4. Chạy server

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Xem API docs

Mở trình duyệt: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/chat` | Chat với AI | 🔑 User/Admin |
| POST | `/api/documents/upload` | Upload tài liệu | 🔑 Admin only |
| GET | `/api/documents` | Danh sách tài liệu | 🔑 Admin only |
| DELETE | `/api/documents/{id}` | Xóa tài liệu | 🔑 Admin only |

## Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nova.vn | admin123 |
| User | user@nova.vn | user123 |
