package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Product;
import vn.iuh.dat.Repository.CategoryRepository;
import vn.iuh.dat.Repository.ProductRepository;
import vn.iuh.dat.Service.IProductService;
import vn.iuh.dat.dto.Response.ProductDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {
    private final ProductRepository repo;
    private final CategoryRepository categoryRepo;
    private final ModelMapper mapper = new ModelMapper();

    @Override
    public List<ProductDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public ProductDTO findById(Long id) {
        return repo.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public ProductDTO save(ProductDTO dto) {
        Product p = new Product();
        if (dto.getId() != null) p = repo.findById(dto.getId()).orElse(new Product());
        p.setName(dto.getName());
        p.setSlug(dto.getSlug());
        p.setPrice(dto.getPrice());
        p.setStock(dto.getStock());
        p.setImage(dto.getImage());
        p.setDescription(dto.getDescription());
        if (dto.getCategoryId() != null)
            p.setCategory(categoryRepo.findById(dto.getCategoryId()).orElse(null));
        return toDTO(repo.save(p));
    }

    @Override
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    @Override
    public List<ProductDTO> findByCategoryId(Long categoryId) {
        return repo.findByCategoryId(categoryId).stream().map(this::toDTO).toList();
    }

    @Override
    public List<ProductDTO> searchByName(String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword).stream().map(this::toDTO).toList();
    }

    private ProductDTO toDTO(Product p) {
        ProductDTO dto = mapper.map(p, ProductDTO.class);
        return dto;
    }
    private Product toEntity(ProductDTO dto) {
        Product p = mapper.map(dto, Product.class);
        return p;
    }
}
