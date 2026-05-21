# User API

## Public Content

### GET `/api/user/home`

Response:

```json
{
  "serviceCards": [],
  "painPoints": [],
  "strengths": []
}
```

### GET `/api/user/seo-service`

```json
{
  "metrics": [],
  "packages": [],
  "roadmap": []
}
```

### GET `/api/user/web-design`

```json
{
  "phases": [],
  "highlights": []
}
```

### GET `/api/user/ads`

```json
{
  "metrics": [],
  "channels": []
}
```

### GET `/api/user/blog`

Trả danh sách blog posts public từ `blog_posts`.

## Admin Users

### GET `/api/admin/users`

Query:

| Param | Mô tả |
|-------|-------|
| `q` | Search name/email |
| `role` | `admin` hoặc `user` |
| `page` | Trang |
| `pageSize` | Số item/trang |

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### POST `/api/admin/users`

```json
{
  "name": "Admin",
  "email": "admin2@example.com",
  "password": "123456",
  "role": "admin"
}
```

### PUT `/api/admin/users/{email}`

Cho phép cập nhật:

```json
{
  "name": "New Name",
  "password": "123456",
  "role": "user"
}
```

### DELETE `/api/admin/users/{email}`

Xóa user theo email.
