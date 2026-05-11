# Danh sách Use Case hệ thống Nova Business RAG Chatbot

Tài liệu này mô tả các use case chính của hệ thống dựa trên 2 giao diện:

- Giao diện khách hàng/User: xem nội dung dịch vụ, blog, đăng nhập Google, chatbot tư vấn và lịch sử chat.
- Giao diện quản trị/Admin: quản lý nội dung, bài viết blog, tài liệu RAG và dashboard tổng quan.

## Use case chung

### Đăng nhập

**Tên Usecase**  
Đăng nhập

**Tác nhân**  
Người dùng, Quản trị viên

**Mô tả**  
Người dùng hoặc quản trị viên đăng nhập vào hệ thống bằng tài khoản được cung cấp hoặc tài khoản Google. Hệ thống kiểm tra thông tin xác thực, xác định vai trò tài khoản và chuyển đến giao diện phù hợp. Nếu là người dùng, hệ thống chuyển đến giao diện khách hàng. Nếu là quản trị viên, hệ thống chuyển đến giao diện quản trị.

**Luồng sự kiện**

1. Người dùng hoặc quản trị viên chọn chức năng "Đăng nhập".
2. Hệ thống hiển thị giao diện đăng nhập.
3. Người dùng hoặc quản trị viên chọn vai trò đăng nhập: User hoặc Admin.
4. Người dùng hoặc quản trị viên nhập email/mật khẩu hoặc chọn đăng nhập bằng Google.
5. Hệ thống kiểm tra thông tin xác thực.
6. Hệ thống kiểm tra vai trò của tài khoản.
7. Nếu thông tin hợp lệ, hệ thống tạo phiên đăng nhập.
8. Hệ thống lưu thông tin phiên đăng nhập ở giao diện.
9. Hệ thống chuyển tài khoản đến giao diện tương ứng với vai trò.

**Ngoại lệ**

- Nếu email hoặc mật khẩu không đúng, hệ thống hiển thị thông báo lỗi.
- Nếu đăng nhập Google thất bại, hệ thống yêu cầu đăng nhập lại.
- Nếu người dùng chọn sai vai trò, hệ thống từ chối đăng nhập.
- Nếu tài khoản Google đăng nhập với vai trò Admin nhưng email admin chưa được cấp trong hệ thống, hệ thống từ chối đăng nhập.
- Nếu vượt quá số lần đăng nhập cho phép, hệ thống yêu cầu thử lại sau.

**Sự kiện kích hoạt**  
Người dùng hoặc quản trị viên chọn chức năng "Đăng nhập".

**Mục tiêu**  
Cho phép tài khoản truy cập vào hệ thống theo đúng vai trò để sử dụng các chức năng tương ứng.

**Tiền điều kiện**  
Tài khoản tồn tại trong hệ thống hoặc có tài khoản Google hợp lệ. Tài khoản quản trị phải được cấp quyền Admin trước.

**Hậu điều kiện**  
Tài khoản đăng nhập thành công, phiên đăng nhập được tạo và hệ thống chuyển đến giao diện phù hợp.

### Đăng xuất

**Tên Usecase**  
Đăng xuất

**Tác nhân**  
Người dùng, Quản trị viên

**Mô tả**  
Người dùng hoặc quản trị viên đăng xuất khỏi hệ thống. Hệ thống xóa phiên đăng nhập, xóa dữ liệu phiên cục bộ liên quan và chuyển về giao diện khách hàng.

**Luồng sự kiện**

1. Người dùng hoặc quản trị viên chọn chức năng "Đăng xuất".
2. Hệ thống kiểm tra trạng thái phiên đăng nhập hiện tại.
3. Hệ thống xóa thông tin phiên đăng nhập khỏi bộ nhớ cục bộ.
4. Hệ thống xóa phiên chat cục bộ của tài khoản nếu có.
5. Hệ thống đặt lại trạng thái đăng nhập.
6. Hệ thống chuyển về giao diện khách hàng.

**Ngoại lệ**

- Nếu phiên đăng nhập đã hết hạn, hệ thống vẫn xóa dữ liệu phiên cục bộ.
- Nếu không tìm thấy dữ liệu phiên, hệ thống vẫn chuyển người dùng về trạng thái chưa đăng nhập.

**Sự kiện kích hoạt**  
Người dùng hoặc quản trị viên chọn nút "Đăng xuất".

**Mục tiêu**  
Kết thúc phiên sử dụng hệ thống của tài khoản đang đăng nhập.

