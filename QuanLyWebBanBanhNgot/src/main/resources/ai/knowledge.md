# DeliciousBakery - Knowledge Base

## GIỚI THIỆU VỀ DELICIOUSBAKERY

DeliciousBakery là website thương mại điện tử chuyên bán các loại bánh ngọt cao cấp, được làm thủ công với nguyên liệu chất lượng. Chúng tôi cung cấp dịch vụ đặt hàng trực tuyến và giao hàng tận nơi.

---

## CẬP NHẬT HỆ THỐNG GẦN ĐÂY

- **Tìm kiếm & lọc sản phẩm**: Trang sản phẩm hỗ trợ tìm theo từ khóa, danh mục, khoảng giá, lọc tồn kho (còn hàng), đồng bộ URL params. Trang quản trị sản phẩm có bộ lọc danh mục và tồn kho (Tất cả / Còn hàng / Tồn kho thấp ≤10 / Hết hàng) kết hợp ô tìm kiếm.
- **Trang chi tiết sản phẩm**: Có nút quay lại danh sách `/products`; hiển thị tồn kho (cảnh báo tồn thấp), nổi bật, đơn vị, trọng lượng, hạn dùng, bảo quản, thành phần/dị ứng; gợi ý tối đa 4 sản phẩm liên quan cùng danh mục.
- **Quản lý người dùng (Admin)**: Chỉ hiển thị vai trò CUSTOMER; có bật/tắt tài khoản với xác nhận; hiển thị trạng thái tài khoản; chặn vô hiệu hóa admin.
- **Trạng thái hiển thị**: SHIPPING hiển thị “Đang giao”; PENDING (payment) hiển thị “Đang chờ” trên Orders/OrderHistory/AdminOrders.
- **Thống kê & báo cáo**: Trang thống kê (AdminStatisticsPage) có tab Sản phẩm / Doanh thu / Khách hàng, biểu đồ Recharts, thẻ tổng quan, bảng chi tiết, chọn chu kỳ doanh thu (ngày/tuần/tháng/năm), tự refresh 60s. Export Excel/PDF thực hiện ở backend (endpoint `/statistics/...`), PDF chi tiết ngang Excel. Endpoint thống kê/export yêu cầu ADMIN (SecurityConfig).
- **Email**: Mẫu email chào mừng và xác nhận đơn hàng HTML chuyên nghiệp (EmailServiceImpl).
- **Đăng ký & bảo mật**: Form đăng ký có ô nhập lại mật khẩu; đăng nhập chặn user bị vô hiệu hóa.
- **Dữ liệu seed**: `data.sql` bỏ cột `original_price`, chứa đơn hàng 01–11/2025 (ORD2001–ORD2110) kèm đầy đủ order_items/payments. Script `generate_orders.py` sinh đơn 2025.
- **Xuất báo cáo backend**: Dùng Apache POI (Excel) và iText + html2pdf + font Asian (PDF); hỗ trợ export products/revenue/customers/all (Excel/PDF); nhúng font tiếng Việt.

## DANH MỤC SẢN PHẨM

DeliciousBakery có 6 danh mục sản phẩm chính:

1. **Bánh Kem** - Các loại bánh kem sinh nhật, bánh kem trang trí với nhiều hương vị khác nhau
2. **Bánh Ngọt** - Cupcakes và các loại bánh ngọt nhỏ gọn
3. **Bánh Tart** - Bánh tart với nhiều nhân khác nhau
4. **Macaron** - Macaron Pháp với nhiều vị đa dạng
5. **Tráng Miệng** - Các món tráng miệng cao cấp như Tiramisu, Cheesecake, Panna Cotta
6. **Bánh Quy** - Cookies và brownies các loại

**Lưu ý:** Danh sách sản phẩm cụ thể, giá cả và số lượng tồn kho sẽ được cập nhật tự động từ hệ thống khi người dùng hỏi.

---

## QUY TRÌNH ĐẶT HÀNG

