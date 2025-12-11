package vn.iuh.dat.Service;

import vn.iuh.dat.Entity.Order;
import vn.iuh.dat.Entity.User;

public interface EmailService {
    void sendOrderConfirmation(Order order);
    void sendWelcomeEmail(User user);
}

