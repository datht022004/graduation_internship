from app.core.database import get_db
from app.manager.blog.usecase import blog_usecase
from app.manager.category.usecase import category_usecase
from app.manager.company_profile.usecase import company_profile_usecase, CompanyProfileCreate
from app.manager.service_packages.usecase import service_package_usecase, ServicePackageCreate
from app.manager.case_studies.usecase import case_study_usecase, CaseStudyCreate
from app.manager.testimonials.usecase import testimonial_usecase, TestimonialCreate
from app.manager.contact_requests.usecase import contact_request_usecase, ContactRequestCreate

# Seed dữ liệu mẫu ban đầu cho môi trường demo/dev.
def seed_demo_data():
    db = get_db()
    # Drop unneeded collections to keep DB clean
    collections_to_drop = [
        "service_cards",
        "pain_points",
        "strengths",
        "seo_metrics",
        "seo_packages",
        "seo_roadmap",
        "design_phases",
        "design_highlights",
        "ads_metrics",
        "ads_channels",
        "training_modules",
        "syllabus"
    ]
    for coll in collections_to_drop:
        db[coll].drop()

    blog_usecase.seed_default_posts()
    category_usecase.seed_default_categories()

    # Seed Company Profiles
    if db["company_profiles"].count_documents({}) == 0:
        company_profile_usecase.create(CompanyProfileCreate(
            section_key="intro",
            title="Về Nova Digital",
            content="Chúng tôi là Agency Marketing chuyên cung cấp các giải pháp SEO và thiết kế website chuyên nghiệp, giúp doanh nghiệp bứt phá doanh thu trên môi trường số."
        ))
        company_profile_usecase.create(CompanyProfileCreate(
            section_key="vision",
            title="Tầm nhìn & Sứ mệnh",
            content="Trở thành đối tác chiến lược hàng đầu của các doanh nghiệp vừa và nhỏ tại Việt Nam trong lĩnh vực Digital Marketing."
        ))

    # Seed Service Packages
    if db["service_packages"].count_documents({}) == 0:
        service_package_usecase.create(ServicePackageCreate(
            service_type="seo",
            title="Gói SEO Cơ Bản",
            summary="Phù hợp cho doanh nghiệp nhỏ mới bắt đầu.",
            price_label="5.000.000đ / tháng",
            points=["Nghiên cứu từ khóa", "Tối ưu Onpage", "Báo cáo hàng tháng"],
            is_active=True
        ))
        service_package_usecase.create(ServicePackageCreate(
            service_type="web",
            title="Gói Web Doanh Nghiệp",
            summary="Thiết kế website chuẩn SEO, giao diện độc quyền.",
            price_label="15.000.000đ",
            points=["Giao diện chuẩn UI/UX", "Tối ưu tốc độ tải trang", "Bảo hành 1 năm"],
            is_active=True
        ))

    # Seed Case Studies
    if db["case_studies"].count_documents({}) == 0:
        case_study_usecase.create(CaseStudyCreate(
            title="Tăng trưởng x3 traffic cho E-commerce",
            client_name="Công ty TNHH ABC",
            description="Chiến dịch SEO tổng thể giúp tăng lượng truy cập tự nhiên gấp 3 lần trong 6 tháng.",
            results=[{"metric": "Traffic", "value": "+300%"}, {"metric": "Doanh thu", "value": "+150%"}],
            image_url="https://placehold.co/600x400/png",
            is_published=True
        ))

    # Seed Testimonials
    db["testimonials"].delete_many({"id": None}) # Clean up failed inserts
    if db["testimonials"].count_documents({}) == 0:
        testimonial_usecase.create(TestimonialCreate(
            client_name="Anh Nguyễn Văn A",
            client_role="Giám đốc Marketing",
            content="Dịch vụ rất chuyên nghiệp, đội ngũ tư vấn nhiệt tình và kết quả SEO vượt ngoài mong đợi.",
            rating=5,
            is_published=True
        ))
        testimonial_usecase.create(TestimonialCreate(
            client_name="Chị Trần Thị B",
            client_role="Chủ thương hiệu Spa",
            content="Website thiết kế cực đẹp, tải trang nhanh, khách hàng của tôi rất thích giao diện mới.",
            rating=5,
            is_published=True
        ))

    # Seed Contact Requests
    if db["contact_requests"].count_documents({}) == 0:
        contact_request_usecase.create(ContactRequestCreate(
            name="Khách Hàng C",
            email="khachhang@example.com",
            phone="0901234567",
            company="Công ty XYZ",
            message="Tôi muốn tư vấn gói SEO tổng thể cho website mới.",
            service_interest="SEO",
            status="pending"
        ))
