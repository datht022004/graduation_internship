# RAG Chat Module

Tài liệu này mô tả luồng chatbot RAG hiện tại: upload tài liệu, tạo embedding bằng OpenAI, lưu vector vào MongoDB Vector Search, truy xuất tài liệu liên quan bằng LangChain và stream câu trả lời về FE.

## 1. Mục tiêu

Chatbot dùng RAG để trả lời dựa trên tài liệu nội bộ đã upload.

Luồng chính:

```text
Admin upload PDF/DOCX/TXT
  -> BE đọc text bằng document loader
  -> chia text thành chunks
  -> tạo embedding bằng OpenAI
  -> lưu chunks + vectors vào MongoDB vector database

User chat
  -> BE embedding câu hỏi
  -> similarity search trong vector DB
  -> lấy top tài liệu liên quan
  -> đưa context vào prompt
  -> OpenAI chat model sinh câu trả lời
  -> stream câu trả lời về FE bằng SSE
```

## 2. File sử dụng nhiều

```text
backend/app/manager/document/
├── controller.py      # API upload/list/delete tài liệu
├── interface.py       # Schema document response
├── repository.py      # Lưu metadata tài liệu vào collection documents
└── usecase.py         # Đọc file, chunk text, add vào vector store

backend/app/manager/chat/
├── controller.py      # POST /api/chat, trả text/event-stream
├── interface.py       # ChatRequest
├── repository.py      # Lưu/lấy lịch sử chat trong MongoDB
└── usecase.py         # Quản lý session, gọi RAG chain

backend/app/core/
├── database.py        # Kết nối app MongoDB và vector MongoDB
├── vector_store.py    # OpenAI embeddings + MongoDB vector store
└── rag_chain.py       # LangChain prompt + OpenAI chat model + retrieval

frontend/src/adapters/services/
└── chatService.js     # Gọi /api/chat streaming theo rule FE struct

frontend/src/zones/user/components/
└── ChatWidget.jsx     # UI chat, chỉ gọi chatService
```

## 3. Biến `.env` liên quan

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here

LLM_MODEL=gpt-4.1-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
RAG_TOP_K=4
VECTOR_INDEX_NAME=vector_index

APP_MONGODB_URI=mongodb://rag_admin:rag_password@mongodb:27017/?directConnection=true&authSource=admin
VECTOR_MONGODB_URI=mongodb://rag_vector_admin:rag_vector_password@mongodb-vector:27017/?directConnection=true&authSource=admin
MONGODB_DB_NAME=rag_chatbot

UPLOAD_DIR=./data/documents
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_FILE_SIZE_MB=100
```

Giải thích:

- `OPENAI_API_KEY`: dùng cho cả embedding và chat model.
- `EMBEDDING_MODEL`: model biến text thành vector.
- `EMBEDDING_DIMENSIONS`: số chiều vector, hiện là `1536` cho `text-embedding-3-small`.
- `LLM_MODEL`: model sinh câu trả lời.
- `RAG_TOP_K`: số chunk liên quan lấy từ vector DB cho mỗi câu hỏi.
- `VECTOR_INDEX_NAME`: tên vector search index trong MongoDB.
- `VECTOR_MONGODB_URI`: MongoDB dùng để lưu vector.
- `APP_MONGODB_URI`: MongoDB dùng để lưu users, documents metadata, chat_sessions.

## 4. Upload và index tài liệu

Endpoint:

```text
POST /api/documents/upload
```

Auth:

```text
Admin only
Authorization: Bearer <admin-jwt>
```

Form data:

| Field | Type | Required | Ghi chú |
|---|---:|---:|---|
| `file` | file | Có | Hỗ trợ `pdf`, `docx`, `doc`, `txt` |

File đọc dữ liệu:

```text
backend/app/manager/document/usecase.py
```

Loader đang dùng:

```text
PDF  -> PyPDFLoader
DOCX -> Docx2txtLoader
TXT  -> TextLoader
```

Lưu ý: loader chỉ trích xuất text từ file. AI model không đọc file trực tiếp.

Sau khi có text:

```text
RecursiveCharacterTextSplitter
  chunk_size = CHUNK_SIZE
  chunk_overlap = CHUNK_OVERLAP
