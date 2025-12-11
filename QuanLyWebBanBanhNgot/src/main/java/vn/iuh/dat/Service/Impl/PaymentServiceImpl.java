package vn.iuh.dat.Service.Impl;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Configuration.StripeConfig;
import vn.iuh.dat.Entity.Order;
import vn.iuh.dat.Entity.Payment;
import vn.iuh.dat.Repository.CartRepository;
import vn.iuh.dat.Repository.OrderRepository;
import vn.iuh.dat.Repository.PaymentRepository;
import vn.iuh.dat.Service.EmailService;
import vn.iuh.dat.Service.IPaymentService;
import vn.iuh.dat.dto.Request.StripePaymentIntentRequest;
import vn.iuh.dat.dto.Response.PaymentDTO;
import vn.iuh.dat.dto.Response.StripePaymentIntentResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;
    private final StripeConfig stripeConfig;
    private final CartRepository cartRepo;
    private final EmailService emailService;


    @Override
    public PaymentDTO findById(Long id) {
        return paymentRepo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public List<PaymentDTO> findAll() {
        return paymentRepo.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public PaymentDTO updateStatus(Long id, String status) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Chỉ set paidAt khi PAID
        if (status.equals("PAID")) {
            payment.setPaidAt(LocalDateTime.now());
            payment.setStatus("PAID");

            // kết nối domain: sau thanh toán chuyển đơn sang PREPARING nếu còn ở PENDING_CONFIRMATION
            Order o = payment.getOrder();
            if ("PENDING_CONFIRMATION".equals(o.getStatus())) {
                o.setStatus("PREPARING");
                orderRepo.save(o);
            }

            // Clear customer's cart after successful payment (Stripe)
            if (o.getCustomer() != null) {
                cartRepo.findByUserId(o.getCustomer().getId()).ifPresent(cart -> {
                    cart.getItems().clear();
                    cart.setUpdatedAt(LocalDateTime.now());
                    cartRepo.save(cart);
                });
            }

            // Send confirmation email after successful online payment
            emailService.sendOrderConfirmation(o);

        } else if (status.equals("FAILED")) {
            payment.setStatus("FAILED");
        } else if (status.equals("PENDING")) {
            payment.setStatus("PENDING");
        } else {
            throw new RuntimeException("Invalid payment status");
        }

        paymentRepo.save(payment);

        return toDTO(payment);
    }

    @Override
    public PaymentDTO refund(Long id) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getStatus().equals("PAID")) {
            throw new RuntimeException("Only paid payments can be refunded");
        }

        payment.setStatus("REFUNDED");
        paymentRepo.save(payment);

        Order o = payment.getOrder();
        o.setStatus("CANCELLED");
        orderRepo.save(o);

        return toDTO(payment);
    }

    @Override
    public StripePaymentIntentResponse createStripePaymentIntent(StripePaymentIntentRequest request) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (request.getAmount() * 100)) // Convert to cents
                    .setCurrency(request.getCurrency() != null ? request.getCurrency() : "vnd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("orderId", request.getOrderId().toString())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Update payment record with Stripe payment intent ID
            if (request.getOrderId() != null) {
                Order order = orderRepo.findById(request.getOrderId())
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                Payment payment = order.getPayment();
                if (payment != null) {
                    payment.setTransactionId(paymentIntent.getId());
                    paymentRepo.save(payment);
                }
            }

            return StripePaymentIntentResponse.builder()
                    .clientSecret(paymentIntent.getClientSecret())
                    .paymentIntentId(paymentIntent.getId())
                    .build();
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }


    // ===================== MAPPER =====================

    private PaymentDTO toDTO(Payment p) {
        return PaymentDTO.builder()
                .id(p.getId())
                .orderId(p.getOrder().getId())
                .amount(p.getAmount())
                .method(p.getMethod())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}
