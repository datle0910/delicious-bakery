package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Request.CheckoutRequestDTO;
import vn.iuh.dat.dto.Response.OrderDTO;
import java.util.List;

public interface IOrderService {
    OrderDTO checkout(Long userId, CheckoutRequestDTO request);
    OrderDTO findById(Long id);
    List<OrderDTO> findAll();
    List<OrderDTO> findByCustomerId(Long customerId);
    OrderDTO updateStatus(Long id, String status);
    void cancel(Long id);
}
