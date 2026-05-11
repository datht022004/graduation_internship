# Frontend Project Note

## 1. Tổng quan

Frontend được xây dựng bằng **Vite 8 + React 19 + Tailwind CSS 4**, phục vụ cho website công ty Digital Marketing / SEO.
Ứng dụng chia thành 2 khu vực chính:

- **User zone**: Landing page cho khách hàng, gồm 6 tab nội dung dịch vụ, login workspace, và AI chat widget.
- **Admin zone**: Dashboard quản lý tài liệu (upload/xóa), phục vụ cho RAG chatbot.

Dữ liệu hiện tại sử dụng **mock data** (dữ liệu giả lập) để phát triển giao diện trước khi nối backend.
Trạng thái đăng nhập lưu tạm vào `localStorage` với khóa `app_auth_session`, session hết hạn sau 3 giờ.

### Tài khoản demo

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@gmail.com   | 123123   |
| User  | user@gmail.com    | 123123   |

### Tech stack

| Thành phần     | Công nghệ                          |
|----------------|-------------------------------------|
| Framework      | React 19.2.4                        |
| Build tool     | Vite 8.0.1                          |
| Styling        | Tailwind CSS 4.2.2                  |
| Linting        | ESLint + React Hooks plugin         |
| CSS processing | PostCSS + Autoprefixer              |
| Deploy         | Docker (Node 22 Alpine + Nginx)     |

### Scripts

| Lệnh              | Chức năng                           |
|--------------------|-------------------------------------|
| `npm run dev`      | Khởi động dev server Vite           |
| `npm run build`    | Build production                    |
| `npm run lint`     | Kiểm tra code với ESLint            |
| `npm run preview`  | Xem trước bản build production      |

---

## 2. Cấu trúc thư mục chi tiết

