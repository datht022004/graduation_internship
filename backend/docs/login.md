# Auth API

## POST `/api/auth/login`

Request:

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

Sai email/password/role trả `401`.

## POST `/api/auth/register`

Request:

```json
{
  "name": "New User",
  "email": "new@example.com",
  "password": "123456"
}
```

Response giống login, status `201`.

Validation:

- name không rỗng
- email có `@` và `.`
- password tối thiểu 6 ký tự
- email trùng trả `409`

## POST `/api/auth/google`

Request:

```json
{
  "google_token": "<credential>",
  "role": "user"
}
```

Backend verify token bằng `GOOGLE_OAUTH_CLIENT_ID`.

Admin Google login chỉ được phép nếu account admin đã tồn tại.

## GET `/api/auth/me`

Header:

```text
Authorization: Bearer <token>
```

Response:

```json
{
  "email": "user@gmail.com",
  "name": "Khách hàng doanh nghiệp",
  "role": "user"
}
```

Token invalid hoặc hết hạn trả `401`.
