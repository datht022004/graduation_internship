# 📋 SEO VIP - Ý tưởng phát triển Backend & Database

## 1. Hiện trạng hệ thống

### ✅ Đã có (hoạt động tốt)
| Module | Backend | Frontend | Ghi chú |
|--------|---------|----------|---------|
| **Auth** | ✅ Login/Register/Google OAuth | ✅ Form đăng nhập | JWT + bcrypt |
| **Blog** | ✅ CRUD + Featured + Phân trang | ✅ Hiển thị + Chi tiết bài viết | Đầy đủ API |
| **Chat RAG** | ✅ SSE streaming + MongoDB Vector Search | ✅ Chat widget | Gemini AI + RAG |
| **Document** | ✅ Upload + Chunking + Embedding | ✅ Admin quản lý tài liệu | Cho RAG knowledge base |
| **Category** | ✅ CRUD | ✅ Admin quản lý danh mục | Phân loại bài viết |
| **User Management** | ✅ CRUD + phân quyền | ✅ Admin quản lý user | Role-based |

### ❌ Đang dùng Mock Data (chưa có API thật)
| Trang FE | Mock file | Dữ liệu |
|----------|-----------|----------|
| **Home** | `home-tab.mock.js` | serviceCards, painPoints, strengths |
| **Dịch vụ SEO** | `seo-service-tab.mock.js` | metrics, packages, roadmap |
| **Thiết kế Website** | `web-design-tab.mock.js` | phases, highlights |
| **Quảng cáo +** | `ads-tab.mock.js` | channels, metrics |
| **Hồ sơ năng lực** | Hardcoded trong JSX | stats, capabilities, case studies |
| **Landing Tabs** | `user-landing.mock.js` | Tab config (eyebrow, title, desc) |

---

## 2. Đề xuất thiết kế Database (MongoDB Collections)

### Ý tưởng chính: Collection `site_content` (CMS động)

Thay vì tạo riêng 1 collection cho từng trang (home, seo, ads...), ta dùng **1 collection duy nhất** với trường `page_key` để phân biệt. Admin có thể chỉnh sửa nội dung mỗi trang từ dashboard mà không cần sửa code.

```
📦 MongoDB Database: seo_vip
│
├── 📁 users              ← (đã có) Quản lý tài khoản
├── 📁 blog_posts          ← (đã có) Bài viết blog
├── 📁 categories          ← (đã có) Danh mục blog
├── 📁 chat_sessions       ← (đã có) Lịch sử chat AI
├── 📁 documents           ← (đã có) Tài liệu RAG
├── 📁 document_vectors    ← (đã có) Vector embeddings
│
├── 📁 site_content        ← (MỚI) Nội dung CMS cho các trang
├── 📁 service_packages    ← (MỚI) Gói dịch vụ & bảng giá
├── 📁 case_studies        ← (MỚI) Dự án tiêu biểu
├── 📁 testimonials        ← (MỚI) Đánh giá khách hàng
├── 📁 contact_requests    ← (MỚI) Form liên hệ / tư vấn
└── 📁 company_profile     ← (MỚI) Hồ sơ năng lực
```

---

### 2.1 Collection: `site_content`

**Mục đích:** Lưu nội dung CMS cho từng trang (Home, SEO, Ads, Web Design). Admin chỉnh sửa qua dashboard, FE gọi API lấy về hiển thị.

```json
{
  "_id": "ObjectId",
  "page_key": "home",           // "home" | "seo-service" | "web-design" | "ads"
  "section_key": "hero",        // phân biệt các phần trong trang
  "title": "SEO VIP - Tăng doanh số",
  "subtitle": "Digital Growth Studio",
  "description": "Chúng tôi là đội ngũ SEO...",
  "content": {},                // JSON linh hoạt tùy section
  "sort_order": 1,
  "is_active": true,
  "updated_by": "admin@seovip.com",
  "created_at": "2026-05-21T00:00:00Z",
  "updated_at": "2026-05-21T00:00:00Z"
}
```

**Ví dụ dữ liệu cho trang Home:**

```json
// Section: Hero Banner
{
  "page_key": "home",
  "section_key": "hero",
  "title": "SEO VIP - Tăng doanh số, tăng giá trị",
  "subtitle": "Digital Growth Studio",
  "description": "Chúng tôi là đội ngũ SEO và Digital Marketing thực chiến...",
  "content": {
    "commitment": "Cam kết dịch vụ chất lượng, minh bạch và đồng hành dài hạn."
  }
}

// Section: Pain Points
{
  "page_key": "home",
  "section_key": "pain_points",
  "title": "Nỗi đau doanh nghiệp",
  "content": {
    "items": [
      "Tốn tiền chạy quảng cáo nhưng lượng khách không ổn định.",
      "Website có traffic nhưng tỉ lệ chuyển đổi thấp.",
      "Không đo được hiệu quả từng kênh Digital Marketing.",
      "Nội dung rời rạc, khó xây thương hiệu dài hạn."
    ]
  }
}

// Section: Strengths
{
  "page_key": "home",
  "section_key": "strengths",
  "title": "Thế mạnh của chúng tôi",
  "content": {
    "items": [
      "Thực chiến hơn 250 dự án đa lĩnh vực.",
      "Cam kết KPI theo từng giai đoạn triển khai.",
      "Hệ thống tư vấn và chăm sóc khách hàng 24/7.",
      "Tối ưu chi phí nhưng vẫn đảm bảo tăng trưởng bền vững."
    ]
  }
}
```

