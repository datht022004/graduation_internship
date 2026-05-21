# Chat API

## POST `/api/chat`

Auth:

```text
Authorization: Bearer <token>
```

Request:

```json
{
  "message": "xin chào",
  "session_id": null
}
```

Response:

```text
Content-Type: text/event-stream
```

Ví dụ stream:

```text
data: Xin chào! Tôi có thể hỗ trợ...

event: session
data: <session_id>

event: done
data: [DONE]
```

Nếu có sources:

```text
event: sources
data: [{"filename":"file.pdf","page":1}]
```

## GET `/api/chat/sessions`

Trả danh sách session của user hiện tại:

```json
{
  "sessions": []
}
```

## GET `/api/chat/sessions/{session_id}`

Trả messages của session. Nếu session không thuộc user hoặc không tồn tại, trả `404`.
