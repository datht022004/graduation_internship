# Module User — Public API cho khách hàng

> Đường dẫn: `app/manager/user/`

---

## 1. Cấu trúc (2 file — khác với các module khác)

```
app/manager/user/
├── controller.py    # 5 GET endpoints (public, không auth)
└── usecase.py       # Gom dữ liệu trả về FE
```

**Không có** `repository.py` và `interface.py` vì module này chỉ đọc dữ liệu từ các module khác hoặc trả static data.

---

## 2. controller.py

```python
router = APIRouter(prefix="/user", tags=["User - Public"])

@router.get("/home")
async def get_home():
    return user_usecase.get_home()

@router.get("/seo-service")
async def get_seo_service():
    return user_usecase.get_seo_service()

@router.get("/web-design")
async def get_web_design():
    return user_usecase.get_web_design()

@router.get("/ads")
async def get_ads():
    return user_usecase.get_ads()

@router.get("/blog")
async def get_blog():
    return user_usecase.get_blog()
```

**Đặc điểm**: Không có `Depends(get_current_user)` hay `Depends(require_admin)` → bất kỳ ai cũng truy cập được.

---

## 3. usecase.py

```python
class UserUseCase:

    # ── Trang chủ: trả static empty ──
    def get_home(self):
        return {
            "serviceCards": [],
            "painPoints": [],
            "strengths": [],
        }

    # ── SEO: trả static empty ──
    def get_seo_service(self):
        return {"metrics": [], "packages": [], "roadmap": []}

    # ── Web Design: trả static empty ──
    def get_web_design(self):
        return {"phases": [], "highlights": []}

    # ── Ads: trả static empty ──
    def get_ads(self):
        return {"metrics": [], "channels": []}

    # ── Blog: đọc từ blog module ──
    def get_blog(self):
        from app.manager.blog.usecase import blog_usecase  # Lazy import
        return blog_usecase.get_public_posts()

user_usecase = UserUseCase()
```

---

## 4. Tại sao trả empty arrays?

Các module CMS (Home, SEO, Web Design, Ads) **chưa triển khai backend CRUD**. Frontend hiện hiển thị nội dung hardcode hoặc fallback mặc định.

Endpoint `/api/user/blog` là **endpoint duy nhất trả dữ liệu thực** — đọc từ collection `blog_posts` qua `blog_usecase`.

---

## 5. Ví dụ Request/Response

### GET `/api/user/blog`

**Request:**
```http
GET /api/user/blog
```

**Luồng:**
```
1. controller.get_blog() → user_usecase.get_blog()
2. usecase → blog_usecase.get_public_posts()
3. blog_usecase → blog_repository.get_all_posts()
4. repository → MongoDB: blog_posts.find({}).sort(isFeatured desc, createdAt desc)
5. return list[BlogPost]
```

**Response 200:**
```json
[
  {
    "id": "a1b2c3d4",
    "title": "Checklist SEO 2026 cho website dịch vụ",
    "category": "SEO Foundation",
    "readTime": "7 phút đọc",
    "excerpt": "Danh sách 25 hạng mục...",
    "isFeatured": true,
    "createdAt": "2026-05-09T01:00:00+00:00",
    "updatedAt": "2026-05-09T01:00:00+00:00"
  },
  ...
]
```

### GET `/api/user/home`

**Response 200:**
```json
{
  "serviceCards": [],
  "painPoints": [],
  "strengths": []
}
```

---

## 6. Kế hoạch mở rộng

Khi triển khai CMS modules, usecase sẽ đọc từ MongoDB thay vì trả empty:

```python
# Tương lai
def get_home(self):
    return {
        "serviceCards": home_repository.get_all_service_cards(),
        "painPoints": home_repository.get_all_pain_points(),
        "strengths": home_repository.get_all_strengths(),
    }
```

Mỗi endpoint user sẽ tương ứng với 1 hoặc nhiều admin CRUD module.