---

### 2.2 Collection: `service_packages`

**Mục đích:** Quản lý các gói dịch vụ (SEO Local, SEO Tổng thể, SEO E-commerce...). Admin có thể thêm/sửa/xóa gói từ dashboard.

```json
{
  "_id": "ObjectId",
  "service_type": "seo",         // "seo" | "web-design" | "ads"
  "title": "SEO Tổng Thể",
  "summary": "Kết hợp technical, content, internal link...",
  "points": [
    "Audit 70+ tiêu chí kỹ thuật",
    "Roadmap content theo funnel",
    "Tối ưu chuyển đổi trên trang đích"
  ],
  "price_label": "Liên hệ",      // hoặc "15.000.000đ/tháng"
  "is_popular": true,
  "sort_order": 2,
  "is_active": true,
  "created_at": "2026-05-21T00:00:00Z",
  "updated_at": "2026-05-21T00:00:00Z"
}
```

---

### 2.3 Collection: `case_studies`

**Mục đích:** Lưu các dự án thành công (Case Study) để hiển thị ở trang Hồ sơ năng lực và trang dịch vụ.

```json
{
  "_id": "ObjectId",
  "title": "Tăng trưởng 400% traffic organic sau 6 tháng",
  "client_industry": "E-learning",
  "challenge": "Kẹt traffic ở mức 10.000/tháng suốt 1 năm...",
  "solution": "Cấu trúc lại Silo content, xử lý technical nợ đọng...",
  "results": [
    { "metric": "Traffic/tháng", "before": "10K", "after": "52K" },
    { "metric": "Keyword Top 1", "before": "0", "after": "15" },
    { "metric": "Form đăng ký", "before": "120/tháng", "after": "300/tháng" }
  ],
  "chart_data": [20, 30, 25, 40, 60, 80, 120, 180, 240, 320, 400],
  "service_type": "seo",
  "is_featured": true,
  "image_url": "",
  "sort_order": 1,
  "created_at": "2026-05-21T00:00:00Z"
}
```

---

### 2.4 Collection: `testimonials`

**Mục đích:** Đánh giá/nhận xét từ khách hàng. Có thể hiển thị ở trang Home hoặc trang dịch vụ.

```json
{
  "_id": "ObjectId",
  "client_name": "Nguyễn Văn A",
  "client_position": "CEO",
  "client_company": "ABC Corp",
  "client_avatar": "",
  "content": "SEO VIP giúp chúng tôi tăng 300% traffic chỉ trong 4 tháng...",
  "rating": 5,
  "service_type": "seo",
  "is_active": true,
  "created_at": "2026-05-21T00:00:00Z"
}
```

---

### 2.5 Collection: `contact_requests`

**Mục đích:** Lưu thông tin khi khách hàng bấm "Tư vấn miễn phí" / "Chat tư vấn ngay" / gửi form liên hệ. Admin xem và quản lý trong dashboard.

```json
{
  "_id": "ObjectId",
  "name": "Trần Thị B",
  "email": "b@company.com",
  "phone": "0912345678",
  "company": "XYZ Ltd",
  "service_interest": "seo",     // "seo" | "web-design" | "ads" | "general"
  "message": "Tôi muốn tư vấn gói SEO cho website bán hàng...",
  "source": "hero_cta",          // nút nào đã bấm
  "status": "new",               // "new" | "contacted" | "converted" | "closed"
  "assigned_to": "",
  "notes": "",
  "created_at": "2026-05-21T00:00:00Z",
  "updated_at": "2026-05-21T00:00:00Z"
}
```

---

### 2.6 Collection: `company_profile`

**Mục đích:** Nội dung trang Hồ sơ năng lực. Admin quản lý các "Con số biết nói", năng lực cốt lõi, v.v.

```json
{
  "_id": "ObjectId",
  "section_key": "metrics",      // "metrics" | "capabilities" | "info"
  "title": "250+",
  "subtitle": "Dự án thành công",
  "description": "",
  "color": "#f2682a",
  "icon": "",
  "sort_order": 1,
  "is_active": true,
  "updated_at": "2026-05-21T00:00:00Z"
}
```

---

## 3. Đề xuất API Endpoints mới

### 3.1 Public API (User-facing)

```
GET  /api/user/home              → Trả về hero, serviceCards, painPoints, strengths, testimonials
GET  /api/user/seo-service       → Trả về metrics, packages (từ DB), roadmap
GET  /api/user/web-design        → Trả về phases, highlights (từ DB)
GET  /api/user/ads               → Trả về channels, metrics (từ DB)
GET  /api/user/blog              → (đã có) Danh sách bài viết
GET  /api/user/company-profile   → Trả về metrics, capabilities, case_studies
POST /api/user/contact           → Gửi form liên hệ/tư vấn
```

