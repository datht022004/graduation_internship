# Module Blog — Quản lý bài viết

> Đường dẫn: `app/manager/blog/`

---

## 1. Cấu trúc 4 file

```
app/manager/blog/
├── controller.py    # 5 endpoints CRUD (admin only)
├── interface.py     # BlogPostBase, BlogPostCreate, BlogPostUpdate, BlogPost
├── repository.py    # CRUD collection "blog_posts"
└── usecase.py       # Business logic + seed + clean data
```

---

## 2. interface.py — Định nghĩa schemas

```python
# ── Base schema (dùng chung cho Create) ──
class BlogPostBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)  # Auto trim

    title: str = Field(..., min_length=1)      # Bắt buộc
    category: str = Field(..., min_length=1)   # Bắt buộc
    readTime: str = Field(..., min_length=1)   # Bắt buộc
    excerpt: str = Field(..., min_length=1)    # Bắt buộc
    content: str = ""                          # Optional
    imageUrl: str = ""
    author: str = ""
    tags: str = ""                # "SEO, Marketing, Lead"
    isFeatured: bool = False

# ── Create schema ──
class BlogPostCreate(BlogPostBase):
    pass   # Giống hệt base

# ── Update schema (tất cả optional) ──
class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    readTime: str | None = None
    # ... tất cả fields đều optional
    isFeatured: bool | None = None

# ── Response schema ──
class BlogPost(BlogPostBase):
    id: str              # UUID[:8]
    createdAt: str       # ISO datetime
    updatedAt: str       # ISO datetime
```

**Nguyên lý**:
- `BlogPostCreate`: tất cả required fields phải có → dùng cho POST
- `BlogPostUpdate`: tất cả fields optional → dùng cho PUT (partial update)
- `BlogPost`: response schema, thêm id + timestamps

---

## 3. repository.py — Tầng truy cập Database

```python
BLOG_POSTS_COLLECTION = "blog_posts"

class BlogRepository:

    def get_collection(self):
        return get_db()["blog_posts"]

    # ── Tạo indexes ──
    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)
        self.get_collection().create_index([("isFeatured", -1), ("createdAt", -1)])

    # ── READ ALL ──
    def get_all_posts(self) -> list[dict]:
        posts = list(
            self.get_collection()
            .find({})
            .sort([("isFeatured", -1), ("createdAt", -1)])
            # ↑ Featured trước, mới nhất trước
        )
        return [self._normalize(post) for post in posts]

    # ── READ ONE ──
    def get_post_by_id(self, post_id: str) -> dict | None:
        post = self.get_collection().find_one({"id": post_id})
        #                                      ↑ Tìm theo "id", KHÔNG phải "_id"
        if not post:
            return None
        return self._normalize(post)

    # ── CREATE ──
    def create_post(self, post_data: dict) -> dict:
        self.get_collection().insert_one(post_data)
        return self.get_post_by_id(post_data["id"])

    # ── UPDATE ──
    def update_post(self, post_id: str, post_data: dict) -> dict | None:
        self.get_collection().update_one(
            {"id": post_id},       # Filter theo custom "id"
            {"$set": post_data}    # Chỉ update fields được gửi
        )
        return self.get_post_by_id(post_id)

    # ── DELETE ──
    def delete_post(self, post_id: str) -> bool:
        result = self.get_collection().delete_one({"id": post_id})
        return result.deleted_count > 0

    # ── HELPERS ──
    def count_posts(self) -> int:
        return self.get_collection().count_documents({})

    def insert_many(self, posts: list[dict]):
        if posts:
            self.get_collection().insert_many(posts)  # Bulk insert cho seed

    def _normalize(self, post: dict) -> dict:
        post["_id"] = str(post["_id"])   # ObjectId → string
        return post

blog_repository = BlogRepository()
```

**Lưu ý quan trọng**: Blog dùng **custom field `id`** (UUID[:8]) thay vì MongoDB `_id`. Tất cả queries filter theo `{"id": post_id}`.

---

## 4. usecase.py — Tầng Business Logic

