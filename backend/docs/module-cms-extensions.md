# Module CMS Extensions

Các module mở rộng phục vụ cho việc quản trị nội dung website động (Dynamic CMS).

Path:

```text
app/manager/company_profile/
app/manager/service_packages/
app/manager/case_studies/
app/manager/testimonials/
app/manager/contact_requests/
```

## Cấu trúc chung (Files)

Mỗi thư mục đại diện cho một module CMS với cấu trúc chuẩn:

| File | Vai trò |
|------|---------|
| `controller.py` | Định nghĩa các routes (APIs) cho Admin (yêu cầu auth) và Public (không yêu cầu auth). |
| `usecase.py` | Pydantic models (Schema validation) và logic nghiệp vụ. |
| `repository.py` | Tương tác trực tiếp với MongoDB (CRUD operations). |

## Danh sách Modules

### 1. Company Profile (Hồ sơ Công ty)
- **Collection**: `company_profiles`
- **Mục đích**: Quản lý thông tin giới thiệu, tầm nhìn, sứ mệnh, v.v.
- **Admin Endpoints**: `/api/admin/company-profile` (GET, POST, PUT, DELETE)
- **Public Endpoints**: `/api/user/company-profile` (GET)

### 2. Service Packages (Gói Dịch Vụ)
- **Collection**: `service_packages`
- **Mục đích**: Quản lý danh sách các gói dịch vụ (SEO, Web Design, Ads) và giá cả, tính năng.
- **Admin Endpoints**: `/api/admin/service-packages` (GET, POST, PUT, DELETE)
- **Public Endpoints**: `/api/user/service-packages` (GET)

### 3. Case Studies (Dự Án Đã Làm)
- **Collection**: `case_studies`
- **Mục đích**: Quản lý các dự án, danh mục đầu tư (portfolio) để show thành tựu cho khách hàng.
- **Admin Endpoints**: `/api/admin/case-studies` (GET, POST, PUT, DELETE)
- **Public Endpoints**: `/api/user/case-studies` (GET)

### 4. Testimonials (Đánh giá Khách Hàng)
- **Collection**: `testimonials`
- **Mục đích**: Quản lý nhận xét và đánh giá của khách hàng, tích hợp sao (rating).
- **Admin Endpoints**: `/api/admin/testimonials` (GET, POST, PUT, DELETE)
- **Public Endpoints**: `/api/user/testimonials` (GET)

### 5. Contact Requests (Yêu Cầu Tư Vấn)
- **Collection**: `contact_requests`
- **Mục đích**: Lưu trữ thông tin khách hàng điền form liên hệ/tư vấn.
- **Admin Endpoints**: `/api/admin/contact-requests` (GET, POST, PUT, DELETE)
- **Public Endpoints**: `/api/user/contact-requests` (POST) (Để user có thể gửi yêu cầu).

## Phân quyền & Security

- Toàn bộ các route `/api/admin/*` bắt buộc sử dụng `Depends(require_admin)` từ `app.manager.auth.usecase`.
- API trả về lỗi `401/403` nếu không cung cấp token Admin hợp lệ.
- Validation dữ liệu được Pydantic tự động xử lý chặt chẽ ở lớp `usecase.py`.
