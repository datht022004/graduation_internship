# Chat Module

> Module RAG chatbot: quản lý session, stream response, lưu lịch sử chat.

---

## 1. Cấu trúc file

```
backend/app/manager/chat/
├── controller.py   # POST /chat, GET /sessions, GET /sessions/{id}
├── interface.py    # ChatRequest, ChatResponse, SourceInfo
├── repository.py   # CRUD chat_sessions collection
└── usecase.py      # Session management + stream chat + quick answers
```

## 2. API Endpoints

Prefix: `/api/chat` — yêu cầu user đăng nhập (`get_current_user`).

| Method | URL | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/chat` | Bearer | Gửi câu hỏi → nhận SSE stream |
| GET | `/api/chat/sessions` | Bearer | Danh sách sessions của user |
| GET | `/api/chat/sessions/{id}` | Bearer | Chi tiết messages trong session |

### POST `/api/chat`

Request:

```json
{
  "message": "Dịch vụ SEO có gì?",
  "session_id": "optional-uuid"
}
```

Response: `text/event-stream` (SSE)

| Event | Data | Mô tả |
|---|---|---|
| (none) | text chunk | Phần câu trả lời |
| `sources` | JSON array | `[{"filename":"x.pdf","page":0}]` |
| `session` | session_id | UUID của session |
| `done` | `[DONE]` | Kết thúc stream |

## 3. Luồng xử lý chat

```
POST /api/chat
  → controller: validate message, get_current_user
  → usecase.get_or_create_session(session_id, email)
      ├── Có session_id → init session nếu chưa có
      └── Không có → tạo UUID mới
  → usecase.stream_chat(question, session_id, email)
      ├── Lấy context history (4 cặp gần nhất)
      ├── Kiểm tra quick answer (greeting)
      │   └── "hi", "hello", "xin chào" → trả lời cố định
      ├── Nếu không phải greeting:
      │   └── rag_chain.stream_rag_response(question, history)
      │       ├── similarity_search(question, k=4)
      │       ├── Xây dựng context + prompt
      │       ├── LLM streaming
      │       └── Trả sources
      └── Lưu history vào DB
  → controller: format SSE events
```

## 4. Session Management

### Constants

```python
MAX_STORED_TURNS = 30    # Tối đa 30 cặp Q&A lưu trong DB
MAX_CONTEXT_TURNS = 4    # Tối đa 4 cặp Q&A gần nhất đưa vào LLM
```

### Quick Answers

Các greeting đơn giản được trả lời ngay không qua RAG:

```python
SIMPLE_GREETING_ANSWERS = {"hi", "hello", "xin chao", "xin chào", "chao", "chào", "alo"}
```

→ Trả: "Xin chào! Tôi có thể hỗ trợ bạn tư vấn SEO, thiết kế website, quảng cáo hoặc đào tạo SEO."

### History Flow

```
stream_chat()
  1. Lấy history từ DB (get_session_history)
  2. Cắt lấy 4 cặp gần nhất cho context
  3. Gọi RAG chain với history
  4. Thu full_answer từ stream
  5. Append human + AI messages vào history
  6. Cắt history nếu > 30 cặp
  7. Lưu lại vào DB
  8. Set title = câu hỏi đầu tiên (nếu chưa có)
```

## 5. Repository (`repository.py`)

Collection: `chat_sessions` (App MongoDB)

| Phương thức | Mô tả |
|---|---|
| `get_session_history(session_id, email)` | Lấy LangChain messages |
| `save_session_history(session_id, history, email)` | Lưu history (upsert) |
| `init_session(session_id, email, title)` | Tạo session mới |
| `set_title_if_empty(session_id, email, title)` | Set title nếu chưa có |
| `list_sessions(email, limit=20)` | Danh sách sessions, sort updated_at desc |
| `get_session_messages(session_id, email)` | Session + messages format cho FE |

### History format trong MongoDB

LangChain `messages_to_dict()` format:

```json
[
  {"type": "human", "data": {"content": "câu hỏi"}},
  {"type": "ai", "data": {"content": "câu trả lời"}}
]
```

### `get_session_messages()` transform

Chuyển từ LangChain format → FE format:

```json
{"messages": [
  {"role": "user", "content": "câu hỏi"},
  {"role": "assistant", "content": "câu trả lời"}
]}
```

## 6. SSE Format

Controller format SSE bằng hàm `_format_sse()`:

```python
def _format_sse(data, event=None):
    # event: sources → "event: sources\ndata: ...\n\n"
    # no event → "data: ...\n\n"
```

Headers:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```
