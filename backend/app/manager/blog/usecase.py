import uuid
import re
import unicodedata
from math import ceil
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from app.manager.blog.repository import blog_repository
from app.models import BlogPostDocument


class BlogPostBase(BaseModel):
    """Cac truong chung khi tao, cap nhat va hien thi bai viet blog."""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1)
    slug: str = ""
    category: str = Field(..., min_length=1)
    readTime: str = Field(..., min_length=1)
    excerpt: str = Field(..., min_length=1)
    content: str = ""
    imageUrl: str = ""
    author: str = ""
    tags: str = ""
    isFeatured: bool = False


class BlogPostCreate(BlogPostBase):
    """Payload tao bai viet blog moi."""

    pass


class BlogPostUpdate(BaseModel):
    """Payload cap nhat bai viet blog, cho phep gui tung phan."""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1)
    slug: str | None = None
    category: str | None = Field(default=None, min_length=1)
    readTime: str | None = Field(default=None, min_length=1)
    excerpt: str | None = Field(default=None, min_length=1)
    content: str | None = None
    imageUrl: str | None = None
    author: str | None = None
    tags: str | None = None
    isFeatured: bool | None = None


class BlogPost(BlogPostBase):
    """Bai viet blog day du duoc tra ve cho admin va public page."""

    id: str
    createdAt: str
    updatedAt: str


class BlogPostListResponse(BaseModel):
    """Response danh sach bai viet blog co phan trang."""

    items: list[BlogPost]
    total: int
    page: int
    pageSize: int
    totalPages: int


