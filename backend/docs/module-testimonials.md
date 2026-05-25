# Module Testimonials

Module Testimonials quản lý lời chứng thực/đánh giá khách hàng hiển thị trên website.

## Vị trí code chính

```text
backend/app/manager/testimonials/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Public/Admin API testimonials |
| `usecase.py` | Validate, tạo/cập nhật/xóa testimonial |
| `repository.py` | CRUD collection `testimonials` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/config/apiService.js` | `adminTestimonials*` |
| `frontend/src/zones/user/pages/tabs/*.jsx` | Các tab user có thể render testimonial |

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
| GET | `/api/user/testimonials` | Không | Lấy testimonial public |
| GET | `/api/admin/testimonials` | Admin Bearer | Lấy danh sách testimonial |
| POST | `/api/admin/testimonials` | Admin Bearer | Tạo testimonial |
| PUT | `/api/admin/testimonials/{item_id}` | Admin Bearer | Cập nhật testimonial |
| DELETE | `/api/admin/testimonials/{item_id}` | Admin Bearer | Xóa testimonial |

## Luồng hoạt động

```text
FE gọi testimonials
  -> GET /api/user/testimonials hoặc /api/admin/testimonials
  -> TestimonialUseCase.get_all()
  -> Repository đọc collection testimonials
  -> trả list Testimonial
```

Create/update:

- Create sinh `id` 8 ký tự.
- `client_name` và `content` bắt buộc.
- `rating` mặc định 5.
- `service_type` dùng để phân nhóm theo dịch vụ.
- `is_active` dùng để bật/tắt hiển thị.

## Dữ liệu MongoDB

Collection:

```text
testimonials
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `client_name` | Tên khách hàng |
| `client_position` | Chức vụ |
| `client_company` | Công ty |
| `client_avatar` | Avatar |
| `content` | Nội dung đánh giá |
| `rating` | Số sao |
| `service_type` | Nhóm dịch vụ |
| `is_active` | Trạng thái bật/tắt |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.

## Lưu ý vận hành

- Public API hiện trả tất cả testimonial, chưa filter `is_active`.
- Không có validate range cho `rating`; nếu cần chặt hơn nên giới hạn 1-5 ở Pydantic.
