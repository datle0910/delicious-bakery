package vn.iuh.dat.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.iuh.dat.Entity.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    java.util.Optional<Payment> findByTransactionId(String transactionId);
    
    // Query to get order IDs for paid payments
    @Query("SELECT p.order.id FROM Payment p WHERE p.status = 'PAID'")
    List<Long> findPaidOrderIds();
}
