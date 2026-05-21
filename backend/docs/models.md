# Models

Models nằm trong `app/models`.

## Files

| File | Model | Collection |
|------|-------|------------|
| `base.py` | `MongoDocument` | Base model |
| `users.py` | `UserDocument` | `users` |
| `blog_posts.py` | `BlogPostDocument` | `blog_posts` |
| `categories.py` | `CategoryDocument` | `categories` |
| `chat_sessions.py` | `ChatSessionDocument` | `chat_sessions` |
| `documents.py` | `DocumentDocument` | `documents` |
| `document_vectors.py` | `VectorDocument` | `document_vectors` |

## Base Model

`MongoDocument` hỗ trợ `_id` alias cho MongoDB.

## UserDocument

Các field chính:

- `email`
- `password`
- `name`
- `role`
- `google_id`
- `auth_providers`
- `created_at`

## BlogPostDocument

Các field chính:

- `id`
- `title`
- `slug`
- `category`
- `readTime`
- `excerpt`
- `content`
- `imageUrl`
- `author`
- `tags`
- `isFeatured`
- `createdAt`
- `updatedAt`

## CategoryDocument

Các field chính:

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

## ChatSessionDocument

Các field chính:

- `session_id`
- `user_email`
- `title`
- `messages`
- `created_at`
- `updated_at`

## DocumentDocument

Metadata tài liệu RAG:

- `id`
- `filename`
- `file_type`
- `file_size`
- `chunk_count`
- `uploaded_at`

## VectorDocument

Vector chunks cho RAG:

- `text`
- `embedding`
- `metadata`

LangChain MongoDB integration cũng lưu thêm metadata tùy pipeline.
