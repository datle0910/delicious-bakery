package vn.iuh.dat.dto.Request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewUpdateDTO {

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating; // Optional - can be null

    @Size(max = 255, message = "Comment cannot exceed 255 characters")
    private String comment; // Optional - can be null or empty
}

