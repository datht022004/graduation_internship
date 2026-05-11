# Cấu trúc thư mục Frontend

Từ thời điểm này FE dùng cấu trúc đơn giản hơn:

- `src/config/api.js` là nơi duy nhất cấu hình và gọi API backend.
- `src/zones/` chỉ làm giao diện, page state và render UI.
- `src/helpers/` chứa logic dùng chung như validate, normalize input, constants.
- `src/core/domain/` chứa struct/shape chuẩn của dữ liệu FE.
- Không dùng tầng `adapters/` nữa để tránh vòng import và khó tìm luồng API.

## 1. Cây thư mục đang dùng

```text
frontend/
├── docs/
│   ├── NOTE.md
│   ├── module.md
│   └── struct.md
├── public/
├── src/
│   ├── config/
│   │   └── api.js
│   ├── core/
│   │   ├── domain/
│   │   │   ├── auth.js
│   │   │   └── document.js
│   │   └── interfaces/
│   ├── helpers/
│   │   ├── authRoles.js
│   │   └── authUseCases.js
│   ├── mock/
│   │   └── pages/
│   │       ├── admin/
│   │       └── user/
│   ├── zones/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   └── pages/
│   │   └── user/
│   │       ├── components/
│   │       ├── config/
│   │       └── pages/
│   │           └── tabs/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 2. Luồng dữ liệu chuẩn

Luồng gọi backend:

```text
zones/page hoặc zones/component
    ↓
src/config/api.js
    ↓
Backend API
```

Nếu cần validate/normalize trước khi gọi API:

```text
zones/page
    ↓
