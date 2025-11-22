package vn.iuh.dat.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "amount", nullable = false)
    private double amount; // hoặc BigDecimal nếu nghiêm túc

    @Column(name = "method", length = 50, nullable = false)
    private String method; // ex: COD, VNPAY, MOMO

    @Column(name = "transaction_id", length = 255)
    private String transactionId; // mã giao dịch cổng thanh toán

    @Column(name = "status", length = 30, nullable = false)
    private String status; // ex: PENDING, PAID, FAILED, REFUNDED

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
