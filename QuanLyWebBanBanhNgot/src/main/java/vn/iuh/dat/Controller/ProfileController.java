package vn.iuh.dat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.Service.IUserService;
import vn.iuh.dat.dto.Request.ProfileUpdateDTO;
import vn.iuh.dat.dto.Response.UserResponseDTO;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final IUserService userService;

    @GetMapping
    public ResponseEntity<UserResponseDTO> getCurrentUser(Authentication authentication) {
        // Get user ID from JWT token claims
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        return ResponseEntity.ok(userService.findById(userId));
    }

    @PutMapping
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @RequestBody @Valid ProfileUpdateDTO dto,
            Authentication authentication) {
        // Get user ID from JWT token claims
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }
}

