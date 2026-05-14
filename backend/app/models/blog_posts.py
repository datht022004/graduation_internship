from __future__ import annotations

from .base import MongoDocument


class BlogPostDocument(MongoDocument):
    id: str
    title: str
    slug: str = ""
    category: str
    readTime: str
    excerpt: str
    content: str = ""
    imageUrl: str = ""
    author: str = ""
    tags: str = ""
    isFeatured: bool = False
    createdAt: str
    updatedAt: str
