-- Clean up existing data (MySQL-compatible)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Roles (match Spring Security usage: ADMIN, CUSTOMER)
INSERT INTO roles (name) VALUES
('ADMIN'),
('CUSTOMER');

-- Users (passwords are placeholders; adjust if PasswordEncoder is enabled)
INSERT INTO users (email, password, full_name, phone, address, role_id, enabled, created_at) VALUES
('admin@example.com', '{noop}123456', 'Administrator', '0123456789', '123 Admin Street', 1, 1, CURRENT_TIMESTAMP),
('user1@example.com', '{noop}123456', 'John Doe', '0987654321', '456 User Street', 2, 1, CURRENT_TIMESTAMP),
('user2@example.com', '{noop}123456', 'Jane Smith', '0912345678', '789 Customer Road', 2, 1, CURRENT_TIMESTAMP);

-- Categories
INSERT INTO categories (name, slug, created_at) VALUES
('Bánh Kem', 'banh-kem', CURRENT_TIMESTAMP),
('Bánh Mì', 'banh-mi', CURRENT_TIMESTAMP),
('Bánh Ngọt', 'banh-ngot', CURRENT_TIMESTAMP),
('Bánh Pizza', 'banh-pizza', CURRENT_TIMESTAMP);

-- Products (price is DOUBLE in entity)
INSERT INTO products (name, slug, price, stock, image, description, category_id, created_at) VALUES
('Bánh Kem Socola', 'banh-kem-socola', 350000, 10, 'cake-1.jpg', 'Bánh kem socola ngon tuyệt', 1, CURRENT_TIMESTAMP),
('Bánh Kem Vanilla', 'banh-kem-vanilla', 300000, 15, 'cake-2.jpg', 'Bánh kem vanilla thơm ngon', 1, CURRENT_TIMESTAMP),
('Bánh Mì Thịt', 'banh-mi-thit', 25000, 50, 'bread-1.jpg', 'Bánh mì thịt nguội', 2, CURRENT_TIMESTAMP),
('Bánh Mì Pate', 'banh-mi-pate', 20000, 50, 'bread-2.jpg', 'Bánh mì pate truyền thống', 2, CURRENT_TIMESTAMP),
('Bánh Cupcake', 'banh-cupcake', 35000, 30, 'cupcake-1.jpg', 'Bánh cupcake nhiều hương vị', 3, CURRENT_TIMESTAMP),
('Bánh Donut', 'banh-donut', 25000, 40, 'donut-1.jpg', 'Bánh donut phủ socola', 3, CURRENT_TIMESTAMP),
('Pizza Hải Sản', 'pizza-hai-san', 180000, 20, 'pizza-1.jpg', 'Pizza hải sản tươi ngon', 4, CURRENT_TIMESTAMP),
('Pizza Thịt', 'pizza-thit', 160000, 20, 'pizza-2.jpg', 'Pizza thịt nguội và nấm', 4, CURRENT_TIMESTAMP);

-- Carts (Cart has one-to-one with User; updated_at exists in entity)
INSERT INTO carts (user_id, created_at, updated_at) VALUES
(2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Cart items (added_at and unit_price exist in entity)
INSERT INTO cart_items (cart_id, product_id, quantity, added_at, unit_price) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, 350000),
(1, 3, 2, CURRENT_TIMESTAMP, 25000),
(2, 2, 1, CURRENT_TIMESTAMP, 300000),
(2, 4, 3, CURRENT_TIMESTAMP, 20000);

-- Orders (total_amount is DOUBLE; created_at exists in entity)
INSERT INTO orders (code, customer_id, total_amount, status, created_at) VALUES
('ORD001', 2, 400000, 'COMPLETED', '2025-10-13 10:00:00'),
('ORD002', 3, 285000, 'PROCESSING', '2025-10-14 09:30:00');

-- Order items (unit_price, total_price, product_name, product_image exist in entity)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(1, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'cake-1.jpg'),
(1, 3, 25000, 2, 50000, 'Bánh Mì Thịt', 'bread-1.jpg'),
(2, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'cake-2.jpg'),
(2, 4, 20000, 3, 60000, 'Bánh Mì Pate', 'bread-2.jpg');

-- Payments (amount is DOUBLE; created_at exists in entity)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(1, 400000, 'CREDIT_CARD', 'TXN123456', 'COMPLETED', '2025-10-13 10:05:00', '2025-10-13 10:05:00'),
(2, 285000, 'COD', 'TXN123457', 'PENDING', NULL, '2025-10-14 09:35:00');

-- Reviews (created_at, updated_at exist in entity)
INSERT INTO reviews (user_id, product_id, rating, comment, created_at, updated_at) VALUES
(2, 1, 5, 'Bánh rất ngon, sẽ mua lại!', '2025-10-14 12:00:00', '2025-10-14 12:00:00'),
(3, 2, 4, 'Bánh mềm, vị vừa ăn.', '2025-10-14 13:00:00', '2025-10-14 13:00:00'),
(2, 3, 3, 'Ổn, nhưng giao hơi lâu.', '2025-10-14 14:00:00', '2025-10-14 14:00:00');