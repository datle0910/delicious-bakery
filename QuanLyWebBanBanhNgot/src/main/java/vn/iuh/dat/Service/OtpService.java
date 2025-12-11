package vn.iuh.dat.Service;

public interface OtpService {
    void sendOtp(String email);
    boolean verifyOtp(String email, String otp);
}
