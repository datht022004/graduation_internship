from __future__ import annotations

import argparse
import hashlib
import re
import sys
import unicodedata
from datetime import datetime, timedelta, timezone
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import get_app_client, get_db
from app.models import BlogPostDocument, CategoryDocument


AUTHOR = "SEOVIP Editorial"

CATEGORY_DATA = [
    {
        "name": "Blog",
        "description": "Tin tức, playbook và kiến thức chung cho doanh nghiệp.",
        "imageUrl": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
        "topics": [
            {
                "title": "Cách xây lịch nội dung 90 ngày cho doanh nghiệp dịch vụ",
                "excerpt": "Khung lập kế hoạch nội dung theo mục tiêu, nhóm khách hàng và kênh phân phối để đội marketing triển khai đều tay.",
                "tags": "Content Plan, Marketing, B2B",
                "points": ["Chia mục tiêu theo từng tháng", "Xây cụm chủ đề theo hành trình khách hàng", "Đặt lịch đo hiệu quả sau mỗi sprint"],
            },
            {
                "title": "Checklist đo hiệu quả marketing không cần dashboard phức tạp",
                "excerpt": "Những chỉ số tối thiểu nên theo dõi hằng tuần để biết nội dung, quảng cáo và website có đang tạo lead thật hay không.",
                "tags": "KPI, Dashboard, Lead",
                "points": ["Theo dõi nguồn lead", "Gắn UTM thống nhất", "So sánh chi phí và tỉ lệ chuyển đổi"],
            },
            {
                "title": "Quy trình briefing giúp agency hiểu đúng mục tiêu kinh doanh",
                "excerpt": "Mẫu trao đổi ngắn gọn để doanh nghiệp truyền đạt bối cảnh, kỳ vọng và ràng buộc trước khi bắt đầu dự án.",
                "tags": "Agency, Brief, Quy trình",
                "points": ["Nêu rõ vấn đề kinh doanh", "Chốt tiêu chí nghiệm thu", "Xác định người ra quyết định"],
            },
            {
                "title": "Cách biến phản hồi khách hàng thành ý tưởng nội dung",
                "excerpt": "Khai thác câu hỏi, phản đối và nhu cầu thật từ khách hàng để tạo bài viết có khả năng chuyển đổi cao.",
                "tags": "Customer Insight, Content, Sales",
                "points": ["Thu thập câu hỏi từ sales", "Phân nhóm pain point", "Viết nội dung giải quyết từng phản đối"],
            },
            {
                "title": "Bản đồ kênh digital marketing cho doanh nghiệp mới bắt đầu",
                "excerpt": "Tổng quan vai trò của SEO, website, social, quảng cáo và email trong một hệ thống tăng trưởng cơ bản.",
                "tags": "Digital Marketing, Growth, Strategy",
                "points": ["Xác định kênh kéo traffic", "Chọn kênh nuôi dưỡng lead", "Ưu tiên theo năng lực vận hành"],
            },
            {
                "title": "Cách viết case study thuyết phục khách hàng B2B",
                "excerpt": "Cấu trúc case study rõ bối cảnh, giải pháp, kết quả và bằng chứng để tăng độ tin cậy khi bán dịch vụ.",
                "tags": "Case Study, B2B, Trust",
                "points": ["Mở bằng vấn đề cụ thể", "Trình bày giải pháp theo timeline", "Đưa số liệu trước và sau"],
            },
            {
                "title": "Những lỗi khiến kế hoạch marketing khó triển khai",
                "excerpt": "Các dấu hiệu kế hoạch quá rộng, thiếu chủ sở hữu hoặc không gắn với dữ liệu khiến đội ngũ dễ bỏ dở giữa chừng.",
                "tags": "Planning, Operations, Marketing",
                "points": ["Giảm số mục tiêu ưu tiên", "Phân quyền rõ ràng", "Đặt mốc kiểm tra ngắn"],
            },
            {
                "title": "Cách xây thư viện thông điệp cho đội sales và marketing",
                "excerpt": "Một hệ thống thông điệp thống nhất giúp quảng cáo, landing page và tư vấn bán hàng nói cùng một ngôn ngữ.",
                "tags": "Messaging, Sales, Branding",
                "points": ["Ghi lại lời hứa chính", "Chuẩn hóa bằng chứng", "Tạo biến thể theo từng phân khúc"],
            },
            {
                "title": "Lịch rà soát website và nội dung hằng tháng",
                "excerpt": "Danh sách việc cần kiểm tra định kỳ để giữ website ổn định, nội dung còn đúng và CTA không bị lỗi thời.",
                "tags": "Website Audit, Content Audit, Checklist",
                "points": ["Kiểm tra form và tracking", "Cập nhật bài có traffic", "Loại bỏ liên kết hỏng"],
            },
            {
                "title": "Cách trình bày báo cáo marketing dễ hiểu cho chủ doanh nghiệp",
                "excerpt": "Mẫu báo cáo tập trung vào kết quả kinh doanh, nguyên nhân biến động và việc cần làm tiếp theo.",
                "tags": "Reporting, Business, Marketing",
                "points": ["Bắt đầu bằng kết quả chính", "Giải thích biến động bằng dữ liệu", "Đề xuất hành động tuần tới"],
            },
        ],
    },
    {
        "name": "Dịch vụ SEO",
        "description": "Bài viết liên quan tới dịch vụ SEO, audit, content và tăng trưởng organic.",
        "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "topics": [
            {
                "title": "Audit SEO kỹ thuật trong 60 phút cho website dịch vụ",
                "excerpt": "Quy trình rà soát nhanh các lỗi index, tốc độ, heading, schema và internal link trước khi lên roadmap SEO.",
                "tags": "SEO Audit, Technical SEO, Website",
                "points": ["Kiểm tra index và sitemap", "Đo Core Web Vitals", "Ưu tiên lỗi ảnh hưởng chuyển đổi"],
            },
            {
                "title": "Cách chọn bộ từ khóa SEO theo intent mua hàng",
                "excerpt": "Phương pháp phân nhóm keyword theo nhu cầu tìm hiểu, so sánh và liên hệ để tối ưu nội dung đúng giai đoạn.",
                "tags": "Keyword Research, SEO, Intent",
                "points": ["Tách intent thông tin và giao dịch", "Ưu tiên cụm có giá trị lead", "Gắn keyword với landing page"],
            },
            {
                "title": "Mô hình topic cluster cho ngành dịch vụ cạnh tranh",
                "excerpt": "Cách xây cụm nội dung trụ cột và bài vệ tinh để tăng độ phủ chủ đề mà vẫn kiểm soát chất lượng.",
                "tags": "Topic Cluster, SEO Content, Authority",
                "points": ["Chọn pillar page", "Lập danh sách bài vệ tinh", "Thiết kế internal link hai chiều"],
            },
            {
                "title": "Tối ưu title và meta description để tăng CTR",
                "excerpt": "Các công thức viết tiêu đề tìm kiếm rõ lợi ích, đúng intent và nổi bật hơn đối thủ trên trang kết quả.",
                "tags": "CTR, Metadata, SEO",
                "points": ["Đưa lợi ích vào 60 ký tự đầu", "Thêm ngữ cảnh địa phương nếu cần", "Tránh nhồi keyword"],
            },
            {
                "title": "Chiến lược SEO local cho doanh nghiệp nhiều chi nhánh",
                "excerpt": "Cách chuẩn hóa landing page địa phương, Google Business Profile và nội dung theo từng khu vực phục vụ.",
                "tags": "Local SEO, Google Business, Branch",
                "points": ["Tạo page riêng cho từng khu vực", "Đồng bộ NAP", "Thu thập review đúng quy trình"],
            },
            {
                "title": "Internal link giúp bài viết mới lên top nhanh hơn",
                "excerpt": "Cách chọn trang nguồn, anchor text và vị trí đặt link để truyền sức mạnh cho nội dung mới xuất bản.",
                "tags": "Internal Link, SEO, Content",
                "points": ["Tìm bài có traffic ổn định", "Dùng anchor tự nhiên", "Theo dõi index sau khi thêm link"],
            },
            {
                "title": "Cách xử lý cannibalization trong cụm từ khóa dịch vụ",
                "excerpt": "Nhận diện nhiều trang cùng tranh một keyword và quyết định gộp, chuyển hướng hoặc tái định vị nội dung.",
                "tags": "Cannibalization, SEO Audit, Content",
                "points": ["So sánh query từng URL", "Chọn trang chính", "Gộp nội dung và cập nhật redirect"],
            },
            {
                "title": "Schema quan trọng cho website tư vấn dịch vụ",
                "excerpt": "Các loại dữ liệu có cấu trúc nên triển khai để giúp công cụ tìm kiếm hiểu doanh nghiệp, dịch vụ và FAQ.",
                "tags": "Schema, Structured Data, SEO",
                "points": ["Bắt đầu với Organization", "Thêm Service và FAQ", "Kiểm tra bằng Rich Results Test"],
            },
            {
                "title": "Kế hoạch SEO 6 tháng cho website mới",
                "excerpt": "Roadmap thực tế từ audit, nghiên cứu từ khóa, sản xuất nội dung đến tối ưu chuyển đổi và báo cáo.",
                "tags": "SEO Roadmap, Growth, Website mới",
                "points": ["Tháng đầu xử lý nền tảng", "Ba tháng giữa phủ nội dung", "Hai tháng cuối tối ưu chuyển đổi"],
            },
            {
                "title": "Cách đo ROI SEO khi chu kỳ bán hàng dài",
                "excerpt": "Thiết lập tracking và mô hình quy đổi để đánh giá SEO với lead tư vấn, cuộc gọi và cơ hội bán hàng.",
                "tags": "SEO ROI, Analytics, B2B",
                "points": ["Gắn nguồn cho từng lead", "Theo dõi pipeline", "Đánh giá theo cohort 90 ngày"],
            },
        ],
    },
    {
        "name": "Home",
        "description": "Nội dung tổng quan và giới thiệu chính trên trang chủ.",
        "imageUrl": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
        "topics": [
            {
                "title": "Cách viết thông điệp hero section rõ trong 5 giây",
                "excerpt": "Công thức trình bày lời hứa, đối tượng phục vụ và kết quả chính để khách truy cập hiểu ngay doanh nghiệp làm gì.",
                "tags": "Homepage, Copywriting, Hero",
                "points": ["Nói rõ đối tượng", "Nêu kết quả cụ thể", "Đặt CTA duy nhất"],
            },
            {
                "title": "Bố cục trang chủ giúp khách hàng đi tới CTA nhanh hơn",
                "excerpt": "Thứ tự các section nên có trên trang chủ dịch vụ: vấn đề, giải pháp, bằng chứng, quy trình và liên hệ.",
                "tags": "Homepage UX, CTA, Conversion",
                "points": ["Mở bằng vấn đề", "Đưa bằng chứng trước bảng giá", "Lặp CTA sau các section quan trọng"],
            },
            {
                "title": "Cách trình bày năng lực doanh nghiệp trên trang chủ",
                "excerpt": "Biến kinh nghiệm, dự án, số liệu và khách hàng tiêu biểu thành bằng chứng dễ quét, không khoe quá đà.",
                "tags": "Trust, Homepage, Branding",
                "points": ["Dùng số liệu có ngữ cảnh", "Gắn logo khách hàng đúng chỗ", "Thêm nhận xét ngắn"],
            },
            {
                "title": "Section pain point giúp khách hàng thấy đúng vấn đề",
                "excerpt": "Cách viết nhóm nỗi đau khách hàng để tạo sự đồng cảm và dẫn họ tới giải pháp phù hợp.",
                "tags": "Pain Point, UX Writing, Homepage",
                "points": ["Viết bằng ngôn ngữ khách hàng", "Tránh phóng đại", "Liên kết mỗi pain point với giải pháp"],
            },
            {
                "title": "Thiết kế CTA trang chủ cho dịch vụ tư vấn",
                "excerpt": "Gợi ý microcopy, vị trí và trạng thái CTA để tăng lượt liên hệ mà vẫn giữ trải nghiệm tự nhiên.",
                "tags": "CTA, Lead, Homepage",
                "points": ["Dùng động từ rõ hành động", "Giảm ma sát form", "Đặt CTA phụ cho người chưa sẵn sàng"],
            },
            {
                "title": "Cách đưa dịch vụ chính lên trang chủ không rối mắt",
                "excerpt": "Phân nhóm dịch vụ theo mục tiêu khách hàng để trang chủ dễ quét và không biến thành danh sách quá dài.",
                "tags": "Service Cards, Homepage, UX",
                "points": ["Giới hạn số nhóm chính", "Dùng mô tả ngắn", "Dẫn tới trang chi tiết"],
            },
            {
                "title": "Tối ưu trang chủ cho người dùng mobile",
                "excerpt": "Các điểm cần kiểm tra trên mobile: tốc độ, kích thước chữ, CTA nổi bật và khoảng cách giữa các khối nội dung.",
                "tags": "Mobile UX, Homepage, Performance",
                "points": ["Giữ hero gọn", "Tăng vùng bấm CTA", "Nén hình ảnh trên màn đầu"],
            },
            {
                "title": "Cách dùng số liệu trên trang chủ mà không gây nhiễu",
                "excerpt": "Chọn số liệu đại diện cho kết quả thật và trình bày ngắn gọn để tăng niềm tin cho khách truy cập.",
                "tags": "Metrics, Trust, Homepage",
                "points": ["Chọn tối đa ba chỉ số", "Ghi rõ phạm vi đo", "Tránh số liệu không kiểm chứng"],
            },
            {
                "title": "Trang chủ nên kể câu chuyện thương hiệu như thế nào",
                "excerpt": "Cách đưa tính cách thương hiệu vào copy, hình ảnh và bằng chứng mà vẫn ưu tiên mục tiêu chuyển đổi.",
                "tags": "Brand Story, Homepage, Copywriting",
                "points": ["Tập trung vào khách hàng", "Dùng giọng văn nhất quán", "Kết nối câu chuyện với lời hứa dịch vụ"],
            },
            {
                "title": "Checklist nghiệm thu trang chủ trước khi public",
                "excerpt": "Danh sách kiểm tra cuối cùng cho nội dung, link, form, SEO cơ bản và trải nghiệm trước ngày ra mắt.",
                "tags": "Launch Checklist, Homepage, QA",
                "points": ["Kiểm tra form liên hệ", "Rà title và meta", "Test tốc độ trên mobile"],
            },
        ],
    },
    {
        "name": "Quảng cáo +",
        "description": "Bài viết về quảng cáo đa kênh, performance marketing và tối ưu ngân sách.",
        "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        "topics": [
            {
                "title": "Cách chia ngân sách quảng cáo theo phễu khách hàng",
                "excerpt": "Mô hình phân bổ ngân sách cho nhận diện, remarketing và chuyển đổi để tránh dồn tiền vào một nhóm audience.",
                "tags": "Ads Budget, Funnel, Performance",
                "points": ["Tách ngân sách test và scale", "Giữ remarketing đủ dữ liệu", "Đặt ngưỡng dừng theo CPL"],
            },
            {
                "title": "Checklist tracking trước khi tăng ngân sách ads",
                "excerpt": "Các bước kiểm tra pixel, conversion, UTM và CRM để không tối ưu chiến dịch bằng dữ liệu sai.",
                "tags": "Tracking, Ads, Analytics",
                "points": ["Kiểm tra event chính", "Đồng bộ UTM", "Đối soát lead với CRM"],
            },
            {
                "title": "Cách viết creative brief cho chiến dịch chuyển đổi",
                "excerpt": "Mẫu brief giúp đội thiết kế và media buyer thống nhất insight, offer, thông điệp và biến thể cần test.",
                "tags": "Creative Brief, Ads, Conversion",
                "points": ["Nêu insight chính", "Chốt offer", "Liệt kê biến thể hình ảnh và headline"],
            },
            {
                "title": "Dấu hiệu campaign đang đốt ngân sách sai chỗ",
                "excerpt": "Nhận biết các vấn đề từ target, landing page, creative fatigue và tracking khiến chi phí tăng nhưng lead giảm.",
                "tags": "Ads Optimization, CPL, Lead",
                "points": ["CTR giảm liên tục", "Lead không khớp chân dung", "Landing page tải chậm"],
            },
            {
                "title": "Cách test A/B quảng cáo khi ngân sách nhỏ",
                "excerpt": "Phương pháp ưu tiên biến thể cần test và đọc kết quả đủ tin cậy cho doanh nghiệp chưa có ngân sách lớn.",
                "tags": "A/B Testing, Ads, Budget",
                "points": ["Test một biến tại một thời điểm", "Đặt thời gian tối thiểu", "Không kết luận khi data quá ít"],
            },
            {
                "title": "Remarketing không gây khó chịu cho khách hàng",
                "excerpt": "Cách kiểm soát tần suất, thông điệp và danh sách loại trừ để remarketing nhắc nhớ đúng lúc.",
                "tags": "Remarketing, Frequency, Customer Experience",
                "points": ["Giới hạn tần suất", "Tách nhóm đã gửi form", "Đổi thông điệp theo thời gian"],
            },
            {
                "title": "Landing page ảnh hưởng CPL quảng cáo như thế nào",
                "excerpt": "Những yếu tố trên landing page làm tăng hoặc giảm chi phí lead: tốc độ, offer, form và bằng chứng.",
                "tags": "Landing Page, Ads, CPL",
                "points": ["Đồng bộ headline với ads", "Rút gọn form", "Đưa bằng chứng gần CTA"],
            },
            {
                "title": "Phân tích báo cáo ads theo tuần để ra quyết định nhanh",
                "excerpt": "Cách đọc các chỉ số chính và quyết định giữ, tắt, chỉnh creative hoặc đổi landing page.",
                "tags": "Ads Reporting, Performance, Decision",
                "points": ["So sánh theo nhóm chiến dịch", "Tách lỗi media và lỗi landing", "Ghi lại quyết định test"],
            },
            {
                "title": "Cách phối hợp Google Ads và SEO trong cùng chiến dịch",
                "excerpt": "Tận dụng dữ liệu keyword trả phí để ưu tiên nội dung SEO và dùng SEO hỗ trợ chất lượng landing page.",
                "tags": "Google Ads, SEO, Integrated Marketing",
                "points": ["Dùng search term làm input SEO", "Tạo landing page chung intent", "So sánh chuyển đổi theo kênh"],
            },
            {
                "title": "Tối ưu quảng cáo đa kênh mà không mất kiểm soát",
                "excerpt": "Khung vận hành campaign trên nhiều nền tảng với naming convention, dashboard và quy trình review thống nhất.",
                "tags": "Multi-channel Ads, Operations, Analytics",
                "points": ["Chuẩn hóa tên campaign", "Gom báo cáo theo mục tiêu", "Chốt lịch review cố định"],
            },
        ],
    },
    {
        "name": "Thiết kế website",
        "description": "Bài viết về thiết kế website, landing page, UX/UI và tối ưu chuyển đổi.",
        "imageUrl": "https://images.unsplash.com/photo-1559028006-448665bd7c7f?auto=format&fit=crop&w=1200&q=80",
        "topics": [
            {
                "title": "Thiết kế landing page B2B tập trung vào lead chất lượng",
                "excerpt": "Cấu trúc landing page giúp khách hàng doanh nghiệp hiểu nhanh giá trị, bằng chứng và bước liên hệ tiếp theo.",
                "tags": "Landing Page, B2B, Lead",
                "points": ["Nêu rõ vấn đề", "Đưa case study", "Thiết kế form ít trường"],
            },
            {
                "title": "Checklist UX cho website dịch vụ trước khi chạy ads",
                "excerpt": "Các yếu tố cần kiểm tra để traffic quảng cáo không bị lãng phí vì trải nghiệm chậm, rối hoặc thiếu CTA.",
                "tags": "UX Checklist, Website, Ads",
                "points": ["Kiểm tra tốc độ", "Đảm bảo CTA thấy ngay", "Test form trên mobile"],
            },
            {
                "title": "Cách sắp xếp trang dịch vụ để tăng chuyển đổi",
                "excerpt": "Bố cục trang dịch vụ theo hành trình đọc: vấn đề, giải pháp, quy trình, bằng chứng, FAQ và CTA.",
                "tags": "Service Page, CRO, UX",
                "points": ["Giải thích giải pháp bằng ngôn ngữ đơn giản", "Đặt FAQ gần CTA", "Thêm bằng chứng sau lợi ích"],
            },
            {
                "title": "Tối ưu form liên hệ để giảm bỏ cuộc",
                "excerpt": "Nguyên tắc thiết kế form ngắn, rõ mục đích và thân thiện trên mobile để tăng tỉ lệ gửi thông tin.",
                "tags": "Form UX, Lead, Conversion",
                "points": ["Giảm trường không cần thiết", "Dùng label rõ", "Hiển thị lỗi ngay tại field"],
            },
            {
                "title": "Thiết kế hệ thống section tái sử dụng cho website doanh nghiệp",
                "excerpt": "Cách chuẩn hóa component nội dung để website dễ mở rộng mà vẫn giữ nhất quán về giao diện và thông điệp.",
                "tags": "Design System, Website, Component",
                "points": ["Định nghĩa section chủ lực", "Tạo quy tắc spacing", "Tái dùng pattern CTA"],
            },
            {
                "title": "Cách chọn hình ảnh cho website dịch vụ",
                "excerpt": "Hướng dẫn chọn ảnh thật, ảnh minh họa và ảnh dự án để tạo niềm tin thay vì cảm giác stock chung chung.",
                "tags": "Visual Design, Website, Trust",
                "points": ["Ưu tiên ảnh đội ngũ hoặc dự án", "Giữ style nhất quán", "Tối ưu dung lượng"],
            },
            {
                "title": "Responsive design cho website có nhiều bảng giá",
                "excerpt": "Cách trình bày gói dịch vụ, so sánh tính năng và CTA trên mobile mà không khiến người xem phải zoom.",
                "tags": "Responsive, Pricing, UX",
                "points": ["Chuyển bảng thành card", "Giữ CTA trong tầm nhìn", "Rút gọn nội dung phụ"],
            },
            {
                "title": "Tối ưu tốc độ website mà không hy sinh thiết kế",
                "excerpt": "Các bước giảm dung lượng hình ảnh, font, script và animation để website đẹp nhưng vẫn tải nhanh.",
                "tags": "Performance, Web Design, Core Web Vitals",
                "points": ["Nén ảnh đúng kích thước", "Giảm font weight", "Lazy load media dưới fold"],
            },
            {
                "title": "Cách dùng social proof trên website dịch vụ",
                "excerpt": "Đặt testimonial, logo khách hàng, số liệu và case study ở vị trí hỗ trợ quyết định liên hệ.",
                "tags": "Social Proof, Trust, CRO",
                "points": ["Đặt proof gần claim lớn", "Dùng testimonial cụ thể", "Liên kết tới case study"],
            },
            {
                "title": "Quy trình nghiệm thu UI trước khi bàn giao website",
                "excerpt": "Danh sách kiểm tra typography, spacing, trạng thái hover, form, responsive và nội dung trước khi go-live.",
                "tags": "UI QA, Website, Handover",
                "points": ["Soát layout trên nhiều viewport", "Kiểm tra trạng thái tương tác", "Chạy test form thật"],
            },
        ],
    },
]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Seed 10 blog posts for each site category."
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Update existing seeded posts instead of only inserting missing posts.",
    )
    args = parser.parse_args()

    db = get_db()
    categories = db["categories"]
    posts = db["blog_posts"]
    categories.create_index("id", unique=True)
    categories.create_index("slug", unique=True)
    posts.create_index("id", unique=True)
    posts.create_index([("isFeatured", -1), ("createdAt", -1)])

    now = datetime.now(timezone.utc)
    ensure_categories(categories, now)

    inserted = 0
    updated = 0
    skipped = 0
    for post in build_posts(now):
        if args.refresh:
            result = posts.update_one(
                {"id": post["id"]},
                {"$set": post},
                upsert=True,
            )
            if result.upserted_id:
                inserted += 1
            else:
                updated += result.modified_count
        else:
            result = posts.update_one(
                {"id": post["id"]},
                {"$setOnInsert": post},
                upsert=True,
            )
            if result.upserted_id:
                inserted += 1
            else:
                skipped += 1

    print(
        f"Seed completed: {inserted} inserted, {updated} updated, {skipped} skipped."
    )
    print(f"Total prepared posts: {sum(len(item['topics']) for item in CATEGORY_DATA)}")
    get_app_client().close()
    return 0


