package vn.iuh.dat.Service.Impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Service.AuthService;
import vn.iuh.dat.dto.Request.IntroSpectRequest;
import vn.iuh.dat.dto.Request.LoginRequestDTO;
import vn.iuh.dat.dto.Response.IntroSpectResponse;
import vn.iuh.dat.dto.Response.LoginResponseDTO;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    @Value("${app.jwt.secret}")
    @NonFinal
    protected String SIGNER_KEY;

    @Override
    public IntroSpectResponse introSpect( IntroSpectRequest introSpectRequest) {
        try{
            var token = introSpectRequest.getToken();
            JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);

            Date expityTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            var verified = signedJWT.verify(verifier);

            return IntroSpectResponse.builder()
                    .valid(verified && expityTime.after(new Date()))
                    .build();
        }catch (JOSEException | ParseException e) {
            log.error("Token không hợp lệ", e);
            return IntroSpectResponse.builder()
                    .valid(false)
                    .build();
        }

    }
    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {

        // 1. Tìm user theo email
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        // 2. Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        // 3. Kiểm tra trạng thái account
        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản bị khóa. Vui lòng liên hệ hỗ trợ.");
        }

        var token = generateToken(user);
        return LoginResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getName())
                .enabled(user.isEnabled())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }
    @Override
    public String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        List<String> roles = List.of(user.getRole().getName()); // ADMIN / CUSTOMER
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getFullName())
                .issuer("DeliciousBakery")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("roles", roles)
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot Create Token!", e);
            throw new RuntimeException(e);
        }
    }
}
