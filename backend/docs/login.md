# Login/Auth Module

Tài liệu này mô tả cấu trúc đăng nhập hiện tại của backend, các API đang dùng, request/response, dữ liệu lưu trong MongoDB và những thư mục/file liên quan nhiều nhất.

## 1. Mục tiêu

Module auth đang hỗ trợ 3 luồng:

- Đăng nhập bằng email/password.
- Đăng ký tài khoản người dùng thủ công bằng email/password.
- Đăng nhập bằng Google OAuth để mở rộng sau này.

Quy ước hiện tại:

- Public register chỉ tạo tài khoản `user`.
- Tài khoản `admin` không cho tự đăng ký public.
- Admin được seed từ `.env` bằng `ADMIN_EMAIL` và `ADMIN_PASSWORD`.
- Google login cho `user` có thể tự tạo account.
- Google login cho `admin` chỉ hợp lệ nếu email admin đã tồn tại trong DB.

## 2. Cấu trúc file sử dụng nhiều

```text
backend/app/manager/auth/
├── controller.py      # Khai báo endpoint /api/auth/*
├── interface.py       # Pydantic schema cho request/response
├── repository.py      # Truy cập MongoDB collection users
└── usecase.py         # Business logic: login, register, google, JWT

backend/app/helpers/
├── security.py        # Hash và verify password bằng bcrypt
└── rate_limit.py      # Giới hạn số request login/register

backend/app/core/
└── database.py        # Kết nối MongoDB app DB

backend/app/config.py  # Đọc biến .env: SECRET_KEY, admin/user seed, Google client id
```

Frontend đang gọi auth qua:

```text
frontend/src/helpers/authApiService.js
frontend/src/helpers/authUseCases.js
frontend/src/zones/user/pages/LoginWorkspace.jsx
frontend/src/zones/user/components/GoogleToneLoginCard.jsx
```

## 3. Luồng tổng quát

### Email/password login

```text
FE form
  -> POST /api/auth/login
  -> auth/controller.py
  -> auth/usecase.py authenticate_user()
  -> auth/repository.py get_account_by_email()
  -> helpers/security.py verify_password()
  -> tạo JWT bằng SECRET_KEY
  -> trả access_token + user
```

### Manual register

```text
FE form đăng ký
  -> POST /api/auth/register
  -> validate name/email/password
  -> kiểm tra email đã tồn tại chưa
  -> hash password bằng bcrypt
  -> lưu user vào MongoDB
  -> tạo JWT
  -> trả access_token + user
```

### Google login

```text
FE GoogleLogin lấy credential
  -> POST /api/auth/google
  -> verify Google id token bằng GOOGLE_OAUTH_CLIENT_ID
  -> lấy email/name/sub từ Google
  -> user: tự tạo hoặc link google_id
  -> admin: chỉ cho login nếu admin email đã tồn tại
  -> tạo JWT
  -> trả access_token + user
```

## 4. API endpoints

Tất cả endpoint auth nằm dưới prefix:

```text
/api/auth
```

Prefix `/api` đến từ `backend/app/manager/router.py`.
Prefix `/auth` đến từ `backend/app/manager/auth/controller.py`.

### 4.1. POST `/api/auth/login`

Dùng để đăng nhập bằng email/password.

Rate limit:

```text
10 request/phút
```

Request body:

```json
{
  "email": "user@gmail.com",
  "password": "123123",
  "role": "user"
}
```

Tham số:

| Field | Type | Required | Ghi chú |
|---|---:|---:|---|
| `email` | string | Có | Email được normalize về lowercase khi truy vấn |
| `password` | string | Có | Password thô từ form, BE verify với hash trong DB |
| `role` | string | Không | Mặc định `user`; có thể là `user` hoặc `admin` |

Response `200`:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "email": "user@gmail.com",
    "name": "Enterprise Client",
    "role": "user"
  }
}
```

Lỗi thường gặp:

```json
{
  "detail": "Invalid credentials for the selected role."
}
```

Status:

- `401`: sai email/password hoặc chọn sai role.
- `429`: vượt rate limit.

### 4.2. POST `/api/auth/register`

Dùng để đăng ký tài khoản thủ công. Endpoint này chỉ tạo tài khoản `user`, không tạo `admin`.

Rate limit:

```text
5 request/phút
```

Request body:

```json
{
  "name": "Nguyễn Văn A",
  "email": "customer@example.com",
  "password": "123123"
}
```

Tham số:

| Field | Type | Required | Ghi chú |
|---|---:|---:|---|
| `name` | string | Có | Không được rỗng sau khi trim |
| `email` | string | Có | Được normalize lowercase, phải giống dạng email cơ bản |
| `password` | string | Có | Tối thiểu 6 ký tự |

Response `201`:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "email": "customer@example.com",
    "name": "Nguyễn Văn A",
    "role": "user"
  }
}
```

