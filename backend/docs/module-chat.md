# Module Chat

Tài liệu này mô tả luồng chatbot từ Frontend đến Backend, nơi đặt code chính, nguyên lý hoạt động và công nghệ đang dùng.

## Vị trí code chính

### Backend

```text
backend/app/manager/chat/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Khai báo API chat, format Server-Sent Events, endpoint user/admin |
| `usecase.py` | Điều phối session, quick answer, RAG streaming, lưu lịch sử |
| `repository.py` | CRUD MongoDB collection `chat_sessions` |

Các file Backend liên quan:

| Path | Vai trò |
|------|---------|
| `backend/app/core/rag_chain.py` | Tạo RAG chain, lấy context từ vector store, gọi LLM streaming |
| `backend/app/core/vector_store.py` | MongoDB Atlas Vector Search, embeddings, similarity search |
| `backend/app/core/database.py` | Kết nối MongoDB nghiệp vụ và MongoDB vector |
| `backend/app/models/chat_sessions.py` | Schema `ChatSessionDocument` |
| `backend/app/manager/document/usecase.py` | Upload tài liệu, tách chunk, index vào vector store cho RAG |
| `backend/app/manager/router.py` | Gắn chat router vào prefix `/api` |
| `backend/app/config.py` | Cấu hình LLM, embedding, MongoDB, RAG |

### Frontend

```text
frontend/src/zones/user/components/ChatWidget.jsx
frontend/src/config/apiService.js
frontend/src/zones/user/pages/UserZonePage.jsx
```

| File | Vai trò |
|------|---------|
| `ChatWidget.jsx` | Giao diện chat, gửi câu hỏi, đọc SSE stream, render từng chunk trả lời |
| `apiService.js` | Khai báo endpoint `/api/chat`, gắn Bearer token, gọi `fetch` cho stream |
| `UserZonePage.jsx` | Nút mở chatbot, bắt buộc login trước khi chat |
| `frontend/nginx/default.conf` | Proxy `/api/chat` riêng để tắt buffering cho SSE |

Admin xem lịch sử chat ở:

```text
frontend/src/zones/admin/pages/AdminContactRequestsPage.jsx
frontend/src/config/apiService.js
```

## Công nghệ sử dụng

### Backend

| Nhóm | Công nghệ |
|------|-----------|
| Web API | FastAPI, Uvicorn |
| Streaming | Server-Sent Events qua `StreamingResponse` |
| RAG/LLM | LangChain, `langchain-openai`, `langchain-google-genai` |
| LLM provider | OpenAI hoặc Google, chọn bằng `LLM_PROVIDER` |
| Embeddings | OpenAI Embeddings hoặc Google Generative AI Embeddings |
| Vector database | MongoDB Atlas Vector Search qua `langchain-mongodb` |
| Database nghiệp vụ | MongoDB/PyMongo |
| Auth | Bearer JWT lấy từ module auth |
| Tài liệu RAG | PDF, DOCX, TXT qua `PyPDFLoader`, `Docx2txtLoader`, `TextLoader` |
| Chunking | `RecursiveCharacterTextSplitter` |

### Frontend

| Nhóm | Công nghệ |
|------|-----------|
| UI | React 19, Vite, Tailwind CSS |
| HTTP thường | Axios |
| Chat streaming | `fetch` + `ReadableStream.getReader()` + `TextDecoder` |
| Lưu session | `localStorage` key `app_chat_session:{email}` |
| Auth header | Bearer token từ `app_auth_session` |

## Endpoints

### User chat

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| POST | `/api/chat` | Bearer | Gửi message và nhận câu trả lời dạng SSE |
| GET | `/api/chat/sessions` | Bearer | Lấy danh sách session chat của user hiện tại |
| GET | `/api/chat/sessions/{session_id}` | Bearer | Lấy chi tiết một session của user hiện tại |

### Admin chat history

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/admin/chat/users` | Admin Bearer | Lấy danh sách user có lịch sử chat |
| GET | `/api/admin/chat/users/{user_email}/sessions` | Admin Bearer | Lấy các session của một user |
| GET | `/api/admin/chat/sessions/{session_id}` | Admin Bearer | Xem chi tiết một session bất kỳ |

## Luồng hoạt động tổng quát

