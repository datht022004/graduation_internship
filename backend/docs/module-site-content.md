# Module Site Content

Module Site Content quản lý nội dung CMS theo `page_key` và `section_key` để FE có thể render các vùng nội dung của website.

## Vị trí code chính

```text
backend/app/manager/site_content/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Public/Admin API cho site content |
| `usecase.py` | Tạo, cập nhật, xóa content và lưu người cập nhật |
| `repository.py` | CRUD collection `site_content` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/admin/pages/AdminSiteContentPage.jsx` | Màn hình chỉnh nội dung website |
| `frontend/src/config/apiService.js` | `adminSiteContentGetByPage`, `adminSiteContentUpdateById` |
| `frontend/src/zones/user/pages/tabs/*.jsx` | Các tab user có thể dùng nội dung CMS |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Validation | Pydantic |
| Database | MongoDB/PyMongo |
| Auth | Admin Bearer cho API quản trị |
| Frontend | React, Axios |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/user/site-content/{page_key}` | Không | Lấy nội dung public theo page |
| GET | `/api/admin/site-content?page_key=...` | Admin Bearer | Lấy nội dung theo page trong admin |
| POST | `/api/admin/site-content` | Admin Bearer | Tạo section content |
| PUT | `/api/admin/site-content/{content_id}` | Admin Bearer | Cập nhật section content |
| DELETE | `/api/admin/site-content/{content_id}` | Admin Bearer | Xóa section content |

## Luồng hoạt động

```text
Admin chọn page cần chỉnh
  -> adminSiteContentGetByPage(pageKey)
  -> GET /api/admin/site-content?page_key=...
  -> require_admin
  -> SiteContentUseCase.get_content_by_page()
  -> Repository sort theo sort_order
  -> FE render form chỉnh từng section
```

Cập nhật:

```text
Admin sửa section
  -> PUT /api/admin/site-content/{id}
  -> chỉ update field được gửi
  -> set updated_by = admin.email
  -> set updated_at = now
  -> trả section mới
```

Public:

```text
FE user cần content theo page
  -> GET /api/user/site-content/{page_key}
  -> lấy tất cả section của page
  -> sort sort_order tăng dần
```

## Dữ liệu MongoDB

Collection:

```text
site_content
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `page_key` | Khóa trang, ví dụ `home`, `seo-service` |
| `section_key` | Khóa section trong trang |
| `title` | Tiêu đề section |
| `subtitle` | Phụ đề |
| `description` | Mô tả |
| `content` | Object linh hoạt chứa dữ liệu section |
| `sort_order` | Thứ tự hiển thị |
| `is_active` | Trạng thái bật/tắt |
| `updated_by` | Email admin cập nhật gần nhất |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.
- `page_key`.
- `section_key`.

## Lưu ý vận hành

- `content` là dict linh hoạt, nên FE và BE cần thống nhất shape theo từng `section_key`.
- Public API hiện trả cả section inactive nếu có trong DB; FE cần tự lọc hoặc BE cần bổ sung filter nếu muốn ẩn.
- Admin page hiện chủ yếu dùng GET/PUT; POST/DELETE đã có sẵn ở backend.
