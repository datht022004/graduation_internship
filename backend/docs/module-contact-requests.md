# Module Contact Requests

Module Contact Requests quản lý yêu cầu liên hệ/lead khách hàng. Trong FE hiện tại trang menu contact requests đang được dùng để xem lịch sử chat, nhưng backend contact request CRUD vẫn tồn tại.

## Vị trí code chính

```text
backend/app/manager/contact_requests/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Admin API contact requests |
| `usecase.py` | Validate, tạo/cập nhật/xóa contact request |
| `repository.py` | CRUD collection `contact_requests` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/config/apiService.js` | Có `adminContactRequests*`, nhưng admin page hiện gọi `adminChat*` |
| `frontend/src/zones/admin/pages/AdminContactRequestsPage.jsx` | Hiện đang hiển thị chat history thay vì contact request CRUD |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Validation | Pydantic |
| Database | MongoDB/PyMongo |
| Auth | Admin Bearer |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/admin/contact-requests` | Admin Bearer | Lấy danh sách contact request |
| POST | `/api/admin/contact-requests` | Admin Bearer | Tạo contact request |
| PUT | `/api/admin/contact-requests/{item_id}` | Admin Bearer | Cập nhật contact request |
| DELETE | `/api/admin/contact-requests/{item_id}` | Admin Bearer | Xóa contact request |

Lưu ý: `public_router = /user/contact-requests` được khai báo trong controller nhưng hiện chưa có endpoint public nào.

## Luồng hoạt động Backend

```text
Admin gọi CRUD endpoint
  -> require_admin
  -> ContactRequestUseCase
  -> ContactRequestRepository
  -> MongoDB collection contact_requests
```

Create:

- Sinh `id` 8 ký tự.
- Set `created_at`, `updated_at`.
- `status` mặc định `new`.

Update:

- Chỉ update field được gửi lên.
- Set lại `updated_at`.

Delete:

- Xóa theo `id`.
- Không tìm thấy trả `404`.

## Dữ liệu MongoDB

Collection:

```text
contact_requests
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `name` | Tên khách hàng |
| `email` | Email |
| `phone` | Số điện thoại |
| `company` | Công ty |
| `service_interest` | Dịch vụ quan tâm |
| `message` | Nội dung yêu cầu |
| `source` | Nguồn lead |
| `status` | `new`, `contacted`, `converted`, `closed` |
| `assigned_to` | Người phụ trách |
| `notes` | Ghi chú nội bộ |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.

## Lưu ý vận hành

- Backend module này vẫn là CRUD contact request.
- Nếu muốn FE dùng lại đúng contact request, cần chỉnh `AdminContactRequestsPage.jsx` vì file đó hiện đang gọi API admin chat history.
