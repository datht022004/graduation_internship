# Backend Implementation Plan

> Tài liệu này liệt kê tất cả các công việc Backend cần thực hiện dựa trên phân tích Frontend.

---

## 1. AUTH MODULE (`manager/auth/`)

### Trạng thái hiện tại (đã có code)
- `controller.py` — có 1 endpoint `POST /api/auth/login`
- `usecase.py` — có `authenticate_user`, `create_access_token` (HS256), `decode_token`, `get_current_user` (FastAPI Depends), `require_admin`, `init_default_users`
- `repository.py` — có `get_account_by_email`, `get_account_by_role`, `create_account` (MongoDB collection `users`)
- `interface.py` — có Pydantic models: `LoginRequest`, `LoginResponse`, `UserInfo`
- JWT config trong `config.py` — `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES=480`

### Endpoints
| Method | URL | Trạng thái | Mô tả |
|--------|-----|------------|--------|
| POST | `/api/auth/login` | ✅ Đã có | Đăng nhập (email, password, role) → trả JWT |
| POST | `/api/auth/register` | ❌ Chưa có | Đăng ký tài khoản mới |
| GET | `/api/auth/me` | ❌ Chưa có | Lấy thông tin user hiện tại (Bearer token) |
| POST | `/api/auth/refresh` | ❌ Chưa có | Refresh access token |
| POST | `/api/auth/logout` | ❌ Chưa có | Đăng xuất (blacklist token trong Redis) |

### Data Model - `users` collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "name": "string",
  "password": "string (hashed)",   // ⚠️ Hiện tại đang lưu plaintext!
  "role": "admin | user",
  "created_at": "datetime",        // ⚠️ Chưa có
  "updated_at": "datetime"         // ⚠️ Chưa có
}
```

### JWT & Middleware (đã có trong `usecase.py`)
| Chức năng | Trạng thái | Mô tả |
|-----------|------------|--------|
| `create_access_token` | ✅ Đã có | Tạo JWT (HS256, python-jose) |
| `decode_token` | ✅ Đã có | Verify + decode JWT |
| `get_current_user` | ✅ Đã có | FastAPI Depends — extract user từ Bearer token |
| `require_admin` | ✅ Đã có | FastAPI Depends — chặn nếu role != admin |
| Refresh token | ❌ Chưa có | Cần thêm refresh_token logic |
| Token blacklist (Redis) | ❌ Chưa có | Cần Redis để blacklist token khi logout |
| Hash password (bcrypt) | ❌ Chưa có | Đang so sánh plaintext password! |

### Công việc còn lại
- [ ] **BẢO MẬT**: Hash password bằng bcrypt (thay vì lưu + so sánh plaintext)
- [ ] Thêm `created_at`, `updated_at` vào user data
- [ ] Repository: thêm `find_by_id`
- [ ] Controller: thêm endpoint `GET /me` (dùng `get_current_user` đã có)
- [ ] Controller: thêm endpoint `POST /register` (hash password, validate email unique)
- [ ] Controller: thêm endpoint `POST /refresh` (refresh token logic)
- [ ] Controller: thêm endpoint `POST /logout` (blacklist token trong Redis)
- [ ] Interface: thêm `RegisterRequest`, `RefreshRequest` Pydantic models

---

## 2. HOME MODULE (`manager/home/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/home/service-cards` | Lấy danh sách service cards |
| POST | `/api/admin/home/service-cards` | Tạo service card |
| PUT | `/api/admin/home/service-cards/:id` | Cập nhật service card |
| DELETE | `/api/admin/home/service-cards/:id` | Xóa service card |
| GET | `/api/admin/home/pain-points` | Lấy danh sách pain points |
| POST | `/api/admin/home/pain-points` | Tạo pain point |
| PUT | `/api/admin/home/pain-points/:id` | Cập nhật pain point |
| DELETE | `/api/admin/home/pain-points/:id` | Xóa pain point |
| GET | `/api/admin/home/strengths` | Lấy danh sách strengths |
| POST | `/api/admin/home/strengths` | Tạo strength |
| PUT | `/api/admin/home/strengths/:id` | Cập nhật strength |
| DELETE | `/api/admin/home/strengths/:id` | Xóa strength |

### Data Models
```json
// service_cards collection
{ "_id": "ObjectId", "title": "string", "desc": "string", "created_at": "datetime" }

// pain_points collection
{ "_id": "ObjectId", "content": "string", "created_at": "datetime" }

