# Module Auth

Tài liệu này mô tả luồng xác thực đăng nhập, đăng ký, Google OAuth và kiểm tra quyền trong hệ thống.

## Vị trí code chính

### Backend

```text
backend/app/manager/auth/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Khai báo API `/api/auth`, validate request, trả token |
| `usecase.py` | Xử lý nghiệp vụ auth, JWT, Google OAuth, phân quyền admin |
| `repository.py` | Truy vấn MongoDB collection `users` |

Các file liên quan:

| Path | Vai trò |
|------|---------|
| `backend/app/helpers/security.py` | Hash và verify password |
| `backend/app/helpers/rate_limit.py` | Rate limit login/register |
| `backend/app/models/users.py` | Schema `UserDocument` |
| `backend/app/config.py` | `SECRET_KEY`, thời hạn token, tài khoản seed, Google OAuth client id |
| `frontend/src/App.jsx` | Lưu/xóa session đăng nhập trong `localStorage` |
| `frontend/src/zones/user/pages/LoginWorkspace.jsx` | UI login/register/google login |
| `frontend/src/config/apiService.js` | Gọi auth API và gắn Bearer token cho request |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Auth token | JWT HS256 qua `python-jose` |
| Password | `passlib[bcrypt]`, `bcrypt` |
| OAuth | Google ID token verification |
| Database | MongoDB/PyMongo |
| Rate limit | SlowAPI |
| Frontend | React, Axios, `localStorage` |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| POST | `/api/auth/login` | Không | Đăng nhập email/password theo role |
| POST | `/api/auth/register` | Không | Đăng ký tài khoản user |
| POST | `/api/auth/google` | Không | Đăng nhập bằng Google token |
| GET | `/api/auth/me` | Bearer | Lấy thông tin user hiện tại |

## Luồng đăng nhập email/password

```text
FE gửi email + password + role
  -> POST /api/auth/login
  -> AuthUseCase.authenticate_user()
  -> tìm user trong collection users
  -> verify password hash
  -> kiểm tra role khớp role đã chọn
  -> tạo JWT access_token
  -> FE lưu app_auth_session vào localStorage
```

Payload:

```json
{
  "email": "user@gmail.com",
  "password": "123123",
  "role": "user"
}
```

Response:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "email": "user@gmail.com",
    "name": "Khách hàng doanh nghiệp",
    "role": "user"
  }
}
```

## Luồng đăng ký

```text
FE gửi name + email + password
  -> POST /api/auth/register
  -> controller validate name/email/password
  -> chuẩn hóa email lowercase
  -> kiểm tra email đã tồn tại chưa
  -> hash password
  -> lưu UserDocument role=user
  -> tạo JWT và trả LoginResponse
```

Quy tắc chính:

- `name` không được rỗng.
- Email phải có `@` và dấu `.`.
- Password tối thiểu 6 ký tự.
- Email trùng trả `409 Conflict`.
- Tài khoản đăng ký thường luôn có `role = user`.

## Luồng Google OAuth

```text
FE nhận Google credential
  -> POST /api/auth/google
  -> verify_oauth2_token bằng GOOGLE_OAUTH_CLIENT_ID
  -> lấy email/name/sub từ Google token
  -> role=user: tạo hoặc lấy user Google
  -> role=admin: chỉ cho phép nếu email đã là admin trong DB
  -> gắn google_id nếu tài khoản chưa có
  -> tạo JWT và trả về FE
```

Lưu ý:

- Google login cho admin không tự tạo admin mới.
- Nếu email đang là admin thì không được login như user.
- Nếu user đã có tài khoản password, backend gắn thêm provider `google`.

## Nguyên lý phân quyền

Các module cần đăng nhập dùng dependency:

```text
get_current_user()
  -> đọc Authorization: Bearer <token>
  -> decode JWT bằng SECRET_KEY
  -> trả UserInfo(email, name, role)
```

Các module admin dùng:

```text
require_admin()
  -> gọi get_current_user()
  -> chỉ cho qua nếu role == "admin"
```

Nếu token sai/hết hạn, backend trả `401`. Frontend interceptor trong `apiService.js` xóa `app_auth_session` và phát event `app:session-expired`.

## Dữ liệu MongoDB

Collection:

```text
users
```

Schema chính:

| Field | Ý nghĩa |
|-------|---------|
| `email` | Email user, unique index |
| `name` | Tên hiển thị |
| `role` | `admin` hoặc `user` |
| `password` | Password hash, có thể `null` nếu chỉ login Google |
| `auth_providers` | Danh sách provider: `password`, `google` |
| `google_id` | Google subject id |
| `created_at` | Thời điểm tạo |

## Cấu hình quan trọng

| Biến | Ý nghĩa |
|------|---------|
| `SECRET_KEY` | Khóa ký JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Thời hạn JWT backend |
| `GOOGLE_OAUTH_CLIENT_ID` | Client id để verify Google token |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin seed mặc định |
| `USER_EMAIL`, `USER_PASSWORD` | Tài khoản user seed mặc định |

## Lưu ý vận hành

- Frontend lưu session trong `localStorage` key `app_auth_session`.
- `App.jsx` tự hết hạn session local sau 3 giờ.
- Backend seed user mặc định qua `AuthUseCase.init_default_users()`.
- Login có rate limit `10/minute`; register có rate limit `5/minute`.
