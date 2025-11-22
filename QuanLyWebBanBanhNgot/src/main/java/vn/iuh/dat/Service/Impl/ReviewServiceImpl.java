package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Product;
import vn.iuh.dat.Entity.Review;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.ProductRepository;
import vn.iuh.dat.Repository.ReviewRepository;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Service.IReviewService;
import vn.iuh.dat.dto.Response.ReviewDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements IReviewService {

    private final ReviewRepository repo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final ModelMapper mapper = new ModelMapper(); // Initialized inline, not injected

    @Override
    public List<ReviewDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public ReviewDTO findById(Long id) {
        return repo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @Override
    public ReviewDTO create(ReviewDTO dto) {

        User user = userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review r = new Review();
        r.setUser(user);
        r.setProduct(product);
        r.setRating(dto.getRating());
        r.setComment(dto.getComment());
        r.setCreatedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());

        repo.save(r);
        return toDTO(r);
    }

    @Override
    public ReviewDTO update(Long id, ReviewDTO dto) {
        Review r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (dto.getRating() > 0) r.setRating(dto.getRating());
        if (dto.getComment() != null && !dto.getComment().isBlank())
            r.setComment(dto.getComment());

        r.setUpdatedAt(LocalDateTime.now());

        repo.save(r);
        return toDTO(r);
    }

    @Override
    public void deleteById(Long id) {
        if (!repo.existsById(id))
            throw new RuntimeException("Review not found");
        repo.deleteById(id);
    }

    @Override
    public List<ReviewDTO> getByProduct(Long productId) {
        return repo.findByProductId(productId).stream().map(this::toDTO).toList();
    }

    @Override
    public List<ReviewDTO> getByUser(Long userId) {
        return repo.findByUserId(userId).stream().map(this::toDTO).toList();
    }

    private ReviewDTO toDTO(Review r) {
        ReviewDTO dto = mapper.map(r, ReviewDTO.class);
        dto.setUserName(r.getUser().getFullName());
        return dto;
    }
}
