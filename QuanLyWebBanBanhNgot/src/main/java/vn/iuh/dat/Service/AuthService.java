package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Request.IntroSpectRequest;
import vn.iuh.dat.dto.Request.LoginRequestDTO;
import vn.iuh.dat.dto.Response.IntroSpectResponse;
import vn.iuh.dat.dto.Response.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
    IntroSpectResponse introSpect(IntroSpectRequest request);
    String generateToken(String email);
}
