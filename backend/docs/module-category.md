# Module Category

Module Category quản lý danh mục bài viết blog trong admin.

## Vị trí code chính

```text
backend/app/manager/category/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Admin API `/api/admin/categories` |
| `usecase.py` | Validate, tạo slug unique, tính postCount, seed/migrate category |
| `repository.py` | CRUD collection `categories`, kiểm tra `blog_posts` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/zones/admin/pages/AdminCategoriesPage.jsx` | Quản lý category |
| `frontend/src/zones/admin/pages/AdminBlogPage.jsx` | Load category để chọn khi tạo blog |
| `frontend/src/config/apiService.js` | `adminCategory*` |

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
| GET | `/api/admin/categories` | Admin Bearer | List category có phân trang/tìm kiếm |
| POST | `/api/admin/categories` | Admin Bearer | Tạo category |
| PUT | `/api/admin/categories/{category_id}` | Admin Bearer | Cập nhật category |
| DELETE | `/api/admin/categories/{category_id}` | Admin Bearer | Xóa category |

Query list:

| Query | Ý nghĩa |
|-------|---------|
| `name` | Tìm category theo tên |
| `page` | Trang |
| `pageSize` | Số item mỗi trang |

## Luồng hoạt động

```text
AdminCategoriesPage
  -> adminCategoryGetPage()
  -> GET /api/admin/categories
  -> require_admin
  -> CategoryUseCase.list_categories()
  -> CategoryRepository.list_categories()
  -> tính postCount từ blog_posts
  -> trả items + pagination
```

Tạo category:

```text
Admin gửi name + description
  -> trim name
  -> tạo slug từ name
  -> nếu slug trùng thì thêm hậu tố -2, -3...
  -> tạo id 8 ký tự
  -> insert categories
```

Cập nhật:

- Cho phép đổi `name`, `description`.
- Khi đổi name, slug được tạo lại và vẫn đảm bảo unique.
- Cập nhật `updated_at`.

Xóa:

- Nếu không tìm thấy, trả `404`.
- Nếu category đang được `blog_posts.category` sử dụng, trả `409 Conflict`.
- Nếu không còn bài viết dùng category thì xóa.

## Dữ liệu MongoDB

Collection:

```text
categories
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `name` | Tên danh mục |
| `slug` | Slug unique |
| `description` | Mô tả |
| `created_at` | Ngày tạo |
| `updated_at` | Ngày cập nhật |

Response có thêm:

| Field | Ý nghĩa |
|-------|---------|
| `postCount` | Số bài viết đang dùng category này |

Index:

- `id` unique.
- `slug` unique.
- `name`.

## Seed và migrate

Default category:

- `Dịch vụ SEO`
- `Thiết kế website`
- `Quảng cáo +`
- `Blog`

`LEGACY_CATEGORY_RENAMES` dùng để gom các category cũ về nhóm category mới, đồng thời rename field `category` trong `blog_posts`.

## Lưu ý vận hành

- Blog đang tham chiếu category bằng `name`, nên đổi tên category có thể ảnh hưởng dữ liệu blog nếu không migrate đồng bộ.
- Không có endpoint public category riêng; FE admin dùng module này để chọn category cho blog.
