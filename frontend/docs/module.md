# Thống Kê Module Toàn Dự Án

## 1. Cách hiểu "module" trong dự án

Để tránh đếm lẫn giữa frontend và backend, tài liệu này dùng 2 cách hiểu module:

- **Backend module**: mỗi thư mục nghiệp vụ trong `backend/app/manager`
- **Frontend module**: mỗi zone lớn trong `frontend/src/zones`

Tiêu chí đánh giá **"module nào nhiều rồi"**:

- **Backend**: ưu tiên số **endpoint** và số **nhóm chức năng** đã có
- **Frontend**: ưu tiên số **page/tab/component** đã hiện diện ở từng zone

Lưu ý: tài liệu này chỉ thống kê theo **mức độ chức năng đã có**, không xếp hạng theo số dòng code.

---

## 2. Tổng quan số lượng module

### Backend

Hiện tại backend có **10 module nghiệp vụ** trong `backend/app/manager`:

| STT | Module | Số file | Số endpoint | Ghi chú ngắn |
|-----|--------|---------|-------------|-------------|
| 1 | `auth` | 4 | 3 | Đăng nhập, lấy user hiện tại, Google login |
| 2 | `ads` | 4 | 8 | CRUD metrics và channels |
| 3 | `blog` | 4 | 5 | CRUD bài viết và toggle featured |
| 4 | `chat` | 4 | 1 | Chat endpoint |
| 5 | `document` | 4 | 3 | Upload, list, delete tài liệu |
| 6 | `home` | 4 | 12 | CRUD service cards, pain points, strengths |
| 7 | `seo_service` | 4 | 12 | CRUD metrics, packages, roadmap |
| 8 | `seo_training` | 4 | 8 | CRUD modules, syllabus |
| 9 | `user` | 2 | 6 | Public API cho các tab nội dung |
| 10 | `web_design` | 4 | 8 | CRUD phases, highlights |

### Frontend

Hiện tại frontend có **2 zone/module lớn** trong `frontend/src/zones`:

| STT | Zone | Components | Pages/Tab Pages | Config | Tổng file zone-level | Ghi chú ngắn |
|-----|------|------------|-----------------|--------|----------------------|-------------|
| 1 | `admin` | 10 | 10 | 1 | 21 | Khu quản trị nội dung và tài liệu |
| 2 | `user` | 9 | 9 | 1 | 19 | Landing page, login workspace, 6 tab dịch vụ |

---

## 3. Module nào đang "nhiều" nhất

### Backend

Hai module triển khai nhiều chức năng nhất hiện tại là:

- **`seo_service`**: **12 endpoint**
- **`home`**: **12 endpoint**

Đây là 2 module đang đầy đủ nhất theo tiêu chí CRUD và nhóm chức năng.

Nhóm đứng sau là:

- **`ads`**: 8 endpoint
- **`seo_training`**: 8 endpoint
- **`web_design`**: 8 endpoint

Những module này cũng đã có mức độ hoàn thiện khá cao vì đều có nhóm chức năng CRUD rõ ràng.

### Frontend

Cả 2 zone `admin` và `user` đều đã khá đầy đủ, nhưng nếu xét theo số file zone-level thì:

- **`admin`** nhỉnh hơn nhẹ với **21 file**
- **`user`** có **19 file**

Điều này hợp lý vì zone `admin` đang có nhiều page quản trị chuyên biệt hơn, còn zone `user` tập trung vào trải nghiệm landing page và các tab dịch vụ.

---

## 4. Backend đã có những module nào và mỗi module đã có gì

### 4.1 `auth`