**Tiền điều kiện**  
Người dùng hoặc quản trị viên đang đăng nhập.

**Hậu điều kiện**  
Tài khoản không còn phiên đăng nhập trong hệ thống và được chuyển về giao diện khách hàng.

## 1. Giao diện khách hàng/User

### 1.1. Xem trang giới thiệu dịch vụ

**Tên Usecase**  
Xem trang giới thiệu dịch vụ

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem nội dung trang chủ giới thiệu các dịch vụ, điểm đau khách hàng và điểm mạnh của công ty.

**Luồng sự kiện**

1. Người dùng truy cập giao diện khách hàng.
2. Hệ thống hiển thị trang chủ.
3. Người dùng chọn tab "Trang chủ" nếu đang ở tab khác.
4. Hệ thống hiển thị danh sách dịch vụ, vấn đề khách hàng và điểm mạnh công ty.

**Ngoại lệ**

- Nếu dữ liệu không tải được, hệ thống hiển thị nội dung mặc định hoặc thông báo lỗi.

**Sự kiện kích hoạt**  
Người dùng truy cập hệ thống hoặc chọn tab "Trang chủ".

**Mục tiêu**  
Giúp người dùng nắm được tổng quan dịch vụ của công ty.

**Tiền điều kiện**  
Không yêu cầu đăng nhập.

**Hậu điều kiện**  
Người dùng xem được nội dung giới thiệu dịch vụ.

### 1.2. Xem thông tin dịch vụ SEO

**Tên Usecase**  
Xem thông tin dịch vụ SEO

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem thông tin về dịch vụ SEO, gồm chỉ số hiệu suất, các gói dịch vụ và lộ trình triển khai.

**Luồng sự kiện**

1. Người dùng chọn tab "Dịch vụ SEO".
2. Hệ thống tải nội dung dịch vụ SEO.
3. Hệ thống hiển thị chỉ số, gói dịch vụ và lộ trình triển khai.
4. Người dùng đọc thông tin hoặc chọn chatbot để được tư vấn thêm.

**Ngoại lệ**

- Nếu dữ liệu không tải được, hệ thống hiển thị thông báo lỗi hoặc dữ liệu mặc định.

**Sự kiện kích hoạt**  
Người dùng chọn tab "Dịch vụ SEO".

**Mục tiêu**  
Cung cấp thông tin dịch vụ SEO cho người dùng.

**Tiền điều kiện**  
Không yêu cầu đăng nhập.

**Hậu điều kiện**  
Người dùng xem được nội dung dịch vụ SEO.

### 1.3. Xem thông tin dịch vụ thiết kế website

**Tên Usecase**  
Xem thông tin dịch vụ thiết kế website

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem thông tin về dịch vụ thiết kế website, gồm các giai đoạn triển khai và điểm nổi bật của dịch vụ.

**Luồng sự kiện**

1. Người dùng chọn tab "Thiết kế Web".
2. Hệ thống tải nội dung dịch vụ thiết kế website.
3. Hệ thống hiển thị các giai đoạn triển khai và điểm nổi bật.
4. Người dùng xem thông tin hoặc yêu cầu tư vấn qua chatbot.

**Ngoại lệ**

- Nếu dữ liệu không tải được, hệ thống hiển thị thông báo lỗi hoặc dữ liệu mặc định.

**Sự kiện kích hoạt**  
Người dùng chọn tab "Thiết kế Web".

**Mục tiêu**  
Cung cấp thông tin dịch vụ thiết kế website cho người dùng.

**Tiền điều kiện**  
Không yêu cầu đăng nhập.

**Hậu điều kiện**  
Người dùng xem được nội dung dịch vụ thiết kế website.

### 1.4. Xem thông tin dịch vụ quảng cáo

**Tên Usecase**  
Xem thông tin dịch vụ quảng cáo

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem thông tin về dịch vụ quảng cáo, gồm các chỉ số hiệu quả và các kênh quảng cáo được triển khai.

**Luồng sự kiện**

1. Người dùng chọn tab "Quảng cáo".
2. Hệ thống tải nội dung dịch vụ quảng cáo.
3. Hệ thống hiển thị chỉ số hiệu quả và danh sách kênh quảng cáo.
4. Người dùng xem thông tin hoặc chọn chatbot để được tư vấn thêm.

**Ngoại lệ**

- Nếu dữ liệu không tải được, hệ thống hiển thị thông báo lỗi hoặc dữ liệu mặc định.

**Sự kiện kích hoạt**  
Người dùng chọn tab "Quảng cáo".