```text
User click Chat ngay
  -> UserZonePage kiểm tra đã đăng nhập chưa
  -> ChatWidget mở khung chat
  -> ChatWidget khôi phục session_id từ localStorage nếu có
  -> FE gọi GET /api/chat/sessions/{session_id} để load lịch sử
  -> User nhập câu hỏi
  -> FE gọi POST /api/chat bằng fetch
  -> BE tạo hoặc tái sử dụng session
  -> BE stream câu trả lời qua SSE
  -> FE đọc từng chunk và cập nhật UI realtime
  -> BE lưu HumanMessage + AIMessage vào MongoDB
  -> FE lưu session_id vào localStorage
```

## Nguyên lý hoạt động Backend

1. `POST /api/chat` nhận payload:

```json
{
  "message": "Tôi muốn tư vấn SEO",
  "session_id": "optional-session-id"
}
```

2. `controller.py` kiểm tra `message` không rỗng và lấy user hiện tại bằng `get_current_user`.

3. `usecase.py` gọi `get_or_create_session()`:

- Nếu FE gửi `session_id`, backend tái sử dụng session đó.
- Nếu không có `session_id`, backend tạo UUID mới.
- `repository.py` tạo document rỗng trong collection `chat_sessions` nếu session chưa tồn tại.

4. Backend lấy lịch sử gần nhất làm context:

- `MAX_CONTEXT_TURNS = 4`, tức tối đa 4 lượt gần nhất.
- Mỗi lượt gồm 1 câu user và 1 câu assistant.
- Lịch sử dùng format message của LangChain.

5. Backend kiểm tra quick greeting:

- Các câu như `hi`, `hello`, `xin chào`, `alo` trả lời nhanh.
- Trường hợp này không gọi LLM và không truy vấn vector store.

6. Với câu hỏi thật, Backend chạy RAG:

```text
question
  -> get_vector_store()
  -> similarity_search(question, k=RAG_TOP_K)
  -> gom page_content làm context
  -> tạo prompt gồm system prompt + chat_history + question
  -> gọi LLM streaming
  -> yield từng chunk text
  -> cuối stream yield sources
```

7. `controller.py` format output thành SSE:

- Text chunk thường: `data: <text chunk>`
- Nguồn tài liệu: `event: sources`
- Session id: `event: session`
- Kết thúc: `event: done`

8. Sau khi LLM trả xong, `usecase.py` lưu lịch sử:

- Append `HumanMessage(question)`.
- Append `AIMessage(answer)`.
- Giữ tối đa `MAX_STORED_TURNS = 30` lượt.
- Cập nhật `updated_at`.
- Nếu session chưa có title, lấy câu hỏi đầu tiên làm title, cắt tối đa 80 ký tự.

## Nguyên lý hoạt động RAG

RAG trong project này hoạt động theo 2 pha.

### Pha 1: Nạp tài liệu vào kho tri thức

```text
Admin upload PDF/DOCX/TXT
  -> document usecase lưu file local
  -> loader đọc nội dung
  -> RecursiveCharacterTextSplitter tách chunk
  -> embedding model tạo vector
  -> lưu chunk vào MongoDB vector collection document_vectors
```

Cấu hình liên quan trong `backend/app/config.py`:

| Biến | Ý nghĩa |
|------|---------|
| `CHUNK_SIZE` | Kích thước mỗi chunk, mặc định 1000 |
| `CHUNK_OVERLAP` | Độ chồng giữa các chunk, mặc định 200 |
| `EMBEDDING_MODEL` | Model embedding |
| `EMBEDDING_DIMENSIONS` | Số chiều vector embedding |
| `VECTOR_INDEX_NAME` | Tên index vector search |

### Pha 2: Chat hỏi đáp

```text
Câu hỏi user
  -> embedding/similarity search
  -> lấy top K tài liệu liên quan
  -> đưa tài liệu vào SYSTEM_PROMPT
  -> LLM chỉ trả lời dựa trên tài liệu
  -> trả nguồn file/page về FE
```

System prompt yêu cầu bot:

- Là trợ lý tư vấn AI của Nova Digital Marketing Agency.
- Trả lời dựa trên tài liệu được cung cấp.
- Nếu không thấy thông tin phù hợp thì nói rõ chưa tìm thấy dữ liệu.
- Không bịa nguồn và không tự suy diễn ngoài tài liệu khi câu hỏi cần thông tin cụ thể.

## Nguyên lý hoạt động Frontend

1. `UserZonePage.jsx` quản lý nút chatbot:

