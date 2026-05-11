# Core Module — Database, Vector Store, RAG Chain

> Tài liệu này mô tả chi tiết 3 thành phần cốt lõi trong `app/core/`: kết nối database, vector store và RAG chain.

---

## 1. Database (`core/database.py`)

### Mục đích

Quản lý kết nối MongoDB với pattern **Lazy Singleton** — chỉ tạo kết nối khi cần, dùng lại cho toàn bộ request.

### Cấu trúc

```python
# Biến module-level (singleton)
_app_client = None      # MongoClient cho app DB
_app_db = None           # Database object cho app DB
_vector_client = None    # MongoClient cho vector DB
_vector_db = None        # Database object cho vector DB
```

### Các hàm

| Hàm | Trả về | Mô tả |
|---|---|---|
| `get_app_client()` | `MongoClient` | Kết nối app MongoDB, tạo mới nếu chưa có |
| `get_db()` | `Database` | Database object cho app data (users, blog, chat, documents) |
| `get_vector_client()` | `MongoClient` | Kết nối vector MongoDB, tạo mới nếu chưa có |
| `get_vector_db()` | `Database` | Database object cho vector data (document_vectors) |

### Nguyên lý hoạt động

```
Lần đầu gọi get_db()
    → _app_db is None
    → gọi get_app_client()
        → _app_client is None
        → MongoClient(APP_MONGODB_URI)  ← Tạo kết nối mới
        → lưu vào _app_client
    → _app_db = _app_client[MONGODB_DB_NAME]
    → lưu vào _app_db
    → trả _app_db

Lần sau gọi get_db()
    → _app_db is not None
    → trả _app_db ngay  ← Dùng lại kết nối
```

### Config liên quan

```env
APP_MONGODB_URI=mongodb://mongodb:27017/?directConnection=true
VECTOR_MONGODB_URI=mongodb://mongodb-vector:27017/?directConnection=true
MONGODB_DB_NAME=rag_chatbot
```

### Tại sao tách 2 MongoDB?

- **App MongoDB**: lưu dữ liệu cấu trúc thông thường (users, blog, sessions)
- **Vector MongoDB**: cần MongoDB 7.0+ với Atlas Vector Search để hỗ trợ cosine similarity search trên embedding vectors

---

## 2. Vector Store (`core/vector_store.py`)

### Mục đích

Quản lý embedding model và MongoDB Vector Search — tạo, lưu trữ và truy vấn vector embeddings.

### Cấu trúc

```python
VECTOR_COLLECTION = "document_vectors"  # Tên collection
_vector_store = None                     # Singleton instance
```

### Các hàm

| Hàm | Mô tả |
|---|---|
| `ensure_vector_search_index(collection)` | Tạo vector search index nếu chưa tồn tại |
| `get_embeddings()` | Trả về embedding model (OpenAI hoặc Google) |
| `init_vector_store()` | Khởi tạo MongoDBAtlasVectorSearch singleton |
| `get_vector_store()` | Lấy vector store instance (lazy init) |
| `add_documents_to_store(chunks)` | Thêm document chunks vào vector store |
| `delete_documents_from_store(doc_id)` | Xóa tất cả vectors của một document |

### Nguyên lý hoạt động — Khởi tạo

```
init_vector_store()
    │
    ├── 1. Lấy collection document_vectors từ Vector MongoDB
    │
    ├── 2. ensure_vector_search_index(collection)
    │   ├── Liệt kê search indexes hiện có
    │   ├── Nếu đã có index tên "vector_index" → bỏ qua
    │   └── Nếu chưa có → tạo SearchIndexModel:
    │       ├── type: "vectorSearch"
    │       ├── fields:
    │       │   ├── embedding (vector, 1536 dims, cosine)
    │       │   ├── doc_id (filter)
    │       │   ├── filename (filter)
    │       │   └── file_type (filter)
    │       └── Gọi collection.create_search_index()
    │
    ├── 3. Tạo embedding model qua get_embeddings()
    │   ├── provider == "openai" → OpenAIEmbeddings
    │   └── provider == "google" → GoogleGenerativeAIEmbeddings
    │
    └── 4. Tạo MongoDBAtlasVectorSearch(collection, embedding, index_name)
```

### Nguyên lý hoạt động — Thêm document

