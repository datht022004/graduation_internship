# Module Company Profile

Module Company Profile quản lý các khối thông tin hồ sơ công ty như chỉ số, năng lực và thông tin giới thiệu.

## Vị trí code chính

```text
backend/app/manager/company_profile/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Public/Admin API company profile |
| `usecase.py` | Validate, tạo/cập nhật/xóa item |
| `repository.py` | CRUD collection `company_profile` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/admin/pages/AdminCompanyProfilePage.jsx` | Quản lý hồ sơ công ty |
| `frontend/src/zones/user/components/CompanyProfileModal.jsx` | Hiển thị hồ sơ trong user zone |
| `frontend/src/zones/user/pages/tabs/CompanyProfilePage.jsx` | Trang/tab hồ sơ |
| `frontend/src/config/apiService.js` | `adminCompanyProfile*` |

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
| GET | `/api/user/company-profile` | Không | Lấy hồ sơ công ty public |
| GET | `/api/admin/company-profile` | Admin Bearer | Lấy danh sách item |
| POST | `/api/admin/company-profile` | Admin Bearer | Tạo item |
| PUT | `/api/admin/company-profile/{item_id}` | Admin Bearer | Cập nhật item |
| DELETE | `/api/admin/company-profile/{item_id}` | Admin Bearer | Xóa item |

## Luồng hoạt động

```text
AdminCompanyProfilePage
  -> adminCompanyProfileGetList()
  -> GET /api/admin/company-profile
  -> require_admin
  -> CompanyProfileUseCase.get_all()
  -> Repository đọc collection company_profile
```

Tạo/cập nhật:

- Backend tạo `id` 8 ký tự khi create.
- Set `created_at` và `updated_at`.
- Update chỉ nhận field được gửi lên.
- Nếu dữ liệu cũ thiếu `created_at` hoặc `updated_at`, usecase gắn fallback để response không lỗi.

## Dữ liệu MongoDB

Collection:

```text
company_profile
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `section_key` | Nhóm dữ liệu, ví dụ `metrics`, `capabilities`, `info` |
| `title` | Tiêu đề |
| `subtitle` | Phụ đề |
| `description` | Mô tả |
| `color` | Mã màu FE dùng để render |
| `icon` | Tên/icon key |
| `sort_order` | Thứ tự hiển thị |
| `is_active` | Trạng thái bật/tắt |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.

## Lưu ý vận hành

- Public API không yêu cầu đăng nhập.
- Repository hiện trả toàn bộ item, chưa sort/filter theo `sort_order` hoặc `is_active`.
- FE nên sort/filter nếu muốn kiểm soát thứ tự và trạng thái hiển thị.