### 1. Tìm kiếm và chọn sản phẩm
- Khách hàng có thể duyệt sản phẩm theo danh mục hoặc tìm kiếm bằng từ khóa; lọc nâng cao theo danh mục, khoảng giá, tồn kho (còn hàng)
- Xem chi tiết sản phẩm: tên, mô tả, giá, hình ảnh, số lượng tồn kho (cảnh báo tồn thấp), đơn vị, trọng lượng, hạn dùng, bảo quản, thành phần/dị ứng

### 2. Thêm vào giỏ hàng
- Khách hàng phải đăng nhập để thêm sản phẩm vào giỏ hàng
- Giỏ hàng được lưu theo tài khoản, có thể thêm/xóa/sửa số lượng sản phẩm
- Giá sản phẩm được lưu tại thời điểm thêm vào giỏ (snapshot price)

### 3. Thanh toán (Checkout)
- Khách hàng xem lại giỏ hàng và chọn "Tiến hành thanh toán"
- Nhập thông tin giao hàng:
  - Có thể sử dụng địa chỉ mặc định từ hồ sơ
  - Hoặc nhập địa chỉ giao hàng mới
  - Nhập số điện thoại (nếu chưa có trong hồ sơ)
  - Ghi chú giao hàng (tùy chọn)
- Chọn phương thức thanh toán
- Xem chi tiết phí vận chuyển và tổng tiền

### 4. Xác nhận đơn hàng
- Sau khi đặt hàng thành công, đơn hàng được tạo với mã đơn hàng duy nhất
- Số lượng sản phẩm trong kho sẽ tự động trừ đi
- Giỏ hàng sẽ được xóa sau khi đặt hàng thành công

---

## PHƯƠNG THỨC THANH TOÁN

DeliciousBakery hỗ trợ 2 phương thức thanh toán:

1. **CASH** - Tiền mặt (Thanh toán khi nhận hàng)
2. **STRIPE** - Thẻ Visa/MasterCard (Thanh toán trực tuyến qua Stripe)

**Lưu ý:** Phương thức thanh toán được chọn tại bước checkout và không thể thay đổi sau khi đặt hàng.

---

## PHÍ VẬN CHUYỂN

### Quy định phí ship:
- **Miễn phí vận chuyển:** Khi tổng số lượng sản phẩm trong đơn hàng > 5 sản phẩm
- **Có phí vận chuyển:** Khi tổng số lượng sản phẩm ≤ 5 sản phẩm
  - Phí vận chuyển = 10% của tổng giá trị đơn hàng (subtotal)

### Ví dụ:
- Đơn hàng có 6 sản phẩm → Miễn phí ship
- Đơn hàng có 3 sản phẩm, tổng tiền 300.000đ → Phí ship = 30.000đ

---

## TRẠNG THÁI ĐƠN HÀNG

Đơn hàng có 4 trạng thái:

1. **PENDING** - Chờ xử lý
   - Đơn hàng mới được tạo
   - Chưa được xử lý
   - Khách hàng có thể hủy đơn ở trạng thái này

2. **SHIPPING** - Đang giao hàng
   - Đơn hàng đã được xác nhận và đang được vận chuyển
   - Không thể hủy đơn ở trạng thái này

3. **DELIVERED** - Đã giao hàng
   - Đơn hàng đã được giao thành công đến khách hàng
   - Không thể thay đổi trạng thái

4. **CANCELLED** - Đã hủy
   - Đơn hàng đã bị hủy
   - Không thể thay đổi trạng thái

**Quy định hủy đơn:**
- Chỉ có thể hủy đơn khi trạng thái là PENDING
- Khách hàng có thể hủy đơn từ trang lịch sử đơn hàng
- Admin có thể hủy đơn từ trang quản lý đơn hàng

---

## TRẠNG THÁI THANH TOÁN

Thanh toán có các trạng thái:

1. **PENDING** - Chờ thanh toán
   - Đơn hàng chưa được thanh toán

2. **COMPLETED** - Đã thanh toán
   - Đơn hàng đã được thanh toán thành công
   - Khi thanh toán thành công, đơn hàng sẽ tự động chuyển sang trạng thái SHIPPING

