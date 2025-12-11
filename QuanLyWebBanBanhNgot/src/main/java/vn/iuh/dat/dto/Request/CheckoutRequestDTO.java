package vn.iuh.dat.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {

    // CASH, STRIPE
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    // Cho phép khách nhập địa chỉ giao hàng mới
    private String shippingAddress;

    // Ghi chú giao hàng (optional)
    private String note;
}

