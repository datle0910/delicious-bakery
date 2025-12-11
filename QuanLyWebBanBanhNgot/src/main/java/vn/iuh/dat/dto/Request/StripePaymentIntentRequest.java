package vn.iuh.dat.dto.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripePaymentIntentRequest {
    private Long orderId;
    private Double amount;
    private String currency;
}