```

Mỗi chunk được gắn metadata:

```json
{
  "doc_id": "abc12345",
  "filename": "service.pdf",
  "file_type": "pdf",
  "page": 0
}
```

Sau đó gọi:

```text
add_documents_to_store(chunks)
```

trong:

```text
backend/app/core/vector_store.py
```

## 5. Embedding và vector database

File:

```text
backend/app/core/vector_store.py
```

OpenAI embedding được tạo bằng:

```py
OpenAIEmbeddings(
    model=settings.EMBEDDING_MODEL,
    api_key=settings.OPENAI_API_KEY,
    dimensions=settings.EMBEDDING_DIMENSIONS,
)
```

Vector store dùng:

```text
MongoDBAtlasVectorSearch
```

Collection vector:

```text
document_vectors
```

Index:

```text
VECTOR_INDEX_NAME=vector_index
```

Khi xóa tài liệu:

```text
DELETE /api/documents/{doc_id}
```

BE xóa:

- metadata trong collection `documents`;
- file local trong `UPLOAD_DIR`;
- vector chunks trong `document_vectors` theo `metadata.doc_id`.

## 6. Chat RAG flow

Endpoint:

```text
POST /api/chat
```

Auth:

```text
User/Admin đã đăng nhập
Authorization: Bearer <jwt>
```

Request body:

```json
{
  "message": "Dịch vụ SEO bên mình có gì?",
  "session_id": "optional-session-id"
}
```

Tham số:

| Field | Type | Required | Ghi chú |
|---|---:|---:|---|
| `message` | string | Có | Câu hỏi của người dùng |
| `session_id` | string/null | Không | Nếu không gửi, BE tạo session mới |

Luồng BE:

```text
chat/controller.py
  -> validate message
  -> get_current_user() kiểm tra JWT
  -> chat_usecase.get_or_create_session()
  -> chat_usecase.stream_chat()
  -> rag_chain.stream_rag_response()
```

Trong `rag_chain.py`:

```text
1. similarity_search(question, k=RAG_TOP_K)
2. gom page_content thành context
3. tạo ChatPromptTemplate
4. gọi ChatOpenAI streaming
5. stream từng chunk text
6. gửi sources riêng bằng SSE event
```

## 7. Prompt hiện tại

System prompt:

```text
Bạn là trợ lý tư vấn AI của Nova Digital Marketing Agency.
Hãy trả lời dựa trên tài liệu được cung cấp.
Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ là chưa tìm thấy dữ liệu phù hợp trong kho tri thức.
Không bịa nguồn và không tự suy diễn ngoài tài liệu nếu câu hỏi cần thông tin cụ thể.

Tài liệu tham khảo:
{context}
```

Prompt có thêm:

```text
chat_history
question
```

`chat_history` được lấy từ collection `chat_sessions`.

## 8. Streaming response

Response type:

```http
Content-Type: text/event-stream
```

Các event:

### Text chunk

```text
data: một phần câu trả lời
```

### Sources

```text
event: sources
data: [{"filename":"service.pdf","page":0}]
```

### Session

```text
event: session
data: session-id
```

### Done

```text
event: done
data: [DONE]
```

FE parse SSE ở:

```text
frontend/src/adapters/services/chatService.js
```

UI render ở:

```text
frontend/src/zones/user/components/ChatWidget.jsx
```

## 9. Chat history

Collection:

```text
chat_sessions
```

Mỗi session lưu:

```json
{
  "session_id": "uuid",
  "history": [
    {
      "type": "human",
      "data": {
        "content": "Câu hỏi"
      }
    },
    {
      "type": "ai",
      "data": {
        "content": "Câu trả lời"
      }
    }
  ]
}
```

Giới hạn hiện tại:

```text
MAX_HISTORY_LENGTH=20
```

Tức là giữ tối đa 20 cặp human/AI gần nhất.

## 10. Cách test nhanh

1. Chạy MongoDB, MongoDB vector và backend.
2. Điền `OPENAI_API_KEY` trong `backend/.env`.
3. Login admin.
4. Upload tài liệu ở màn admin documents.
5. Login user.
6. Mở chat và hỏi nội dung nằm trong tài liệu.

Nếu chưa upload tài liệu, chatbot sẽ không có context phù hợp và nên trả lời rằng chưa tìm thấy dữ liệu phù hợp trong kho tri thức.

## 11. Lưu ý

- Đổi embedding model hoặc dimensions sau khi đã index tài liệu thì nên re-index lại toàn bộ tài liệu.
- `VECTOR_INDEX_NAME` phải khớp với index trong MongoDB vector database.
- `OPENAI_API_KEY` không commit lên git.
- Nếu `POST /api/chat` trả `401`, kiểm tra JWT ở FE.
- Nếu upload lỗi embedding, kiểm tra `OPENAI_API_KEY` và `EMBEDDING_MODEL`.
- Nếu chat không tìm thấy tài liệu, kiểm tra tài liệu đã upload/index thành công chưa.