def ensure_categories(collection, now: datetime) -> None:
    for category in CATEGORY_DATA:
        category_doc = CategoryDocument(
            id=stable_id("cat", category["name"]),
            name=category["name"],
            slug=slugify(category["name"]),
            description=category["description"],
            created_at=now,
            updated_at=now,
        ).model_dump(by_alias=True, exclude_none=True)
        collection.update_one(
            {"name": category["name"]},
            {"$setOnInsert": category_doc},
            upsert=True,
        )


def build_posts(now: datetime) -> list[dict]:
    blog_posts = []
    order = 0
    for category in CATEGORY_DATA:
        for index, topic in enumerate(category["topics"], start=1):
            created_at = now - timedelta(minutes=order)
            content = build_content(category["name"], topic)
            doc = BlogPostDocument(
                id=stable_id("blog", f"{category['name']}::{topic['title']}"),
                title=topic["title"],
                slug=slugify(topic["title"]),
                category=category["name"],
                readTime=estimate_read_time(content),
                excerpt=topic["excerpt"],
                content=content,
                imageUrl=category["imageUrl"],
                author=AUTHOR,
                tags=topic["tags"],
                isFeatured=index == 1,
                createdAt=created_at.isoformat(),
                updatedAt=now.isoformat(),
            )
            blog_posts.append(doc.model_dump(by_alias=True, exclude_none=True))
            order += 1
    return blog_posts


