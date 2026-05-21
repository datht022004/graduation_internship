# Module Blog

Path:

```text
app/manager/blog/
```

## Files

| File | Vai trò |
|------|---------|
| `controller.py` | Admin blog routes |
| `usecase.py` | Blog schemas, slug, pagination, seed default posts |
| `repository.py` | MongoDB operations cho `blog_posts` |

## Endpoints

Prefix:

```text
/api/admin/blog
```

| Method | Path | Auth |
|--------|------|------|
| GET | `/posts` | Admin |
| POST | `/posts` | Admin |
| PUT | `/posts/{post_id}` | Admin |
| DELETE | `/posts/{post_id}` | Admin |
| PATCH | `/posts/{post_id}/toggle-featured` | Admin |

## Features

- Pagination bằng `page`, `pageSize`.
- Filter category bằng `category`.
- Search title/slug bằng `q`.
- Auto slug từ title nếu không gửi slug.
- Toggle `isFeatured`.
- Seed default posts khi DB trống.

## Public Blog

Public endpoint `/api/user/blog` dùng:

```python
blog_usecase.get_public_posts()
```

để trả danh sách bài viết cho frontend user zone.
