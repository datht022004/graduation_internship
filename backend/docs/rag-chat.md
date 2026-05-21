# RAG Chat Flow

## Thành Phần

| File | Vai trò |
|------|---------|
| `core/vector_store.py` | Embedding và MongoDB vector store |
| `core/rag_chain.py` | Retrieve documents và gọi LLM |
| `manager/document/usecase.py` | Upload/index tài liệu |
| `manager/chat/usecase.py` | Session + stream response |

## Upload Pipeline

```text
Admin upload file
  -> validate extension/size
  -> save to data/documents
  -> load content
  -> split chunks
  -> attach metadata doc_id/filename/file_type
  -> embed chunks
  -> save vectors
  -> save document metadata
```

Supported file types:

```text
pdf, doc, docx, txt
```

## Retrieval Pipeline

```text
Question
  -> vector similarity search top_k
  -> build context
  -> build prompt tiếng Việt
  -> stream LLM response
  -> append sources event
```

## Settings Liên Quan

| Setting | Mặc định |
|---------|----------|
| `LLM_PROVIDER` | `openai` |
| `LLM_MODEL` | `gpt-4.1-mini` |
| `EMBEDDING_MODEL` | `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | `1536` |
| `RAG_TOP_K` | `4` |
| `CHUNK_SIZE` | `1000` |
| `CHUNK_OVERLAP` | `200` |
| `VECTOR_INDEX_NAME` | `vector_index` |

## Provider

OpenAI cần:

```env
OPENAI_API_KEY=...
```

Google cần:

```env
GOOGLE_API_KEY=...
LLM_PROVIDER=google
```

## Lưu Ý

- Nếu API key thiếu, vector store/RAG sẽ báo lỗi khi init hoặc khi chat thật.
- Greeting đơn giản trong `ChatUseCase` không gọi RAG/LLM.
- Delete document sẽ xóa vector chunks theo `doc_id`.