def build_content(category_name: str, topic: dict) -> str:
    point_items = "".join(f"<li>{escape_html(point)}</li>" for point in topic["points"])
    return (
        f"<h2>{escape_html(topic['title'])}</h2>"
        f"<p>{escape_html(topic['excerpt'])}</p>"
        f"<h3>Bối cảnh triển khai</h3>"
        f"<p>Với nhóm nội dung {escape_html(category_name)}, doanh nghiệp nên bắt đầu từ mục tiêu kinh doanh, "
        "chân dung khách hàng và dữ liệu hiện có. Khi ba yếu tố này rõ ràng, đội ngũ có thể ưu tiên đúng việc "
        "thay vì triển khai nhiều hạng mục rời rạc.</p>"
        f"<h3>Các bước nên làm</h3>"
        f"<ul>{point_items}</ul>"
        f"<h3>Cách đo hiệu quả</h3>"
        "<p>Hãy gắn từng thay đổi với một chỉ số cụ thể như lượt liên hệ, tỉ lệ gửi form, chất lượng lead, "
        "traffic tự nhiên hoặc chi phí trên mỗi chuyển đổi. Việc đo lường theo tuần giúp phát hiện sớm điểm nghẽn "
        "và điều chỉnh trước khi ngân sách hoặc thời gian bị lãng phí.</p>"
        f"<aside class=\"blog-callout\"><strong>Gợi ý áp dụng:</strong>"
        "<p>Chọn một hạng mục nhỏ để thử trong 7-14 ngày, ghi lại kết quả, sau đó mới mở rộng thành quy trình chuẩn.</p>"
        "</aside>"
        f"<h3>Kết luận</h3>"
        "<p>Một bài viết hiệu quả không chỉ cung cấp thông tin, mà còn giúp người đọc biết bước tiếp theo cần làm. "
        "Khi nội dung, thiết kế và đo lường cùng phục vụ một mục tiêu, hiệu quả chuyển đổi sẽ rõ ràng hơn.</p>"
    )


def estimate_read_time(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    words = [word for word in text.split() if word]
    minutes = max(1, (len(words) + 219) // 220)
    return f"{minutes} phút đọc"


def stable_id(prefix: str, value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]
    return f"{prefix}-{digest}"


def slugify(value: str) -> str:
    slug = unicodedata.normalize("NFD", value.strip().lower())
    slug = "".join(char for char in slug if unicodedata.category(char) != "Mn")
    slug = slug.replace("đ", "d")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-") or "danh-muc"


def escape_html(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )


if __name__ == "__main__":
    raise SystemExit(main())
