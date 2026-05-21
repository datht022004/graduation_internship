# Module Chat

Path:

```text
app/manager/chat/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Chat routes, SSE formatting |
| `usecase.py` | Session lifecycle, quick greeting, stream chat |
| `repository.py` | MongoDB `chat_sessions` CRUD |

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/chat` | Bearer |
| GET | `/api/chat/sessions` | Bearer |
| GET | `/api/chat/sessions/{session_id}` | Bearer |

## Chat Behavior

- Nếu message là greeting đơn giản (`hi`, `hello`, `xin chào`, ...), backend trả quick answer không gọi LLM.
- Câu hỏi thật đi qua RAG pipeline trong `core/rag_chain.py`.
- History lưu trong `chat_sessions`.
- Chỉ lấy vài turn gần nhất làm context.

## SSE Events

Response `POST /api/chat` là:

```text
text/event-stream
```

Event có thể gồm:

- `data: <text chunk>`
- `event: sources`
- `event: session`
- `event: done`

Frontend `ChatWidget` parse các event này.
