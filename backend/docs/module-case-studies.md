# Module Case Studies

Module Case Studies quản lý các case study/dự án đã triển khai để hiển thị bằng chứng năng lực trên website.

## Vị trí code chính

```text
backend/app/manager/case_studies/
```

| File | Vai trò |
|------|---------|
| `controller.py` | Public/Admin API case studies |
| `usecase.py` | Validate, tạo/cập nhật/xóa case study |
| `repository.py` | CRUD collection `case_studies` |

Frontend liên quan:

| Path | Vai trò |
|------|---------|
| `frontend/src/config/apiService.js` | `adminCaseStudies*` |
| `frontend/src/zones/user/pages/tabs/*.jsx` | Các tab dịch vụ có thể render case study |

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| API | FastAPI |
| Validation | Pydantic |
| Database | MongoDB/PyMongo |
| Auth | Admin Bearer cho CRUD |
| Frontend | React, Axios |

## Endpoints

| Method | Path | Auth | Mục đích |
|--------|------|------|----------|
| GET | `/api/user/case-studies` | Không | Lấy case study public |
| GET | `/api/admin/case-studies` | Admin Bearer | Lấy danh sách case study |
| POST | `/api/admin/case-studies` | Admin Bearer | Tạo case study |
| PUT | `/api/admin/case-studies/{item_id}` | Admin Bearer | Cập nhật case study |
| DELETE | `/api/admin/case-studies/{item_id}` | Admin Bearer | Xóa case study |

## Luồng hoạt động

```text
FE gọi danh sách case studies
  -> GET /api/user/case-studies hoặc /api/admin/case-studies
  -> CaseStudyUseCase.get_all()
  -> Repository đọc collection case_studies
  -> trả list CaseStudy
```

Create/update:

- Create sinh `id` 8 ký tự.
- `results` lưu list object `{label, value}` hoặc shape tương tự do FE quy ước.
- `chart_data` lưu list số để FE render biểu đồ.
- `service_type` phân nhóm case study theo dịch vụ.
- `is_featured` đánh dấu case study nổi bật.

## Dữ liệu MongoDB

Collection:

```text
case_studies
```

Schema:

| Field | Ý nghĩa |
|-------|---------|
| `id` | ID 8 ký tự |
| `title` | Tên case study |
| `client_industry` | Ngành khách hàng |
| `challenge` | Vấn đề |
| `solution` | Giải pháp |
| `results` | Danh sách kết quả |
| `chart_data` | Dữ liệu biểu đồ |
| `service_type` | Loại dịch vụ |
| `is_featured` | Nổi bật |
| `image_url` | Ảnh minh họa |
| `sort_order` | Thứ tự hiển thị |
| `created_at`, `updated_at` | Mốc thời gian |

Index:

- `id` unique.

## Lưu ý vận hành

- Public API không yêu cầu đăng nhập.
- Repository hiện chưa sort/filter theo `sort_order` hoặc `is_featured`.
- FE cần thống nhất shape của từng object trong `results`.