```
frontend/
│
├── Dockerfile                          # Docker multi-stage build: Node 22 build → Nginx 1.27 serve
├── README.md                           # Hướng dẫn tổng quan dự án FE
├── eslint.config.js                    # Cấu hình ESLint (flat config) + React Hooks + React Refresh
├── index.html                          # HTML gốc của Vite, mount React vào <div id="root">
├── package.json                        # Dependencies, scripts (dev/build/lint/preview)
├── package-lock.json                   # Lock file đảm bảo phiên bản dependency đồng nhất
├── vite.config.js                      # Cấu hình Vite: React plugin, Tailwind plugin, proxy /api → localhost:8000
├── .env                                # Biến môi trường: VITE_API_BASE_URL=/api
├── .gitignore                          # Danh sách file/thư mục không track bởi git
│
├── nginx/
│   └── default.conf                    # Cấu hình Nginx: serve static, proxy /api/ → backend:8000,
│                                       #   SPA fallback (mọi route → index.html), hỗ trợ WebSocket
│
├── public/
│   ├── favicon.svg                     # Icon tab trình duyệt
│   └── icons.svg                       # Bộ icon SVG dùng chung trong app
│
├── docs/
│   └── NOTE.md                         # File này — ghi chú cấu trúc và chức năng của dự án FE
│
└── src/
    │
    ├── main.jsx                        # Điểm khởi động React: render <App /> vào DOM với StrictMode
    ├── App.jsx                         # Component gốc: quản lý session (3h), phân luồng Admin/User zone,
    │                                   #   lưu trạng thái auth vào localStorage
    ├── index.css                       # Style toàn cục: import Tailwind, CSS variables (--ink, --accent,
    │                                   #   --cream, --sun), animation (float-in, stagger, chatbot effects),
    │                                   #   class dùng chung (.panel frosted glass, .chatbot-fab)
    │
    ├── adapters/
    │   └── repositories/
    │       ├── api/                    # [CHƯA DÙNG] Dự kiến đặt API adapter khi nối backend thật
    │       └── mock/
    │           ├── adminRepository.js  # Mock repository cho admin: getAdminDocuments(), uploadAdminDocument(),
    │           │                       #   deleteAdminDocument() — quản lý document trong memory
    │           └── userRepository.js   # Mock repository cho user: getUserLandingContent() — trả về nội dung
    │                                   #   landing page từ mock data
    │
    ├── core/
    │   ├── domain/                     # [CHƯA DÙNG] Dự kiến chứa entity và business rules
    │   └── interfaces/                 # [CHƯA DÙNG] Dự kiến chứa contract/interface cho service, repository
    │
    ├── helpers/
    │   ├── authRoles.js               # Định nghĩa role: ADMIN, USER và hàm getRoleLabel() lấy tên hiển thị
    │   ├── authService.js             # Mock login service: loginByEmail() kiểm tra tài khoản demo,
    │   │                              #   trả về { user, token } hoặc throw error
    │   └── authUseCases.js            # Business logic auth: validate email/password trước khi gọi authService,
    │                                  #   normalize input (trim, lowercase email)
    │
    ├── mock/
    │   └── pages/
    │       ├── admin/
    │       │   └── dashboard.mock.js  # Dữ liệu giả lập: danh sách document ban đầu (tên, size, chunks, ngày upload)
    │       │
    │       └── user/
    │           ├── landing.mock.js        # Mock: thông báo login/logout, label UI, hàm greeting
    │           ├── user-landing.mock.js   # Mock: 6 tab definition (key, label, eyebrow, title, description)
    │           ├── user-header.mock.js    # Mock: menu top bar (Giới thiệu, Dự án, Tuyển dụng, Đối tác, Liên hệ)
    │           ├── home-tab.mock.js       # Mock: 6 service cards, pain points, điểm mạnh công ty
    │           ├── seo-service-tab.mock.js # Mock: metrics SEO, các gói dịch vụ, roadmap triển khai
    │           ├── seo-training-tab.mock.js # Mock: module đào tạo, giáo trình, thời lượng khóa học
    │           ├── web-design-tab.mock.js  # Mock: quy trình thiết kế, các phase, tiêu chuẩn chất lượng
    │           ├── ads-tab.mock.js         # Mock: chỉ số hiệu suất, kênh quảng cáo, KPIs dashboard
    │           └── blog.mock.js            # Mock: bài viết nổi bật, danh sách article, thời gian đọc
    │
    └── zones/
        │
        ├── admin/
        │   ├── config/
        │   │   └── navigation.js          # Khai báo nav admin: trang mặc định = 'dashboard'
        │   │
        │   ├── components/
        │   │   ├── DocumentUploader.jsx   # Component upload tài liệu: kéo thả file, validate loại file
        │   │   │                          #   (PDF/DOCX/TXT), giới hạn 100MB, hiển thị progress và trạng thái
        │   │   └── DocumentList.jsx       # Component danh sách tài liệu: bảng hiển thị metadata (tên, size,
        │   │                              #   chunks, ngày upload), icon theo loại file, nút xóa với confirm
        │   │
        │   └── pages/
        │       ├── AdminZonePage.jsx      # Container cấp zone admin: sidebar + nội dung page + chat widget
        │       ├── AdminOverviewPage.jsx  # Trang tổng quan admin
        │       └── AdminDocumentsPage.jsx # Quản lý tài liệu RAG: upload, list, delete document
        │
        └── user/
            ├── config/
            │   └── navigation.ts          # Khai báo nav user: trang mặc định = 'landing'
            │
            ├── components/
            │   ├── UserHeaderTopBar.jsx   # Thanh top bar: thông tin liên hệ (SĐT, email), menu desktop,
            │   │                          #   chọn ngôn ngữ, mô tả dịch vụ
            │   ├── UserHeaderNav.jsx      # Thanh nav chính: logo SEOvip + tagline, menu tab (6 tab dịch vụ),
            │   │                          #   hiển thị user đã login, nút "Tư vấn miễn phí", responsive mobile
            │   ├── UserHeroBanner.jsx     # Banner hero: nền gradient tối + radial overlay, nội dung thay đổi theo
            │   │                          #   tab đang chọn, 2 nút CTA (chính và phụ), responsive
            │   ├── UserLandingFooter.jsx  # Footer: thông tin công ty, hỗ trợ khách hàng, danh sách dịch vụ,
            │   │                          #   copyright, nút gọi điện nổi (bottom-left)
            │   ├── ChatWidget.jsx         # Chat widget AI: giao diện chat đầy đủ, streaming giả lập (hiển thị
            │   │                          #   từng từ), hiển thị nguồn tài liệu, phân biệt tin user/bot, auto
            │   │                          #   scroll, loading spinner. Mock response theo keyword (seo → gói
            │   │                          #   dịch vụ, giá/chi phí → bảng giá, mặc định → fallback)
            │   ├── GoogleToneLoginCard.jsx # Card đăng nhập kiểu Google: toggle chọn role (Admin/User), form
            │   │                          #   email + password, validate, loading state, thông báo lỗi/thành công
            │   └── RoleSelector.jsx       # Component chọn role: giao diện segmented control Admin/User,
            │                              #   highlight role đang active
            │
            └── pages/
                ├── UserZonePage.jsx       # Container cấp zone user: quản lý landing page, login modal,
                │                          #   chat widget, xử lý sự kiện mở/đóng chat
                ├── UserLandingPage.jsx    # Trang landing chính: header (top bar + nav), hero banner,
                │                          #   render tab content động, footer. Điều khiển chuyển tab
                ├── LoginWorkspace.jsx     # Workspace đăng nhập: modal hiển thị GoogleToneLoginCard,
                │                          #   gọi authUseCases, trả kết quả (user + token) lên App
                │
                └── tabs/
                    ├── HomeTabPage.jsx        # Tab Trang chủ: tổng quan 6 dịch vụ, pain points & giải pháp,
                    │                          #   giá trị công ty, CTA liên hệ
                    ├── SeoServiceTabPage.jsx  # Tab Dịch vụ SEO: chỉ số hiệu suất, các gói SEO (có tên, mô
                    │                          #   tả, tính năng), roadmap triển khai theo giai đoạn
                    ├── SeoTrainingTabPage.jsx # Tab Đào tạo SEO: các module học, giáo trình chi tiết, thời
                    │                          #   lượng, mentorship
                    ├── WebDesignTabPage.jsx   # Tab Thiết kế Web: quy trình làm việc (phases), tiêu chuẩn
                    │                          #   thiết kế, highlight chất lượng
                    ├── AdsTabPage.jsx         # Tab Quảng cáo: chỉ số hiệu suất, kênh quảng cáo đa nền tảng,
                    │                          #   KPIs, dashboard metric
                    └── BlogTabPage.jsx        # Tab Blog: bài viết nổi bật, danh sách article với danh mục,
                                               #   thời gian đọc, hình ảnh
```

