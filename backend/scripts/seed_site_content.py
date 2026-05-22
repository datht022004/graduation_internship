import sys
from pathlib import Path
import os
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parent.parent))
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.manager.site_content.usecase import SiteContentCreate, site_content_usecase

ADMIN_EMAIL = "admin@seovip.com"

# The mock data structure converted to what DB expects
HOME_CONTENT = [
    {
        "page_key": "home",
        "section_key": "services",
        "title": "Dịch vụ của chúng tôi",
        "content": {
            "serviceCards": [
                {
                    "title": "Dịch vụ SEO",
                    "desc": "Thiết kế chiến lược từ technical SEO, content SEO tới CRO để kéo đúng khách hàng và tăng chuyển đổi.",
                    "tabKey": "seo-service",
                },
                {
                    "title": "Thiết kế website",
                    "desc": "Website vận hành nhanh, nội dung rõ ràng, cấu trúc tối ưu để tăng chất lượng lead từ organic và ads.",
                    "tabKey": "web-design",
                },
                {
                    "title": "Quảng cáo +",
                    "desc": "Triển khai Google, Meta, TikTok theo phễu bán hàng, theo dõi CPL/ROAS và tối ưu liên tục.",
                    "tabKey": "ads",
                },
                {
                    "title": "Blog",
                    "desc": "Kho kiến thức SEO - Ads - Website dành cho doanh nghiệp với bài viết ngắn gọn, có checklist hành động.",
                    "tabKey": "blog",
                },
            ]
        },
        "sort_order": 1
    },
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
        },
        "sort_order": 2
    },
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
        },
        "sort_order": 3
    }
]

def seed_content():
    print("Seeding site content...")
    from app.manager.site_content.repository import site_content_repository
    
    # check if already seeded
    if site_content_repository.get_collection().count_documents({}) > 0:
        print("Site content already seeded.")
        return

    for item in HOME_CONTENT:
        payload = SiteContentCreate(**item)
        site_content_usecase.create_content(payload, ADMIN_EMAIL)
        
    print("Site content seed completed!")

if __name__ == "__main__":
    seed_content()