helpers/*
    ↓
src/config/api.js
    ↓
Backend API
```

Nếu API response cần shape ổn định:

```text
src/config/api.js
    ↓
core/domain/*
    ↓
zones/*
```

Ví dụ login:

```text
LoginWorkspace.jsx
    ↓
helpers/authUseCases.js
    ↓
config/api.js authApi.login()
    ↓
POST /api/auth/login
    ↓
core/domain/auth.js normalize response
```

Ví dụ chat RAG:

```text
ChatWidget.jsx
    ↓
config/api.js streamChatMessage()
    ↓
POST /api/chat
    ↓
SSE stream text + sources + session
```

## 3. Vai trò từng thư mục

### `src/config/`

Chứa cấu hình và lời gọi API backend.

File chính:

```text
src/config/api.js
```

`api.js` chịu trách nhiệm:

- cấu hình `API_BASE_URL`;
- tạo `apiClient` bằng axios;
- gắn JWT vào header `Authorization`;
- khai báo `API_ENDPOINTS`;
- gọi API login/register/google;
- gọi API user tabs;
- gọi API admin CRUD;
- gọi API upload/list/delete document;
- gọi API chat RAG streaming;
- map response quan trọng về struct trong `core/domain`.

Quy ước:

- Tất cả request backend phải đi qua `src/config/api.js`.
- Không gọi `fetch('/api/...')` trực tiếp trong component.
- Không import axios trong `zones`.
- Không viết endpoint string trong page/component.
- Nếu backend đổi endpoint, ưu tiên sửa trong `config/api.js`.

Ví dụ đúng:

```js
import { getUserHome } from '../../../../config/api'

const data = await getUserHome()
```

Ví dụ không nên:

```js
const response = await fetch('/api/user/home')
```

### `src/zones/`

Chứa toàn bộ giao diện theo khu vực nghiệp vụ.

```text
zones/admin/
zones/user/
```

`zones` được phép:

- render layout;
- quản lý state màn hình;
- gọi function API từ `config/api.js`;
- gọi helper validate/normalize;
- truyền props cho component con;
- xử lý loading/error UI.

`zones` không nên:

- tự tạo axios client;
- tự hard-code endpoint;
- tự đọc/ghi token thủ công;
- chứa business struct dài;
- chứa logic mapping response backend phức tạp.

### `src/helpers/`

Chứa logic dùng chung, không phụ thuộc UI cụ thể và không trực tiếp quản lý HTTP client.

Hiện tại:

```text
helpers/authRoles.js
helpers/authUseCases.js
```

Phù hợp để đặt:

- role constants;
- validate form;
- normalize email/password/name;
- function tiện ích dùng nhiều nơi;
- format number/date/string;
- rule nhỏ không thuộc riêng admin hoặc user.

Không nên đặt trong `helpers`:

- API client;
- endpoint backend;
- component UI;
- mock data dài;
- entity struct chuẩn.

### `src/core/domain/`

Chứa struct/shape chuẩn của dữ liệu FE.

Hiện tại:

```text
core/domain/auth.js
core/domain/document.js
```

Mục tiêu:

- FE nhận dữ liệu có shape ổn định;
- API response backend có thể được normalize trước khi đưa vào UI;
- tránh component phải biết field backend trả về thế nào.

Ví dụ:

```js
export function createUserStruct(input = {}) {
    return {
        email: input.email ?? '',
        name: input.name ?? '',
        role: input.role ?? 'user',
    }
}
```

Khi thêm module lớn, có thể thêm struct tương ứng:

```text
core/domain/blog.js
core/domain/service.js
core/domain/ads.js
core/domain/seo.js
```

Chỉ thêm struct khi dữ liệu đó dùng nhiều nơi hoặc cần normalize rõ ràng.

### `src/core/interfaces/`

Để dành cho contract/interface sau này.

Hiện tại project đang dùng JavaScript, nên thư mục này có thể để trống. Nếu sau này chuyển sang TypeScript hoặc muốn ghi contract bằng JSDoc, đây là nơi phù hợp.

### `src/mock/`

Chứa dữ liệu tĩnh phục vụ UI.

Hiện tại vẫn còn dùng cho:

- navigation/tab content tĩnh ở user landing;
- nội dung mock page cũ;
- dữ liệu tham khảo khi backend chưa đủ nội dung.

Quy ước mới:

- `mock/` chỉ chứa dữ liệu tĩnh.
- Không chứa API function.
- Không chứa CRUD logic.
- Không tạo thêm mock repository.
- Nếu dữ liệu đã có backend endpoint, ưu tiên gọi qua `config/api.js`.

### `src/App.jsx`, `main.jsx`, `index.css`

- `main.jsx`: mount React app và provider toàn cục.
- `App.jsx`: quản lý session FE, zone hiện tại, login/logout.
- `index.css`: global style, Tailwind import, animation và class dùng chung.

## 4. Quy ước API trong `config/api.js`

### Nhóm auth

```js
authApi.login(payload)
authApi.register(payload)
authApi.googleLogin(payload)
```

Backend tương ứng:

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/google
```

### Nhóm user

```js
getUserHome()
getUserSeoService()
getUserSeoTraining()
getUserWebDesign()
getUserAds()
getUserBlog()
getUserLandingContent()
```

Backend tương ứng:

```text
GET /api/user/home
GET /api/user/seo-service
GET /api/user/seo-training
GET /api/user/web-design
GET /api/user/ads
GET /api/user/blog
```

### Nhóm admin document/RAG

```js
getAdminDocuments()
uploadAdminDocument(file)
deleteAdminDocument(docId)
```

Backend tương ứng:

```text
GET /api/documents
POST /api/documents/upload
DELETE /api/documents/{docId}
```

### Nhóm chat RAG

```js
streamChatMessage({
    message,
    sessionId,
    signal,
    onTextChange,
    onSessionChange,
})
```

Backend tương ứng:

```text
POST /api/chat
```

Response là `text/event-stream`, FE xử lý:

- text chunk;
- sources;
- session id;
- done event.

### Nhóm admin CRUD

Admin pages gọi trực tiếp các function trong `config/api.js`.

Ví dụ:

```js
getBlogPosts()
createBlogPost(payload)
updateBlogPost(id, payload)
deleteBlogPost(id)
```

Không tạo thêm repository trung gian.

## 5. Khi thêm module mới

Ví dụ thêm module `email marketing`.

Nên làm:

```text
1. Backend tạo endpoint /api/admin/email-marketing hoặc /api/user/email-marketing
2. FE thêm endpoint vào API_ENDPOINTS trong src/config/api.js
3. FE thêm function gọi API trong src/config/api.js
4. Nếu response cần shape ổn định, thêm struct trong src/core/domain/
5. Page/component trong zones gọi function từ config/api.js
```

Không nên làm:

```text
zones/.../Page.jsx tự fetch('/api/...')
helpers/ tự gọi axios
mock/ tạo CRUD logic
tạo lại adapters/repositories
```

## 6. Tóm tắt dễ nhớ

- `config/api.js`: gọi backend, giữ endpoint, axios client, JWT header.
- `zones/`: giao diện và state màn hình.
- `helpers/`: validate, normalize input, constants dùng chung.
- `core/domain/`: struct/shape chuẩn.
- `mock/`: dữ liệu tĩnh cho UI, không chứa API logic.
- Không dùng `adapters/` nữa.
