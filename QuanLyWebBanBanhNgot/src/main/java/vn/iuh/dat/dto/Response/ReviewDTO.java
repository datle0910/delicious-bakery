package vn.iuh.dat.dto.Response;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private Long id;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    private String userName;

    @NotNull(message = "Product ID cannot be null")
    private Long productId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int rating;

    @Size(min = 5, max = 255, message = "Comment must be between 5 and 255 characters")
    private String comment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

