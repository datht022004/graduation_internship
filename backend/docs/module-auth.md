# Module Auth

Path:

```text
app/manager/auth/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Routes auth, request/response schemas |
| `usecase.py` | JWT, password auth, register, Google OAuth, dependencies |
| `repository.py` | CRUD users collection |

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/google` | Public |
| GET | `/api/auth/me` | Bearer |

## Schemas

Schemas nằm trong `controller.py`:

- `LoginRequest`
- `RegisterRequest`
- `GoogleLoginRequest`
- `LoginResponse`

`UserInfo` nằm trong `usecase.py`.

## Use Cases

- `init_default_users()`
- `register_manual_user()`
- `authenticate_user()`
- `authenticate_google()`
- `create_access_token()`
- `decode_token()`
- `get_current_user()`
- `require_admin()`

## Default Users

Tạo lúc startup nếu chưa tồn tại:

| Env | Role |
|-----|------|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | admin |
| `USER_EMAIL`, `USER_PASSWORD` | user |

## Notes

- Email được normalize lowercase.
- Password được hash bằng bcrypt.
- JWT dùng HS256 và `SECRET_KEY`.
- `require_admin()` được dùng cho `/api/admin/*` và `/api/documents/*`.
