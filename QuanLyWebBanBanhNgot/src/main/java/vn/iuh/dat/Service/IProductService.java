package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.ProductDTO;
import java.util.List;

public interface IProductService {
    List<ProductDTO> findAll();
    ProductDTO findById(Long id);
    ProductDTO save(ProductDTO dto);
    void deleteById(Long id);
    List<ProductDTO> findByCategoryId(Long categoryId);
    List<ProductDTO> searchByName(String keyword);
}
