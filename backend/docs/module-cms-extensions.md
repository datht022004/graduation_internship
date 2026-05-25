# Module CMS Extensions

File này là bản tổng quan nhanh cho nhóm module CMS mở rộng. Tài liệu chi tiết đã được tách ra từng file `module-*.md` riêng.

## Các module trong nhóm

| Module | Backend path | Collection | Tài liệu chi tiết |
|--------|--------------|------------|-------------------|
| Company Profile | `backend/app/manager/company_profile/` | `company_profile` | `backend/docs/module-company-profile.md` |
| Service Packages | `backend/app/manager/service_packages/` | `service_packages` | `backend/docs/module-service-packages.md` |
| Case Studies | `backend/app/manager/case_studies/` | `case_studies` | `backend/docs/module-case-studies.md` |
| Testimonials | `backend/app/manager/testimonials/` | `testimonials` | `backend/docs/module-testimonials.md` |
| Contact Requests | `backend/app/manager/contact_requests/` | `contact_requests` | `backend/docs/module-contact-requests.md` |
| Site Content | `backend/app/manager/site_content/` | `site_content` | `backend/docs/module-site-content.md` |

## Cấu trúc chung

Phần lớn các module CMS có 3 file chính:

| File | Vai trò |
|------|---------|
| `controller.py` | Khai báo public/admin routes |
| `usecase.py` | Pydantic schema, validate và nghiệp vụ CRUD |
| `repository.py` | Thao tác MongoDB |

## Mẫu endpoint chung

Các module public/admin thường đi theo mẫu:

```text
GET    /api/user/{resource}
GET    /api/admin/{resource}
POST   /api/admin/{resource}
PUT    /api/admin/{resource}/{item_id}
DELETE /api/admin/{resource}/{item_id}
```

Riêng `site_content` dùng:

```text
GET /api/user/site-content/{page_key}
GET /api/admin/site-content?page_key=...
```

Riêng `contact_requests` hiện chỉ có admin CRUD trong code backend. `public_router` đã được khai báo nhưng chưa có public endpoint.

## Phân quyền

- Public routes `/api/user/*` không yêu cầu đăng nhập.
- Admin routes `/api/admin/*` dùng `Depends(require_admin)`.
- Request admin cần header:

```text
Authorization: Bearer <access_token>
```

## Lưu ý chung

- Các repository CMS hiện chủ yếu đọc toàn bộ collection, chưa đồng nhất sort/filter theo `sort_order` hoặc `is_active`.
- Nếu FE cần ẩn item inactive hoặc sắp xếp theo thứ tự, nên xử lý ở FE hoặc bổ sung filter/sort trong repository.
- Các file chi tiết mới là nguồn tham khảo chính khi cần xem luồng, schema và endpoint từng module.
