package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.CategoryDTO;
import java.util.List;

public interface ICategoryService {
    List<CategoryDTO> findAll();
    CategoryDTO findById(Long id);
    CategoryDTO save(CategoryDTO dto);
    void deleteById(Long id);
}
