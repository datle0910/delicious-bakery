package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Cart;
import vn.iuh.dat.Entity.CartItem;
import vn.iuh.dat.Entity.Product;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.CartRepository;
import vn.iuh.dat.Repository.ProductRepository;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Service.ICartService;
import vn.iuh.dat.dto.Response.CartDTO;
import vn.iuh.dat.dto.Response.CartItemDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements ICartService {
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ModelMapper mapper = new ModelMapper(); // Initialized inline, not injected


    @Override
    public CartDTO getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createCart(userId));
        return toDTO(cart);
    }

    private Cart createCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()-> new RuntimeException("User not found"));
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Override
    public CartDTO addItem(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createCart(userId));

        Product product = productRepository.findById(productId).orElseThrow(()-> new RuntimeException("Product not found"));

        CartItem existing = cart.getItems().stream().filter(i -> i.getProduct().getId().equals(productId))
                .findFirst().orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(product.getPrice());
            item.setAddedAt(LocalDateTime.now());
            cart.getItems().add(item);
        }
        cart.setUpdatedAt(LocalDateTime.now());
        return toDTO(cartRepository.save(cart));
    }
    @Override
    public CartDTO updateItemQuantity(Long userId, Long itemId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (quantity < 1)
            throw new RuntimeException("Quantity must be >= 1");

        item.setQuantity(quantity);
        cart.setUpdatedAt(LocalDateTime.now());
        return toDTO(cartRepository.save(cart));
    }

    @Override
    public CartDTO removeItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(i -> i.getId().equals(itemId));

        cart.setUpdatedAt(LocalDateTime.now());
        return toDTO(cartRepository.save(cart));
    }

    @Override
    public CartDTO clear(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());

        return toDTO(cartRepository.save(cart));
    }

    private CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        List<CartItemDTO> items = cart.getItems().stream().map(item -> {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setProductImage(item.getProduct().getImage()); // Product image URL
            itemDTO.setPrice(item.getProduct().getPrice()); // Current product price
            itemDTO.setUnitPrice(item.getUnitPrice()); // Snapshot price when added
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setAddedAt(item.getAddedAt());
            return itemDTO;
        }).toList();

        dto.setItems(items);

        double total = items.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();

        dto.setTotalAmount(total);

        return dto;
    }


}