class BlogUseCase:
    # Lấy toàn bộ bản ghi cho module hiện tại.
    def get_all_posts(self) -> list[BlogPost]:
        posts = blog_repository.get_all_posts()
        return [BlogPost(**post) for post in posts]

    # Lấy danh sách bản ghi có phân trang/lọc khi cần.
    def list_posts(self, category: str = "", search: str = "", page: int = 1, page_size: int = 10) -> BlogPostListResponse:
        blog_repository.ensure_indexes()
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        total = blog_repository.count_matching_posts(category, search)
        total_pages = ceil(total / page_size) if total else 1
        safe_page = min(page, total_pages)
        skip = (safe_page - 1) * page_size
        posts = blog_repository.list_posts(category=category, search=search, skip=skip, limit=page_size)

        return BlogPostListResponse(
            items=[BlogPost(**post) for post in posts],
            total=total,
            page=safe_page,
            pageSize=page_size,
            totalPages=total_pages,
        )

    # Lấy danh sách bài viết public cho trang user.
    def get_public_posts(self) -> list[BlogPost]:
        return self.get_all_posts()

    # Tạo bản ghi mới sau khi validate payload.
    def create_post(self, payload: BlogPostCreate) -> BlogPost:
        now = self._now()
        post_data = {
            "id": str(uuid.uuid4())[:8],
            **self._clean_post_data(payload.model_dump()),
            "createdAt": now,
            "updatedAt": now,
        }
        post_doc = BlogPostDocument(**post_data)
        post = blog_repository.create_post(post_doc.model_dump(by_alias=True, exclude_none=True))
        return BlogPost(**post)

    # Cập nhật bản ghi hiện có theo id/khóa chính.
    def update_post(self, post_id: str, payload: BlogPostUpdate) -> BlogPost | None:
        existing = blog_repository.get_post_by_id(post_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data = self._clean_post_data(update_data)
            update_data["updatedAt"] = self._now()
            existing = blog_repository.update_post(post_id, update_data)

        return BlogPost(**existing)

    # Xóa bản ghi/tài nguyên theo id/khóa chính.
    def delete_post(self, post_id: str) -> bool:
        return blog_repository.delete_post(post_id)

    # Bật/tắt trạng thái nổi bật của bài viết.
    def toggle_featured(self, post_id: str) -> BlogPost | None:
        existing = blog_repository.get_post_by_id(post_id)
        if not existing:
            return None

        updated = blog_repository.update_post(
            post_id,
            {
                "isFeatured": not existing.get("isFeatured", False),
                "updatedAt": self._now(),
            },
        )
        return BlogPost(**updated)

    # Seed dữ liệu mẫu ban đầu cho môi trường demo/dev.
    def seed_default_posts(self):
        blog_repository.ensure_indexes()
        if blog_repository.count_posts() > 0:
            return

        now = self._now()
        defaults = [
            {
                "title": "Checklist SEO 2026 cho website dịch vụ",
                "category": "Dịch vụ SEO",
                "readTime": "7 phút đọc",
                "excerpt": "Danh sách 25 hạng mục quan trọng để cải thiện thứ hạng và tỉ lệ chuyển đổi ngay trong quý này.",
                "content": "<h2>Checklist nền tảng</h2><p>Bắt đầu từ technical SEO, cấu trúc nội dung, internal link và đo lường chuyển đổi. Mỗi hạng mục nên có người phụ trách, deadline và chỉ số theo dõi rõ ràng.</p><ul><li>Audit tốc độ và Core Web Vitals.</li><li>Chuẩn hóa title, meta description và heading.</li><li>Gắn CTA phù hợp theo từng nhóm intent.</li></ul>",
                "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
                "author": "DataZone Editorial",
                "tags": "SEO, Checklist, Website dịch vụ",
                "isFeatured": True,
            },
            {
                "title": "Thiết kế landing page tăng lead B2B",
                "category": "Thiết kế website",
                "readTime": "9 phút đọc",
                "excerpt": "Mô hình cấu trúc landing page theo hành vi khách hàng doanh nghiệp, kèm ví dụ CTA hiệu quả.",
                "content": "<h2>Landing page cần làm rõ lời hứa</h2><p>Một landing page B2B hiệu quả nên trình bày nhanh vấn đề, bằng chứng năng lực, quy trình triển khai và lời kêu gọi hành động dễ hiểu.</p>",
                "imageUrl": "https://images.unsplash.com/photo-1559028006-448665bd7c7f?auto=format&fit=crop&w=1200&q=80",
                "author": "DataZone Editorial",
                "tags": "Landing Page, CRO, B2B",
                "isFeatured": False,
            },
            {
                "title": "5 lỗi khiến quảng cáo đốt ngân sách",
                "category": "Quảng cáo +",
                "readTime": "6 phút đọc",
                "excerpt": "Phân tích các lỗi phổ biến trong target, creative và đo lường khiến chi phí tăng nhưng lead giảm.",
                "content": "<h2>Đừng tối ưu khi dữ liệu chưa sạch</h2><p>Trước khi tăng ngân sách, hãy kiểm tra tracking, chất lượng lead và thông điệp creative. Nhiều campaign thất thoát vì đo sai mục tiêu ngay từ đầu.</p>",
                "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                "author": "DataZone Editorial",
                "tags": "Ads, Performance, Tracking",
                "isFeatured": False,
            },
        ]
        posts = []
        for post in defaults:
            post_doc = BlogPostDocument(
                id=str(uuid.uuid4())[:8],
                **post,
                createdAt=now,
                updatedAt=now,
            )
            posts.append(post_doc.model_dump(by_alias=True, exclude_none=True))
        blog_repository.insert_many(posts)

    # Làm sạch payload trước khi lưu xuống database.
    def _clean_post_data(self, data: dict) -> dict:
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                cleaned[key] = value.strip()
            else:
                cleaned[key] = value
        if cleaned.get("title"):
            cleaned["slug"] = cleaned.get("slug") or self._create_slug(cleaned["title"])
        return cleaned

    # Tạo slug URL thân thiện và hạn chế trùng lặp.
    def _create_slug(self, value: str) -> str:
        slug = unicodedata.normalize("NFD", value.strip().lower())
        slug = "".join(char for char in slug if unicodedata.category(char) != "Mn")
        slug = slug.replace("đ", "d")
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        return slug.strip("-") or "bai-viet"

    # Tạo timestamp hiện tại dùng cho dữ liệu lưu DB.
    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()


blog_usecase = BlogUseCase()
