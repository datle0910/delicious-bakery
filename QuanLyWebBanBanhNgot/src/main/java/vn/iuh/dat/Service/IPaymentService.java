package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Request.StripePaymentIntentRequest;
import vn.iuh.dat.dto.Response.PaymentDTO;
import vn.iuh.dat.dto.Response.StripePaymentIntentResponse;

import java.util.List;

public interface IPaymentService {
    PaymentDTO findById(Long id);

    List<PaymentDTO> findAll();

    PaymentDTO updateStatus(Long paymentId, String status);

    PaymentDTO refund(Long paymentId);

    StripePaymentIntentResponse createStripePaymentIntent(StripePaymentIntentRequest request);
}
