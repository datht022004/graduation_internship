# Thống kê Module Dự Án

Tài liệu này thống kê module theo trạng thái code hiện tại của dự án.

## 1. Cách hiểu module

- **Backend module**: thư mục nghiệp vụ trong `backend/app/manager`.
- **Frontend module**: zone hoặc nhóm chức năng trong `frontend/src`.

## 2. Backend modules

Backend hiện có 6 module nghiệp vụ chính trong `backend/app/manager`:

| Module | File chính | Nhóm endpoint | Ghi chú |
|--------|------------|---------------|---------|
| `auth` | `controller.py`, `usecase.py`, `repository.py` | 4 | Login, register, Google login, me |
| `blog` | `controller.py`, `usecase.py`, `repository.py` | 5 | Admin CRUD blog post và toggle featured |
| `category` | `controller.py`, `usecase.py`, `repository.py` | 4 | Admin CRUD category |
| `chat` | `controller.py`, `usecase.py`, `repository.py` | 3 | Chat SSE, list sessions, session detail |
| `document` | `controller.py`, `usecase.py`, `repository.py` | 3 | Upload, list, delete tài liệu RAG |
| `user` | `controller.py`, `usecase.py`, `repository.py` | 9 | Public content APIs và admin user CRUD |

Tất cả được gom qua:

```text
backend/app/manager/router.py
```

và mount dưới prefix:

```text
/api
```

## 3. Backend endpoint map

### Auth

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/google` | Public |
| GET | `/api/auth/me` | User/Admin |

### User public content

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/user/home` | Public |
| GET | `/api/user/seo-service` | Public |
| GET | `/api/user/web-design` | Public |
| GET | `/api/user/ads` | Public |
| GET | `/api/user/blog` | Public |

### Chat

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/chat` | User/Admin |
| GET | `/api/chat/sessions` | User/Admin |
| GET | `/api/chat/sessions/{session_id}` | User/Admin |

### Documents

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/documents` | Admin |
| POST | `/api/documents/upload` | Admin |
| DELETE | `/api/documents/{doc_id}` | Admin |

### Admin blog

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/blog/posts` | Admin |
| POST | `/api/admin/blog/posts` | Admin |
| PUT | `/api/admin/blog/posts/{post_id}` | Admin |
| DELETE | `/api/admin/blog/posts/{post_id}` | Admin |
| PATCH | `/api/admin/blog/posts/{post_id}/toggle-featured` | Admin |

### Admin categories

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/categories` | Admin |
| POST | `/api/admin/categories` | Admin |
| PUT | `/api/admin/categories/{category_id}` | Admin |
| DELETE | `/api/admin/categories/{category_id}` | Admin |

### Admin users

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/users` | Admin |
| POST | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/{email}` | Admin |
| DELETE | `/api/admin/users/{email}` | Admin |

## 4. Frontend modules

Frontend có các nhóm chính:

| Module | Đường dẫn | Vai trò |
|--------|-----------|---------|
| API service | `src/config/apiService.js` | API URL, endpoint map, axios/fetch calls |
| App shell | `src/App.jsx` | Session, phân luồng admin/user |
| Helpers | `src/helpers` | Role constants, auth use cases |
| Admin zone | `src/zones/admin` | Dashboard và CRUD admin |
| User zone | `src/zones/user` | Landing, login, tabs, chat |
| Mock fallback | `src/mock/pages` | Dữ liệu fallback cho UI |

## 5. Admin frontend

Admin navigation hiện có 5 mục:

| Key | Page |
|-----|------|
| `dashboard` | `AdminOverviewPage.jsx` |
| `blog` | `AdminBlogPage.jsx` |
| `categories` | `AdminCategoriesPage.jsx` |
| `users` | `AdminUsersPage.jsx` |
| `documents` | `AdminDocumentsPage.jsx` |

Admin components:

- `AdminSidebar.jsx`
- `AdminDataTable.jsx`
- `AdminModal.jsx`
- `AdminFormField.jsx`
- `AdminDeleteConfirm.jsx`
- `AdminPageHeader.jsx`
- `AdminStatCard.jsx`
- `DocumentUploader.jsx`
- `DocumentList.jsx`
- `BlogPostPreviewModal.jsx`

## 6. User frontend

User zone hiện có:

| Nhóm | File |
|------|------|
| Container | `UserZonePage.jsx` |
| Landing | `UserLandingPage.jsx` |
| Auth | `LoginWorkspace.jsx`, `GoogleToneLoginCard.jsx`, `RoleSelector.jsx` |
| Layout | `UserHeaderTopBar.jsx`, `UserHeaderNav.jsx`, `UserHeroBanner.jsx`, `UserLandingFooter.jsx` |
| Chat | `ChatWidget.jsx` |
| Tabs | `HomeTabPage.jsx`, `SeoServiceTabPage.jsx`, `WebDesignTabPage.jsx`, `AdsTabPage.jsx`, `BlogTabPage.jsx` |
| Related content | `RelatedBlogPosts.jsx` |

User navigation hiện chỉ có key:

```text
landing
```

## 7. API service function groups

`src/config/apiService.js` export các nhóm function:

| Nhóm | Function |
|------|----------|
| Auth | `authLogin`, `authRegister`, `authLoginWithGoogle`, `authGetCurrentUser`, `authApi` |
| User public | `userGetHomeContent`, `userGetSeoServiceContent`, `userGetWebDesignContent`, `userGetAdsContent`, `userGetBlogContent` |
| Chat | `chatStreamMessage`, `chatGetSessions`, `chatGetSessionById` |
| Documents | `documentGetAdminPage`, `documentGetAdminList`, `documentUploadAdminFile`, `documentDeleteById` |
| Admin blog | `adminBlogGetPostPage`, `adminBlogGetPosts`, `adminBlogCreatePost`, `adminBlogUpdatePost`, `adminBlogDeletePost`, `adminBlogToggleFeaturedPost` |
| Admin users | `adminUserGetPage`, `adminUserCreate`, `adminUserUpdateByEmail`, `adminUserDeleteByEmail` |
| Admin categories | `adminCategoryGetPage`, `adminCategoryGetList`, `adminCategoryCreate`, `adminCategoryUpdateById`, `adminCategoryDeleteById` |

## 8. Kết luận

- Backend đã có đủ module cho auth, public content, admin CRUD, document RAG và chat RAG.
- Frontend đã kết nối backend thật qua `src/config/apiService.js`.
- Admin zone đã bao phủ blog, categories, users, documents và dashboard.
- User zone đã bao phủ landing page, login/register/google login, public content tabs và chat widget.
- Mock data hiện chỉ đóng vai trò fallback cho UI public, không còn là nguồn chính cho các luồng admin/auth.