- Có 3 endpoint chính:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/google`
- Đã có logic:
  - xác thực tài khoản
  - tạo access token
  - lấy user hiện tại
  - kiểm tra quyền admin qua `require_admin`

### 4.2 `document`

- Có 3 endpoint chính:
  - `POST /api/documents/upload`
  - `GET /api/documents`
  - `DELETE /api/documents/{doc_id}`
- Đã có chức năng:
  - upload tài liệu
  - kiểm tra định dạng file hợp lệ
  - kiểm tra giới hạn dung lượng
  - lấy danh sách tài liệu
  - xóa tài liệu

### 4.3 `chat`

- Có 1 endpoint chính:
  - `POST /api/chat`
- Đây là module chuyên biệt cho nghiệp vụ chat, nên ít endpoint hơn nhưng không có nghĩa là ít quan trọng.

### 4.4 `home`

- Có **12 endpoint**
- Đã có 3 nhóm chức năng CRUD:
  - service cards
  - pain points
  - strengths
- Đây là một trong hai module backend nhiều chức năng nhất hiện tại.

### 4.5 `seo_service`

- Có **12 endpoint**
- Đã có 3 nhóm chức năng CRUD:
  - metrics
  - packages
  - roadmap
- Đây là một trong hai module backend nhiều chức năng nhất hiện tại.

### 4.6 `seo_training`

- Có **8 endpoint**
- Đã có 2 nhóm chức năng CRUD:
  - modules
  - syllabus

### 4.7 `web_design`

- Có **8 endpoint**
- Đã có 2 nhóm chức năng CRUD:
  - phases
  - highlights

### 4.8 `ads`

- Có **8 endpoint**
- Đã có 2 nhóm chức năng CRUD:
  - metrics
  - channels

### 4.9 `blog`

- Có **5 endpoint**
- Đã có chức năng:
  - CRUD bài viết
  - bật/tắt trạng thái featured qua endpoint toggle

### 4.10 `user`

- Có **6 endpoint public**
- Đã có các endpoint lấy dữ liệu cho:
  - `home`
  - `seo-service`
  - `seo-training`
  - `web-design`
  - `ads`
  - `blog`
- Đây là module public API phục vụ zone người dùng ở frontend.

---

## 5. Frontend đã có những module nào và mỗi module đã có gì

### 5.1 `admin`

Zone `admin` hiện đã có các nhóm thành phần chính:

- **Shared admin components**:
  - sidebar
  - data table
  - modal
  - form field
  - empty state
  - delete confirm
  - stat card
  - page header
- **Document components**:
  - `DocumentUploader`
  - `DocumentList`
- **Pages quản trị**:
  - `AdminZonePage`
  - `AdminOverviewPage`
  - `AdminDocumentsPage`
  - `AdminHomePage`
  - `AdminSeoServicePage`
  - `AdminSeoTrainingPage`
  - `AdminWebDesignPage`
  - `AdminAdsPage`
  - `AdminBlogPage`

Tóm lại, `admin` đã có đủ phần khung quản trị và các màn hình quản lý nội dung chính.

### 5.2 `user`

Zone `user` hiện đã có các nhóm thành phần chính:

- **Layout và landing components**:
  - top bar
  - header nav
  - hero banner
  - footer
  - company intro
  - feature list
- **Auth và tương tác**:
  - `GoogleToneLoginCard`
  - `RoleSelector`
  - `ChatWidget`
- **Pages chính**:
  - `UserZonePage`
  - `UserLandingPage`
  - `LoginWorkspace`
- **6 tab nội dung dịch vụ**:
  - `HomeTabPage`
  - `SeoServiceTabPage`
  - `SeoTrainingTabPage`
  - `WebDesignTabPage`
  - `AdsTabPage`
  - `BlogTabPage`

Tóm lại, `user` đã có đầy đủ landing page, khu đăng nhập và các tab nội dung dịch vụ để phục vụ người dùng cuối.

---

## 6. Kết luận nhanh

- Backend hiện có **10 module nghiệp vụ**, frontend có **2 zone/module lớn**
- Hai module backend triển khai nhiều chức năng nhất hiện tại là **`home`** và **`seo_service`**, cùng có **12 endpoint**
- Nhóm module CRUD khá đầy đủ tiếp theo là **`ads`**, **`seo_training`** và **`web_design`**
- Các module như **`chat`**, **`auth`**, **`document`** có ít endpoint hơn, nhưng đó là vì chúng tập trung vào nghiệp vụ chuyên biệt, không phải vì chưa làm
- Ở frontend, cả `admin` và `user` đều đã khá hoàn chỉnh, trong đó `admin` nhỉnh hơn nhẹ về số file zone-level

---

## 7. Nguồn đối chiếu để kiểm tra lại

Các số liệu trong tài liệu này được đối chiếu từ:

- `backend/app/manager/router.py`
- các file `controller.py` trong từng module backend
- cấu trúc thư mục `backend/app/manager/*`
- cấu trúc thư mục `frontend/src/zones/*`