---

## 3. Giải thích chi tiết từng phần

### 3.1 Root files (cấu hình dự án)

| File               | Chức năng                                                                                   |
|--------------------|---------------------------------------------------------------------------------------------|
| `Dockerfile`       | Build 2 giai đoạn: (1) Node 22 Alpine chạy `npm install` + `npm run build`, (2) Nginx 1.27 Alpine serve thư mục `dist/`, expose port 80 |
| `vite.config.js`   | Cấu hình Vite: plugin React (Fast Refresh HMR), plugin Tailwind CSS, proxy `/api` → `http://localhost:8000` (backend) với `changeOrigin: true` |
| `.env`             | Biến môi trường: `VITE_API_BASE_URL=/api` — base URL cho mọi API call                     |
| `eslint.config.js` | ESLint flat config: ESLint recommended + React Hooks plugin + React Refresh plugin          |
| `nginx/default.conf` | Nginx: root `/usr/share/nginx/html`, proxy `/api/` → `http://backend:8000/api/`, SPA fallback (tất cả route → `index.html`), hỗ trợ WebSocket (Upgrade headers) |

### 3.2 Entry layer (tầng khởi động)

| File          | Chức năng                                                                                        |
|---------------|--------------------------------------------------------------------------------------------------|
| `main.jsx`    | Mount `<App />` vào DOM, bật React.StrictMode cho dev                                            |
| `App.jsx`     | Component gốc: đọc session từ localStorage, kiểm tra hết hạn (3h), phân luồng hiển thị AdminZone hoặc UserZone, quản lý state `authUser`, `activeZone`, xử lý chuyển zone và logout |
| `index.css`   | Import Tailwind, định nghĩa CSS variables (`--ink: #132235`, `--accent: #0c7f72`, `--accent-soft: #6dc8be`, `--cream: #f8f7ef`, `--sun: #ffb35a`), animation keyframes (`float-in`, `stagger-1/2/3`, `chatbot-shake`, `chatbot-pulse`, `chatbot-core-glow`, `chatbot-dot-blink`), class `.panel` (frosted glass + backdrop-blur), class `.chatbot-fab` (floating action button) |