**Mục tiêu**  
Cung cấp thông tin dịch vụ quảng cáo cho người dùng.

**Tiền điều kiện**  
Không yêu cầu đăng nhập.

**Hậu điều kiện**  
Người dùng xem được nội dung dịch vụ quảng cáo.

### 1.5. Xem danh sách bài viết blog

**Tên Usecase**  
Xem danh sách bài viết blog

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem danh sách bài viết blog được quản trị viên tạo trong hệ thống. Hệ thống hiển thị bài viết nổi bật, danh sách bài viết và thông tin chủ đề.

**Luồng sự kiện**

1. Người dùng chọn tab "Blog".
2. Hệ thống gọi API lấy danh sách bài viết.
3. Hệ thống xác định bài viết nổi bật nếu có.
4. Hệ thống hiển thị bài viết nổi bật và danh sách bài viết còn lại.
5. Người dùng chọn bài viết để xem thêm.

**Ngoại lệ**

- Nếu không có bài viết, hệ thống hiển thị thông báo "Chưa có bài viết nào".
- Nếu tải dữ liệu thất bại, hệ thống hiển thị thông báo không tải được bài viết.

**Sự kiện kích hoạt**  
Người dùng chọn tab "Blog".

**Mục tiêu**  
Cho phép người dùng xem nội dung blog của hệ thống.

**Tiền điều kiện**  
Không yêu cầu đăng nhập.

**Hậu điều kiện**  
Danh sách bài viết blog được hiển thị.

### 1.6. Xem chi tiết bài viết blog

**Tên Usecase**  
Xem chi tiết bài viết blog

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng xem thông tin chi tiết của một bài viết blog, gồm tiêu đề, chủ đề, thời gian đọc và nội dung mô tả.

**Luồng sự kiện**

1. Người dùng mở danh sách bài viết blog.
2. Người dùng chọn "Đọc chi tiết" tại một bài viết.
3. Hệ thống xác định bài viết được chọn.
4. Hệ thống hiển thị thông tin chi tiết bài viết.

**Ngoại lệ**

- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo không tìm thấy bài viết.
- Nếu dữ liệu bài viết không tải được, hệ thống yêu cầu người dùng thử lại.

**Sự kiện kích hoạt**  
Người dùng chọn một bài viết blog.

**Mục tiêu**  
Cho phép người dùng đọc nội dung chi tiết của bài viết.

**Tiền điều kiện**  
Bài viết tồn tại trong hệ thống.

**Hậu điều kiện**  
Chi tiết bài viết được hiển thị cho người dùng.

### 1.7. Tìm kiếm bài viết

**Tên Usecase**  
Tìm kiếm bài viết

**Tác nhân**  
Người dùng, Khách truy cập

**Mô tả**  
Người dùng nhập từ khóa để tìm kiếm bài viết blog theo tiêu đề, chủ đề hoặc nội dung mô tả.

**Luồng sự kiện**

1. Người dùng mở tab "Blog".
2. Người dùng nhập từ khóa tìm kiếm.
3. Hệ thống kiểm tra từ khóa.
4. Hệ thống lọc danh sách bài viết phù hợp.
5. Hệ thống hiển thị kết quả tìm kiếm.

**Ngoại lệ**

- Nếu từ khóa rỗng, hệ thống hiển thị toàn bộ danh sách bài viết.
- Nếu không có bài viết phù hợp, hệ thống hiển thị thông báo không tìm thấy kết quả.

**Sự kiện kích hoạt**  
Người dùng nhập từ khóa vào ô tìm kiếm bài viết.

**Mục tiêu**  
Giúp người dùng nhanh chóng tìm được bài viết cần đọc.

**Tiền điều kiện**  
Hệ thống có danh sách bài viết blog.

**Hậu điều kiện**  
Danh sách bài viết phù hợp với từ khóa được hiển thị.

### 1.8. Yêu thích bài viết

**Tên Usecase**  
Yêu thích bài viết

**Tác nhân**  
Người dùng

**Mô tả**  
Người dùng đánh dấu một bài viết blog là yêu thích để lưu lại và xem lại sau.

**Luồng sự kiện**

1. Người dùng đăng nhập vào hệ thống.
2. Người dùng mở danh sách hoặc chi tiết bài viết blog.
3. Người dùng chọn chức năng "Yêu thích".
4. Hệ thống kiểm tra trạng thái đăng nhập.
5. Hệ thống lưu bài viết vào danh sách yêu thích của người dùng.
6. Hệ thống cập nhật trạng thái yêu thích trên giao diện.

