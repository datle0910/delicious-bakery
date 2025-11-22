package vn.iuh.dat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.dto.Response.CartDTO;
import vn.iuh.dat.Service.ICartService;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final ICartService service;

    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getCart(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartDTO> addItem(@PathVariable Long userId, @RequestParam Long productId, @RequestParam int quantity) {
        return ResponseEntity.ok(service.addItem(userId, productId, quantity));
    }

    @PatchMapping("/{userId}/items/{itemId}")
    public ResponseEntity<CartDTO> updateQty(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(service.updateItemQuantity(userId, itemId, quantity));
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long userId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(service.removeItem(userId, itemId));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<CartDTO> clearCart(@PathVariable Long userId) {
        return ResponseEntity.ok(service.clear(userId));
    }
}
