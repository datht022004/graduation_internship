import sys
from pathlib import Path
import os
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parent.parent))
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.manager.site_content.usecase import SiteContentCreate, site_content_usecase
from app.manager.site_content.repository import site_content_repository

ADMIN_EMAIL = "admin@seovip.com"

ALL_CONTENT = [
    # HOME
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
    },
    # SEO SERVICE
    {
        "page_key": "seo-service",
        "section_key": "metrics",
        "title": "Hiệu quả đo lường",
        "content": {
            "items": [
                { "value": "+168%", "label": "Organic traffic sau 6 tháng" },
                { "value": "4.2x", "label": "Tăng lead từ kênh tìm kiếm" },
                { "value": "91%", "label": "Keyword ưu tiên vào top 10" },
            ]
        },
        "sort_order": 1
    },
    {
        "page_key": "seo-service",
        "section_key": "packages",
        "title": "Gói dịch vụ SEO",
        "content": {
            "items": [
                {
                    "title": "SEO Local",
                    "summary": "Phù hợp doanh nghiệp cần tăng khách hàng tại địa phương, tối ưu Google Business Profile.",
                    "points": ["Tối ưu map và local landing", "Kế hoạch review thật theo ngành", "Báo cáo cuộc gọi/đặt lịch"],
                },
                {
                    "title": "SEO Tổng Thể",
                    "summary": "Kết hợp technical, content, internal link và entity để phát triển bền vững toàn website.",
                    "points": ["Audit 70+ tiêu chí kỹ thuật", "Roadmap content theo funnel", "Tối ưu chuyển đổi trên trang đích"],
                },
                {
                    "title": "SEO E-commerce",
                    "summary": "Tối ưu cấu trúc danh mục, sản phẩm và schema để tăng doanh thu từ tìm kiếm tự nhiên.",
                    "points": ["Chiến lược danh mục chủ lực", "Mẫu product page chuẩn intent", "Tracking doanh thu theo cụm từ khóa"],
                },
            ]
        },
        "sort_order": 2
    },
    {
        "page_key": "seo-service",
        "section_key": "roadmap",
        "title": "Lộ trình triển khai",
        "content": {
            "items": ["Tuần 1-2: Audit & KPI", "Tuần 3-6: Khắc phục kỹ thuật", "Tháng 2-3: Content + Internal Link", "Tháng 4+: Mở rộng cụm chủ đề + CRO"]
        },
        "sort_order": 3
    },
    # WEB DESIGN
    {
        "page_key": "web-design",
        "section_key": "phases",
        "title": "Quy trình thiết kế",
        "content": {
            "items": [
                { "title": "Discovery", "desc": "Phân tích người dùng, hành vi và mục tiêu kinh doanh." },
                { "title": "UX/UI System", "desc": "Thiết kế wireframe và giao diện nhất quán theo brand." },
                { "title": "Build & SEO", "desc": "Phát triển giao diện, tối ưu tốc độ và setup SEO căn bản." },
                { "title": "Launch", "desc": "QA đa thiết bị, go-live và theo dõi hiệu suất 30 ngày." },
            ]
        },
        "sort_order": 1
    },
    {
        "page_key": "web-design",
        "section_key": "highlights",
        "title": "Điểm nhấn",
        "content": {
            "items": [
                "Tối ưu Core Web Vitals từ đầu",
                "Cấu trúc thông tin để tìm kiếm hiểu đúng",
                "Mẫu trang đích để chốt lead nhanh hơn",
            ]
        },
        "sort_order": 2
    },
    # ADS
    {
        "page_key": "ads",
        "section_key": "channels",
        "title": "Kênh quảng cáo",
        "content": {
            "items": [
                { "name": "Google Ads", "kpi": "Lead quality", "desc": "Tập trung Search + PMax theo dịch vụ ưu tiên." },
                { "name": "Meta Ads", "kpi": "CPL", "desc": "Xây phễu 3 tầng: nhận diện, quan tâm, chuyển đổi." },
                { "name": "TikTok Ads", "kpi": "Reach to lead", "desc": "Creative ngắn, test nhanh theo cụm thông điệp." },
            ]
        },
        "sort_order": 1
    },
    {
        "page_key": "ads",
        "section_key": "metrics",
        "title": "Hiệu quả đo lường",
        "content": {
            "items": [
                { "value": "-28%", "label": "Giảm CPL sau tối ưu" },
                { "value": "3.6x", "label": "ROAS trung bình campaign chủ lực" },
                { "value": "72h", "label": "Chu kỳ tối ưu creative" },
            ]
        },
        "sort_order": 2
    }
]

def seed_content():
    print("Clearing old site content...")
    site_content_repository.get_collection().delete_many({})

    print("Seeding new site content for all pages...")
    for item in ALL_CONTENT:
        payload = SiteContentCreate(**item)
        site_content_usecase.create_content(payload, ADMIN_EMAIL)
        
    print("All site content seed completed successfully!")

if __name__ == "__main__":
    seed_content()