**Ngoại lệ**

- Nếu người dùng chưa đăng nhập, hệ thống yêu cầu đăng nhập.
- Nếu bài viết đã được yêu thích trước đó, hệ thống giữ nguyên trạng thái hiện tại.
- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo lỗi.

**Sự kiện kích hoạt**  
Người dùng chọn nút yêu thích bài viết.

**Mục tiêu**  
Cho phép người dùng lưu lại bài viết quan tâm.

**Tiền điều kiện**  
Người dùng đã đăng nhập và bài viết tồn tại.

**Hậu điều kiện**  
Bài viết được thêm vào danh sách yêu thích của người dùng.

### 1.9. Bỏ yêu thích bài viết

**Tên Usecase**  
Bỏ yêu thích bài viết

**Tác nhân**  
Người dùng

**Mô tả**  
Người dùng bỏ đánh dấu yêu thích đối với một bài viết blog đã lưu trước đó.

**Luồng sự kiện**

1. Người dùng đăng nhập vào hệ thống.
2. Người dùng mở bài viết đã được yêu thích.
3. Người dùng chọn chức năng "Bỏ yêu thích".
4. Hệ thống kiểm tra trạng thái đăng nhập.
5. Hệ thống xóa bài viết khỏi danh sách yêu thích của người dùng.
6. Hệ thống cập nhật trạng thái trên giao diện.

**Ngoại lệ**

- Nếu người dùng chưa đăng nhập, hệ thống yêu cầu đăng nhập.
- Nếu bài viết chưa được yêu thích, hệ thống giữ nguyên trạng thái hiện tại.
- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo lỗi.

**Sự kiện kích hoạt**  
Người dùng chọn nút bỏ yêu thích bài viết.

**Mục tiêu**  
Cho phép người dùng quản lý danh sách bài viết yêu thích.

**Tiền điều kiện**  
Người dùng đã đăng nhập và bài viết đang ở trạng thái yêu thích.

**Hậu điều kiện**  
Bài viết được xóa khỏi danh sách yêu thích của người dùng.

### 1.10. Sử dụng chatbot tư vấn

**Tên Usecase**  
Sử dụng chatbot tư vấn

**Tác nhân**  
Người dùng, Quản trị viên

**Mô tả**  
Người dùng gửi câu hỏi cho chatbot. Hệ thống sử dụng RAG để tìm tài liệu liên quan trong kho tri thức, tạo câu trả lời và trả kết quả dạng streaming cho giao diện.

**Luồng sự kiện**

1. Người dùng đăng nhập vào hệ thống.
2. Người dùng mở chatbot tư vấn.
3. Người dùng nhập câu hỏi.
4. Hệ thống kiểm tra phiên đăng nhập.
5. Hệ thống tạo hoặc lấy phiên chat hiện tại.
6. Hệ thống tìm kiếm tài liệu liên quan trong vector database.
7. Hệ thống gửi ngữ cảnh và câu hỏi đến mô hình AI.
8. Hệ thống stream câu trả lời về giao diện.
9. Hệ thống lưu lịch sử câu hỏi và câu trả lời vào phiên chat.

**Ngoại lệ**

- Nếu người dùng chưa đăng nhập, hệ thống yêu cầu đăng nhập.
- Nếu câu hỏi rỗng, hệ thống yêu cầu nhập nội dung.
- Nếu không tìm thấy tài liệu phù hợp, chatbot thông báo chưa tìm thấy dữ liệu phù hợp trong kho tri thức.
- Nếu phiên đăng nhập hết hạn, hệ thống yêu cầu đăng nhập lại.

**Sự kiện kích hoạt**  
Người dùng gửi câu hỏi trong chatbot.

**Mục tiêu**  
Tư vấn dịch vụ cho người dùng dựa trên tài liệu nội bộ đã được quản trị viên tải lên.

**Tiền điều kiện**  
Người dùng đã đăng nhập và hệ thống chatbot được cấu hình đầy đủ.

**Hậu điều kiện**  
Người dùng nhận được câu trả lời tư vấn và lịch sử chat được cập nhật.

### 1.11. Xem lịch sử tư vấn/chat

**Tên Usecase**  
Xem lịch sử tư vấn/chat

**Tác nhân**  
Người dùng, Quản trị viên

**Mô tả**  
Người dùng đã đăng nhập xem lại các phiên tư vấn/chat trước đó của mình.

**Luồng sự kiện**

