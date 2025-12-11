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

        // Check if user has already reviewed this product
        repo.findByUserIdAndProductId(dto.getUserId(), dto.getProductId())
                .ifPresent(existingReview -> {
                    throw new RuntimeException("You have already reviewed this product. You can edit or delete your existing review.");
                });

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

        // Security check: ensure user can only update their own review
        if (!r.getUser().getId().equals(dto.getUserId())) {
            throw new RuntimeException("You can only update your own reviews");
        }

        // Update rating if provided
        if (dto.getRating() > 0) {
            r.setRating(dto.getRating());
        }
        // Update comment if provided
        if (dto.getComment() != null && !dto.getComment().isBlank()) {
            r.setComment(dto.getComment());
        }

        r.setUpdatedAt(LocalDateTime.now());

        repo.save(r);
        return toDTO(r);
    }

    @Override
    public void deleteById(Long id, Long userId) {
        Review r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Security check: ensure user can only delete their own review
        if (!r.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
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

    @Override
    public ReviewDTO getByUserAndProduct(Long userId, Long productId) {
        return repo.findByUserIdAndProductId(userId, productId)
                .map(this::toDTO)
                .orElse(null);
    }

    private ReviewDTO toDTO(Review r) {
        ReviewDTO dto = mapper.map(r, ReviewDTO.class);
        dto.setUserName(r.getUser().getFullName());
        return dto;
    }
}
