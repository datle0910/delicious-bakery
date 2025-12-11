package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.*;
import vn.iuh.dat.Repository.CartRepository;
import vn.iuh.dat.Repository.OrderRepository;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Repository.ProductRepository;
import vn.iuh.dat.Service.IOrderService;
import vn.iuh.dat.Service.EmailService;
import vn.iuh.dat.dto.Request.CheckoutRequestDTO;
import vn.iuh.dat.dto.Response.OrderDTO;
import vn.iuh.dat.dto.Response.OrderItemDTO;
import vn.iuh.dat.dto.Response.PaymentDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final EmailService emailService;
    private final ModelMapper mapper = new ModelMapper();

    @Override
    public OrderDTO checkout(Long userId, CheckoutRequestDTO request) {

        // Lấy giỏ hàng
        Cart cart = cartRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Your cart is empty");
        }

        User customer = cart.getUser();

        // === VALIDATE STOCK & CALCULATE TOTAL QUANTITY ===
        int totalQuantity = 0;
        for (CartItem ci : cart.getItems()) {
            Product product = ci.getProduct();
            if (product.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" không đủ tồn kho.");
            }
            totalQuantity += ci.getQuantity();
        }

        // === CREATE ORDER ===
        Order order = new Order();
        order.setCustomer(customer);
        order.setCode("ORD-" + System.currentTimeMillis());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        // snapshot fields
        // Nếu request có shippingAddress thì dùng, ngược lại dùng địa chỉ mặc định của khách
        String shippingAddress = request.getShippingAddress();
        order.setShippingAddress(
                (shippingAddress != null && !shippingAddress.isBlank())
                        ? shippingAddress
                        : customer.getAddress()
        );
        order.setNote(request.getNote());
        order.setUpdatedAt(LocalDateTime.now());

        // === COPY CART ITEMS → ORDER ITEMS ===
        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0;

        for (CartItem ci : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());

            // Use snapshot price from cart item, not current product price
            oi.setUnitPrice(ci.getUnitPrice());
            oi.setTotalPrice(ci.getQuantity() * ci.getUnitPrice());

            // snapshot name + image
            oi.setProductName(ci.getProduct().getName());
            oi.setProductImage(ci.getProduct().getImage());

            subtotal += oi.getTotalPrice();

            orderItems.add(oi);
        }

        order.setItems(orderItems);

        // === SHIPPING FEE & TOTAL ===
        // Miễn phí vận chuyển nếu tổng số lượng sản phẩm > 5
        double shippingFee;
        if (totalQuantity > 5) {
            shippingFee = 0;
        } else {
            shippingFee = subtotal * 0.1; // 10% phí vận chuyển cho đơn nhỏ
        }
        double totalAmount = subtotal + shippingFee;

        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        // === PAYMENT (1 order = 1 payment) ===
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setStatus("PENDING");
        payment.setMethod(request.getPaymentMethod()); // CASH, STRIPE
        payment.setCreatedAt(LocalDateTime.now());
        payment.setPaidAt(null); // chưa thanh toán

        order.setPayment(payment);

        // === INITIAL ORDER STATUS ===
        order.setStatus("PENDING_CONFIRMATION");

        boolean isStripe = "STRIPE".equalsIgnoreCase(request.getPaymentMethod());

        // === SAVE ORDER & UPDATE STOCK ===
        orderRepo.save(order);

        for (CartItem ci : cart.getItems()) {
            Product product = ci.getProduct();
            product.setStock(product.getStock() - ci.getQuantity());
            productRepo.save(product);
        }

        // === CLEAR CART (only for non-Stripe payments; Stripe clears on payment success) ===
        if (!isStripe) {
            cart.getItems().clear();
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepo.save(cart);
            // === NOTIFY CUSTOMER ===
            emailService.sendOrderConfirmation(order);
        }

        return toDTO(order);
    }

    @Override
    public OrderDTO findById(Long id) {
        return orderRepo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<OrderDTO> findAll() {
        return orderRepo.findAll()
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<OrderDTO> findByCustomerId(Long customerId) {
        return orderRepo.findByCustomerId(customerId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public OrderDTO updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus().equals("DELIVERED") || order.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Order cannot be modified");
        }

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        orderRepo.save(order);

        return toDTO(order);
    }

    @Override
    public void cancel(Long id) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String status = order.getStatus();
        boolean cancellable = status.equals("PENDING_CONFIRMATION") || status.equals("PREPARING");
        if (!cancellable) {
            throw new RuntimeException("Order can only be cancelled before delivery is prepared");
        }

        // Restore stock for all items in the cancelled order
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepo.save(product);
        }

        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(order);
    }


    // ========================= MAPPING =========================

    private OrderDTO toDTO(Order o) {
        OrderDTO dto = new OrderDTO();

        dto.setId(o.getId());
        dto.setCode(o.getCode());
        dto.setStatus(o.getStatus());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setShippingFee(o.getShippingFee());
        dto.setShippingAddress(o.getShippingAddress());
        dto.setNote(o.getNote());

        dto.setCustomerId(o.getCustomer().getId());
        dto.setCustomerName(o.getCustomer().getFullName());
        dto.setCustomerEmail(o.getCustomer().getEmail());

        // Items
        dto.setItems(
                o.getItems().stream().map(i ->
                        OrderItemDTO.builder()
                                .id(i.getId())
                                .productId(i.getProduct().getId())
                                .productName(i.getProductName())
                                .productImage(i.getProductImage())
                                .quantity(i.getQuantity())
                                .unitPrice(i.getUnitPrice())
                                .totalPrice(i.getTotalPrice())
                                .build()
                ).toList()
        );

        // Payment
        if (o.getPayment() != null) {
            dto.setPayment(
                    PaymentDTO.builder()
                            .id(o.getPayment().getId())
                            .method(o.getPayment().getMethod())
                            .status(o.getPayment().getStatus())
                            .transactionId(o.getPayment().getTransactionId())
                            .amount(o.getPayment().getAmount())
                            .paidAt(o.getPayment().getPaidAt())
                            .build()
            );
        }

        return dto;
    }
}