- Nếu chưa đăng nhập, hiển thị modal yêu cầu login.
- Nếu đã đăng nhập, mở `ChatWidget`.
- Sau login user thường, tự mở chat.
- Admin có thể vào vùng quản trị, nhưng widget vẫn dùng `authUser`.

2. `ChatWidget.jsx` khởi tạo lời chào theo tên user.

3. Khi có user, widget đọc session cũ:

```text
localStorage key = app_chat_session:{email}
```

Nếu có `session_id`, FE gọi `GET /api/chat/sessions/{session_id}` để load lại lịch sử. Nếu backend trả lỗi, FE xóa session local và quay về lời chào mặc định.

4. Khi gửi câu hỏi:

- FE thêm message user vào UI ngay.
- FE thêm một message bot rỗng có `isStreaming = true`.
- FE gọi `chatStreamMessage()` trong `apiService.js`.
- Hàm này dùng `fetch`, không dùng Axios, vì cần đọc streaming response.

5. FE đọc SSE bằng `readChatStream()`:

```text
response.body.getReader()
  -> TextDecoder
  -> tách từng dòng SSE
  -> data thường: nối vào fullText
  -> event: sources: parse JSON sources
  -> event: session: cập nhật session_id
  -> event: done: kết thúc
```

6. Khi stream kết thúc:

- Bot message được cập nhật `text`, `sources`, `isStreaming = false`.
- Nếu có `session_id`, FE lưu vào `localStorage`.
- Nếu lỗi, FE hiển thị message lỗi trong bong bóng bot.

## Dữ liệu lưu trong MongoDB

Collection chính:

```text
chat_sessions
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `session_id` | UUID của phiên chat |
| `user_email` | Email user sở hữu session |
| `title` | Tiêu đề session, lấy từ câu hỏi đầu tiên |
| `history` | Danh sách LangChain messages đã serialize |
| `created_at` | Thời điểm tạo session |
| `updated_at` | Thời điểm cập nhật gần nhất |

Khi trả về FE, backend map `history` thành:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "..."
    },
    {
      "role": "assistant",
      "content": "..."
    }
  ]
}
```

## SSE Events

Response `POST /api/chat` có content type:

```text
text/event-stream
```

Các event:

### Text chunk mặc định

```text
data: Nội dung trả lời đang stream
```

FE nối các chunk này vào `fullText` để hiển thị realtime.

### Sources

```text
event: sources
data: [{"filename":"file.pdf","page":1}]
```

Backend lấy từ metadata của document chunk trong vector store.

### Session

```text
event: session
data: <session_id>
```

FE dùng event này để lưu session hiện tại vào state và `localStorage`.

### Done

```text
event: done
data: [DONE]
```

Báo hiệu stream đã kết thúc.

## Cấu hình quan trọng

Các cấu hình nằm trong `backend/app/config.py` hoặc file `.env`:

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `LLM_PROVIDER` | `openai` | Chọn provider `openai` hoặc `google` |
| `OPENAI_API_KEY` | rỗng | API key OpenAI |
| `GOOGLE_API_KEY` | rỗng | API key Google |
| `LLM_MODEL` | `gpt-4.1-mini` | Model chat |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model embedding |
| `EMBEDDING_DIMENSIONS` | `1536` | Số chiều embedding |
| `RAG_TOP_K` | `4` | Số chunk liên quan lấy cho mỗi câu hỏi |
| `APP_MONGODB_URI` | `mongodb://mongodb:27017/?directConnection=true` | MongoDB lưu users, sessions, documents |
| `VECTOR_MONGODB_URI` | `mongodb://mongodb-vector:27017/?directConnection=true` | MongoDB lưu vector documents |
| `MONGODB_DB_NAME` | `rag_chatbot` | Tên database |

## Lưu ý vận hành

- Chat yêu cầu user đăng nhập vì `/api/chat` dùng Bearer token.
- Greeting đơn giản vẫn được lưu vào history nhưng không tốn call LLM.
- Nếu thiếu API key hoặc vector DB chưa chạy, câu hỏi RAG thật sẽ lỗi.
- Nginx có rule riêng cho `/api/chat` để `proxy_buffering off`; nếu bật buffering, FE sẽ không nhận chunk realtime.
- Frontend hiện parse sources nhưng giao diện `ChatWidget.jsx` chưa render danh sách nguồn ra màn hình.
- Admin xem lịch sử chat thông qua các endpoint `/api/admin/chat/...`.