### 3.2 Admin API (Dashboard)

```
# Quản lý nội dung CMS
GET    /api/admin/site-content?page_key=home
POST   /api/admin/site-content
PUT    /api/admin/site-content/{id}
DELETE /api/admin/site-content/{id}

# Quản lý gói dịch vụ
GET    /api/admin/service-packages?type=seo
POST   /api/admin/service-packages
PUT    /api/admin/service-packages/{id}
DELETE /api/admin/service-packages/{id}

# Quản lý Case Study
GET    /api/admin/case-studies
POST   /api/admin/case-studies
PUT    /api/admin/case-studies/{id}
DELETE /api/admin/case-studies/{id}

# Quản lý Testimonials
GET    /api/admin/testimonials
POST   /api/admin/testimonials
PUT    /api/admin/testimonials/{id}
DELETE /api/admin/testimonials/{id}

# Quản lý form liên hệ
GET    /api/admin/contact-requests?status=new
PUT    /api/admin/contact-requests/{id}/status
DELETE /api/admin/contact-requests/{id}

# Quản lý hồ sơ năng lực
GET    /api/admin/company-profile
PUT    /api/admin/company-profile/{id}
```

---

## 4. Lộ trình triển khai đề xuất

### Phase 1 — CMS cơ bản (ưu tiên cao nhất)
> Mục tiêu: Thay thế mock data bằng dữ liệu thật từ DB

1. Tạo collection `site_content` + Model + Repository
2. Tạo API `GET /api/user/{page_key}` đọc từ DB, fallback về mock nếu chưa có data
3. Tạo seed script chèn dữ liệu mẫu từ các file mock hiện tại vào DB
4. Tạo trang Admin CMS để chỉnh sửa nội dung (CRUD)

### Phase 2 — Gói dịch vụ & Hồ sơ năng lực
> Mục tiêu: Nâng cấp trang dịch vụ và Company Profile

5. Collection `service_packages` + CRUD API + Admin UI
6. Collection `company_profile` + API + Admin UI
7. Collection `case_studies` + CRUD API + Hiển thị ở FE

### Phase 3 — Tương tác khách hàng
> Mục tiêu: Thu thập lead và feedback

8. Collection `contact_requests` + Form API + Admin quản lý
9. Collection `testimonials` + CRUD + Hiển thị ở trang Home/Service
10. Dashboard thống kê: số lead mới, top dịch vụ quan tâm, conversion rate

### Phase 4 — Nâng cao (nếu còn thời gian)
11. Thêm upload ảnh cho Case Study / Blog (lưu file hoặc dùng Cloudinary)
12. Thêm analytics: đếm lượt xem bài viết, lượt click CTA
13. Thêm SEO metadata quản lý từ Admin (meta title, meta description cho mỗi trang)

---

## 5. Sơ đồ quan hệ dữ liệu

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│   users      │     │  blog_posts    │     │   categories     │
│ (auth/admin) │     │ (bài viết)     │────▶│ (danh mục blog)  │
└──────────────┘     └────────────────┘     └──────────────────┘
       │
       │ created_by
       ▼
┌──────────────────┐     ┌────────────────────┐
│  site_content    │     │  service_packages  │
│ (CMS các trang)  │     │ (gói dịch vụ)      │
│ page_key: home   │     │ service_type: seo   │
│ page_key: seo    │     │ service_type: ads   │
└──────────────────┘     └────────────────────┘
                                │
                                │ service_type
                                ▼
┌──────────────────┐     ┌────────────────────┐
│  case_studies    │     │   testimonials     │
│ (dự án tiêu biểu)│     │ (đánh giá KH)      │
│ service_type:seo │     │ service_type: seo   │
└──────────────────┘     └────────────────────┘

┌──────────────────┐     ┌────────────────────┐
│ contact_requests │     │ company_profile    │
│ (form tư vấn)    │     │ (hồ sơ năng lực)   │
└──────────────────┘     └────────────────────┘

┌──────────────────┐     ┌────────────────────┐
│  chat_sessions   │     │  documents         │
│ (lịch sử chat)   │     │ (tài liệu RAG)     │
└──────────────────┘     │                    │
                         │  document_vectors  │
                         │ (vector embeddings) │
                         └────────────────────┘
```

---

## 6. Ghi chú kỹ thuật

- **MongoDB** là document-based, nên không cần JOIN. Mỗi API endpoint query 1-2 collection là đủ.
- **Fallback pattern**: FE đã có cơ chế `hasSeoContent(result) ? result : MOCK`. Khi chưa có data trong DB, hệ thống tự fallback về mock → Không bị lỗi.
- **Seed script**: Nên viết script để import mock data vào DB lần đầu, tránh DB trống khi demo.
- **Admin Dashboard**: Hệ thống đã có sẵn layout admin với các tab quản lý Blog, User, Category → Chỉ cần thêm tab mới cho CMS/Packages/CaseStudy.
