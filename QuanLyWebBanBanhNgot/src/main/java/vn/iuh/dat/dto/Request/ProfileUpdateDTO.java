package vn.iuh.dat.dto.Request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateDTO {
    @NotBlank(message = "Full name cannot be empty or blank")
    @Size(min = 3, message = "Full name must be at least 3 characters")
    private String fullName;
    
    @Pattern(regexp = "^(|(?:0|\\+84)[0-9]{9,10})$", message = "Invalid phone number format")
    private String phone; // Optional - can be null or empty string
    
    private String address;
}