```python
class BlogUseCase:

    # ── READ ALL ──
    def get_all_posts(self) -> list[BlogPost]:
        posts = blog_repository.get_all_posts()   # list[dict]
        return [BlogPost(**post) for post in posts]   # dict → Pydantic

    # ── PUBLIC READ (gọi bởi user module) ──
    def get_public_posts(self) -> list[BlogPost]:
        return self.get_all_posts()

    # ── CREATE ──
    def create_post(self, payload: BlogPostCreate) -> BlogPost:
        now = self._now()  # ISO datetime string
        post_data = {
            "id": str(uuid.uuid4())[:8],              # Tạo unique ID
            **self._clean_post_data(payload.model_dump()),  # Trim whitespace
            "createdAt": now,
            "updatedAt": now,
        }
        post_doc = BlogPostDocument(**post_data)       # Validate bằng Pydantic model
        post = blog_repository.create_post(
            post_doc.model_dump(by_alias=True, exclude_none=True)
        )
        return BlogPost(**post)

    # ── UPDATE ──
    def update_post(self, post_id: str, payload: BlogPostUpdate) -> BlogPost | None:
        existing = blog_repository.get_post_by_id(post_id)
        if not existing:
            return None  # → controller trả 404

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        #                                ↑ Chỉ lấy fields user thực sự gửi
        if update_data:
            update_data = self._clean_post_data(update_data)
            update_data["updatedAt"] = self._now()
            existing = blog_repository.update_post(post_id, update_data)

        return BlogPost(**existing)

    # ── DELETE ──
    def delete_post(self, post_id: str) -> bool:
        return blog_repository.delete_post(post_id)

    # ── TOGGLE FEATURED ──
    def toggle_featured(self, post_id: str) -> BlogPost | None:
        existing = blog_repository.get_post_by_id(post_id)
        if not existing:
            return None
        updated = blog_repository.update_post(post_id, {
            "isFeatured": not existing.get("isFeatured", False),
            "updatedAt": self._now(),
        })
        return BlogPost(**updated)

    # ── SEED (khi app start) ──
    def seed_default_posts(self):
        blog_repository.ensure_indexes()
        if blog_repository.count_posts() > 0:
            return   # Đã có data → bỏ qua
        # Tạo 3 bài mẫu...
        blog_repository.insert_many(posts)

    # ── HELPERS ──
    def _clean_post_data(self, data: dict) -> dict:
        # Trim whitespace cho mọi string field
        return {k: v.strip() if isinstance(v, str) else v for k, v in data.items()}

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

blog_usecase = BlogUseCase()
```

---

## 5. controller.py — Tầng HTTP

```python
router = APIRouter(prefix="/admin/blog", tags=["Admin - Blog"])

# ── GET /api/admin/blog/posts — Danh sách ──
@router.get("/posts", response_model=list[BlogPost])
async def list_blog_posts(admin: UserInfo = Depends(require_admin)):
    return blog_usecase.get_all_posts()

# ── POST /api/admin/blog/posts — Tạo mới ──
@router.post("/posts", response_model=BlogPost, status_code=201)
async def create_blog_post(body: BlogPostCreate, admin = Depends(require_admin)):
    return blog_usecase.create_post(body)

# ── PUT /api/admin/blog/posts/{id} — Cập nhật ──
@router.put("/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, body: BlogPostUpdate, admin = Depends(require_admin)):
    post = blog_usecase.update_post(post_id, body)
    if not post:
        raise HTTPException(404, f"Blog post not found with ID: {post_id}")
    return post

# ── DELETE /api/admin/blog/posts/{id} — Xóa ──
@router.delete("/posts/{post_id}", status_code=204)
async def delete_blog_post(post_id: str, admin = Depends(require_admin)):
    if not blog_usecase.delete_post(post_id):
        raise HTTPException(404, f"Blog post not found with ID: {post_id}")
    return Response(status_code=204)

# ── PATCH /api/admin/blog/posts/{id}/toggle-featured ──
@router.patch("/posts/{post_id}/toggle-featured", response_model=BlogPost)
async def toggle_featured(post_id: str, admin = Depends(require_admin)):
    post = blog_usecase.toggle_featured(post_id)
    if not post:
        raise HTTPException(404, f"Blog post not found with ID: {post_id}")
    return post
```

---

## 6. Ví dụ CRUD hoàn chỉnh

### CREATE — Tạo bài viết mới

**Request:**
```http
POST /api/admin/blog/posts
Authorization: Bearer eyJ...admin-token
Content-Type: application/json

{
  "title": "Hướng dẫn SEO On-page 2026",
  "category": "SEO Foundation",
  "readTime": "8 phút đọc",
  "excerpt": "Tổng hợp kỹ thuật SEO On-page quan trọng nhất.",
  "author": "DataZone Editorial",
  "tags": "SEO, On-page",
  "isFeatured": false
}
```

