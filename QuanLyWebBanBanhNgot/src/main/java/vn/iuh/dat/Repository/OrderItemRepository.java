package vn.iuh.dat.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.iuh.dat.Entity.OrderItem;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByProductId(Long productId);

    // Kiểm tra xem sản phẩm đã xuất hiện trong bất kỳ dòng đơn hàng nào chưa
    boolean existsByProductId(Long productId);
}
