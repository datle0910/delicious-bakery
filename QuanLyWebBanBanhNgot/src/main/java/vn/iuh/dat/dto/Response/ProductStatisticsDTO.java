package vn.iuh.dat.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStatisticsDTO {
    private List<TopProductDTO> bestSellingProducts;
    private List<TopProductDTO> slowSellingProducts;
    private List<TopProductDTO> topProductsByPurchaseCount;
    private Long totalProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;
}

