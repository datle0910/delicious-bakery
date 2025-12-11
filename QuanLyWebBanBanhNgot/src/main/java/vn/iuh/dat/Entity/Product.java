package vn.iuh.dat.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private int stock;

    @Column(length = 255)
    private String image;

    @Column(length = 255)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(length = 255)
    private String allergens;

    @Column(length = 50)
    private String weight;

    @Column(length = 50)
    private String shelfLife;

    @Column(columnDefinition = "TEXT")
    private String storageInstructions;

    @Column(nullable = false)
    private Boolean isFeatured = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(length = 50)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