1. Người dùng đăng nhập vào hệ thống.
2. Người dùng mở chatbot hoặc khu vực lịch sử tư vấn.
3. Hệ thống kiểm tra phiên đăng nhập.
4. Hệ thống lấy danh sách phiên chat của tài khoản.
5. Người dùng chọn một phiên chat.
6. Hệ thống hiển thị nội dung tin nhắn trong phiên chat.

**Ngoại lệ**

- Nếu người dùng chưa đăng nhập, hệ thống yêu cầu đăng nhập.
- Nếu chưa có lịch sử chat, hệ thống hiển thị trạng thái rỗng.
- Nếu phiên chat không thuộc tài khoản hiện tại, hệ thống từ chối truy cập.

**Sự kiện kích hoạt**  
Người dùng chọn xem lịch sử tư vấn/chat.

**Mục tiêu**  
Cho phép người dùng xem lại nội dung tư vấn trước đó.

**Tiền điều kiện**  
Người dùng đã đăng nhập.

**Hậu điều kiện**  
Lịch sử tư vấn/chat được hiển thị.

## 2. Giao diện quản trị/Admin

### 2.1. Quản lý nội dung trang chủ

**Tên Usecase**  
Quản lý nội dung trang chủ

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên quản lý nội dung hiển thị trên trang chủ khách hàng, gồm dịch vụ, điểm đau khách hàng và điểm mạnh công ty.

**Luồng sự kiện**

1. Quản trị viên đăng nhập vào giao diện quản trị.
2. Quản trị viên chọn menu "Trang chủ".
3. Hệ thống hiển thị danh sách nhóm nội dung trang chủ.
4. Quản trị viên thêm, chỉnh sửa hoặc xóa nội dung.
5. Hệ thống kiểm tra dữ liệu nhập.
6. Hệ thống lưu thay đổi.
7. Hệ thống cập nhật danh sách nội dung trên giao diện.

**Ngoại lệ**

- Nếu dữ liệu bắt buộc bị bỏ trống, hệ thống yêu cầu nhập đầy đủ.
- Nếu phiên đăng nhập không hợp lệ, hệ thống từ chối thao tác.
- Nếu thao tác lưu thất bại, hệ thống hiển thị thông báo lỗi.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Trang chủ".

**Mục tiêu**  
Cho phép quản trị viên cập nhật nội dung trang chủ hiển thị cho khách hàng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Nội dung trang chủ được cập nhật trong hệ thống.

### 2.2. Quản lý nội dung dịch vụ SEO

**Tên Usecase**  
Quản lý nội dung dịch vụ SEO

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên quản lý nội dung dịch vụ SEO, gồm chỉ số hiệu suất, gói dịch vụ và lộ trình triển khai.

**Luồng sự kiện**

1. Quản trị viên chọn menu "Dịch vụ SEO".
2. Hệ thống hiển thị các nhóm nội dung SEO.
3. Quản trị viên chọn thêm, chỉnh sửa hoặc xóa nội dung.
4. Hệ thống hiển thị biểu mẫu nhập liệu.
5. Quản trị viên nhập thông tin và lưu.
6. Hệ thống kiểm tra dữ liệu.
7. Hệ thống lưu thay đổi và cập nhật danh sách.

**Ngoại lệ**

- Nếu dữ liệu không hợp lệ, hệ thống yêu cầu chỉnh sửa.
- Nếu nội dung cần sửa hoặc xóa không tồn tại, hệ thống hiển thị thông báo lỗi.
- Nếu tài khoản không phải admin, hệ thống từ chối thao tác.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Dịch vụ SEO".

**Mục tiêu**  
Cập nhật nội dung dịch vụ SEO hiển thị ở giao diện khách hàng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Nội dung dịch vụ SEO được cập nhật.

### 2.3. Quản lý nội dung thiết kế website

**Tên Usecase**  
Quản lý nội dung thiết kế website

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên quản lý nội dung dịch vụ thiết kế website, gồm các giai đoạn triển khai và điểm nổi bật.

**Luồng sự kiện**

1. Quản trị viên chọn menu "Thiết kế Web".
2. Hệ thống hiển thị danh sách giai đoạn và điểm nổi bật.
3. Quản trị viên thêm, chỉnh sửa hoặc xóa nội dung.
4. Hệ thống hiển thị biểu mẫu tương ứng.
5. Quản trị viên nhập dữ liệu và lưu.
6. Hệ thống kiểm tra và lưu thay đổi.
7. Hệ thống cập nhật lại danh sách.