### 3.3 adapters/repositories (tầng dữ liệu)

**Pattern**: Repository pattern — tách biệt cách lấy dữ liệu khỏi UI. Hiện tại chỉ có mock, khi backend sẵn sàng sẽ thêm API adapter.

| File                   | Chức năng                                                                                 |
|------------------------|-------------------------------------------------------------------------------------------|
| `mock/adminRepository.js` | Mock admin data: `getAdminDocuments()` trả danh sách document, `uploadAdminDocument(file)` thêm document vào memory, `deleteAdminDocument(docId)` xóa document. Dữ liệu lưu trong biến `let docs = [...]` |
| `api/`                    | Repository gọi backend thật qua `src/config/api.js`, có nhánh mock khi bật `VITE_USE_MOCK_API` |

### 3.4 core (tầng nghiệp vụ)

| Thư mục       | Chức năng                                                        |
|---------------|------------------------------------------------------------------|
| `domain/`     | **Chưa dùng** — dự kiến chứa entity và business rules            |
| `interfaces/` | **Chưa dùng** — dự kiến chứa contract/interface cho service và repository |

### 3.5 helpers (hàm trợ giúp)

| File              | Chức năng                                                                                  |
|-------------------|--------------------------------------------------------------------------------------------|
| `authRoles.js`    | Định nghĩa hằng số role: `ADMIN = 'admin'`, `USER = 'user'`. Hàm `getRoleLabel(role)` trả tên hiển thị ("Admin" / "User") |
| `authService.js`  | Mock login: `loginByEmail(email, password)` so khớp với tài khoản demo. Thành công trả `{ user: { email, role, name }, token }`. Thất bại throw error |
| `authUseCases.js` | Lớp use case: validate email format, kiểm tra password không rỗng, normalize input (trim + lowercase email), rồi gọi `authService.loginByEmail()` |

### 3.6 mock/pages (dữ liệu giả lập)

#### Admin mocks

| File                | Nội dung                                                               |
|---------------------|------------------------------------------------------------------------|
| `dashboard.mock.js` | Mảng document ban đầu: tên file, kích thước, số chunk, ngày upload     |

#### User mocks

| File                       | Nội dung                                                                     |
|----------------------------|------------------------------------------------------------------------------|
| `landing.mock.js`          | Template thông báo login/logout, label UI mặc định, hàm greeting theo giờ    |
| `user-landing.mock.js`     | 6 tab: Home, Dịch vụ SEO, Đào tạo SEO, Thiết kế Web, Quảng cáo, Blog. Mỗi tab có key, label, eyebrow, title, description |
| `user-header.mock.js`      | Menu top bar: Giới thiệu, Dự án, Tuyển dụng, Đối tác, Liên hệ               |
| `home-tab.mock.js`         | 6 service cards (SEO, Web, Training, PR, Ads, CRO), pain points, điểm mạnh  |
| `seo-service-tab.mock.js`  | Metrics SEO, các gói dịch vụ (tên + mô tả + features), roadmap triển khai    |
| `seo-training-tab.mock.js` | Module đào tạo, giáo trình chi tiết, thời lượng khóa học                     |
| `web-design-tab.mock.js`   | Các phase thiết kế, tiêu chuẩn chất lượng, highlights                        |
| `ads-tab.mock.js`          | Chỉ số hiệu suất, kênh quảng cáo (Google, FB, TikTok...), KPIs               |
| `blog.mock.js`             | Bài viết nổi bật, danh sách article (danh mục, thời gian đọc, ảnh)          |

### 3.7 zones/admin (khu vực quản trị)

