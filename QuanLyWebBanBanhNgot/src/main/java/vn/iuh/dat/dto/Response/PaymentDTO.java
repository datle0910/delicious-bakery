package vn.iuh.dat.dto.Response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;

    private Long orderId;

    private double amount;
    private String method;
    private String status;
    private String transactionId;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}


