package vn.iuh.dat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.iuh.dat.Service.OtpService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/otp")
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        otpService.sendOtp(email);
        return ResponseEntity.ok("OTP đã được gửi");
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verify(@RequestParam String email, @RequestParam String otp) {
        return ResponseEntity.ok(otpService.verifyOtp(email, otp));
    }
}
