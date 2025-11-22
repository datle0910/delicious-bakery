package vn.iuh.dat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.Service.AuthService;
import vn.iuh.dat.Service.IUserService;
import vn.iuh.dat.dto.Request.IntroSpectRequest;
import vn.iuh.dat.dto.Request.LoginRequestDTO;
import vn.iuh.dat.dto.Response.IntroSpectResponse;
import vn.iuh.dat.dto.Response.LoginResponseDTO;
import vn.iuh.dat.dto.Request.UserRequestDTO;
import vn.iuh.dat.dto.Response.UserResponseDTO;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IUserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody @Valid UserRequestDTO dto) {
        return ResponseEntity.status(201).body(userService.create(dto));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(!userService.existsByEmail(email));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO req) {
        return ResponseEntity.ok(authService.login(req));
    }
    @PostMapping("/introspect")
    public ResponseEntity<IntroSpectResponse> introspect(@RequestBody IntroSpectRequest introSpectRequest) {
        var result = authService.introSpect(introSpectRequest);
        return ResponseEntity.ok(result);
    }
}