**Ngoại lệ**

- Nếu dữ liệu bắt buộc bị thiếu, hệ thống yêu cầu bổ sung.
- Nếu nội dung không tồn tại, hệ thống hiển thị thông báo lỗi.
- Nếu phiên đăng nhập hết hạn, hệ thống yêu cầu đăng nhập lại.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Thiết kế Web".

**Mục tiêu**  
Cập nhật nội dung dịch vụ thiết kế website cho người dùng xem.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Nội dung thiết kế website được cập nhật.

### 2.4. Quản lý nội dung quảng cáo

**Tên Usecase**  
Quản lý nội dung quảng cáo

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên quản lý nội dung dịch vụ quảng cáo, gồm chỉ số hiệu quả và các kênh quảng cáo.

**Luồng sự kiện**

1. Quản trị viên chọn menu "Quảng cáo".
2. Hệ thống hiển thị danh sách chỉ số và kênh quảng cáo.
3. Quản trị viên thêm, chỉnh sửa hoặc xóa nội dung.
4. Hệ thống hiển thị biểu mẫu nhập liệu.
5. Quản trị viên lưu thông tin.
6. Hệ thống kiểm tra và lưu dữ liệu.
7. Hệ thống cập nhật danh sách nội dung.

**Ngoại lệ**

- Nếu dữ liệu không hợp lệ, hệ thống hiển thị lỗi.
- Nếu nội dung cần thao tác không tồn tại, hệ thống thông báo không tìm thấy.
- Nếu tài khoản không có quyền admin, hệ thống từ chối thao tác.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Quảng cáo".

**Mục tiêu**  
Cho phép quản trị viên cập nhật nội dung quảng cáo hiển thị cho khách hàng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Nội dung quảng cáo được cập nhật.

### 2.5. Quản lý bài viết blog

**Tên Usecase**  
Quản lý bài viết blog

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên xem và quản lý danh sách bài viết blog trong hệ thống.

**Luồng sự kiện**

1. Quản trị viên chọn menu "Blog".
2. Hệ thống hiển thị danh sách bài viết.
3. Quản trị viên có thể lọc bài viết theo chủ đề.
4. Quản trị viên chọn thêm, chỉnh sửa, xóa hoặc đánh dấu nổi bật.
5. Hệ thống thực hiện thao tác tương ứng.
6. Hệ thống cập nhật danh sách bài viết.

**Ngoại lệ**

- Nếu không có bài viết, hệ thống hiển thị trạng thái rỗng.
- Nếu tải danh sách thất bại, hệ thống hiển thị thông báo lỗi.
- Nếu phiên admin không hợp lệ, hệ thống từ chối truy cập.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Blog".

**Mục tiêu**  
Cho phép quản trị viên kiểm soát nội dung blog hiển thị cho người dùng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Danh sách bài viết blog được hiển thị và sẵn sàng quản lý.

### 2.6. Thêm bài viết blog

**Tên Usecase**  
Thêm bài viết blog

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên tạo bài viết blog mới với tiêu đề, chủ đề, thời gian đọc, mô tả và trạng thái nổi bật.

**Luồng sự kiện**

1. Quản trị viên mở trang quản lý Blog.
2. Quản trị viên chọn "Thêm mới".
3. Hệ thống hiển thị form thêm bài viết.
4. Quản trị viên nhập thông tin bài viết.
5. Quản trị viên chọn trạng thái nổi bật nếu cần.
6. Quản trị viên chọn lưu.
7. Hệ thống kiểm tra dữ liệu.
8. Hệ thống tạo bài viết mới và cập nhật danh sách.

**Ngoại lệ**

- Nếu tiêu đề hoặc thông tin bắt buộc bị trống, hệ thống yêu cầu nhập đầy đủ.
- Nếu tạo bài viết thất bại, hệ thống hiển thị thông báo lỗi.

**Sự kiện kích hoạt**  
Quản trị viên chọn chức năng "Thêm mới" trong trang Blog.

**Mục tiêu**  
Tạo bài viết blog mới cho hệ thống.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Bài viết mới được lưu và hiển thị trong danh sách blog.

### 2.7. Chỉnh sửa bài viết blog

**Tên Usecase**  
Chỉnh sửa bài viết blog

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên cập nhật thông tin một bài viết blog đã có trong hệ thống.

**Luồng sự kiện**

