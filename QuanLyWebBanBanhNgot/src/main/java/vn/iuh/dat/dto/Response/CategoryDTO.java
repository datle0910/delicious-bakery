package vn.iuh.dat.dto.Response;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    @NotBlank(message = "Category name cannot be blank")
    private String name;
    @NotBlank(message = "Category slug cannot be blank")
    private String slug;
    private LocalDateTime createdAt;
}
