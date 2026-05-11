# Module Document — Quản lý tài liệu RAG

> Đường dẫn: `app/manager/document/`

---

## 1. Cấu trúc 4 file

```
app/manager/document/
├── controller.py    # 3 endpoints: upload, list, delete (admin only)
├── interface.py     # DocumentInfo, UploadResponse, DeleteResponse, DocumentListResponse
├── repository.py    # CRUD collection "documents" + quản lý file local
└── usecase.py       # Upload pipeline: parse → chunk → embed → index
```

---

## 2. interface.py — Định nghĩa schemas

```python
class DocumentInfo(BaseModel):
    id: str               # UUID[:8]
    filename: str         # Tên file gốc
    file_type: str        # "pdf" | "docx" | "txt"
    file_size: int        # Bytes
    chunk_count: int      # Số chunks sau khi split
    uploaded_at: str      # ISO datetime

class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total: int

class UploadResponse(BaseModel):
    message: str          # "Upload successful: file.pdf (25 chunks)"
    document: DocumentInfo

class DeleteResponse(BaseModel):
    message: str
    document_id: str
```

---

## 3. repository.py — Tầng truy cập Database + File

```python
DOCUMENTS_COLLECTION = "documents"

class DocumentRepository:

    def get_collection(self):
        return get_db()["documents"]

    # ── READ ALL ──
    def get_all_documents(self) -> list[dict]:
        docs = list(self.get_collection().find({}))
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return docs

    # ── READ ONE ──
    def get_document_by_id(self, doc_id: str) -> dict | None:
        doc = self.get_collection().find_one({"id": doc_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    # ── CREATE (metadata) ──
    def add_document(self, doc_info: dict):
        self.get_collection().insert_one(doc_info)

    # ── DELETE (metadata) ──
    def remove_document(self, doc_id: str):
        self.get_collection().delete_one({"id": doc_id})

    # ── DELETE FILE trên disk ──
    def delete_local_file(self, doc_id: str):
        for file in settings.upload_path.iterdir():
            if file.name.startswith(f"{doc_id}_"):
                os.remove(file)
                break

document_repository = DocumentRepository()
```

**Đặc biệt**: Repository này quản lý cả **MongoDB metadata** lẫn **file trên disk**.

---

## 4. usecase.py — Upload Pipeline

```python
class DocumentUseCase:

    # ── READ ALL ──
    def get_all_documents(self) -> list[DocumentInfo]:
        docs = document_repository.get_all_documents()
        return [DocumentInfo(**doc) for doc in docs]

    # ── CREATE (Upload + Index) ──
    async def upload_and_index_document(self, file_content: bytes, filename: str) -> DocumentInfo:
        file_type = self._detect_file_type(filename)  # "pdf"/"docx"/"txt"
        doc_id = str(uuid.uuid4())[:8]
        safe_filename = f"{doc_id}_{filename}"
        file_path = settings.upload_path / safe_filename

        # 1. Lưu file lên disk
        with open(file_path, "wb") as f:
            f.write(file_content)

        try:
            # 2. Load text từ file
            loader = self._get_loader(str(file_path), file_type)
            raw_documents = loader.load()

            # 3. Split text thành chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.CHUNK_SIZE,       # 1000 chars
                chunk_overlap=settings.CHUNK_OVERLAP,  # 200 chars overlap
                separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            )
            chunks = text_splitter.split_documents(raw_documents)

            # 4. Gắn metadata cho mỗi chunk
            for chunk in chunks:
                chunk.metadata.update({
                    "doc_id": doc_id,
                    "filename": filename,
                    "file_type": file_type,
                })

            # 5. Embed + lưu vào Vector MongoDB
            add_documents_to_store(chunks)
            # → Tạo embedding vector cho mỗi chunk
            # → Lưu {text, embedding, metadata} vào document_vectors

            # 6. Lưu metadata vào App MongoDB
            doc_info = DocumentInfo(id=doc_id, filename=filename, ...)
            doc_doc = DocumentDocument(**doc_info.model_dump())
            document_repository.add_document(
                doc_doc.model_dump(by_alias=True, exclude_none=True)
            )
            return doc_info

        except Exception as e:
            if file_path.exists():
                os.remove(file_path)  # Rollback: xóa file nếu lỗi
            raise e

    # ── DELETE (3 bước) ──
    def delete_document(self, doc_id: str) -> bool:
        doc_entry = document_repository.get_document_by_id(doc_id)
        if not doc_entry:
            return False

        # Bước 1: Xóa vectors từ Vector MongoDB
        delete_documents_from_store(doc_id)

        # Bước 2: Xóa file local
        document_repository.delete_local_file(doc_id)

        # Bước 3: Xóa metadata từ App MongoDB
        document_repository.remove_document(doc_id)
        return True

    # ── HELPERS ──
    def _detect_file_type(self, filename: str) -> str:
        ext = filename.rsplit(".", 1)[-1].lower()
        type_map = {"pdf": "pdf", "docx": "docx", "doc": "docx", "txt": "txt"}
        return type_map[ext]  # Raise KeyError nếu không hỗ trợ

    def _get_loader(self, file_path: str, file_type: str):
        if file_type == "pdf":   return PyPDFLoader(file_path)
        if file_type == "docx":  return Docx2txtLoader(file_path)
        if file_type == "txt":   return TextLoader(file_path, encoding="utf-8")

document_usecase = DocumentUseCase()
```

