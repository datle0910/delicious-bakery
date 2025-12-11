package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Category;
import vn.iuh.dat.Repository.CategoryRepository;
import vn.iuh.dat.Repository.ProductRepository;
import vn.iuh.dat.Service.ICategoryService;
import vn.iuh.dat.dto.Response.CategoryDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements ICategoryService {
    private final CategoryRepository repo;
    private final ProductRepository productRepo;
    private final ModelMapper mapper = new ModelMapper();
    @Override
    public List<CategoryDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public CategoryDTO findById(Long id) {
        return repo.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public CategoryDTO save(CategoryDTO dto) {
        Category c = new Category();
        if (dto.getId() != null)
            c = repo.findById(dto.getId()).orElse(new Category());
        c.setName(dto.getName());
        c.setSlug(dto.getSlug());
        c.setCreatedAt(dto.getCreatedAt());
        return toDTO(repo.save(c));
    }

    @Override
    public void deleteById(Long id) {
        // Ràng buộc: không cho phép xóa danh mục nếu vẫn còn sản phẩm
        boolean hasProducts = productRepo.existsByCategoryId(id);
        if (hasProducts) {
            throw new RuntimeException("Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này.");
        }
        repo.deleteById(id);
    }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = mapper.map(c, CategoryDTO.class);
        return dto;
    }
    private Category toEntity(CategoryDTO dto) {
        Category c = mapper.map(dto, Category.class);
        return c;
    }
}
