import uuid
from math import ceil
from datetime import datetime, timezone

from app.manager.blog.interface import BlogPost, BlogPostCreate, BlogPostListResponse, BlogPostUpdate
from app.manager.blog.repository import blog_repository
from app.models import BlogPostDocument


class BlogUseCase:
    def get_all_posts(self) -> list[BlogPost]:
        posts = blog_repository.get_all_posts()
        return [BlogPost(**post) for post in posts]

    def list_posts(self, category: str = "", page: int = 1, page_size: int = 10) -> BlogPostListResponse:
        blog_repository.ensure_indexes()
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        total = blog_repository.count_matching_posts(category)
        total_pages = ceil(total / page_size) if total else 1
        safe_page = min(page, total_pages)
        skip = (safe_page - 1) * page_size
        posts = blog_repository.list_posts(category=category, skip=skip, limit=page_size)

        return BlogPostListResponse(
            items=[BlogPost(**post) for post in posts],
            total=total,
            page=safe_page,
            pageSize=page_size,
            totalPages=total_pages,
        )

    def get_public_posts(self) -> list[BlogPost]:
        return self.get_all_posts()

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

    def delete_post(self, post_id: str) -> bool:
        return blog_repository.delete_post(post_id)

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

    def _clean_post_data(self, data: dict) -> dict:
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                cleaned[key] = value.strip()
            else:
                cleaned[key] = value
        return cleaned

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()


blog_usecase = BlogUseCase()
