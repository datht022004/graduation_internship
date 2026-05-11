# Blog Module

> Tài liệu này mô tả chi tiết module quản lý blog: cấu trúc, nguyên lý hoạt động, API endpoints và luồng dữ liệu.

---

## 1. Mục tiêu

Module Blog cho phép quản trị viên:
- Tạo, chỉnh sửa, xóa bài viết blog
- Đánh dấu bài viết nổi bật (featured)
- Seed dữ liệu mẫu khi khởi động

Người dùng công khai có thể xem blog qua module `user/`.

---

## 2. Cấu trúc file

```
backend/app/manager/blog/
├── controller.py   # 5 API endpoints (admin only)
├── interface.py    # Pydantic schemas: BlogPostBase, BlogPostCreate, BlogPostUpdate, BlogPost
├── repository.py   # CRUD blog_posts collection
└── usecase.py      # Business logic + seed + clean data
```

---

## 3. API Endpoints

Tất cả endpoints yêu cầu **admin auth** (`require_admin`).

Prefix: `/api/admin/blog`

### 3.1. GET `/api/admin/blog/posts`

Lấy danh sách tất cả blog posts, sắp xếp: featured trước, mới nhất trước.

Response `200`:

```json
[
  {
    "id": "a1b2c3d4",
    "title": "Checklist SEO 2026",
    "category": "SEO Foundation",
    "readTime": "7 phút đọc",
    "excerpt": "Danh sách 25 hạng mục...",
    "content": "<h2>...</h2>",
    "imageUrl": "https://...",
    "author": "DataZone Editorial",
    "tags": "SEO, Checklist",
    "isFeatured": true,
    "createdAt": "2026-05-09T01:00:00Z",
    "updatedAt": "2026-05-09T01:00:00Z"
  }
]
```

### 3.2. POST `/api/admin/blog/posts`

Tạo bài viết mới.

Request body:

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `title` | string | Có | min 1 ký tự |
| `category` | string | Có | min 1 ký tự |
| `readTime` | string | Có | min 1 ký tự |
| `excerpt` | string | Có | min 1 ký tự |
| `content` | string | Không | Nội dung HTML |
| `imageUrl` | string | Không | URL hình ảnh |
| `author` | string | Không | Tác giả |
| `tags` | string | Không | Phân cách bằng dấu phẩy |
| `isFeatured` | bool | Không | Mặc định false |

Response `201`: BlogPost object.

### 3.3. PUT `/api/admin/blog/posts/{post_id}`

Cập nhật bài viết. Chỉ gửi fields cần update (partial update).

Response `200`: BlogPost object cập nhật.
Response `404`: Post không tồn tại.

### 3.4. DELETE `/api/admin/blog/posts/{post_id}`

Xóa bài viết.

Response `204`: Xóa thành công.
Response `404`: Post không tồn tại.

### 3.5. PATCH `/api/admin/blog/posts/{post_id}/toggle-featured`

Toggle trạng thái featured (true ↔ false).

Response `200`: BlogPost object với isFeatured đã toggle.
Response `404`: Post không tồn tại.

---

## 4. Interface — Pydantic Schemas (`interface.py`)

### BlogPostBase

Schema base với validation:

```python
title: str = Field(..., min_length=1)
category: str = Field(..., min_length=1)
readTime: str = Field(..., min_length=1)
excerpt: str = Field(..., min_length=1)
# + các optional fields
```

`model_config = ConfigDict(str_strip_whitespace=True)` — tự động trim whitespace.

### BlogPostCreate

Kế thừa `BlogPostBase`, dùng cho POST request.

### BlogPostUpdate

Tất cả fields đều optional (`None`), dùng cho PUT request (partial update).

### BlogPost

Response schema, thêm `id`, `createdAt`, `updatedAt`.

---

## 5. Repository (`repository.py`)

### Collection: `blog_posts`

### Các phương thức

| Phương thức | Mô tả |
|---|---|
| `ensure_indexes()` | Tạo index `id` (unique) + compound index `(isFeatured, createdAt)` |
| `get_all_posts()` | Lấy tất cả, sort by featured desc + createdAt desc |
| `get_post_by_id(post_id)` | Tìm theo field `id` (không phải `_id`) |
| `create_post(data)` | Insert + trả lại post |
| `update_post(post_id, data)` | Update bằng `$set` |
| `delete_post(post_id)` | Xóa theo `id` |
| `count_posts()` | Đếm tổng số posts |
| `insert_many(posts)` | Bulk insert (dùng cho seed) |