**Luồng:**
```
1. FastAPI: parse body → BlogPostCreate (validate min_length, strip whitespace)
2. FastAPI: Depends(require_admin) → decode JWT → kiểm tra role == "admin"
3. controller → blog_usecase.create_post(body)
4. usecase:
   ├── id = uuid4()[:8] → "f7e2a1b9"
   ├── _clean_post_data() → trim strings
   ├── createdAt = updatedAt = "2026-05-09T01:30:00+00:00"
   ├── BlogPostDocument(**data) → Pydantic validate
   └── blog_repository.create_post(data)
5. repository:
   ├── collection.insert_one({id: "f7e2a1b9", title: "...", ...})
   └── collection.find_one({"id": "f7e2a1b9"}) → trả document
6. return BlogPost(**document) → JSON response
```

**Response 201:**
```json
{
  "id": "f7e2a1b9",
  "title": "Hướng dẫn SEO On-page 2026",
  "category": "SEO Foundation",
  "readTime": "8 phút đọc",
  "excerpt": "Tổng hợp kỹ thuật SEO On-page quan trọng nhất.",
  "content": "",
  "imageUrl": "",
  "author": "DataZone Editorial",
  "tags": "SEO, On-page",
  "isFeatured": false,
  "createdAt": "2026-05-09T01:30:00+00:00",
  "updatedAt": "2026-05-09T01:30:00+00:00"
}
```

### UPDATE — Cập nhật bài viết (Partial Update)

**Request:**
```http
PUT /api/admin/blog/posts/f7e2a1b9
Authorization: Bearer eyJ...admin-token
Content-Type: application/json

{
  "title": "Hướng dẫn SEO On-page 2026 (Cập nhật)",
  "isFeatured": true
}
```

**Luồng:**
```
1. BlogPostUpdate: chỉ title + isFeatured được set, các field khác = None
2. usecase.update_post("f7e2a1b9", body)
   ├── repository.get_post_by_id("f7e2a1b9") → existing post
   ├── payload.model_dump(exclude_none=True, exclude_unset=True)
   │   → {"title": "Hướng dẫn...(Cập nhật)", "isFeatured": true}
   │   ↑ Chỉ 2 fields user gửi
   ├── _clean_post_data() → trim
   ├── update_data["updatedAt"] = now
   └── repository.update_post("f7e2a1b9", update_data)
3. repository:
   └── collection.update_one(
         {"id": "f7e2a1b9"},
         {"$set": {"title": "...", "isFeatured": true, "updatedAt": "..."}}
       )
   ↑ MongoDB chỉ update 3 fields, giữ nguyên các field khác
```

### DELETE — Xóa bài viết

**Request:**
```http
DELETE /api/admin/blog/posts/f7e2a1b9
Authorization: Bearer eyJ...admin-token
```

**Luồng:**
```
1. controller → blog_usecase.delete_post("f7e2a1b9")
2. usecase → blog_repository.delete_post("f7e2a1b9")
3. repository → collection.delete_one({"id": "f7e2a1b9"})
4. return deleted_count > 0 → True
```

**Response 204:** No Content

### TOGGLE FEATURED

**Request:**
```http
PATCH /api/admin/blog/posts/f7e2a1b9/toggle-featured
Authorization: Bearer eyJ...admin-token
```

**Luồng:**
```
1. usecase.toggle_featured("f7e2a1b9")
   ├── repository.get_post_by_id → existing.isFeatured = true
   └── repository.update_post("f7e2a1b9", {
         "isFeatured": false,    ← đảo ngược: true → false
         "updatedAt": now
       })
```

---

## 7. MongoDB document mẫu

```json
// Collection: blog_posts
{
  "_id": "ObjectId(6654abc123...)",
  "id": "f7e2a1b9",
  "title": "Hướng dẫn SEO On-page 2026 (Cập nhật)",
  "category": "SEO Foundation",
  "readTime": "8 phút đọc",
  "excerpt": "Tổng hợp kỹ thuật SEO On-page quan trọng nhất.",
  "content": "",
  "imageUrl": "",
  "author": "DataZone Editorial",
  "tags": "SEO, On-page",
  "isFeatured": true,
  "createdAt": "2026-05-09T01:30:00+00:00",
  "updatedAt": "2026-05-09T01:35:00+00:00"
}
```
