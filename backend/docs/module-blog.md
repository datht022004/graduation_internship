# Module Blog

Module Blog quản lý bài viết trong admin và cung cấp dữ liệu blog public qua module User.

## Vị trí code chính

```text
backend/app/manager/blog/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Admin API `/api/admin/blog/posts` |
| `usecase.py` | Validate payload, tạo slug, phân trang, toggle featured, seed data |
| `repository.py` | CRUD MongoDB collection `blog_posts` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/admin/pages/AdminBlogPage.jsx` | Quản lý bài viết |
| `frontend/src/zones/user/pages/tabs/BlogTabPage.jsx` | Hiển thị blog public |
| `frontend/src/zones/user/components/BlogPostDetailModal.jsx` | Xem chi tiết bài viết |
| `frontend/src/config/apiService.js` | `adminBlog*`, `getUserBlog()` |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Validation | Pydantic |
| Database | MongoDB/PyMongo |
| Auth | Admin Bearer |
| Frontend | React, Axios |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/admin/blog/posts` | Admin Bearer | List bài viết, phân trang, lọc |
| POST | `/api/admin/blog/posts` | Admin Bearer | Tạo bài viết |
| PUT | `/api/admin/blog/posts/{post_id}` | Admin Bearer | Cập nhật bài viết |
| DELETE | `/api/admin/blog/posts/{post_id}` | Admin Bearer | Xóa bài viết |
| PATCH | `/api/admin/blog/posts/{post_id}/toggle-featured` | Admin Bearer | Bật/tắt nổi bật |
| GET | `/api/user/blog` | Không | Lấy danh sách bài viết public |

Query admin list:

| Query | Ý nghĩa |
|-------|---------|
| `category` | Lọc theo tên danh mục |
| `q` | Tìm theo title/slug |
| `page` | Trang |
| `pageSize` | Số item mỗi trang |

## Luồng hoạt động

```text
AdminBlogPage
  -> adminBlogGetPostPage()
  -> GET /api/admin/blog/posts
  -> require_admin
  -> BlogUseCase.list_posts()
  -> BlogRepository.list_posts()
  -> trả items + pagination
```

Tạo bài viết:

```text
Admin gửi BlogPostCreate
  -> trim string
  -> nếu slug rỗng thì tạo slug từ title
  -> tạo id 8 ký tự
  -> set createdAt/updatedAt
  -> insert blog_posts
```

Cập nhật:

- Chỉ update field được gửi lên.
- Nếu có đổi title và không truyền slug mới thì slug được tạo lại theo title.
- Cập nhật `updatedAt`.

Toggle featured:

- Đọc bài viết hiện tại.
- Đảo `isFeatured`.
- Cập nhật `updatedAt`.

## Dữ liệu MongoDB

Collection:

```text
blog_posts
```

Schema chính:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `title` | Tiêu đề |
| `slug` | Slug URL |
| `category` | Tên category |
| `readTime` | Thời gian đọc |
| `excerpt` | Mô tả ngắn |
| `content` | Nội dung HTML/text |
| `imageUrl` | Ảnh đại diện |
| `author` | Tác giả |
| `tags` | Tags dạng string |
| `isFeatured` | Nổi bật |
| `viewCount` | Lượt xem, mặc định 0 |
| `createdAt`, `updatedAt` | Mốc thời gian |

Index:

- `id` unique.
- `isFeatured`, `createdAt` để sort bài nổi bật lên trước.

## Quan hệ với Category

- Blog lưu category bằng tên category, không lưu category id.
- Module Category không cho xóa category nếu còn bài viết dùng category đó.
- Khi seed legacy category, Category có thể rename category cũ trong `blog_posts`.

## Lưu ý vận hành

- Public blog lấy qua `/api/user/blog`, không gọi trực tiếp `/api/admin/blog/posts`.
- Search trong repository hiện lọc sau khi lấy data theo category, dựa trên title/slug.
- Nội dung seed mặc định nằm trong `BlogUseCase.seed_default_posts()`.
