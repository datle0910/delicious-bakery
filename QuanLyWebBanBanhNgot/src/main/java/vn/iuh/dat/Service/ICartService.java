package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.CartDTO;

public interface ICartService {
    CartDTO getCart(Long userId);
    CartDTO addItem(Long userId, Long productId, int quantity);
    CartDTO updateItemQuantity(Long userId, Long cartItemId, int quantity);
    CartDTO removeItem(Long userId, Long cartItemId);
    CartDTO clear(Long userId);
}
