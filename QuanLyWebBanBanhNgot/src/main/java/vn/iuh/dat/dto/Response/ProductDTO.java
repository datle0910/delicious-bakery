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
    private String ingredients;
    private String allergens;
    private String weight;
    private String shelfLife;
    private String storageInstructions;
    private Boolean isFeatured;
    private Boolean isActive;
    private String unit;
    private LocalDateTime createdAt;

    private Long categoryId;
    private String categoryName;
}
