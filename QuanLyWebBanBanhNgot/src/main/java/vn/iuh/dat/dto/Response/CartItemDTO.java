package vn.iuh.dat.dto.Response;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    @NotNull(message = "Product ID in Cart Item cannot be null")
    private Long productId;
    private String productName;
    @Positive(message = "Price must be greater than 0")
    private double price; // Current product price (for display)
    @Positive(message = "Unit price must be greater than 0")
    private double unitPrice; // Snapshot price when added to cart
    @Min(value = 1,message = "Quantity must be at least 1")
    private int quantity;
    private LocalDateTime addedAt;
}
