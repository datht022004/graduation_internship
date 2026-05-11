# Module Chat — RAG Chatbot

> Đường dẫn: `app/manager/chat/`

---

## 1. Cấu trúc 4 file

```
app/manager/chat/
├── controller.py    # 3 endpoints: chat (SSE), list sessions, get session
├── interface.py     # ChatRequest, ChatResponse, SourceInfo
├── repository.py    # CRUD collection "chat_sessions" + history management
└── usecase.py       # Session lifecycle + stream chat + quick answers
```

---

## 2. interface.py — Định nghĩa schemas

```python
class ChatRequest(BaseModel):
    message: str                        # Câu hỏi người dùng
    session_id: Optional[str] = None    # Null → tạo session mới

class SourceInfo(BaseModel):
    filename: str                       # Tên file tham khảo
    page: Optional[int] = None          # Số trang (PDF)
    content_preview: str = ""

class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceInfo] = []
    session_id: str
```

---

## 3. repository.py — Tầng truy cập Database

```python
CHAT_COLLECTION = "chat_sessions"

class ChatRepository:

    def get_collection(self):
        return get_db()["chat_sessions"]

    # ── Query helper ──
    def _query(self, session_id: str, user_email: str | None = None):
        query = {"session_id": session_id}
        if user_email:
            query["user_email"] = user_email   # Đảm bảo user chỉ thấy session của mình
        return query

    # ── READ: Lấy lịch sử chat (LangChain messages) ──
    def get_session_history(self, session_id, user_email=None) -> list:
        session = self.get_collection().find_one(self._query(session_id, user_email))
        if session and "history" in session:
            return messages_from_dict(session["history"])  # dict → LangChain Message
        return []

    # ── UPDATE: Lưu lịch sử chat ──
    def save_session_history(self, session_id, history, user_email=None):
        history_dicts = messages_to_dict(history)  # LangChain Message → dict
        self.get_collection().update_one(
            self._query(session_id, user_email),
            {"$set": {"history": history_dicts, "updated_at": _now()}},
            upsert=True   # Tạo mới nếu chưa có
        )

    # ── CREATE: Khởi tạo session rỗng ──
    def init_session(self, session_id, user_email=None, title=""):
        if self.get_collection().find_one(self._query(session_id, user_email)):
            return   # Đã tồn tại → bỏ qua

        session_doc = ChatSessionDocument(
            session_id=session_id, user_email=user_email,
            title=title, history=[], created_at=_now(), updated_at=_now(),
        )
        self.get_collection().insert_one(
            session_doc.model_dump(by_alias=True, exclude_none=True)
        )

    # ── UPDATE: Set title (câu hỏi đầu tiên) ──
    def set_title_if_empty(self, session_id, user_email, title):
        self.get_collection().update_one(
            {**self._query(session_id, user_email),
             "$or": [{"title": ""}, {"title": {"$exists": False}}]},
            {"$set": {"title": title[:80], "updated_at": _now()}},
        )

    # ── READ: Danh sách sessions ──
    def list_sessions(self, user_email, limit=20):
        return list(self.get_collection().find(
            {"user_email": user_email},
            {"_id": 0, "session_id": 1, "title": 1, "updated_at": 1, "created_at": 1},
        ).sort("updated_at", -1).limit(limit))

    # ── READ: Messages trong 1 session ──
    def get_session_messages(self, session_id, user_email):
        session = self.get_collection().find_one(...)
        if not session:
            return None
        # Transform LangChain format → FE format
        return {
            **session,
            "messages": [
                {"role": "user" if m["type"]=="human" else "assistant",
                 "content": m["data"]["content"]}
                for m in session.get("history", [])
            ],
        }

chat_repository = ChatRepository()
```

---

## 4. usecase.py — Business Logic

```python
MAX_STORED_TURNS = 30   # Tối đa 30 cặp Q&A lưu trong DB
MAX_CONTEXT_TURNS = 4   # Chỉ gửi 4 cặp gần nhất cho LLM

# Greeting → trả lời nhanh, không qua RAG
SIMPLE_GREETING_ANSWERS = {"hi", "hello", "xin chào", "chào", "alo"}

class ChatUseCase:

    # ── Tạo hoặc lấy session ──
    def get_or_create_session(self, session_id, user_email=None) -> str:
        if not session_id:
            session_id = str(uuid.uuid4())   # Tạo mới
        chat_repository.init_session(session_id, user_email)
        return session_id

    # ── Lấy history gần nhất cho context ──
    def _get_context_history(self, session_id, user_email):
        history = chat_repository.get_session_history(session_id, user_email)
        return history[-(MAX_CONTEXT_TURNS * 2):]  # 4 cặp = 8 messages

    # ── Thêm Q&A vào history ──
    def _add_to_history(self, session_id, user_email, question, answer):
        history = chat_repository.get_session_history(session_id, user_email)
        history.append(HumanMessage(content=question))
        history.append(AIMessage(content=answer))
        # Cắt bớt nếu quá dài
        if len(history) > MAX_STORED_TURNS * 2:
            history = history[-(MAX_STORED_TURNS * 2):]
        chat_repository.save_session_history(session_id, history, user_email)
        chat_repository.set_title_if_empty(session_id, user_email, question)

    # ── Stream chat chính ──
    async def stream_chat(self, question, session_id, user_email=None):
        chat_history = self._get_context_history(session_id, user_email)

        # Quick answer cho greeting
        quick = _get_quick_answer(question)
        if quick:
            yield quick
            self._add_to_history(session_id, user_email, question, quick)
            return

        # RAG flow
        full_answer = []
        async for chunk in stream_rag_response(question, chat_history):
            if chunk.startswith(SOURCES_MARKER):
                yield chunk       # Sources → FE xử lý riêng
            else:
                full_answer.append(chunk)
                yield chunk       # Text chunk → FE hiển thị dần

        self._add_to_history(session_id, user_email, question, "".join(full_answer))

chat_usecase = ChatUseCase()
```