3. **FAILED** - Thanh toán thất bại
   - Giao dịch thanh toán không thành công

4. **REFUNDED** - Đã hoàn tiền
   - Đơn hàng đã được hoàn tiền

---

## TÀI KHOẢN NGƯỜI DÙNG

### Đăng ký tài khoản:
- Khách hàng cần đăng ký tài khoản để mua hàng
- Quy trình đăng ký:
  1. Nhập thông tin: Email, mật khẩu, họ tên, số điện thoại (tùy chọn), địa chỉ (tùy chọn)
  2. Hệ thống gửi mã OTP qua email để xác thực
  3. Nhập mã OTP để hoàn tất đăng ký
- Email phải chưa được sử dụng trong hệ thống
- Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số
- Form đăng ký trên frontend có ô nhập lại mật khẩu để xác nhận

### Đăng nhập:
- Sử dụng email và mật khẩu để đăng nhập
- Sau khi đăng nhập, hệ thống cấp JWT token để xác thực
- Người dùng bị vô hiệu hóa sẽ không đăng nhập được

### Hồ sơ người dùng:
- Khách hàng có thể cập nhật thông tin cá nhân: họ tên, số điện thoại, địa chỉ
- Địa chỉ trong hồ sơ có thể được sử dụng làm địa chỉ giao hàng mặc định

### Vai trò người dùng:
- **CUSTOMER** - Khách hàng: Có thể xem sản phẩm, đặt hàng, xem lịch sử đơn hàng, đánh giá sản phẩm
- **ADMIN** - Quản trị viên: Có quyền quản lý toàn bộ hệ thống (sản phẩm, đơn hàng, người dùng, v.v.)
- Trang quản trị người dùng chỉ hiển thị CUSTOMER; có thể bật/tắt tài khoản với xác nhận; không cho phép vô hiệu hóa admin

---

## GIỎ HÀNG

### Tính năng giỏ hàng:
- Giỏ hàng được lưu theo tài khoản (mỗi user có 1 giỏ hàng)
- Khách hàng có thể:
  - Thêm sản phẩm vào giỏ hàng
  - Xem danh sách sản phẩm trong giỏ
  - Thay đổi số lượng sản phẩm
  - Xóa sản phẩm khỏi giỏ hàng
- Giá sản phẩm được lưu tại thời điểm thêm vào giỏ (không thay đổi khi giá sản phẩm thay đổi)
- Giỏ hàng tự động xóa sau khi đặt hàng thành công

### Kiểm tra tồn kho:
- Hệ thống kiểm tra số lượng tồn kho khi thêm vào giỏ hàng
- Khi checkout, hệ thống kiểm tra lại tồn kho và cảnh báo nếu sản phẩm hết hàng

---

## ĐÁNH GIÁ SẢN PHẨM

### Tính năng đánh giá:
- Khách hàng có thể đánh giá sản phẩm sau khi mua hàng
- Mỗi khách hàng chỉ có thể đánh giá 1 lần cho mỗi sản phẩm
- Đánh giá bao gồm:
  - Điểm đánh giá (rating): từ 1 đến 5 sao
  - Bình luận (comment): nhận xét về sản phẩm
- Khách hàng có thể chỉnh sửa hoặc xóa đánh giá của mình
- Đánh giá được hiển thị công khai trên trang chi tiết sản phẩm

---

## CHÍNH SÁCH VÀ QUY ĐỊNH

### Chính sách đổi trả:
- Hiện tại hệ thống chưa hỗ trợ đổi trả hàng
- Khách hàng chỉ có thể hủy đơn khi đơn hàng ở trạng thái PENDING

### Chính sách bảo mật:
- Thông tin cá nhân và thanh toán được bảo mật
- Mật khẩu được mã hóa bằng BCrypt
- JWT token được sử dụng để xác thực người dùng

