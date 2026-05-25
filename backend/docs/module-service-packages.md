# Module Service Packages

Module Service Packages quản lý các gói dịch vụ hiển thị trên website như SEO, thiết kế website và quảng cáo.

## Vị trí code chính

```text
backend/app/manager/service_packages/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Public/Admin API service packages |
| `usecase.py` | Validate, tạo/cập nhật/xóa package |
| `repository.py` | CRUD collection `service_packages` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/admin/pages/AdminServicePackagesPage.jsx` | Quản lý gói dịch vụ |
| `frontend/src/zones/user/pages/tabs/PricingTabPage.jsx` | Hiển thị gói dịch vụ |
| `frontend/src/config/apiService.js` | `adminServicePackages*`, `getUserServicePackages()` |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Validation | Pydantic |
| Database | MongoDB/PyMongo |
| Auth | Admin Bearer cho CRUD |
| Frontend | React, Axios |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/user/service-packages` | Không | Lấy package public |
| GET | `/api/admin/service-packages` | Admin Bearer | Lấy danh sách package |
| POST | `/api/admin/service-packages` | Admin Bearer | Tạo package |
| PUT | `/api/admin/service-packages/{item_id}` | Admin Bearer | Cập nhật package |
| DELETE | `/api/admin/service-packages/{item_id}` | Admin Bearer | Xóa package |

## Luồng hoạt động

```text
AdminServicePackagesPage
  -> adminServicePackagesGetList()
  -> GET /api/admin/service-packages
  -> require_admin
  -> ServicePackageUseCase.get_all()
  -> Repository đọc service_packages
```

Create/update:

- Create sinh `id` 8 ký tự.
- Payload dùng `service_type` để phân nhóm: `seo`, `web-design`, `ads`.
- `points` là list các bullet point trong gói.
- `is_popular` đánh dấu gói nổi bật.
- `is_active` dùng để bật/tắt hiển thị.

## Dữ liệu MongoDB

Collection:

```text
service_packages
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `service_type` | Loại dịch vụ |
| `title` | Tên gói |
| `summary` | Mô tả ngắn |
| `points` | Danh sách điểm nổi bật |
| `price_label` | Nhãn giá |
| `is_popular` | Gói nổi bật |
| `sort_order` | Thứ tự hiển thị |
| `is_active` | Trạng thái bật/tắt |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.

## Lưu ý vận hành

- Public API hiện trả tất cả package trong DB, chưa filter `is_active`.
- Repository chưa sort theo `sort_order`; FE nên sort nếu cần.
- Admin CRUD trả `404` nếu item không tồn tại.
