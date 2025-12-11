package vn.iuh.dat.dto.Response;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {

    private Long id;

    private String code;

    @NotBlank(message = "Order status cannot be blank")
    @Pattern(regexp = "PENDING_CONFIRMATION|PREPARING|OUT_FOR_DELIVERY|DELIVERED|CANCELLED",
            message = "Status must be PENDING_CONFIRMATION, PREPARING, OUT_FOR_DELIVERY, DELIVERED or CANCELLED")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @NotNull(message = "Customer id cannot be null")
    private Long customerId;

    private String customerName;
    private String customerEmail;

    private double totalAmount;
    private double shippingFee;
    private String shippingAddress;
    private String note;

    private List<OrderItemDTO> items;

    private PaymentDTO payment;
}
