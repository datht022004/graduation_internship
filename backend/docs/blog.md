# Blog API

Tất cả admin blog endpoints cần admin token.

## GET `/api/admin/blog/posts`

Query:

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `category` | `""` | Lọc theo category |
| `q` | `""` | Tìm theo title/slug |
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

## POST `/api/admin/blog/posts`

Body chính:

```json
{
  "title": "Checklist SEO",
  "category": "Dịch vụ SEO",
  "readTime": "7 phút đọc",
  "excerpt": "Mô tả ngắn",
  "content": "<p>Nội dung</p>",
  "imageUrl": "",
  "author": "",
  "tags": "",
  "isFeatured": false
}
```

## PUT `/api/admin/blog/posts/{post_id}`

Cho phép cập nhật từng phần.

## DELETE `/api/admin/blog/posts/{post_id}`

Xóa bài viết. Không tìm thấy trả `404`.

## PATCH `/api/admin/blog/posts/{post_id}/toggle-featured`

Đảo trạng thái `isFeatured`.

## Public Blog

Frontend public blog gọi:

```text
GET /api/user/blog
```

Endpoint này không cần auth.
