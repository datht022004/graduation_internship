# Module Category

Path:

```text
app/manager/category/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Admin category routes |
| `usecase.py` | Category schemas, pagination, validation, seed defaults |
| `repository.py` | MongoDB operations cho `categories` |

## Endpoints

Prefix:

```text
/api/admin/categories
```

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Admin |
| POST | `/` | Admin |
| PUT | `/{category_id}` | Admin |
| DELETE | `/{category_id}` | Admin |

## Features

- Pagination bằng `page`, `pageSize`.
- Search category bằng query `name`.
- Seed default categories khi app startup.
- Chặn xóa category đang được blog post sử dụng.

## Delete Rules

`delete_category()` có thể trả:

| Result | HTTP |
|--------|------|
| `deleted` | 204 |
| `not_found` | 404 |
| `in_use` | 409 |
