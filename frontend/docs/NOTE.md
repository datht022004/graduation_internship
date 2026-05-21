# Frontend Note

## 1. Tổng quan

Frontend là ứng dụng **Vite 8 + React 19 + Tailwind CSS 4** cho hệ thống RAG chatbot tư vấn dịch vụ Digital Marketing.

Ứng dụng có 2 khu vực:

- **User zone**: landing page, nội dung dịch vụ, login/register/google login và chat widget.
- **Admin zone**: dashboard, quản lý blog, danh mục, người dùng và tài liệu RAG.

Frontend hiện đã kết nối backend thật qua `src/config/apiService.js`. Mock data chỉ còn dùng làm fallback cho một số tab public khi dữ liệu API rỗng hoặc lỗi.

## 2. Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `123123` |
| User | `user@gmail.com` | `123123` |

## 3. Tech stack

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| HTTP client | Axios + fetch cho SSE chat |
| Auth | JWT lưu trong `localStorage` |
| OAuth | `@react-oauth/google` |
| Lint | ESLint flat config |
| Deploy | Docker multi-stage build, Nginx serve static và proxy API |

## 4. Scripts

| Lệnh | Mục đích |
|------|----------|
| `npm run dev` | Chạy dev server Vite |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run preview` | Preview bản build |

## 5. File cấu hình quan trọng

| File | Vai trò |
|------|---------|
| `src/config/apiService.js` | Khai báo API URL, endpoint và toàn bộ function gọi backend |
| `vite.config.js` | React plugin, Tailwind plugin, proxy `/api` sang backend local |
| `nginx/default.conf` | Serve SPA và proxy `/api/` sang backend Docker service |
| `src/App.jsx` | Quản lý auth session, phân vùng admin/user |
| `src/index.css` | Tailwind import, biến màu, animation và style toàn cục |

## 6. API service

`src/config/apiService.js` đang là entry duy nhất để frontend gọi backend.

Nội dung chính:

- `API_URL`
- `API_ENDPOINTS`
- `axios.defaults.timeout = 10000`
- interceptor tự gắn `Authorization: Bearer <token>`
- function auth: login, register, google login, me
- function user public content: home, SEO, web design, ads, blog
- function admin: blog, categories, users, documents
- function chat: SSE streaming qua `fetch`

Khi thêm API mới:

1. Thêm path vào `API_ENDPOINTS`.
2. Thêm function gọi API cùng module.
3. Ghi comment ngay trên function dạng `METHOD /path - Module: mô tả`.
4. Component import function từ `src/config/apiService.js`.

## 7. Auth session

Session lưu ở:

```text
localStorage["app_auth_session"]
```

Shape:

```js
{
  user,
  token,
  timestamp
}
```

`App.jsx` kiểm tra session hết hạn sau 3 giờ. Khi logout, app xóa `app_auth_session` và chat session theo email user.

## 8. Chat session

Chat widget lưu session id theo user:

```text
app_chat_session:{email}
```

Luồng chat:

```text
ChatWidget
  -> chatStreamMessage()
  -> POST /api/chat
  -> đọc SSE event: data, sources, session, done
```

Chat greeting đơn giản có thể trả lời nhanh từ backend mà không cần gọi LLM. Các câu hỏi RAG thật phụ thuộc tài liệu đã upload, MongoDB Vector và API key provider.

## 9. Admin zone

Admin zone hiện có:

- Dashboard tổng quan.
- Blog CRUD và toggle featured.
- Category CRUD.
- User CRUD.
- Document upload/list/delete cho RAG.

Các endpoint admin yêu cầu token admin.

## 10. User zone

User zone hiện có:

- Header, hero, footer.
- Landing page.
- Login/register/google login.
- Các tab public: home, SEO service, web design, ads, blog.
- Related blog posts.
- Chat widget.

Các tab public gọi API trước. Nếu API rỗng hoặc lỗi, UI dùng mock fallback để không trắng màn hình.

## 11. Môi trường

`.env` frontend hiện dùng:

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=...
```

Trong dev:

```text
Browser -> Vite /api proxy -> http://localhost:8000/api
```

Trong Docker:

```text
Browser -> Nginx /api proxy -> backend:8000/api
```

## 12. Kiểm tra nhanh

Trước khi bàn giao frontend:

```bash
npm run lint
npm run build
```

Nếu cần kiểm tra tích hợp với backend, đảm bảo backend và MongoDB đang chạy rồi test login, admin pages, upload document và chat greeting.
