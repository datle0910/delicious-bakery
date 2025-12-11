package vn.iuh.dat.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.iuh.dat.Entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Kiểm tra xem một danh mục có chứa sản phẩm hay không (dùng cho ràng buộc xóa)
    boolean existsByCategoryId(Long categoryId);
}
