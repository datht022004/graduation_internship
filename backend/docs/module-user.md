# Module User

Path:

```text
app/manager/user/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Public content routes và admin users routes |
| `usecase.py` | Public data response, admin user schemas/logic |
| `repository.py` | CRUD users collection |

## Public Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/user/home` | Public |
| GET | `/api/user/seo-service` | Public |
| GET | `/api/user/web-design` | Public |
| GET | `/api/user/ads` | Public |
| GET | `/api/user/blog` | Public |

Hiện các endpoint content ngoài blog có thể trả mảng rỗng để frontend fallback mock.

## Admin User Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/users` | Admin |
| POST | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/{email}` | Admin |
| DELETE | `/api/admin/users/{email}` | Admin |

## Rules

- Role hợp lệ: `admin`, `user`.
- Email phải hợp lệ cơ bản.
- Password tối thiểu 6 ký tự khi tạo hoặc đổi.
- Admin không thể tự xóa account đang đăng nhập.
- Admin không thể tự hạ quyền chính mình.