Lỗi thường gặp:

```json
{
  "detail": "Name is required."
}
```

```json
{
  "detail": "A valid email is required."
}
```

```json
{
  "detail": "Password must be at least 6 characters."
}
```

```json
{
  "detail": "Email is already registered."
}
```

Status:

- `400`: dữ liệu không hợp lệ.
- `409`: email đã tồn tại.
- `429`: vượt rate limit.

### 4.3. POST `/api/auth/google`

Dùng để đăng nhập bằng Google OAuth.

Rate limit:

```text
10 request/phút
```

Request body:

```json
{
  "google_token": "google-id-token",
  "role": "user"
}
```

Tham số:

| Field | Type | Required | Ghi chú |
|---|---:|---:|---|
| `google_token` | string | Có | Credential token FE nhận từ `@react-oauth/google` |
| `role` | string | Không | Mặc định `user`; admin bị kiểm soát chặt hơn |

Response `200`:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "email": "customer@example.com",
    "name": "Nguyễn Văn A",
    "role": "user"
  }
}
```

Lỗi thường gặp:

```json
{
  "detail": "Invalid Google token."
}
```

Status:

- `401`: Google token sai, thiếu Google OAuth client id, hoặc admin email chưa được cấp sẵn.
- `429`: vượt rate limit.

### 4.4. GET `/api/auth/me`

Dùng để lấy thông tin user hiện tại từ JWT.

Header:

```http
Authorization: Bearer jwt-token
```

Response `200`:

```json
{
  "email": "user@gmail.com",
  "name": "Enterprise Client",
  "role": "user"
}
```

Lỗi thường gặp:

```json
{
  "detail": "Invalid or expired token."
}
```

Status:

- `401`: token thiếu, sai hoặc hết hạn.

## 5. Response schema

### `UserInfo`

```json
{
  "email": "string",
  "name": "string",
  "role": "user | admin"
}
```

### `LoginResponse`

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "email": "string",
    "name": "string",
    "role": "user | admin"
  }
}
```

JWT payload hiện chứa:

```json
{
  "email": "user@gmail.com",
  "name": "Enterprise Client",
  "role": "user",
  "exp": 1234567890
}
```

## 6. JWT auth hiện tại

Backend hiện đã có JWT auth.

Các file chính:

```text
backend/app/manager/auth/usecase.py
backend/app/manager/auth/controller.py
frontend/src/App.jsx
frontend/src/adapters/repositories/api/client.js
```

### 6.1. JWT được tạo lúc nào

JWT được tạo sau khi xác thực thành công ở các API:

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/google
```

Trong `auth/controller.py`, các endpoint trên đều gọi chung:

```text
_build_login_response(account)
```

Hàm này gọi tiếp:

```text
auth_usecase.create_access_token(...)
```

Token được trả về ở field:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### 6.2. JWT được ký bằng gì

JWT dùng:

```text
algorithm: HS256
secret: SECRET_KEY từ .env
expire: ACCESS_TOKEN_EXPIRE_MINUTES từ .env
```

Code nằm ở `auth/usecase.py`:

```py
ALGORITHM = "HS256"

