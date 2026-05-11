# User/Public Module

> Module public cho khách hàng: trả nội dung các trang dịch vụ và blog.

---

## 1. Cấu trúc file

```
backend/app/manager/user/
├── controller.py   # 5 GET endpoints (public, không cần auth)
└── usecase.py      # Gom dữ liệu trả về FE
```

**Lưu ý**: Module này không có `repository.py` và `interface.py` vì chỉ đọc dữ liệu từ các module khác hoặc trả static data.

## 2. API Endpoints

Prefix: `/api/user` — **không yêu cầu auth** (public).

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/user/home` | Nội dung trang chủ |
| GET | `/api/user/seo-service` | Nội dung dịch vụ SEO |
| GET | `/api/user/web-design` | Nội dung thiết kế web |
| GET | `/api/user/ads` | Nội dung quảng cáo |
| GET | `/api/user/blog` | Danh sách blog posts (public) |

## 3. Response hiện tại

### GET `/api/user/home`

```json
{
  "serviceCards": [],
  "painPoints": [],
  "strengths": []
}
```

### GET `/api/user/seo-service`

```json
{
  "metrics": [],
  "packages": [],
  "roadmap": []
}
```

### GET `/api/user/web-design`

```json
{
  "phases": [],
  "highlights": []
}
```

### GET `/api/user/ads`

```json
{
  "metrics": [],
  "channels": []
}
```

### GET `/api/user/blog`

Trả danh sách `BlogPost[]` từ `blog_usecase.get_public_posts()`.

## 4. Nguyên lý hoạt động

```
UserUseCase
    │
    ├── get_home()        → static empty arrays
    ├── get_seo_service() → static empty arrays
    ├── get_web_design()  → static empty arrays
    ├── get_ads()         → static empty arrays
    │
    └── get_blog()        → blog_usecase.get_public_posts()
                            → đọc từ MongoDB blog_posts
```

### Tại sao trả empty arrays?

Các module Home, SEO, Web Design, Ads **chưa được triển khai** ở backend. Các collection tương ứng (`service_cards`, `pain_points`, `strengths`, v.v.) đã bị drop trong `seed.py`.

Frontend hiện tại sử dụng dữ liệu hardcode hoặc hiển thị nội dung mặc định khi nhận empty arrays.

### Blog endpoint

Endpoint `/api/user/blog` là **endpoint duy nhất trả dữ liệu thực** — sử dụng lazy import để tránh circular dependency:

```python
def get_blog(self):
    from app.manager.blog.usecase import blog_usecase
    return blog_usecase.get_public_posts()
```

## 5. Kế hoạch mở rộng

Khi triển khai các module CRUD cho Home/SEO/WebDesign/Ads, usecase sẽ đọc dữ liệu từ các repository tương ứng thay vì trả empty arrays:

```python
# Tương lai
def get_home(self):
    return {
        "serviceCards": home_repository.get_service_cards(),
        "painPoints": home_repository.get_pain_points(),
        "strengths": home_repository.get_strengths(),
    }
```