| File/Thư mục               | Chức năng                                                                        |
|----------------------------|----------------------------------------------------------------------------------|
| `config/navigation.js`     | Khai báo nav admin: trang mặc định = `'dashboard'`, có thể mở rộng thêm trang    |
| `components/DocumentUploader.jsx` | Upload tài liệu: kéo thả file, validate loại (PDF/DOCX/TXT), giới hạn 100MB, hiển thị progress bar, thông báo thành công/lỗi. Mock upload với delay 250ms |
| `components/DocumentList.jsx` | Danh sách tài liệu: bảng hiển thị (tên, size format, số chunk, ngày upload), icon theo loại file (.pdf/.docx/.txt), nút xóa có confirm dialog, trạng thái empty khi chưa có document |
| `pages/AdminZonePage.jsx`  | Container zone admin: sidebar + page content + ChatWidget, nút chuyển sang user zone |
| `pages/AdminOverviewPage.jsx` | Trang tổng quan admin: KPI, số liệu nội dung, shortcut quản trị |
| `pages/AdminDocumentsPage.jsx` | Quản lý tài liệu RAG: DocumentUploader, DocumentList, refresh và xóa tài liệu |

### 3.8 zones/user (khu vực khách hàng)

#### Config

| File              | Chức năng                                                     |
|-------------------|---------------------------------------------------------------|
| `navigation.ts`   | Khai báo nav user: trang mặc định = `'landing'`              |

#### Components

| Component               | Chức năng                                                                            |
|--------------------------|--------------------------------------------------------------------------------------|
| `UserHeaderTopBar.jsx`   | Thanh top: SĐT + email liên hệ, menu desktop (5 mục), chọn ngôn ngữ, mô tả dịch vụ  |
| `UserHeaderNav.jsx`      | Nav chính: logo "SEOvip" + tagline, 6 tab dịch vụ, trạng thái user login, nút "Tư vấn miễn phí", mobile scroll ngang |
| `UserHeroBanner.jsx`     | Hero banner: nền gradient tối + radial overlay, nội dung thay đổi theo tab active, 2 nút CTA. Responsive heading |
| `UserLandingFooter.jsx`  | Footer: 4 cột (công ty, hỗ trợ, dịch vụ, liên hệ), copyright, nút gọi điện nổi góc trái màn hình |
| `ChatWidget.jsx`         | Chat AI: khung chat full-feature, streaming giả lập (hiện từng từ 50ms), nguồn tài liệu, user/bot styling, auto-scroll, loading spinner. Mock response: "seo" → gói dịch vụ, "giá/chi phí" → bảng giá, default → fallback. Yêu cầu user đã đăng nhập |
| `GoogleToneLoginCard.jsx` | Card login kiểu Google: RoleSelector, form email + password, validate, loading, thông báo lỗi/thành công, nút Google login (UI only) |
| `RoleSelector.jsx`       | Segmented control chọn role: Admin / User, highlight active                          |

#### Pages

| Page                    | Chức năng                                                                              |
|-------------------------|----------------------------------------------------------------------------------------|
| `UserZonePage.jsx`      | Container zone user: quản lý landing page, login modal (show/hide), chat widget, xử lý sự kiện mở/đóng chat |
| `UserLandingPage.jsx`   | Landing page chính: TopBar + Nav + HeroBanner + [Tab Content động] + Footer. Điều khiển tab active, truyền callback login/chat |
| `LoginWorkspace.jsx`    | Modal đăng nhập: hiển thị GoogleToneLoginCard, gọi authUseCases validate + login, trả kết quả { user, token } lên App qua callback |

#### Tab pages

| Tab page                  | Nội dung hiển thị                                                                   |
|---------------------------|--------------------------------------------------------------------------------------|
| `HomeTabPage.jsx`         | Trang chủ: tổng quan 6 dịch vụ (cards), pain points và giải pháp, giá trị công ty, CTA liên hệ tư vấn |
| `SeoServiceTabPage.jsx`   | Dịch vụ SEO: chỉ số hiệu suất (traffic, ranking...), các gói SEO (Basic/Pro/Enterprise), roadmap triển khai theo phase |
| `SeoTrainingTabPage.jsx`  | Đào tạo SEO: các module học (SEO cơ bản → nâng cao), giáo trình, mentorship, thời lượng |
| `WebDesignTabPage.jsx`    | Thiết kế Web: quy trình (khám phá → thiết kế → phát triển → bàn giao), tiêu chuẩn, highlight |
| `AdsTabPage.jsx`          | Quảng cáo: metric hiệu suất, kênh quảng cáo đa nền tảng (Google/FB/TikTok/Zalo...), KPIs dashboard |
| `BlogTabPage.jsx`         | Blog: bài viết nổi bật (featured), danh sách article với category + thời gian đọc + thumbnail |