---

## 5. controller.py — SSE Streaming

```python
router = APIRouter(prefix="/chat", tags=["RAG Chat"])

def _format_sse(data: str, event: str | None = None) -> str:
    lines = []
    if event:
        lines.append(f"event: {event}")
    for line in str(data).splitlines() or [""]:
        lines.append(f"data: {line}")
    return "\n".join(lines) + "\n\n"

# ── POST /api/chat — Stream chat ──
@router.post("")
async def chat(request: ChatRequest, user = Depends(get_current_user)):
    if not request.message.strip():
        raise HTTPException(400, "Message cannot be empty.")

    session_id = chat_usecase.get_or_create_session(request.session_id, user.email)

    async def event_stream():
        async for chunk in chat_usecase.stream_chat(request.message, session_id, user.email):
            if chunk.startswith(SOURCES_MARKER):
                yield _format_sse(chunk[len(SOURCES_MARKER):], event="sources")
            else:
                yield _format_sse(chunk)
        yield _format_sse(session_id, event="session")
        yield _format_sse("[DONE]", event="done")

    return StreamingResponse(event_stream(), media_type="text/event-stream", ...)

# ── GET /api/chat/sessions ──
@router.get("/sessions")
async def list_sessions(user = Depends(get_current_user)):
    return {"sessions": chat_usecase.list_sessions(user.email)}

# ── GET /api/chat/sessions/{id} ──
@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user = Depends(get_current_user)):
    session = chat_usecase.get_session_messages(session_id, user.email)
    if not session:
        raise HTTPException(404, "Chat session not found.")
    return session
```

---

## 6. Ví dụ hoàn chỉnh — Chat với RAG

**Request:**
```http
POST /api/chat
Authorization: Bearer eyJ...user-token
Content-Type: application/json

{"message": "Dịch vụ SEO bên mình có gì?", "session_id": null}
```

**Luồng:**
```
1. Controller:
   ├── Validate: message ≠ empty
   ├── get_current_user() → {email: "user@gmail.com", role: "user"}
   └── chat_usecase.get_or_create_session(null, "user@gmail.com")
       → session_id = "550e8400-e29b-..."

2. Usecase stream_chat():
   ├── _get_context_history() → [] (session mới, chưa có history)
   ├── _get_quick_answer("Dịch vụ SEO bên mình có gì?") → None (không phải greeting)
   └── stream_rag_response("Dịch vụ SEO bên mình có gì?", [])

3. RAG chain (core/rag_chain.py):
   ├── vector_store.similarity_search("Dịch vụ SEO bên mình có gì?", k=4)
   │   → OpenAI: embed câu hỏi → vector 1536 dims
   │   → MongoDB: cosine similarity search → top 4 chunks
   ├── context = chunk1 + "---" + chunk2 + "---" + chunk3 + "---" + chunk4
   ├── ChatPromptTemplate: system(PROMPT + context) + human(question)
   └── ChatOpenAI(gpt-4.1-mini).astream() → stream chunks

4. Controller SSE output:
   data: Dịch vụ SEO            ← text chunk 1
   data: của chúng tôi gồm      ← text chunk 2
   data: ...                     ← text chunk N
   event: sources
   data: [{"filename":"seo.pdf","page":2}]
   event: session
   data: 550e8400-e29b-...
   event: done
   data: [DONE]

5. Usecase: _add_to_history()
   ├── HumanMessage("Dịch vụ SEO bên mình có gì?")
   ├── AIMessage("Dịch vụ SEO của chúng tôi gồm...")
   ├── save_session_history() → MongoDB
   └── set_title_if_empty() → title = "Dịch vụ SEO bên mình có gì?"
```

**MongoDB sau khi chat:**
```json
// Collection: chat_sessions
{
  "session_id": "550e8400-e29b-...",
  "user_email": "user@gmail.com",
  "title": "Dịch vụ SEO bên mình có gì?",
  "history": [
    {"type": "human", "data": {"content": "Dịch vụ SEO bên mình có gì?"}},
    {"type": "ai", "data": {"content": "Dịch vụ SEO của chúng tôi gồm..."}}
  ],
  "created_at": "2026-05-09T01:30:00Z",
  "updated_at": "2026-05-09T01:30:05Z"
}
```
