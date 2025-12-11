package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Service.OtpService;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    @Override
    public void sendOtp(String email) {
        String otp = generateOtp();

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpStore.put(email, new OtpEntry(otp, expiresAt));

        sendEmail(email, otp);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email);

        if (entry == null) return false;
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            otpStore.remove(email);
            return false;
        }

        boolean match = entry.code().equals(otp);
        if (match) otpStore.remove(email);

        return match;
    }

    private String generateOtp() {
        int code = 100000 + new Random().nextInt(900000);
        return String.valueOf(code);
    }

    private void sendEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail);
            helper.setSubject("Mã xác thực đăng ký DeliciousBakery");

            String html = "<p>Xin chào,</p>"
                    + "<p>Mã OTP của bạn là: <strong>" + otp + "</strong></p>"
                    + "<p>Mã chỉ có hiệu lực trong " + OTP_EXPIRY_MINUTES + " phút.</p>";

            helper.setText(html, true);

            mailSender.send(message);

            log.info("Đã gửi OTP đến email: {}", to);

        } catch (Exception e) {
            log.error("Lỗi khi gửi OTP qua Gmail SMTP", e);
        }
    }

    private record OtpEntry(String code, LocalDateTime expiresAt) {}
}
