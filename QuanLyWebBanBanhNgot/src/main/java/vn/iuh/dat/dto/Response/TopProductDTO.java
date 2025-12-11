package vn.iuh.dat.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopProductDTO {
    private Long productId;
    private String productName;
    private String productImage;
    private Long totalQuantitySold;
    private Double totalRevenue;
    private Integer purchaseCount;
    private Integer currentStock;
}

