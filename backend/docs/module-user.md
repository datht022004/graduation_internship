# Module User

Module User gồm 2 phần: public data cho khu vực người dùng và quản trị tài khoản trong admin.

## Vị trí code chính

```text
backend/app/manager/user/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Khai báo route public `/user/*` và admin `/admin/users` |
| `usecase.py` | Trả public data, validate user admin CRUD |
| `repository.py` | Truy vấn collection `users` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/user/pages/UserZonePage.jsx` | Khu vực user |
| `frontend/src/zones/user/pages/tabs/*.jsx` | Các tab public: home, SEO, web design, ads, blog |
| `frontend/src/zones/admin/pages/AdminUsersPage.jsx` | Quản lý user |
| `frontend/src/config/apiService.js` | `adminUser*`, `getUser*` API functions |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Database | MongoDB/PyMongo |
| Auth | Bearer JWT, `require_admin` cho admin CRUD |
| Password | Hash password qua helper security |
| Frontend | React, Axios, Tailwind CSS |

## Endpoints public

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/user/home` | Không | Dữ liệu tab Trang chủ |
| GET | `/api/user/seo-service` | Không | Dữ liệu tab Dịch vụ SEO |
| GET | `/api/user/web-design` | Không | Dữ liệu tab Thiết kế website |
| GET | `/api/user/ads` | Không | Dữ liệu tab Quảng cáo |
| GET | `/api/user/blog` | Không | Danh sách blog public |

Hiện các endpoint `home`, `seo-service`, `web-design`, `ads` trả khung dữ liệu rỗng để FE có fallback/mock. Endpoint `blog` gọi lại `blog_usecase.get_public_posts()`.

## Endpoints admin

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/admin/users` | Admin Bearer | Danh sách user có phân trang, lọc |
| POST | `/api/admin/users` | Admin Bearer | Tạo user/admin mới |
| PUT | `/api/admin/users/{email}` | Admin Bearer | Cập nhật name/password/role |
| DELETE | `/api/admin/users/{email}` | Admin Bearer | Xóa user |

Query list:

| Query | Ý nghĩa |
|-------|---------|
| `q` | Tìm theo name hoặc email |
| `role` | Lọc `admin` hoặc `user` |
| `page` | Trang hiện tại |
| `pageSize` | Số item mỗi trang, tối đa 100 |

## Luồng admin quản lý user

```text
AdminUsersPage
  -> adminUserGetPage()
  -> GET /api/admin/users
  -> require_admin
  -> UserUseCase.list_managed_users()
  -> UserRepository.list_users()
  -> trả items + total + pagination
```

Tạo user:

```text
Admin nhập name/email/password/role
  -> validate email, role, password min_length
  -> kiểm tra email chưa tồn tại
  -> hash password
  -> insert users
```

Cập nhật user:

- Cho phép đổi `name`, `password`, `role`.
- Nếu đổi password, backend hash lại password và thêm `password` vào `auth_providers`.
- Không cho admin đang đăng nhập tự hạ quyền chính mình.

Xóa user:

- Không cho admin xóa chính tài khoản đang đăng nhập.
- Không tìm thấy user trả `404`.

## Dữ liệu MongoDB

Collection:

```text
users
```

Response admin map về:

| Field | Ý nghĩa |
|-------|---------|
| `id` | Mongo `_id` string |
| `email` | Email |
| `name` | Tên |
| `role` | `admin` hoặc `user` |
| `authProviders` | Provider đăng nhập |
| `createdAt` | Ngày tạo |

Index:

- `email` unique.
- `role`.
- `name`.

## Lưu ý vận hành

- Module user admin dùng chung collection `users` với module auth.
- Tạo admin mới qua `/api/admin/users` cần tài khoản admin hiện tại.
- Các endpoint public không yêu cầu đăng nhập.
