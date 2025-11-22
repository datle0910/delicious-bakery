// dto/RegisterDTO.java
package vn.iuh.dat.dto.Request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {
    @NotBlank @Email
    private String email;
    @NotBlank
    @Size(min = 8, max = 20,message = "The password must be at least 8 characters and no more than 20 characters.")
    private String password;
    @NotBlank
    private String fullName;
    private String phone;
    private String address;
    private Long roleId;
}
