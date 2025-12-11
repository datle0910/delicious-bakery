package vn.iuh.dat.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName; // snapshot

    @Column(name = "product_image")
    private String productImage; // snapshot

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;
}
