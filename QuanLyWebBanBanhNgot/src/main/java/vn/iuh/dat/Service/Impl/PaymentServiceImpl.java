package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Order;
import vn.iuh.dat.Entity.Payment;
import vn.iuh.dat.Repository.OrderRepository;
import vn.iuh.dat.Repository.PaymentRepository;
import vn.iuh.dat.Service.IPaymentService;
import vn.iuh.dat.dto.Response.PaymentDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;

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

            // kết nối domain: order chỉ được ship sau paid
            Order o = payment.getOrder();
            o.setStatus("SHIPPING");
            orderRepo.save(o);

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
