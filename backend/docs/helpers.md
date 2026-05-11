# Helpers Module

> Tài liệu này mô tả chi tiết các hàm tiện ích trong `app/helpers/`: CRUD generic, security, seed data và rate limiting.

---

## 1. BaseCrudRepository (`helpers/crud.py`)

### Mục đích

Cung cấp class base CRUD generic cho tất cả MongoDB collections, tránh lặp lại code CRUD cơ bản.

### Cấu trúc class

```python
class BaseCrudRepository:
    def __init__(self, collection_name: str)
    def get_collection(self)       # Lấy MongoDB collection
    def _serialize(self, doc)      # Chuyển _id → id (string)
    def get_all(self)              # Lấy tất cả documents
    def get_by_id(self, doc_id)    # Tìm theo ObjectId
    def create(self, data)         # Tạo mới + auto created_at
    def update(self, doc_id, data) # Cập nhật + auto updated_at
    def delete(self, doc_id)       # Xóa theo ObjectId
```

### Nguyên lý hoạt động

```
BaseCrudRepository("blog_posts")
    │
    ├── get_collection()
    │   └── get_db()["blog_posts"]  ← Lazy connect MongoDB
    │
    ├── _serialize(doc)
    │   ├── doc["_id"] → doc["id"] = str(doc["_id"])
    │   └── del doc["_id"]
    │   → Chuyển ObjectId thành string id cho JSON response
    │
    ├── create(data)
    │   ├── data["created_at"] = datetime.now(UTC)
    │   ├── collection.insert_one(data)
    │   └── data["id"] = str(result.inserted_id)
    │
    ├── update(doc_id, data)
    │   ├── data["updated_at"] = datetime.now(UTC)
    │   └── collection.find_one_and_update(
    │       {"_id": ObjectId(doc_id)},
    │       {"$set": data},
    │       return_document=True
    │   )
    │
    └── delete(doc_id)
        └── collection.delete_one({"_id": ObjectId(doc_id)})
```

### Lưu ý

- Hiện tại **chưa có module nào kế thừa** `BaseCrudRepository`. Các repository (auth, blog, chat, document) đều tự viết CRUD riêng do có logic đặc thù.
- Class này là template sẵn sàng cho các module CRUD đơn giản trong tương lai.

---

## 2. Security (`helpers/security.py`)

### Mục đích

Cung cấp hàm hash và verify password sử dụng bcrypt.

### Cấu trúc

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str
def verify_password(plain_password: str, hashed_password: str) -> bool
```

### Nguyên lý hoạt động

```
Đăng ký / Seed user:
    plain_password = "123123"
    → hash_password("123123")
    → "$2b$12$..." (bcrypt hash)
    → lưu vào MongoDB

Đăng nhập:
    plain_password = "123123"
    hashed = "$2b$12$..." (từ DB)
    → verify_password("123123", "$2b$12$...")
    → True / False
```

### Thư viện sử dụng

- `passlib` với scheme `bcrypt`
- Auto-detect deprecated hash formats và migrate

### Ai gọi

| Caller | Hàm | Mục đích |
|---|---|---|
| `auth/usecase.py` → `init_default_users()` | `hash_password()` | Hash password seed admin/user |
| `auth/usecase.py` → `register_manual_user()` | `hash_password()` | Hash password user đăng ký |
| `auth/usecase.py` → `authenticate_user()` | `verify_password()` | Kiểm tra password khi login |

---

## 3. Seed (`helpers/seed.py`)

### Mục đích

Dọn dẹp database và seed dữ liệu demo mỗi khi app khởi động.

### Cấu trúc

```python
def seed_demo_data():
    # 1. Drop các collection không dùng
    # 2. Seed blog posts mẫu
```

### Nguyên lý hoạt động

```
seed_demo_data()
    │
    ├── 1. Drop unneeded collections
    │   ├── service_cards
    │   ├── pain_points
    │   ├── strengths
    │   ├── seo_metrics
    │   ├── seo_packages
    │   ├── seo_roadmap
    │   ├── design_phases
    │   ├── design_highlights
    │   ├── ads_metrics
    │   ├── ads_channels
    │   ├── training_modules
    │   └── syllabus
    │
    └── 2. blog_usecase.seed_default_posts()
        ├── Kiểm tra blog_posts có data chưa
        ├── Nếu chưa có → tạo 3 bài viết mẫu
        └── Nếu đã có → bỏ qua
```

### Tại sao drop các collection?

Các collection `service_cards`, `pain_points`, v.v. là từ phiên bản cũ khi dữ liệu được lưu trong MongoDB. Hiện tại module `user/` trả về dữ liệu static (empty arrays), nên các collection cũ không cần thiết.

### Được gọi từ đâu

```
app/main.py → lifespan() → seed_demo_data()
```

Chạy mỗi lần backend khởi động.

---

## 4. Rate Limiter (`helpers/rate_limit.py`)

### Mục đích

Giới hạn số lượng request từ một IP trong khoảng thời gian nhất định.

### Cấu trúc

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

### Nguyên lý hoạt động

```
Client gửi request
    │
    ├── SlowAPI extract IP từ request (get_remote_address)
    ├── Kiểm tra số request trong window time
    │   ├── Trong giới hạn → cho phép
    │   └── Vượt giới hạn → 429 Too Many Requests
    │
    └── Response bình thường hoặc 429
```

### Cách sử dụng

```python
# Trong controller
@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest):
    ...
```

### Rate limits hiện tại

| Endpoint | Limit |
|---|---|
| `POST /api/auth/login` | 10/minute |
| `POST /api/auth/register` | 5/minute |
| `POST /api/auth/google` | 10/minute |

### Đăng ký trong app

```python
# app/main.py
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

### Thư viện

- `slowapi` — wrapper của `limits` cho FastAPI/Starlette
- Key function: `get_remote_address` — dùng IP client từ request

---

## 5. Tổng kết mối quan hệ

```
helpers/
├── crud.py         ← Template CRUD (chưa kế thừa)
├── security.py     ← auth/usecase.py gọi
├── seed.py         ← main.py → lifespan() gọi
└── rate_limit.py   ← main.py đăng ký + controller dùng decorator
```
