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
public class CustomerStatisticsDTO {
    private Long totalCustomers;
    private Long activeCustomers;
    private Long newCustomers;
    private List<TopCustomerDTO> topCustomersByPurchaseCount;
    private List<TopCustomerDTO> topCustomersByTotalSpending;
}