def create_access_token(self, data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
```

Biến `.env` cần có:

```env
SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

`SECRET_KEY` là secret nhạy cảm, không commit giá trị thật.

### 6.3. FE lưu và gửi JWT như thế nào

Sau khi login/register/google thành công, FE nhận:

```text
user
accessToken
```

FE lưu session vào `localStorage` key:

```text
app_auth_session
```

Shape lưu ở FE:

```json
{
  "user": {
    "email": "user@gmail.com",
    "name": "Enterprise Client",
    "role": "user"
  },
  "token": "jwt-token",
  "timestamp": 1234567890
}
```

Axios client đọc session này trong:

```text
frontend/src/adapters/repositories/api/client.js
```

Mỗi request API sẽ tự gắn header:

```http
Authorization: Bearer jwt-token
```

### 6.4. BE kiểm tra JWT như thế nào

BE dùng:

```text
HTTPBearer()
```

để đọc header:

```http
Authorization: Bearer jwt-token
```

Sau đó gọi:

```text
auth_usecase.decode_token(token)
```

Nếu token hợp lệ, backend trả ra `UserInfo`:

```json
{
  "email": "user@gmail.com",
  "name": "Enterprise Client",
  "role": "user"
}
```

Nếu token sai hoặc hết hạn:

```json
{
  "detail": "Invalid or expired token."
}
```

### 6.5. Dependency dùng để bảo vệ route

Có 2 dependency chính:

```py
get_current_user()
```

Dùng cho route chỉ cần user đã đăng nhập. Ví dụ:

```text
GET /api/auth/me
POST /api/chat
```

```py
require_admin()
```

Dùng cho route bắt buộc role `admin`. Ví dụ:

```text
/api/documents/*
/api/admin/home/*
/api/admin/blog/*
/api/admin/ads/*
/api/admin/seo-service/*
/api/admin/seo-training/*
/api/admin/web-design/*
```

Nếu user không phải admin:

```json
{
  "detail": "Access denied. Admin privileges required."
}
```

Status:

```text
403 Forbidden
```

### 6.6. Tóm tắt JWT flow

```text
Login/Register/Google
  -> BE xác thực account
  -> BE ký JWT bằng SECRET_KEY
  -> FE lưu token vào localStorage
  -> FE gửi Authorization: Bearer <token>
  -> BE decode token
  -> get_current_user trả UserInfo
  -> require_admin kiểm tra role admin nếu cần
```

## 7. MongoDB collection

Collection:

```text
users
```

Index:

```text
email unique
```

Document mẫu cho tài khoản password:

```json
{
  "_id": "ObjectId",
  "email": "user@gmail.com",
  "password": "bcrypt-hash",
  "name": "Enterprise Client",
  "role": "user",
  "auth_providers": ["password"],
  "created_at": "datetime"
}
```

Document mẫu cho tài khoản Google:

```json
{
  "_id": "ObjectId",
  "email": "customer@example.com",
  "password": null,
  "name": "Nguyễn Văn A",
  "role": "user",
  "google_id": "google-sub",
  "auth_providers": ["google"],
  "created_at": "datetime"
}
```

Nếu một tài khoản password được link thêm Google, document có thể có:

```json
{
  "auth_providers": ["password", "google"],
  "google_id": "google-sub"
}
```

## 8. Biến `.env` liên quan

```env
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=123123
USER_EMAIL=user@gmail.com
USER_PASSWORD=123123

SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=480

GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Giải thích:

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: seed tài khoản admin mặc định khi app start.
- `USER_EMAIL`, `USER_PASSWORD`: seed tài khoản user demo khi app start.
- `SECRET_KEY`: dùng ký JWT, không được commit key thật.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: thời gian sống của token.
- `GOOGLE_OAUTH_CLIENT_ID`: dùng verify Google id token ở backend.

## 9. Frontend đang gọi API như thế nào

File gọi API:

```text
frontend/src/helpers/authApiService.js
```

Mapping hiện tại:

```text
authService.login()
  -> POST /auth/login

authService.register()
  -> POST /auth/register

authService.googleLogin()
  -> POST /auth/google
```

Do axios client đã có base URL `/api`, nên FE gọi `/auth/login` sẽ thành:

```text
/api/auth/login
```

Form UI:

```text
frontend/src/zones/user/pages/LoginWorkspace.jsx
frontend/src/zones/user/components/GoogleToneLoginCard.jsx
```

UI hiện có 2 tab:

- `Đăng nhập`: email/password hoặc Google.
- `Đăng ký`: tạo user bằng name/email/password.

## 10. Auth dùng nhiều cái gì

Module login sử dụng nhiều nhất:

- FastAPI router để khai báo API.
- Pydantic schema để validate request/response.
- MongoDB collection `users` để lưu account.
- Bcrypt qua `passlib` để hash/verify password.
- JWT qua `python-jose` để tạo và đọc access token.
- Google OAuth library để verify `google_token`.
- SlowAPI để rate limit login/register.
- `.env` để lấy secret, admin seed và Google client id.

## 11. Lưu ý phát triển tiếp

- Không cho public register tạo `admin`.
- Không trả password hash ra response.
- Không hard-code secret thật trong code.
- Nên dùng email unique index để tránh trùng account.
- Có thể thêm confirm password ở FE nếu cần UX chặt hơn.
- Có thể thêm endpoint đổi mật khẩu sau.
- Có thể thêm email verification trước khi cho tài khoản mới chat.