// strengths collection
{ "_id": "ObjectId", "content": "string", "created_at": "datetime" }
```

### Công việc
- [ ] 3 Models: ServiceCard, PainPoint, Strength
- [ ] Repository: CRUD cho mỗi entity
- [ ] Usecase: logic CRUD (validate, gọi repository)
- [ ] Controller: 12 endpoints (4 CRUD × 3 entities)

---

## 3. SEO SERVICE MODULE (`manager/seo_service/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/seo-service/metrics` | Lấy danh sách SEO metrics |
| POST | `/api/admin/seo-service/metrics` | Tạo metric |
| PUT | `/api/admin/seo-service/metrics/:id` | Cập nhật metric |
| DELETE | `/api/admin/seo-service/metrics/:id` | Xóa metric |
| GET | `/api/admin/seo-service/packages` | Lấy danh sách packages |
| POST | `/api/admin/seo-service/packages` | Tạo package |
| PUT | `/api/admin/seo-service/packages/:id` | Cập nhật package |
| DELETE | `/api/admin/seo-service/packages/:id` | Xóa package |
| GET | `/api/admin/seo-service/roadmap` | Lấy danh sách roadmap steps |
| POST | `/api/admin/seo-service/roadmap` | Tạo step |
| PUT | `/api/admin/seo-service/roadmap/:id` | Cập nhật step |
| DELETE | `/api/admin/seo-service/roadmap/:id` | Xóa step |

### Data Models
```json
// seo_metrics collection
{ "_id": "ObjectId", "value": "string", "label": "string", "created_at": "datetime" }

// seo_packages collection
{ "_id": "ObjectId", "title": "string", "summary": "string", "points": ["string"], "created_at": "datetime" }

// seo_roadmap collection
{ "_id": "ObjectId", "step": "string", "created_at": "datetime" }
```

### Công việc
- [ ] 3 Models: SeoMetric, SeoPackage, SeoRoadmap
- [ ] Repository: CRUD cho mỗi entity
- [ ] Usecase: logic CRUD
- [ ] Controller: 12 endpoints (4 CRUD × 3 entities)

---

## 4. SEO TRAINING MODULE (`manager/seo_training/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/seo-training/modules` | Lấy danh sách training modules |
| POST | `/api/admin/seo-training/modules` | Tạo module |
| PUT | `/api/admin/seo-training/modules/:id` | Cập nhật module |
| DELETE | `/api/admin/seo-training/modules/:id` | Xóa module |
| GET | `/api/admin/seo-training/syllabus` | Lấy danh sách syllabus |
| POST | `/api/admin/seo-training/syllabus` | Tạo syllabus item |
| PUT | `/api/admin/seo-training/syllabus/:id` | Cập nhật syllabus item |
| DELETE | `/api/admin/seo-training/syllabus/:id` | Xóa syllabus item |

### Data Models
```json
// training_modules collection
{ "_id": "ObjectId", "title": "string", "duration": "string", "output": "string", "created_at": "datetime" }

// syllabus collection
{ "_id": "ObjectId", "content": "string", "created_at": "datetime" }
```

### Công việc
- [ ] 2 Models: TrainingModule, Syllabus
- [ ] Repository: CRUD cho mỗi entity
- [ ] Usecase: logic CRUD
- [ ] Controller: 8 endpoints (4 CRUD × 2 entities)

---

## 5. WEB DESIGN MODULE (`manager/web_design/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/web-design/phases` | Lấy danh sách design phases |
| POST | `/api/admin/web-design/phases` | Tạo phase |
| PUT | `/api/admin/web-design/phases/:id` | Cập nhật phase |
| DELETE | `/api/admin/web-design/phases/:id` | Xóa phase |
| GET | `/api/admin/web-design/highlights` | Lấy danh sách highlights |
| POST | `/api/admin/web-design/highlights` | Tạo highlight |
| PUT | `/api/admin/web-design/highlights/:id` | Cập nhật highlight |
| DELETE | `/api/admin/web-design/highlights/:id` | Xóa highlight |

### Data Models
```json
// design_phases collection
{ "_id": "ObjectId", "title": "string", "desc": "string", "created_at": "datetime" }

