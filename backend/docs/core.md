# Core Layer

`app/core` chứa hạ tầng dùng chung cho database, vector search và RAG chain.

## Files

| File | Vai trò |
|------|---------|
| `database.py` | Tạo MongoClient cho app DB và vector DB |
| `vector_store.py` | Tạo embedding model, vector index, MongoDBAtlasVectorSearch |
| `rag_chain.py` | Retrieve documents, build prompt, stream LLM response |

## `database.py`

Export:

- `get_app_client()`
- `get_db()`
- `get_vector_client()`
- `get_vector_db()`

Settings dùng:

- `APP_MONGODB_URI`
- `VECTOR_MONGODB_URI`
- `MONGODB_DB_NAME`

Mongo clients được cache bằng biến module-level để tránh tạo lại nhiều lần.

## `vector_store.py`

Collection vector:

```text
document_vectors
```

Index name:

```text
settings.VECTOR_INDEX_NAME
```

Provider embedding:

| `LLM_PROVIDER` | Embedding class |
|----------------|-----------------|
| `openai` | `OpenAIEmbeddings` |
| `google` | `GoogleGenerativeAIEmbeddings` |

Các function chính:

- `ensure_vector_search_index(collection)`
- `get_embeddings()`
- `init_vector_store()`
- `get_vector_store()`
- `add_documents_to_store(chunks)`
- `delete_documents_from_store(doc_id)`

## `rag_chain.py`

Provider LLM:

| `LLM_PROVIDER` | LLM class |
|----------------|-----------|
| `openai` | `ChatOpenAI` |
| `google` | `ChatGoogleGenerativeAI` |

Function chính:

```python
async def stream_rag_response(question, chat_history)
```

Luồng:

1. Lấy vector store.
2. `similarity_search(question, k=settings.RAG_TOP_K)`.
3. Ghép context và sources.
4. Tạo prompt tiếng Việt.
5. Stream LLM chunk.
6. Cuối stream gửi marker sources nếu có.

Sources marker:

```text
__SOURCES__:
```
