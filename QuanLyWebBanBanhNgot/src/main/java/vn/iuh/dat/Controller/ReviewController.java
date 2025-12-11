package vn.iuh.dat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.Service.IReviewService;
import vn.iuh.dat.dto.Request.ReviewCreateDTO;
import vn.iuh.dat.dto.Request.ReviewUpdateDTO;
import vn.iuh.dat.dto.Response.ReviewDTO;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService service;

    @GetMapping
    public ResponseEntity<List<ReviewDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> create(
            @RequestBody @Valid ReviewCreateDTO dto,
            Authentication authentication) {
        // Extract userId from JWT token
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        // Convert ReviewCreateDTO to ReviewDTO with userId from token
        ReviewDTO reviewDTO = new ReviewDTO();
        reviewDTO.setUserId(userId);
        reviewDTO.setProductId(dto.getProductId());
        reviewDTO.setRating(dto.getRating());
        reviewDTO.setComment(dto.getComment());
        
        return ResponseEntity.ok(service.create(reviewDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid ReviewUpdateDTO dto,
            Authentication authentication) {
        // Extract userId from JWT token
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        // Convert ReviewUpdateDTO to ReviewDTO with userId from token
        ReviewDTO reviewDTO = new ReviewDTO();
        reviewDTO.setUserId(userId);
        if (dto.getRating() != null) {
            reviewDTO.setRating(dto.getRating());
        }
        if (dto.getComment() != null) {
            reviewDTO.setComment(dto.getComment());
        }
        
        return ResponseEntity.ok(service.update(id, reviewDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        // Extract userId from JWT token
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        service.deleteById(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(service.getByProduct(productId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUser(userId));
    }

    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<ReviewDTO> getByUserAndProduct(
            @PathVariable Long userId,
            @PathVariable Long productId,
            Authentication authentication) {
        // Extract userId from JWT token for security
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long authenticatedUserId = jwt.getClaim("userId");
        
        if (authenticatedUserId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        // Only allow users to get their own review
        if (!authenticatedUserId.equals(userId)) {
            throw new RuntimeException("You can only view your own reviews");
        }
        
        ReviewDTO review = service.getByUserAndProduct(userId, productId);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }

    @GetMapping("/my-review/product/{productId}")
    public ResponseEntity<ReviewDTO> getMyReviewForProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        // Extract userId from JWT token
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("userId");
        
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        
        ReviewDTO review = service.getByUserAndProduct(userId, productId);
        // Khi người dùng chưa đánh giá sản phẩm này, trả về 200 cùng với body = null
        // để frontend không bị lỗi 404 trong Network tab
        if (review == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(review);
    }
}
