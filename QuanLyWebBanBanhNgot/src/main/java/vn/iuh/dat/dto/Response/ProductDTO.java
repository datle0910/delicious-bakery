package vn.iuh.dat.dto.Response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String name;
    private String slug;
    private double price;
    private int stock;
    private String image;
    private String description;
    private LocalDateTime createdAt;

    private Long categoryId;
    private String categoryName;
}