---

## 5. controller.py — Tầng HTTP

```python
router = APIRouter(prefix="/documents", tags=["Document Management"])
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}

# ── POST /api/documents/upload ──
@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), admin = Depends(require_admin)):
    # Validate filename
    if not file.filename:
        raise HTTPException(400, "Invalid filename.")

    # Validate extension
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type .{ext} is not supported.")

    # Validate size
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:  # 100MB
        raise HTTPException(413, f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB.")

    # Upload + index
    doc_info = await document_usecase.upload_and_index_document(content, file.filename)
    return UploadResponse(
        message=f"Upload successful: {file.filename} ({doc_info.chunk_count} chunks)",
        document=doc_info,
    )

# ── GET /api/documents ──
@router.get("", response_model=DocumentListResponse)
async def list_documents(admin = Depends(require_admin)):
    documents = document_usecase.get_all_documents()
    return DocumentListResponse(documents=documents, total=len(documents))

# ── DELETE /api/documents/{doc_id} ──
@router.delete("/{doc_id}", response_model=DeleteResponse)
async def remove_document(doc_id: str, admin = Depends(require_admin)):
    if not document_usecase.delete_document(doc_id):
        raise HTTPException(404, f"Document not found with ID: {doc_id}")
    return DeleteResponse(message="Document deleted successfully.", document_id=doc_id)
```

---

## 6. Ví dụ CRUD hoàn chỉnh

### UPLOAD — Tạo tài liệu mới

**Request:**
```http
POST /api/documents/upload
Authorization: Bearer eyJ...admin-token
Content-Type: multipart/form-data

file: [service-catalog.pdf]
```

**Luồng:**
```
1. Controller:
   ├── Validate: filename ≠ null, ext ∈ {pdf,docx,doc,txt}, size ≤ 100MB
   └── document_usecase.upload_and_index_document(bytes, "service-catalog.pdf")

2. Usecase:
   ├── detect_file_type("service-catalog.pdf") → "pdf"
   ├── doc_id = uuid4()[:8] → "a1b2c3d4"
   ├── Lưu file → data/documents/a1b2c3d4_service-catalog.pdf
   ├── PyPDFLoader("...a1b2c3d4_service-catalog.pdf").load()
   │   → 10 pages → 10 LangChain Documents
   ├── RecursiveCharacterTextSplitter(1000, 200).split_documents()
   │   → 25 chunks
   ├── Mỗi chunk.metadata += {doc_id, filename, file_type}
   ├── add_documents_to_store(25 chunks)
   │   → OpenAI embedding API × 25 → 25 vectors (1536 dims)
   │   → MongoDB: document_vectors.insert_many(25 documents)
   └── App MongoDB: documents.insert_one({id, filename, chunk_count: 25, ...})

3. Return DocumentInfo
```

**Response 200:**
```json
{
  "message": "Upload successful: service-catalog.pdf (25 chunks)",
  "document": {
    "id": "a1b2c3d4",
    "filename": "service-catalog.pdf",
    "file_type": "pdf",
    "file_size": 1048576,
    "chunk_count": 25,
    "uploaded_at": "2026-05-09T01:30:00+00:00"
  }
}
```

**Dữ liệu tạo ra:**
```
App MongoDB - collection "documents":
  {id: "a1b2c3d4", filename: "service-catalog.pdf", chunk_count: 25, ...}

Vector MongoDB - collection "document_vectors":
  25 documents, mỗi cái:
  {text: "...", embedding: [0.01, -0.02, ...1536 floats], metadata: {doc_id: "a1b2c3d4", ...}}

Disk:
  data/documents/a1b2c3d4_service-catalog.pdf
```

### DELETE — Xóa tài liệu

**Request:**
```http
DELETE /api/documents/a1b2c3d4
Authorization: Bearer eyJ...admin-token
```

**Luồng:**
```
1. document_usecase.delete_document("a1b2c3d4")
   ├── repository.get_document_by_id("a1b2c3d4") → ✓ tồn tại
   ├── delete_documents_from_store("a1b2c3d4")
   │   → Vector MongoDB: document_vectors.delete_many({doc_id: "a1b2c3d4"})
   │   → 25 vector documents bị xóa
   ├── repository.delete_local_file("a1b2c3d4")
   │   → os.remove("data/documents/a1b2c3d4_service-catalog.pdf")
   └── repository.remove_document("a1b2c3d4")
       → App MongoDB: documents.delete_one({id: "a1b2c3d4"})
```

**Response 200:**
```json
{
  "message": "Document deleted successfully.",
  "document_id": "a1b2c3d4"
}
```
