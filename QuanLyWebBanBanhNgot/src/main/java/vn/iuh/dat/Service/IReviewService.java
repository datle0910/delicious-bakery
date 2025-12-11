package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.ReviewDTO;
import java.util.List;

public interface IReviewService {
    List<ReviewDTO> findAll();
    ReviewDTO findById(Long id);
    ReviewDTO create(ReviewDTO dto);
    ReviewDTO update(Long id, ReviewDTO dto);
    void deleteById(Long id, Long userId);

    List<ReviewDTO> getByProduct(Long productId);
    List<ReviewDTO> getByUser(Long userId);
    ReviewDTO getByUserAndProduct(Long userId, Long productId);
}