// design_highlights collection
{ "_id": "ObjectId", "content": "string", "created_at": "datetime" }
```

### Công việc
- [ ] 2 Models: DesignPhase, DesignHighlight
- [ ] Repository: CRUD cho mỗi entity
- [ ] Usecase: logic CRUD
- [ ] Controller: 8 endpoints (4 CRUD × 2 entities)

---

## 6. ADS MODULE (`manager/ads/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/ads/metrics` | Lấy danh sách ads metrics |
| POST | `/api/admin/ads/metrics` | Tạo metric |
| PUT | `/api/admin/ads/metrics/:id` | Cập nhật metric |
| DELETE | `/api/admin/ads/metrics/:id` | Xóa metric |
| GET | `/api/admin/ads/channels` | Lấy danh sách channels |
| POST | `/api/admin/ads/channels` | Tạo channel |
| PUT | `/api/admin/ads/channels/:id` | Cập nhật channel |
| DELETE | `/api/admin/ads/channels/:id` | Xóa channel |

### Data Models
```json
// ads_metrics collection
{ "_id": "ObjectId", "value": "string", "label": "string", "created_at": "datetime" }

// ads_channels collection
{ "_id": "ObjectId", "name": "string", "kpi": "string", "desc": "string", "created_at": "datetime" }
```

### Công việc
- [ ] 2 Models: AdsMetric, AdsChannel
- [ ] Repository: CRUD cho mỗi entity
- [ ] Usecase: logic CRUD
- [ ] Controller: 8 endpoints (4 CRUD × 2 entities)

---

## 7. BLOG MODULE (`manager/blog/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/blog/posts` | Lấy danh sách blog posts |
| POST | `/api/admin/blog/posts` | Tạo post |
| PUT | `/api/admin/blog/posts/:id` | Cập nhật post |
| DELETE | `/api/admin/blog/posts/:id` | Xóa post |
| PATCH | `/api/admin/blog/posts/:id/toggle-featured` | Toggle featured |

### Data Model
```json
// blog_posts collection
{
  "_id": "ObjectId",
  "title": "string",
  "category": "string",
  "read_time": "string",
  "excerpt": "string",
  "is_featured": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Công việc
- [ ] Model: BlogPost
- [ ] Repository: CRUD + toggle_featured
- [ ] Usecase: logic CRUD + toggle featured
- [ ] Controller: 5 endpoints

---

## 8. DOCUMENT MODULE (`manager/document/`) - Đã có sẵn

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/admin/documents` | Lấy danh sách documents |
| POST | `/api/admin/documents/upload` | Upload document (multipart/form-data) |
| DELETE | `/api/admin/documents/:id` | Xóa document |

### Data Model
```json
// documents collection
{
  "_id": "ObjectId",
  "filename": "string",
  "file_type": "string",
  "file_size": "number",
  "uploaded_at": "datetime",
  "chunk_count": "number"
}
```

### Công việc
- [ ] Model: Document
- [ ] Repository: get_all, upload (lưu file + tạo record), delete
- [ ] Usecase: upload logic (validate file type/size, tính chunk_count = ceil(size/20480))
- [ ] Controller: 3 endpoints

---

## 9. CHAT MODULE (`manager/chat/`) - Đã có sẵn

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| POST | `/api/chat/message` | Gửi tin nhắn → nhận phản hồi AI (RAG) |

### Data
```json
// Request
{ "message": "string", "context": "string (optional)" }

// Response
{ "reply": "string", "sources": [{ "filename": "string", "page": "number" }] }
```

### Công việc
- [ ] Tích hợp RAG: query vector DB từ documents đã upload
- [ ] Usecase: nhận message → search documents → gọi LLM → trả response + sources
- [ ] Controller: 1 endpoint (POST)

---

## 10. USER/PUBLIC MODULE (`manager/user/`)

### Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/user/home` | Lấy nội dung trang Home (cards, pain points, strengths) |
| GET | `/api/user/seo-service` | Lấy nội dung SEO Service (metrics, packages, roadmap) |
| GET | `/api/user/seo-training` | Lấy nội dung SEO Training (modules, syllabus) |
| GET | `/api/user/web-design` | Lấy nội dung Web Design (phases, highlights) |
| GET | `/api/user/ads` | Lấy nội dung Ads (metrics, channels) |
| GET | `/api/user/blog` | Lấy danh sách blog posts (public) |

### Công việc
- [ ] Controller: 6 endpoints GET (đọc từ các collection đã có)
- [ ] Usecase: gom dữ liệu từ nhiều collection trả về 1 response
- [ ] Không cần auth (public endpoints)

---

## 11. INFRASTRUCTURE (Cần làm trước)

### Config (`config.py`) — ✅ Đã có
> File `src/config.py` dùng `pydantic_settings.BaseSettings`, đọc `.env` tự động.
> Đã có: MONGODB_URI, MONGODB_DB_NAME, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, GOOGLE_API_KEY, LLM_MODEL, EMBEDDING_MODEL, UPLOAD_DIR, CHUNK_SIZE, ADMIN_EMAIL/PASSWORD, USER_EMAIL/PASSWORD, MAX_FILE_SIZE_MB.
- [ ] Thêm `REDIS_URL` vào config (chưa có, cần cho JWT blacklist)
- [ ] Thêm `CORS_ORIGINS` vào config (hiện hard-code trong `main.py`)

### Database (`core/database.py`) — ✅ Đã có MongoDB
> Kết nối MongoDB đã có qua `app.core.database.get_db()`.
- [ ] `redis.py` — Kết nối Redis (chưa có, cần cho JWT blacklist, cache)

### Middleware / Auth Dependency — ✅ Đã có trong `usecase.py`
> JWT decode + verify và role check đã nằm trong `manager/auth/usecase.py`:
> - `get_current_user(credentials)` — FastAPI Depends, extract user từ Bearer token
> - `require_admin(user)` — FastAPI Depends, chặn nếu không phải admin
>
> **Lưu ý**: Không tách ra thư mục `middleware/` riêng — logic auth dùng FastAPI Dependency Injection.
- [ ] Cân nhắc: tách `get_current_user` + `require_admin` ra file riêng nếu muốn gọn hơn

### Models (`models/`)
- [ ] Tất cả MongoDB schemas (tổng: ~15 collections)

### Constants (`constants/`)
- [ ] `messages.py` — Response messages (SUCCESS, NOT_FOUND, UNAUTHORIZED, ...)
- [ ] `enums.py` — UserRole(admin, user), FileType, ...

### Helpers (`helpers/`)
- [ ] `formatter.py` — Format response chuẩn `{ success, data, message }`
- [ ] `validator.py` — Validate ObjectId, email format, ...
- [ ] `utils.py` — Hash password (bcrypt), generate ID, ...

### Handlers (`handlers/`)
- [ ] Error handler global (404, 500, validation error)

---

## Tổng kết

| Module | Số Endpoints | Số Models | Trạng thái |
|--------|-------------|-----------|------------|
| Auth | 5 | 1 | ⚠️ Có 1/5 endpoint (login). Thiếu: register, me, refresh, logout. Password chưa hash! |
| Home | 12 | 3 | ❌ Chưa làm |
| SEO Service | 12 | 3 | ❌ Chưa làm |
| SEO Training | 8 | 2 | ❌ Chưa làm |
| Web Design | 8 | 2 | ❌ Chưa làm |
| Ads | 8 | 2 | ❌ Chưa làm |
| Blog | 5 | 1 | ❌ Chưa làm |
| Document | 3 | 1 | ✅ Đã có skeleton |
| Chat | 1 | 0 | ✅ Đã có skeleton |
| User (Public) | 6 | 0 | ❌ Chưa làm |
| **Tổng** | **68** | **~15** | |

### Đã có sẵn (Infrastructure)
- ✅ `config.py` — Pydantic Settings, đọc .env
- ✅ `core/database.py` — Kết nối MongoDB
- ✅ `core/vector_store.py` — Vector store cho RAG
- ✅ JWT — generate + decode token (trong auth/usecase.py)
- ✅ Auth dependency — `get_current_user`, `require_admin` (FastAPI Depends)
- ✅ CORS — đã config trong main.py
- ✅ Default users — tự tạo admin + user khi khởi động

### Cần làm thêm (Infrastructure)
- ❌ Redis — chưa có kết nối (cần cho JWT blacklist)
- ❌ Password hashing — đang lưu + so sánh plaintext!
- ❌ Constants, Helpers, Handlers — thư mục trống
- ❌ Models — thư mục trống (schema nằm tản mát trong repository)

### Thứ tự triển khai đề xuất
1. **Auth fix** — Hash password (bcrypt), thêm endpoint `GET /me`, `POST /register`
2. **Infrastructure** — Redis, constants, helpers, error handlers
3. **Home** → **SEO Service** → **SEO Training** → **Web Design** → **Ads** → **Blog** (CRUD modules)
4. **Document** — hoàn thiện upload + chunking
5. **User (Public)** — public API đọc dữ liệu
6. **Auth nâng cao** — refresh token, logout + blacklist (Redis)
7. **Chat** — RAG integration (phức tạp nhất, làm cuối)
