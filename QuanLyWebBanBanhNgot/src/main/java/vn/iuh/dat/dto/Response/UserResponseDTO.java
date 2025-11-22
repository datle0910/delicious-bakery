package vn.iuh.dat.dto.Response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String roleName;
    private boolean enabled;
    private LocalDateTime createdAt;
}
