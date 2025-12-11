package vn.iuh.dat.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopCustomerDTO {
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long purchaseCount;
    private Double totalSpending;
}

