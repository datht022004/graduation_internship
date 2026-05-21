# Backend Use Cases

## Auth

### Login

```text
User nhập email/password/role
  -> POST /api/auth/login
  -> kiểm tra users collection
  -> verify password
  -> trả JWT + user info
```

### Register

```text
User nhập name/email/password
  -> POST /api/auth/register
  -> validate email/password
  -> hash password
  -> tạo role user
  -> trả JWT + user info
```

### Google Login

```text
FE gửi Google credential
  -> POST /api/auth/google
  -> verify_oauth2_token
  -> user login/create hoặc admin attach identity
  -> trả JWT + user info
```

## Public Content

Frontend user zone gọi:

- `/api/user/home`
- `/api/user/seo-service`
- `/api/user/web-design`
- `/api/user/ads`
- `/api/user/blog`

Hiện `home`, `seo-service`, `web-design`, `ads` có thể trả mảng rỗng để FE fallback mock. Blog lấy từ `blog_posts`.

## Admin Blog

Admin có thể:

- list/search/filter blog posts
- create post
- update post
- delete post
- toggle featured

## Admin Categories

Admin có thể:

- list/search categories
- create category
- update category
- delete category

Nếu category đang được blog post sử dụng, backend trả `409 Conflict`.

## Admin Users

Admin có thể:

- list/search/filter users
- create admin/user
- update name/password/role
- delete user

Backend chặn:

- admin tự xóa chính mình
- admin tự hạ quyền chính mình

## Documents RAG

Admin upload PDF/DOC/DOCX/TXT:

```text
validate file
  -> save local
  -> load text
  -> split chunk
  -> embed
  -> add to vector store
  -> save metadata
```

Admin cũng có thể list và delete document. Delete sẽ xóa metadata, local file và vector chunks.

## Chat RAG

User/admin gửi message:

```text
POST /api/chat
  -> tạo/lấy session
  -> lấy history gần nhất
  -> quick answer nếu là greeting
  -> RAG retrieve + LLM streaming nếu là câu hỏi thật
  -> lưu history
```

Response là `text/event-stream`.