### Quy định về sản phẩm:
- Giá sản phẩm có thể thay đổi, nhưng giá trong đơn hàng đã đặt sẽ không thay đổi
- Số lượng tồn kho được cập nhật theo thời gian thực
- Khách hàng không thể đặt hàng số lượng lớn hơn số lượng tồn kho

---

## HƯỚNG DẪN SỬ DỤNG WEBSITE

### Cho khách hàng:
1. **Xem sản phẩm:** Truy cập trang "Sản phẩm" để xem tất cả sản phẩm hoặc tìm kiếm theo từ khóa; dùng bộ lọc danh mục/giá/tồn kho
2. **Xem chi tiết:** Click vào sản phẩm để xem thông tin chi tiết, hình ảnh, và đánh giá
3. **Thêm vào giỏ:** Click nút "Mua" để thêm sản phẩm vào giỏ hàng (cần đăng nhập)
4. **Xem giỏ hàng:** Click icon giỏ hàng ở header để xem và quản lý giỏ hàng
5. **Thanh toán:** Từ giỏ hàng, click "Tiến hành thanh toán" để đặt hàng
6. **Xem lịch sử:** Vào trang "Đơn hàng" để xem lịch sử đơn hàng và chi tiết từng đơn
7. **Đánh giá:** Sau khi nhận hàng, khách hàng có thể đánh giá sản phẩm từ trang chi tiết sản phẩm
8. **Quay lại danh sách:** Trên trang chi tiết sản phẩm có nút "Quay lại danh sách sản phẩm"

### Cho admin:
1. **Quản lý sản phẩm:** Thêm, sửa, xóa sản phẩm và danh mục
   - Bộ lọc nhanh theo danh mục và tồn kho; tìm kiếm tên/slug/danh mục
2. **Quản lý đơn hàng:** Xem, cập nhật trạng thái đơn hàng, quản lý thanh toán
3. **Quản lý người dùng:** Xem danh sách khách hàng và quản trị viên
4. **Thống kê:** Xem tổng quan về số lượng đơn hàng, doanh thu, số lượng khách hàng
   - Tab Sản phẩm / Doanh thu / Khách hàng; chọn chu kỳ doanh thu (ngày/tuần/tháng/năm); export Excel/PDF (thực thi ở backend); yêu cầu quyền ADMIN

---

## PHẠM VI HỖ TRỢ CỦA AI

AI chỉ được phép trả lời các câu hỏi liên quan đến:
- Thông tin về DeliciousBakery và dịch vụ
- Sản phẩm, danh mục, giá cả, tồn kho
- Quy trình đặt hàng và thanh toán
- Phí vận chuyển và chính sách giao hàng
- Trạng thái đơn hàng và thanh toán
- Tài khoản người dùng và giỏ hàng
- Đánh giá sản phẩm
- Hướng dẫn sử dụng website
- Chính sách và quy định của cửa hàng

**Nếu người dùng hỏi ngoài phạm vi trên, AI phải trả lời:**
"Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến DeliciousBakery. Vui lòng hỏi về sản phẩm, đơn hàng, thanh toán, hoặc các dịch vụ của chúng tôi."

---

## LƯU Ý QUAN TRỌNG CHO AI

1. **Luôn kiểm tra dữ liệu thực tế:** Khi người dùng hỏi về sản phẩm cụ thể, giá cả, hoặc tồn kho, AI phải tham khảo phần "DANH SÁCH SẢN PHẨM HIỆN CÓ" được tự động cập nhật từ hệ thống.

2. **Trả lời chính xác:** Không được bịa đặt thông tin. Nếu không có thông tin trong knowledge base, phải nói rõ là không biết hoặc hướng dẫn người dùng liên hệ hỗ trợ.

3. **Giữ phạm vi:** Tuyệt đối không trả lời các câu hỏi không liên quan đến DeliciousBakery như thời tiết, tin tức, giải trí, v.v.

4. **Thân thiện và chuyên nghiệp:** Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, và thân thiện.

5. **Hướng dẫn cụ thể:** Khi người dùng hỏi về cách sử dụng tính năng, hãy đưa ra hướng dẫn từng bước cụ thể.
