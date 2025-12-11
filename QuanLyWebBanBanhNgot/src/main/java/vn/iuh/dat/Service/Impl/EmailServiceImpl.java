package vn.iuh.dat.Service.Impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Order;
import vn.iuh.dat.Entity.OrderItem;
import vn.iuh.dat.Service.EmailService;
import vn.iuh.dat.Entity.User;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private static final Locale VI_LOCALE = new Locale("vi", "VN");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOrderConfirmation(Order order) {
        if (order == null || order.getCustomer() == null) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomer().getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Xác nhận đơn hàng " + order.getCode());

            String itemRows = order.getItems().stream()
                    .map(this::buildItemRow)
                    .collect(Collectors.joining());

            String html = """
                    <div style="font-family:'Inter',Arial,sans-serif;background:#f5f5f7;padding:24px;">
                      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:20px 24px;color:#fff;">
                          <div style="font-size:13px;opacity:0.9;">Mã đơn hàng</div>
                          <div style="font-size:22px;font-weight:700;">%s</div>
                          <div style="margin-top:6px;font-size:14px;opacity:0.9;">Ngày tạo: %s</div>
                        </div>
                        <div style="padding:24px;">
                          <p style="margin:0 0 8px 0;font-size:16px;color:#0f172a;font-weight:700;">Xin chào %s,</p>
                          <p style="margin:0 0 16px 0;color:#475569;line-height:1.6;">
                            Cảm ơn bạn đã đặt hàng tại <strong>DeliciousBakery</strong>. Chúng tôi đang chuẩn bị đơn hàng của bạn.
                          </p>

                          <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:16px;">
                            <div style="background:#f8fafc;padding:12px 16px;font-weight:600;color:#0f172a;">Chi tiết sản phẩm</div>
                            <table style="width:100%%;border-collapse:collapse;">
                              <thead>
                                <tr style="background:#ffffff;color:#475569;">
                                  <th style="text-align:left;padding:10px 16px;border-bottom:1px solid #e2e8f0;">Sản phẩm</th>
                                  <th style="text-align:center;padding:10px 16px;border-bottom:1px solid #e2e8f0;">SL</th>
                                  <th style="text-align:right;padding:10px 16px;border-bottom:1px solid #e2e8f0;">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>%s</tbody>
                            </table>
                          </div>

                          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;">
                              <div style="font-size:13px;color:#64748b;">Phí vận chuyển</div>
                              <div style="font-weight:700;color:#0f172a;">%s</div>
                            </div>
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;">
                              <div style="font-size:13px;color:#64748b;">Tổng thanh toán</div>
                              <div style="font-weight:700;color:#0f172a;font-size:18px;">%s</div>
                            </div>
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;">
                              <div style="font-size:13px;color:#64748b;">Thanh toán</div>
                              <div style="font-weight:700;color:#0f172a;">%s</div>
                            </div>
                          </div>

                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:16px;">
                            <div style="font-size:13px;color:#64748b;">Địa chỉ giao hàng</div>
                            <div style="font-weight:600;color:#0f172a;">%s</div>
                          </div>

                          <p style="margin:0;color:#475569;line-height:1.6;font-size:14px;">
                            Nếu cần hỗ trợ, hãy phản hồi email này hoặc liên hệ hotline <strong>1900 6868</strong>.
                          </p>
                          <p style="margin:12px 0 0 0;color:#0f172a;font-weight:700;">DeliciousBakery</p>
                        </div>
                      </div>
                    </div>
                    """.formatted(
                    order.getCode(),
                    DATE_FORMATTER.format(order.getCreatedAt()),
                    order.getCustomer().getFullName(),
                    itemRows,
                    formatCurrency(order.getShippingFee()),
                    formatCurrency(order.getTotalAmount()),
                    order.getPayment() != null ? order.getPayment().getMethod() : "CASH",
                    order.getShippingAddress()
            );

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Sent order confirmation email for order {}", order.getCode());

        } catch (Exception ex) {
            log.error("Failed to send order confirmation email", ex);
        }
    }

    @Override
    public void sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Chào mừng đến DeliciousBakery");

            String html = """
                    <div style="font-family:'Inter',Arial,sans-serif;background:#f5f5f7;padding:24px;">
                      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:20px 24px;color:#fff;">
                          <div style="font-size:22px;font-weight:700;">Chào mừng %s!</div>
                          <div style="margin-top:6px;font-size:14px;opacity:0.9;">Rất vui khi bạn đã tham gia DeliciousBakery.</div>
                        </div>
                        <div style="padding:24px;">
                          <p style="margin:0 0 12px 0;color:#475569;line-height:1.6;">
                            Tài khoản của bạn đã được tạo thành công. Hãy khám phá các món bánh tươi ngon, thêm vào giỏ và thanh toán nhanh chóng.
                          </p>
                          <ul style="margin:0 0 16px 18px;color:#475569;line-height:1.6;padding:0;">
                            <li>Theo dõi đơn hàng theo thời gian thực</li>
                            <li>Lưu thông tin giao hàng để đặt nhanh</li>
                            <li>Nhận ưu đãi và khuyến mãi sớm nhất</li>
                          </ul>
                          <div style="text-align:center;margin-top:20px;">
                            <a href="https://deliciousbakery.vn/login" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">
                              Đăng nhập ngay
                            </a>
                          </div>
                          <p style="margin:20px 0 0 0;color:#475569;font-size:14px;line-height:1.6;">
                            Cần hỗ trợ? Hãy trả lời email này hoặc gọi hotline <strong>1900 6868</strong>.
                          </p>
                          <p style="margin:8px 0 0 0;color:#0f172a;font-weight:700;">DeliciousBakery</p>
                        </div>
                      </div>
                    </div>
                    """.formatted(user.getFullName());

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Sent welcome email to user {}", user.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send welcome email", ex);
        }
    }

    private String buildItemRow(OrderItem item) {
        return """
                <tr>
                  <td style="padding:8px 0;">%s</td>
                  <td style="text-align:center;">%d</td>
                  <td style="text-align:right;">%s</td>
                </tr>
                """.formatted(
                item.getProductName(),
                item.getQuantity(),
                formatCurrency(item.getTotalPrice())
        );
    }

    private String formatCurrency(double amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(VI_LOCALE);
        formatter.setMaximumFractionDigits(0);
        return formatter.format(amount);
    }
}

