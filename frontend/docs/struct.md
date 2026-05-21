# Cấu trúc Frontend

Tài liệu này mô tả cấu trúc hiện tại của frontend trong project RAG chatbot tư vấn dịch vụ Digital Marketing.

## 1. Nguyên tắc tổ chức

- `src/config/apiService.js` là nơi tập trung cấu hình API endpoint và các hàm gọi backend.
- `src/zones/admin` chứa giao diện quản trị.
- `src/zones/user` chứa giao diện khách hàng, landing page, login và chat widget.
- `src/helpers` chứa logic dùng chung nhỏ, ví dụ role và validate form auth.
- `src/mock` chứa dữ liệu fallback cho UI khi API public chưa có dữ liệu đầy đủ.
- Component không hard-code endpoint backend. Component import function từ `config/apiService.js`.

## 2. Cây thư mục chính

```text
frontend/
├── docs/
│   ├── NOTE.md
│   ├── module.md
│   └── struct.md
├── nginx/
│   └── default.conf
├── public/
├── src/
│   ├── config/
│   │   └── apiService.js
│   ├── helpers/
│   │   ├── authRoles.js
│   │   └── authUseCases.js
│   ├── mock/
│   │   └── pages/
│   │       ├── admin/
│   │       │   ├── ads.mock.js
│   │       │   ├── blog.mock.js
│   │       │   ├── dashboard.mock.js
│   │       │   ├── home.mock.js
│   │       │   ├── seo-service.mock.js
│   │       │   └── web-design.mock.js
│   │       └── user/
│   │           ├── ads-tab.mock.js
│   │           ├── blog.mock.js
│   │           ├── home-tab.mock.js
│   │           ├── landing.mock.js
│   │           ├── seo-service-tab.mock.js
│   │           ├── user-header.mock.js
│   │           ├── user-landing.mock.js
│   │           └── web-design-tab.mock.js
│   ├── zones/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   │   └── navigation.js
│   │   │   └── pages/
│   │   └── user/
│   │       ├── components/
│   │       ├── config/
│   │       │   └── navigation.ts
│   │       └── pages/
│   │           └── tabs/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── Dockerfile
├── package.json
└── vite.config.js
```

## 3. Luồng dữ liệu

### Luồng gọi API

```text
Page hoặc Component
    ↓
src/config/apiService.js
    ↓
Backend FastAPI /api/*
```

Ví dụ:

```js
import { documentGetAdminPage } from '../../../config/apiService'

const data = await documentGetAdminPage({ page: 1, pageSize: 5 })
```

### Luồng login

```text
LoginWorkspace.jsx
    ↓
helpers/authUseCases.js
    ↓
authApi.login() trong config/apiService.js
    ↓
POST /api/auth/login
    ↓
App.jsx lưu app_auth_session vào localStorage
```

### Luồng chat RAG

```text
ChatWidget.jsx
    ↓
chatStreamMessage() trong config/apiService.js
    ↓
POST /api/chat
    ↓
SSE stream text, sources, session id
```

## 4. `src/config/apiService.js`

File này đang chứa:

- `API_URL`
- `API_ENDPOINTS`
- timeout axios mặc định
- interceptor gắn JWT từ `localStorage`
- các hàm gọi API theo module:
  - auth
  - user public content
  - chat
  - documents
  - admin blog
  - admin categories
  - admin users

Quy ước:

- Khi thêm endpoint mới, khai báo trong `API_ENDPOINTS` trước.
- Sau đó viết function gọi API ngay bên dưới theo module tương ứng.
- Note trên function cần ghi rõ `METHOD /path`.
- Component chỉ gọi function đã export, không gọi `axios` hoặc `fetch` trực tiếp, trừ khi xử lý stream đặc biệt đã nằm trong `apiService.js`.

## 5. `src/zones/admin`

Admin zone gồm các trang:

- `AdminOverviewPage.jsx`: dashboard tổng quan.
- `AdminBlogPage.jsx`: quản lý bài viết blog.
- `AdminCategoriesPage.jsx`: quản lý danh mục blog.
- `AdminUsersPage.jsx`: quản lý tài khoản.
- `AdminDocumentsPage.jsx`: quản lý tài liệu RAG.

Admin components dùng chung:

- `AdminDataTable.jsx`
- `AdminModal.jsx`
- `AdminFormField.jsx`
- `AdminDeleteConfirm.jsx`
- `AdminPageHeader.jsx`
- `AdminSidebar.jsx`
- `AdminStatCard.jsx`
- `DocumentUploader.jsx`
- `DocumentList.jsx`
- `BlogPostPreviewModal.jsx`

Navigation admin nằm ở:

```text
src/zones/admin/config/navigation.js
```

Các mục hiện có: dashboard, blog, categories, users, documents.

## 6. `src/zones/user`

User zone gồm:

- `UserZonePage.jsx`: container chính của user zone.
- `UserLandingPage.jsx`: landing page và tab content.
- `LoginWorkspace.jsx`: form login/register/google login.
- `tabs/*`: nội dung Home, SEO Service, Web Design, Ads, Blog.
- `ChatWidget.jsx`: chat RAG có streaming và lưu session theo email user.

Navigation user hiện chỉ có entry `landing`.

## 7. `src/helpers`

```text
authRoles.js
authUseCases.js
```

`authRoles.js` định nghĩa role admin/user và label hiển thị.

`authUseCases.js` validate form login/register, normalize email/name rồi gọi `authApi`.

## 8. `src/mock`

Mock data hiện dùng làm fallback cho giao diện public nếu API trả dữ liệu rỗng hoặc lỗi.

Không dùng mock để đăng nhập hoặc CRUD admin. Các luồng đó đã gọi backend thật qua `apiService.js`.

## 9. Môi trường và API base URL

Frontend dùng Vite env:

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=...
```

Nếu `VITE_API_BASE_URL` không có, `apiService.js` tự ghép:

```text
{VITE_API_PROTOCOL || http}://{VITE_API_HOST || window.location.hostname}:{VITE_API_PORT || 8000}/api
```

Trong dev, `vite.config.js` proxy `/api` sang `http://localhost:8000`.

Trong Docker production, `nginx/default.conf` proxy `/api/` sang backend service.