```
add_documents_to_store(chunks)
    │
    ├── Lấy vector store instance
    └── store.add_documents(chunks)
        ├── Với mỗi chunk:
        │   ├── Gọi embedding model để tạo vector
        │   └── Lưu {text, embedding, metadata} vào MongoDB
        └── MongoDB tự index vector cho search
```

### Nguyên lý hoạt động — Xóa document

```
delete_documents_from_store(doc_id)
    │
    └── collection.delete_many({
            "$or": [
                {"doc_id": doc_id},
                {"metadata.doc_id": doc_id}
            ]
        })
```

Xóa theo cả `doc_id` trực tiếp và `metadata.doc_id` để đảm bảo không sót.

### Embedding Models hỗ trợ

| Provider | Model | Dimensions |
|---|---|---|
| OpenAI | `text-embedding-3-small` | 1536 (configurable) |
| OpenAI | `text-embedding-3-large` | configurable |
| Google | `models/embedding-001` | cố định |

### Config liên quan

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
VECTOR_INDEX_NAME=vector_index
```

---

## 3. RAG Chain (`core/rag_chain.py`)

### Mục đích

Tạo pipeline RAG hoàn chỉnh: truy xuất tài liệu → xây dựng prompt → gọi LLM → stream response.

### Constants

```python
SOURCES_MARKER = "__SOURCES__:"  # Marker phân biệt sources vs text trong stream
```

### System Prompt

```
Bạn là trợ lý tư vấn AI của Nova Digital Marketing Agency.
Hãy trả lời dựa trên tài liệu được cung cấp.
Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ là chưa tìm thấy
dữ liệu phù hợp trong kho tri thức.
Không bịa nguồn và không tự suy diễn ngoài tài liệu nếu câu hỏi cần thông tin cụ thể.

Tài liệu tham khảo:
{context}
```

### Các hàm

| Hàm | Mô tả |
|---|---|
| `_require_api_key(provider, key)` | Kiểm tra API key, raise nếu thiếu |
| `_get_llm()` | Tạo LLM instance (OpenAI hoặc Google) với streaming=True |
| `stream_rag_response(question, chat_history)` | Hàm chính — AsyncGenerator stream response |

### Nguyên lý hoạt động — `stream_rag_response()`

```
stream_rag_response(question, chat_history)
    │
    ├── 1. Similarity Search
    │   ├── Lấy vector store
    │   └── store.similarity_search(question, k=RAG_TOP_K)
    │       ├── Embedding câu hỏi thành vector
    │       └── Tìm top 4 chunks gần nhất (cosine similarity)
    │
    ├── 2. Xây dựng Context
    │   ├── Gom page_content từ các chunks
    │   ├── Nối bằng "---" separator
    │   └── Thu thập sources (filename, page)
    │
    ├── 3. Tạo Prompt
    │   └── ChatPromptTemplate:
    │       ├── system: SYSTEM_PROMPT với {context}
    │       ├── chat_history: MessagesPlaceholder
    │       └── human: {question}
    │
    ├── 4. Gọi LLM Streaming
    │   ├── chain = prompt | llm
    │   └── async for chunk in chain.astream():
    │       └── yield chunk.content  ← Stream từng phần
    │
    └── 5. Gửi Sources
        └── yield "__SOURCES__:" + json.dumps(sources)
```

### LLM Models hỗ trợ

| Provider | Class | Model mặc định |
|---|---|---|
| OpenAI | `ChatOpenAI` | `gpt-4.1-mini` |
| Google | `ChatGoogleGenerativeAI` | configurable |

### Config liên quan

```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4.1-mini
RAG_TOP_K=4
```

---

## 4. Mối quan hệ giữa 3 thành phần

```
                    database.py
                    ┌──────────┐
                    │ get_db() │────────→ App data (users, blog, chat, docs)
                    │          │
                    │ get_     │
                    │ vector_  │
                    │ db()     │────→ vector_store.py ────→ rag_chain.py
                    └──────────┘     ┌──────────────┐     ┌─────────────┐
                                     │ init/get     │     │ stream_rag_ │
                                     │ vector_store │     │ response()  │
                                     │              │     │             │
                                     │ add/delete   │     │ _get_llm()  │
                                     │ documents    │     │             │
                                     └──────────────┘     └─────────────┘
```

- `database.py` cung cấp kết nối MongoDB cho cả `vector_store.py` và toàn bộ repository layer
- `vector_store.py` cung cấp embedding + search cho `rag_chain.py`
- `rag_chain.py` được gọi từ `chat/usecase.py` để xử lý câu hỏi