---

## 4. Hệ thống màu sắc

| Biến CSS        | Giá trị   | Sử dụng                         |
|-----------------|-----------|----------------------------------|
| `--ink`         | `#132235` | Màu chữ tối (navy)              |
| `--accent`      | `#0c7f72` | Màu nhấn chính (teal)           |
| `--accent-soft` | `#6dc8be` | Màu nhấn nhạt                   |
| `--cream`       | `#f8f7ef` | Màu nền sáng                    |
| `--sun`         | `#ffb35a` | Màu điểm nhấn cam/vàng          |

**Palette mở rộng** (dùng trực tiếp trong Tailwind classes):
- Primary: Cam/Rust (`#f2682a`, `#f68a44`)
- Dark: Navy (`#13283c`, `#0e1e2d`, `#0a111f`)
- Light: Cream, white, slate grays
- Semantic: Red (lỗi), Emerald (thành công), Sky/Cyan (thông tin)

---

## 5. Luồng chạy chính

```
[Browser] → index.html → main.jsx → <App />
                                        │
                      ┌─────────────────┼─────────────────┐
                      │                                   │
                activeZone === 'user'             activeZone === 'admin'
                      │                                   │
                 <UserZonePage>                      <AdminZonePage>
                      │                                   │
            ┌────┬────┴────┐                    ┌─────────┴─────────┐
            │              │                    │                   │
     <UserLandingPage>  <ChatWidget>   <AdminOverviewPage>   <ChatWidget>
            │                                   │
   ┌────────┼────────┐              ┌───────────┴───────────┐
   │        │        │              │                       │
<TopBar> <Nav> <HeroBanner>   <DocumentUploader>     <DocumentList>
            │
   [Tab Content động]
   HomeTab │ SeoTab │ TrainingTab │ WebTab │ AdsTab │ BlogTab
```

### Luồng đăng nhập

```
1. User click "Đăng nhập" trên Nav
2. UserZonePage mở <LoginWorkspace> (modal)
3. LoginWorkspace hiển thị <GoogleToneLoginCard>
4. User chọn role → nhập email/password → submit
5. authUseCases.js validate input (trim, lowercase, format check)
6. authService.js kiểm tra tài khoản demo
7. Thành công: trả { user, token } → App lưu vào localStorage
8. App cập nhật state → hiển thị zone tương ứng
```

### Luồng chat AI

```
1. User click nút chat (chatbot-fab) góc phải màn hình
2. ChatWidget mở khung chat
3. User nhập câu hỏi → gửi
4. Mock response: phân tích keyword trong câu hỏi
   - Chứa "seo" → trả lời về gói dịch vụ SEO
   - Chứa "giá" hoặc "chi phí" → trả lời về bảng giá
   - Mặc định → trả lời chung về dịch vụ
5. Response hiển thị theo kiểu streaming (từng từ, 50ms/từ)
6. Hiển thị nguồn tài liệu tham khảo (nếu có)
```

---

## 6. Deployment

### Docker

```dockerfile
# Stage 1: Build
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx proxy

- `/api/` → `http://backend:8000/api/` (reverse proxy tới backend)
- Tất cả route khác → `index.html` (SPA fallback)
- Hỗ trợ WebSocket qua Upgrade headers

---

## 7. Ghi chú phát triển

- **Mock data**: Toàn bộ dữ liệu hiện tại là mock. Khi backend sẵn sàng, thay `mock/` repository bằng `api/` repository trong `src/adapters/repositories/api/`.
- **Thư mục chưa dùng**: `core/domain/`, `core/interfaces/`, `adapters/repositories/api/` — là khung kiến trúc để mở rộng.
- **Google Login**: Nút đăng nhập Google trên LoginCard chỉ là UI, chưa tích hợp OAuth thật.
- **ChatWidget**: Hiện tại trả lời mock theo keyword, sẽ nối với RAG backend để trả lời thông minh hơn.
- **Session**: Hết hạn sau 3 giờ, lưu trong localStorage. Chưa có refresh token.
- **Responsive**: Giao diện hỗ trợ mobile qua Tailwind breakpoints (sm/md/lg/xl), nav có scroll ngang trên mobile.