### Lưu ý về ID

Blog module dùng **custom `id`** (UUID[:8]) thay vì MongoDB `_id`:

```python
# Tìm post
collection.find_one({"id": post_id})  # ← dùng field "id"

# KHÔNG dùng
collection.find_one({"_id": ObjectId(post_id)})  # ← KHÔNG dùng
```

### `_normalize(post)`

Chuyển `_id` ObjectId thành string để tránh lỗi serialization:

```python
def _normalize(self, post):
    post["_id"] = str(post["_id"])
    return post
```

---

## 6. Usecase — Business Logic (`usecase.py`)

### Các phương thức

| Phương thức | Mô tả |
|---|---|
| `get_all_posts()` | Lấy tất cả posts, convert sang BlogPost schema |
| `get_public_posts()` | Alias của get_all_posts (dùng bởi user module) |
| `create_post(payload)` | Tạo UUID[:8], clean data, set timestamps, lưu |
| `update_post(post_id, payload)` | Partial update, clean data, set updatedAt |
| `delete_post(post_id)` | Xóa post |
| `toggle_featured(post_id)` | Toggle isFeatured |
| `seed_default_posts()` | Seed 3 bài mẫu nếu DB trống |

### Nguyên lý tạo post

```
create_post(payload)
    │
    ├── 1. Tạo UUID[:8] làm id
    │   └── str(uuid.uuid4())[:8]  → "a1b2c3d4"
    │
    ├── 2. Clean data
    │   └── _clean_post_data(): trim whitespace tất cả string fields
    │
    ├── 3. Set timestamps
    │   ├── createdAt = datetime.now(UTC).isoformat()
    │   └── updatedAt = datetime.now(UTC).isoformat()
    │
    ├── 4. Tạo BlogPostDocument (Pydantic validation)
    │
    ├── 5. Serialize bằng model_dump(by_alias=True, exclude_none=True)
    │
    └── 6. Lưu vào MongoDB qua repository
```

### Seed default posts

Khi khởi động, nếu collection `blog_posts` trống, usecase tạo 3 bài mẫu:

1. "Checklist SEO 2026 cho website dịch vụ" — featured
2. "Thiết kế landing page tăng lead B2B"
3. "5 lỗi khiến quảng cáo đốt ngân sách"

### `_clean_post_data(data)`

Trim whitespace cho tất cả string values:

```python
def _clean_post_data(self, data):
    for key, value in data.items():
        if isinstance(value, str):
            cleaned[key] = value.strip()
    return cleaned
```

---

## 7. Luồng dữ liệu tổng thể

```
Admin FE
    │
    ├── GET /api/admin/blog/posts
    │   → controller → usecase.get_all_posts()
    │     → repository.get_all_posts()
    │       → MongoDB blog_posts.find().sort(...)
    │
    ├── POST /api/admin/blog/posts
    │   → controller → usecase.create_post(payload)
    │     → UUID[:8], clean, timestamp, validate
    │     → repository.create_post(data)
    │       → MongoDB blog_posts.insert_one()
    │
    ├── PUT /api/admin/blog/posts/{id}
    │   → controller → usecase.update_post(id, payload)
    │     → repository.get_post_by_id(id) ← kiểm tra tồn tại
    │     → clean, set updatedAt
    │     → repository.update_post(id, data)
    │       → MongoDB blog_posts.update_one()
    │
    ├── DELETE /api/admin/blog/posts/{id}
    │   → controller → usecase.delete_post(id)
    │     → repository.delete_post(id)
    │       → MongoDB blog_posts.delete_one()
    │
    └── PATCH /api/admin/blog/posts/{id}/toggle-featured
        → controller → usecase.toggle_featured(id)
          → repository.get_post_by_id(id)
          → repository.update_post(id, {isFeatured: !current})


User FE (qua module user/)
    │
    └── GET /api/user/blog
        → user/controller → user/usecase.get_blog()
          → blog_usecase.get_public_posts()
            → repository.get_all_posts()
```