1. Quản trị viên mở trang quản lý Blog.
2. Quản trị viên chọn bài viết cần chỉnh sửa.
3. Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại.
4. Quản trị viên cập nhật thông tin.
5. Quản trị viên chọn lưu.
6. Hệ thống kiểm tra dữ liệu.
7. Hệ thống cập nhật bài viết.
8. Hệ thống làm mới danh sách bài viết.

**Ngoại lệ**

- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo không tìm thấy.
- Nếu dữ liệu không hợp lệ, hệ thống yêu cầu chỉnh sửa.
- Nếu phiên admin hết hạn, hệ thống yêu cầu đăng nhập lại.

**Sự kiện kích hoạt**  
Quản trị viên chọn chức năng chỉnh sửa bài viết.

**Mục tiêu**  
Cập nhật nội dung bài viết blog.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập và bài viết tồn tại.

**Hậu điều kiện**  
Bài viết được cập nhật trong hệ thống.

### 2.8. Xóa bài viết blog

**Tên Usecase**  
Xóa bài viết blog

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên xóa bài viết blog không còn cần hiển thị trong hệ thống.

**Luồng sự kiện**

1. Quản trị viên mở trang quản lý Blog.
2. Quản trị viên chọn bài viết cần xóa.
3. Hệ thống hiển thị hộp thoại xác nhận.
4. Quản trị viên xác nhận xóa.
5. Hệ thống xóa bài viết.
6. Hệ thống cập nhật danh sách bài viết.

**Ngoại lệ**

- Nếu quản trị viên hủy xác nhận, hệ thống không xóa bài viết.
- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo lỗi.
- Nếu xóa thất bại, hệ thống thông báo cho quản trị viên.

**Sự kiện kích hoạt**  
Quản trị viên chọn chức năng xóa bài viết.

**Mục tiêu**  
Loại bỏ bài viết không còn phù hợp khỏi hệ thống.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập và bài viết tồn tại.

**Hậu điều kiện**  
Bài viết bị xóa khỏi danh sách blog.

### 2.9. Đánh dấu bài viết nổi bật

**Tên Usecase**  
Đánh dấu bài viết nổi bật

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên bật hoặc tắt trạng thái nổi bật của bài viết blog để bài viết được ưu tiên hiển thị ở giao diện khách hàng.

**Luồng sự kiện**

1. Quản trị viên mở trang quản lý Blog.
2. Quản trị viên chọn bài viết cần thay đổi trạng thái nổi bật.
3. Quản trị viên chọn chức năng đánh dấu nổi bật.
4. Hệ thống đổi trạng thái `isFeatured` của bài viết.
5. Hệ thống cập nhật bài viết trên danh sách.
6. Giao diện khách hàng hiển thị bài viết nổi bật theo trạng thái mới.

**Ngoại lệ**

- Nếu bài viết không tồn tại, hệ thống hiển thị thông báo lỗi.
- Nếu cập nhật thất bại, hệ thống giữ nguyên trạng thái cũ.

**Sự kiện kích hoạt**  
Quản trị viên chọn nút đánh dấu/bỏ đánh dấu nổi bật.

**Mục tiêu**  
Ưu tiên hiển thị bài viết quan trọng trên trang Blog của khách hàng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập và bài viết tồn tại.

**Hậu điều kiện**  
Trạng thái nổi bật của bài viết được cập nhật.

### 2.10. Quản lý tài liệu RAG cho chatbot

**Tên Usecase**  
Quản lý tài liệu RAG cho chatbot

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên quản lý danh sách tài liệu dùng làm kho tri thức cho chatbot RAG.

**Luồng sự kiện**

1. Quản trị viên chọn menu "Tài liệu RAG".
2. Hệ thống tải danh sách tài liệu đã upload.
3. Hệ thống hiển thị tên file, loại file, trạng thái và thời gian tải lên.
4. Quản trị viên có thể tải tài liệu mới hoặc xóa tài liệu cũ.

**Ngoại lệ**

- Nếu chưa có tài liệu, hệ thống hiển thị trạng thái rỗng.
- Nếu tải danh sách thất bại, hệ thống hiển thị thông báo lỗi.
- Nếu tài khoản không phải admin, hệ thống từ chối truy cập.

**Sự kiện kích hoạt**  
Quản trị viên chọn menu "Tài liệu RAG".

**Mục tiêu**  
Cho phép quản trị viên kiểm soát kho tri thức mà chatbot sử dụng.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Danh sách tài liệu RAG được hiển thị.

### 2.11. Tải tài liệu lên hệ thống

