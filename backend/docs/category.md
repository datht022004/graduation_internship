# Category API

Tất cả endpoint category cần admin token.

## GET `/api/admin/categories`

Query:

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `name` | `""` | Tìm theo tên danh mục |
| `page` | `1` | Trang |
| `pageSize` | `10` | Số item/trang, tối đa 100 |

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

## POST `/api/admin/categories`

Request:

```json
{
  "name": "Dịch vụ SEO",
  "description": "Nhóm bài viết SEO"
}
```

Response là category đã tạo.

## PUT `/api/admin/categories/{category_id}`

Request có thể gửi từng phần:

```json
{
  "name": "SEO",
  "description": "Mô tả mới"
}
```

Không tìm thấy trả `404`.

## DELETE `/api/admin/categories/{category_id}`

Response thành công: `204 No Content`.

Error:

- `404`: category không tồn tại
- `409`: category đang được blog posts sử dụng