**Tên Usecase**  
Tải tài liệu lên hệ thống

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên tải tài liệu PDF, DOC, DOCX hoặc TXT lên hệ thống. Hệ thống trích xuất văn bản, chia nhỏ nội dung, tạo embedding và lưu vào vector database để chatbot sử dụng.

**Luồng sự kiện**

1. Quản trị viên mở trang "Tài liệu RAG".
2. Quản trị viên chọn file cần tải lên.
3. Hệ thống kiểm tra định dạng và dung lượng file.
4. Hệ thống tải file lên server.
5. Hệ thống trích xuất nội dung văn bản từ file.
6. Hệ thống chia nội dung thành các đoạn nhỏ.
7. Hệ thống tạo embedding cho từng đoạn.
8. Hệ thống lưu metadata tài liệu và vector vào database.
9. Hệ thống cập nhật danh sách tài liệu.

**Ngoại lệ**

- Nếu file sai định dạng, hệ thống từ chối tải lên.
- Nếu file vượt quá dung lượng cho phép, hệ thống hiển thị thông báo lỗi.
- Nếu không trích xuất được nội dung, hệ thống thông báo tải lên thất bại.
- Nếu phiên admin hết hạn, hệ thống yêu cầu đăng nhập lại.

**Sự kiện kích hoạt**  
Quản trị viên chọn file và thực hiện tải lên.

**Mục tiêu**  
Bổ sung tài liệu vào kho tri thức của chatbot.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập và file thuộc định dạng được hỗ trợ.

**Hậu điều kiện**  
Tài liệu được lưu vào hệ thống và có thể được chatbot truy xuất.

### 2.12. Xóa tài liệu khỏi hệ thống

**Tên Usecase**  
Xóa tài liệu khỏi hệ thống

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên xóa tài liệu khỏi kho tri thức. Hệ thống xóa metadata, file lưu trữ và vector liên quan đến tài liệu.

**Luồng sự kiện**

1. Quản trị viên mở trang "Tài liệu RAG".
2. Quản trị viên chọn tài liệu cần xóa.
3. Hệ thống yêu cầu xác nhận xóa.
4. Quản trị viên xác nhận.
5. Hệ thống xóa metadata tài liệu.
6. Hệ thống xóa file khỏi thư mục lưu trữ.
7. Hệ thống xóa vector chunks tương ứng trong vector database.
8. Hệ thống cập nhật danh sách tài liệu.

**Ngoại lệ**

- Nếu quản trị viên hủy xác nhận, hệ thống không xóa tài liệu.
- Nếu tài liệu không tồn tại, hệ thống hiển thị thông báo lỗi.
- Nếu xóa vector hoặc file thất bại, hệ thống thông báo lỗi xử lý.

**Sự kiện kích hoạt**  
Quản trị viên chọn chức năng xóa tài liệu.

**Mục tiêu**  
Loại bỏ tài liệu không còn sử dụng khỏi kho tri thức chatbot.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập và tài liệu tồn tại.

**Hậu điều kiện**  
Tài liệu và dữ liệu vector liên quan bị xóa khỏi hệ thống.

### 2.13. Xem tổng quan số lượng nội dung, bài viết, tài liệu

**Tên Usecase**  
Xem tổng quan số lượng nội dung, bài viết, tài liệu

**Tác nhân**  
Quản trị viên

**Mô tả**  
Quản trị viên xem dashboard tổng quan gồm số lượng nhóm nội dung dịch vụ, bài viết blog, tài liệu RAG và các nội dung quản trị khác.

**Luồng sự kiện**

1. Quản trị viên đăng nhập vào giao diện quản trị.
2. Hệ thống mở trang Dashboard mặc định.
3. Hệ thống tải dữ liệu từ các nhóm nội dung, blog và tài liệu.
4. Hệ thống tính toán số lượng từng nhóm.
5. Hệ thống hiển thị các thẻ thống kê và danh sách bài viết gần đây.

**Ngoại lệ**

- Nếu một nhóm dữ liệu không tải được, hệ thống hiển thị giá trị mặc định hoặc thông báo lỗi.
- Nếu phiên đăng nhập không hợp lệ, hệ thống chuyển về đăng nhập.

**Sự kiện kích hoạt**  
Quản trị viên mở giao diện quản trị hoặc chọn menu Dashboard.

**Mục tiêu**  
Giúp quản trị viên nắm nhanh tình trạng nội dung trong hệ thống.

**Tiền điều kiện**  
Quản trị viên đã đăng nhập.

**Hậu điều kiện**  
Dashboard tổng quan được hiển thị.
