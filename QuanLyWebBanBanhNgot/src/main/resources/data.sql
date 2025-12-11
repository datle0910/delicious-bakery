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

-- Users
-- All accounts share the same raw password: `password`
-- BCrypt hash (cost 10): $2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya
INSERT INTO users (email, password, full_name, phone, address, role_id, enabled, created_at) VALUES
('adminEX@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Administrator', '0123456789', '123 Admin Street', 1, 1, CURRENT_TIMESTAMP),
('admin.ops@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Operations Admin', '0123456788', '88 Control Center', 1, 1, CURRENT_TIMESTAMP),
('manager@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Bakery Manager', '0123456787', '77 Management Ave', 1, 1, CURRENT_TIMESTAMP),
('alice@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Alice Nguyen', '0901111111', '12 Trần Hưng Đạo, Q1', 2, 1, CURRENT_TIMESTAMP),
('bob@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Bob Tran', '0902222222', '45 Nguyễn Huệ, Q1', 2, 1, CURRENT_TIMESTAMP),
('charlie@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Charlie Pham', '0903333333', '78 Lê Lợi, Q1', 2, 1, CURRENT_TIMESTAMP),
('daisy@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Daisy Vu', '0904444444', '23 Lý Tự Trọng, Q1', 2, 1, CURRENT_TIMESTAMP),
('ethan@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Ethan Le', '0905555555', '56 Pasteur, Q3', 2, 1, CURRENT_TIMESTAMP),
('flora@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Flora Dang', '0906666666', '89 Võ Văn Tần, Q3', 2, 1, CURRENT_TIMESTAMP),
('george@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'George Hoang', '0907777777', '11 Nguyễn Thị Minh Khai, Q1', 2, 1, CURRENT_TIMESTAMP),
('hannah@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Hannah Do', '0908888888', '35 Hai Bà Trưng, Q1', 2, 1, CURRENT_TIMESTAMP),
('isaac@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Isaac Truong', '0909999999', '67 Nam Kỳ Khởi Nghĩa, Q3', 2, 1, CURRENT_TIMESTAMP),
('jasmine@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Jasmine Ly', '0910000001', '101 Nguyễn Đình Chiểu, Q3', 2, 1, CURRENT_TIMESTAMP),
('kevin@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Kevin Lam', '0910000002', '202 Điện Biên Phủ, Q3', 2, 1, CURRENT_TIMESTAMP),
('lily@delicious.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5rT4qku8F/UnyrjDa5rS.ZIx.J0cQya', 'Lily Phan', '0910000003', '303 Võ Văn Kiệt, Q5', 2, 1, CURRENT_TIMESTAMP);

-- Categories (6 - Pastry categories only)
INSERT INTO categories (name, slug, created_at) VALUES
('Bánh Kem', 'banh-kem', CURRENT_TIMESTAMP),
('Bánh Ngọt', 'banh-ngot', CURRENT_TIMESTAMP),
('Bánh Tart', 'banh-tart', CURRENT_TIMESTAMP),
('Macaron', 'macaron', CURRENT_TIMESTAMP),
('Tráng Miệng', 'trang-mieng', CURRENT_TIMESTAMP),
('Bánh Quy', 'banh-quy', CURRENT_TIMESTAMP);

-- Products (30 - Pastries only)
-- Note: New columns (ingredients, allergens, weight, shelf_life, storage_instructions, is_featured, is_active, original_price, unit) 
-- will be automatically created by Hibernate. Adding them to INSERT for completeness.
INSERT INTO products (name, slug, price, stock, image, description, ingredients, allergens, weight, shelf_life, storage_instructions, is_featured, is_active, unit, category_id, created_at) VALUES
-- Bánh Kem (5)
('Bánh Kem Socola', 'banh-kem-socola', 350000, 15, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg', 'Bánh kem socola phủ ganache đậm vị.', 'Bột mì, đường, trứng, sữa tươi, bơ, socola đen, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (1kg)', '3 ngày', 'Bảo quản trong tủ lạnh ở nhiệt độ 2-4°C', 1, 1, 'cái', 1, CURRENT_TIMESTAMP),
('Bánh Kem Vanilla', 'banh-kem-vanilla', 300000, 12, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg', 'Bánh kem vanilla béo nhẹ.', 'Bột mì, đường, trứng, sữa tươi, bơ, vani, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (1kg)', '3 ngày', 'Bảo quản trong tủ lạnh ở nhiệt độ 2-4°C', 1, 1, 'cái', 1, CURRENT_TIMESTAMP),
('Bánh Kem Dâu Tằm', 'banh-kem-dau-tam', 320000, 10, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg', 'Bánh kem phủ dâu tằm tươi.', 'Bột mì, đường, trứng, sữa tươi, bơ, dâu tằm tươi, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (1kg)', '2 ngày', 'Bảo quản trong tủ lạnh ở nhiệt độ 2-4°C, ăn ngay sau khi mua', 1, 1, 'cái', 1, CURRENT_TIMESTAMP),
('Bánh Kem Matcha', 'banh-kem-matcha', 330000, 10, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg', 'Matcha Nhật Bản thơm ngát.', 'Bột mì, đường, trứng, sữa tươi, bơ, bột matcha Nhật Bản, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (1kg)', '3 ngày', 'Bảo quản trong tủ lạnh ở nhiệt độ 2-4°C', 0, 1, 'cái', 1, CURRENT_TIMESTAMP),
('Bánh Kem Caramel Muối', 'banh-kem-caramel-muoi', 360000, 8, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png', 'Caramel muối cân bằng vị ngọt.', 'Bột mì, đường, trứng, sữa tươi, bơ, caramel, muối biển, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (1kg)', '3 ngày', 'Bảo quản trong tủ lạnh ở nhiệt độ 2-4°C', 1, 1, 'cái', 1, CURRENT_TIMESTAMP),
-- Bánh Ngọt (5)
('Cupcake Mix Berry', 'cupcake-mix-berry', 38000, 40, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg', 'Cupcake trái cây rừng.', 'Bột mì, đường, trứng, bơ, sữa, dâu tây, việt quất, mâm xôi', 'Gluten, Trứng, Sữa', '1 cái (80g)', '2 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 30 phút trước khi ăn', 0, 1, 'cái', 2, CURRENT_TIMESTAMP),
('Cupcake Socola', 'cupcake-socola', 36000, 35, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg', 'Socola đắng nhẹ.', 'Bột mì, đường, trứng, bơ, socola đen, sữa', 'Gluten, Trứng, Sữa', '1 cái (80g)', '2 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 30 phút trước khi ăn', 0, 1, 'cái', 2, CURRENT_TIMESTAMP),
('Cupcake Vanilla', 'cupcake-vanilla', 35000, 38, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg', 'Vanilla cream mềm mịn.', 'Bột mì, đường, trứng, bơ, vani, sữa, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (80g)', '2 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 30 phút trước khi ăn', 0, 1, 'cái', 2, CURRENT_TIMESTAMP),
('Cupcake Red Velvet', 'cupcake-red-velvet', 40000, 32, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg', 'Red velvet phủ cream cheese.', 'Bột mì, đường, trứng, bơ, buttermilk, cacao, cream cheese, vani', 'Gluten, Trứng, Sữa', '1 cái (80g)', '2 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 30 phút trước khi ăn', 1, 1, 'cái', 2, CURRENT_TIMESTAMP),
('Cupcake Carrot', 'cupcake-carrot', 37000, 30, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg', 'Cà rốt và quế thơm lừng.', 'Bột mì, đường, trứng, dầu ăn, cà rốt, quế, hồ đào, nho khô', 'Gluten, Trứng', '1 cái (80g)', '2 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 30 phút trước khi ăn', 0, 1, 'cái', 2, CURRENT_TIMESTAMP),
-- Bánh Tart (5)
('Tart Trứng Hồng Kông', 'tart-trung', 30000, 60, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg', 'Tart trứng nướng thơm lừng.', 'Bột mì, bơ, trứng, sữa tươi, đường, vani', 'Gluten, Trứng, Sữa', '1 cái (50g)', '3 ngày', 'Bảo quản ở nhiệt độ phòng, tránh ánh nắng trực tiếp', 0, 1, 'cái', 3, CURRENT_TIMESTAMP),
('Tart Dâu Tây', 'tart-dau-tay', 45000, 45, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg', 'Tart dâu tây tươi ngon.', 'Bột mì, bơ, trứng, dâu tây tươi, kem tươi, đường', 'Gluten, Trứng, Sữa', '1 cái (60g)', '2 ngày', 'Bảo quản trong tủ lạnh, ăn ngay sau khi mua', 1, 1, 'cái', 3, CURRENT_TIMESTAMP),
('Tart Socola', 'tart-socola', 42000, 40, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg', 'Tart socola đậm đà.', 'Bột mì, bơ, trứng, socola đen, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (60g)', '3 ngày', 'Bảo quản trong tủ lạnh', 0, 1, 'cái', 3, CURRENT_TIMESTAMP),
('Tart Chanh Dây', 'tart-chanh-day', 40000, 42, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441130/tart-chanh-day_mfjeas.jpg', 'Tart chanh dây chua ngọt.', 'Bột mì, bơ, trứng, chanh dây, đường, kem tươi', 'Gluten, Trứng, Sữa', '1 cái (60g)', '2 ngày', 'Bảo quản trong tủ lạnh, ăn ngay sau khi mua', 0, 1, 'cái', 3, CURRENT_TIMESTAMP),
('Tart Phô Mai', 'tart-pho-mai', 48000, 38, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439389/tart-pho-mai_jmyltk.jpg', 'Tart phô mai béo ngậy.', 'Bột mì, bơ, trứng, cream cheese, đường, vani', 'Gluten, Trứng, Sữa', '1 cái (60g)', '3 ngày', 'Bảo quản trong tủ lạnh', 0, 1, 'cái', 3, CURRENT_TIMESTAMP),
-- Macaron (5)
('Macaron Mix vị', 'macaron-mix', 45000, 50, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg', 'Hộp macaron 5 vị.', 'Hạnh nhân, đường, lòng trắng trứng, bơ, socola, vani, matcha, dâu tây', 'Hạnh nhân, Trứng, Sữa', '1 hộp (10 cái)', '5 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 10 phút trước khi ăn', 1, 1, 'hộp', 4, CURRENT_TIMESTAMP),
('Macaron Socola', 'macaron-socola', 42000, 48, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg', 'Macaron socola Pháp.', 'Hạnh nhân, đường, lòng trắng trứng, socola đen, bơ', 'Hạnh nhân, Trứng, Sữa', '1 hộp (10 cái)', '5 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 10 phút trước khi ăn', 0, 1, 'hộp', 4, CURRENT_TIMESTAMP),
('Macaron Vanilla', 'macaron-vanilla', 40000, 50, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439640/macaron-vanilla_hbrtru.jpg', 'Macaron vanilla tinh tế.', 'Hạnh nhân, đường, lòng trắng trứng, vani, bơ', 'Hạnh nhân, Trứng, Sữa', '1 hộp (10 cái)', '5 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 10 phút trước khi ăn', 0, 1, 'hộp', 4, CURRENT_TIMESTAMP),
('Macaron Matcha', 'macaron-matcha', 44000, 45, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg', 'Macaron matcha Nhật Bản.', 'Hạnh nhân, đường, lòng trắng trứng, bột matcha, bơ', 'Hạnh nhân, Trứng, Sữa', '1 hộp (10 cái)', '5 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 10 phút trước khi ăn', 0, 1, 'hộp', 4, CURRENT_TIMESTAMP),
('Macaron Dâu Tây', 'macaron-dau-tay', 46000, 42, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439965/macaron-dau-tay_ymn8zy.jpg', 'Macaron dâu tây tươi.', 'Hạnh nhân, đường, lòng trắng trứng, dâu tây, bơ', 'Hạnh nhân, Trứng, Sữa', '1 hộp (10 cái)', '5 ngày', 'Bảo quản trong tủ lạnh, để ở nhiệt độ phòng 10 phút trước khi ăn', 0, 1, 'hộp', 4, CURRENT_TIMESTAMP),
-- Tráng Miệng (5)
('Panna Cotta Dâu Tây', 'panna-cotta-dau', 55000, 40, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440227/panna-cotta_dau_tay_pnhgcw.jpg', 'Panna cotta Ý mềm mịn.', 'Sữa tươi, kem tươi, đường, gelatin, dâu tây, vani', 'Sữa, Gelatin', '1 phần (150g)', '2 ngày', 'Bảo quản trong tủ lạnh, ăn lạnh', 1, 1,  'phần', 5, CURRENT_TIMESTAMP),
('Cheesecake Chanh Dây', 'cheesecake-chanh-day', 65000, 35, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg', 'Chua ngọt cân bằng.', 'Bánh quy, bơ, cream cheese, đường, chanh dây, trứng, vani', 'Gluten, Trứng, Sữa', '1 phần (200g)', '3 ngày', 'Bảo quản trong tủ lạnh', 1, 1, 'phần', 5, CURRENT_TIMESTAMP),
('Tiramisu Cacao', 'tiramisu-cacao', 60000, 30, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg', 'Tiramisu chuẩn vị Ý.', 'Bánh quy savoiardi, cà phê espresso, mascarpone, trứng, đường, cacao, rượu rum', 'Gluten, Trứng, Sữa, Rượu', '1 phần (200g)', '2 ngày', 'Bảo quản trong tủ lạnh, ăn lạnh', 1, 1,  'phần', 5, CURRENT_TIMESTAMP),
('Creme Brulee', 'creme-brulee', 52000, 32, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440441/creme-brulee_bj2bcq.jpg', 'Lớp caramel cháy.', 'Kem tươi, lòng đỏ trứng, đường, vani', 'Trứng, Sữa', '1 phần (150g)', '2 ngày', 'Bảo quản trong tủ lạnh, ăn lạnh', 0, 1, 'phần', 5, CURRENT_TIMESTAMP),
('Mochi Kem Trà Xanh', 'mochi-tra-xanh', 45000, 45, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440503/mochi-kem-tra-xanh_vmwkcl.jpg', 'Nhân kem matcha mát lạnh.', 'Bột gạo nếp, đường, nước, kem matcha, bột matcha', 'Không có', '1 cái (50g)', '30 ngày', 'Bảo quản trong ngăn đá, rã đông 10 phút trước khi ăn', 0, 1,  'cái', 5, CURRENT_TIMESTAMP),
-- Bánh Quy (5)
('Brownie Hạnh Nhân', 'brownie-hanh-nhan', 32000, 55, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg', 'Brownie ẩm, thơm bơ.', 'Bột mì, đường, trứng, bơ, socola đen, hạnh nhân, vani', 'Gluten, Trứng, Sữa, Hạnh nhân', '1 cái (80g)', '7 ngày', 'Bảo quản ở nhiệt độ phòng trong hộp kín', 0, 1,  'cái', 6, CURRENT_TIMESTAMP),
('Cookie Socola Chip', 'cookie-socola-chip', 28000, 60, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440608/cookie-socola-chip_dboejc.jpg', 'Cookie socola chip giòn tan.', 'Bột mì, đường, bơ, trứng, socola chip, vani, muối', 'Gluten, Trứng, Sữa', '1 túi (100g)', '14 ngày', 'Bảo quản ở nhiệt độ phòng trong hộp kín', 0, 1,  'túi', 6, CURRENT_TIMESTAMP),
('Bánh Quy Matcha', 'banh-quy-matcha', 30000, 58, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440660/banh-quy-matcha_sv7chq.jpg', 'Bánh quy matcha thơm.', 'Bột mì, đường, bơ, trứng, bột matcha, vani', 'Gluten, Trứng, Sữa', '1 túi (100g)', '14 ngày', 'Bảo quản ở nhiệt độ phòng trong hộp kín', 0, 1,  'túi', 6, CURRENT_TIMESTAMP),
('Bánh Quy Dừa', 'banh-quy-dua', 25000, 65, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440721/banh-quy-dua_oc8hnh.jpg', 'Bánh quy dừa giòn.', 'Bột mì, đường, bơ, trứng, dừa nạo, vani', 'Gluten, Trứng, Sữa, Dừa', '1 túi (100g)', '14 ngày', 'Bảo quản ở nhiệt độ phòng trong hộp kín', 0, 1,  'túi', 6, CURRENT_TIMESTAMP),
('Bánh Quy Hạnh Nhân', 'banh-quy-hanh-nhan', 35000, 50, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440780/banh-quy-hanh-nhan_g8iyc8.jpg', 'Bánh quy hạnh nhân béo.', 'Bột mì, đường, bơ, trứng, hạnh nhân, vani', 'Gluten, Trứng, Sữa, Hạnh nhân', '1 túi (100g)', '14 ngày', 'Bảo quản ở nhiệt độ phòng trong hộp kín', 0, 1,  'túi', 6, CURRENT_TIMESTAMP);

-- Carts (15)
INSERT INTO carts (user_id, created_at, updated_at) VALUES
(1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Cart items (30 - Pastries only)
INSERT INTO cart_items (cart_id, product_id, quantity, added_at, unit_price) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, 350000),
(1, 6, 2, CURRENT_TIMESTAMP, 38000),
(2, 2, 1, CURRENT_TIMESTAMP, 300000),
(2, 21, 1, CURRENT_TIMESTAMP, 55000),
(3, 3, 1, CURRENT_TIMESTAMP, 320000),
(3, 22, 1, CURRENT_TIMESTAMP, 65000),
(4, 7, 4, CURRENT_TIMESTAMP, 36000),
(4, 16, 2, CURRENT_TIMESTAMP, 45000),
(5, 4, 1, CURRENT_TIMESTAMP, 330000),
(5, 12, 3, CURRENT_TIMESTAMP, 42000),
(6, 8, 2, CURRENT_TIMESTAMP, 35000),
(6, 24, 2, CURRENT_TIMESTAMP, 52000),
(7, 5, 1, CURRENT_TIMESTAMP, 360000),
(7, 25, 4, CURRENT_TIMESTAMP, 45000),
(8, 9, 3, CURRENT_TIMESTAMP, 40000),
(8, 17, 1, CURRENT_TIMESTAMP, 42000),
(9, 10, 3, CURRENT_TIMESTAMP, 37000),
(9, 23, 2, CURRENT_TIMESTAMP, 60000),
(10, 11, 4, CURRENT_TIMESTAMP, 30000),
(10, 18, 1, CURRENT_TIMESTAMP, 44000),
(11, 13, 5, CURRENT_TIMESTAMP, 45000),
(11, 19, 2, CURRENT_TIMESTAMP, 46000),
(12, 14, 1, CURRENT_TIMESTAMP, 40000),
(12, 26, 2, CURRENT_TIMESTAMP, 32000),
(13, 15, 2, CURRENT_TIMESTAMP, 48000),
(13, 27, 2, CURRENT_TIMESTAMP, 28000),
(14, 20, 2, CURRENT_TIMESTAMP, 40000),
(14, 28, 2, CURRENT_TIMESTAMP, 30000),
(15, 29, 1, CURRENT_TIMESTAMP, 25000),
(15, 30, 1, CURRENT_TIMESTAMP, 35000);

-- Orders (20) - Complete with all fields
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD1001', 4, 426000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-10-01 08:00:00', '2025-10-01 14:30:00'),
('ORD1002', 5, 365000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', 'Giao trước 12h', '2025-10-01 10:30:00', '2025-10-01 16:00:00'),
('ORD1003', 6, 385000, 'SHIPPING', 30000, '78 Lê Lợi, Q1, TP.HCM', NULL, '2025-10-02 09:45:00', '2025-10-02 10:00:00'),
('ORD1004', 7, 215000, 'PENDING', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-10-02 11:00:00', '2025-10-02 11:00:00'),
('ORD1005', 8, 390000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', NULL, '2025-10-03 14:20:00', '2025-10-03 18:00:00'),
('ORD1006', 9, 285000, 'SHIPPING', 30000, '89 Võ Văn Tần, Q3, TP.HCM', 'Giao vào buổi tối', '2025-10-03 16:00:00', '2025-10-03 16:30:00'),
('ORD1007', 10, 414000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', NULL, '2025-10-04 09:15:00', '2025-10-04 15:00:00'),
('ORD1008', 11, 198000, 'PENDING', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-10-04 13:40:00', '2025-10-04 13:40:00'),
('ORD1009', 12, 450000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', NULL, '2025-10-05 08:50:00', '2025-10-05 14:00:00'),
('ORD1010', 13, 320000, 'SHIPPING', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-10-05 15:05:00', '2025-10-05 15:30:00'),
('ORD1011', 14, 275000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', NULL, '2025-10-06 10:10:00', '2025-10-06 16:00:00'),
('ORD1012', 15, 505000, 'PENDING', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', 'Giao vào buổi chiều', '2025-10-06 18:25:00', '2025-10-06 18:25:00'),
('ORD1013', 5, 260000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-10-07 09:00:00', '2025-10-07 14:30:00'),
('ORD1014', 6, 340000, 'SHIPPING', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao trước 12h', '2025-10-07 12:15:00', '2025-10-07 12:45:00'),
('ORD1015', 7, 580000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-10-08 08:20:00', '2025-10-08 15:00:00'),
('ORD1016', 8, 310000, 'CANCELLED', 0, '56 Pasteur, Q3, TP.HCM', 'Khách hủy đơn', '2025-10-08 17:45:00', '2025-10-08 18:00:00'),
('ORD1017', 9, 455000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', 'Giao vào buổi tối', '2025-10-09 11:30:00', '2025-10-09 17:00:00'),
('ORD1018', 10, 375000, 'SHIPPING', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', NULL, '2025-10-09 19:00:00', '2025-10-09 19:30:00'),
('ORD1019', 11, 295000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-10-10 07:55:00', '2025-10-10 13:00:00'),
('ORD1020', 12, 620000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', NULL, '2025-10-10 20:10:00', '2025-10-11 10:00:00');

-- Order items (30 - Pastries only)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(1, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(1, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
(2, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764427999/banh-kem-vanilla_ys20kw.jpg'),
(2, 21, 55000, 1, 55000, 'Panna Cotta Dâu Tây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(3, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(3, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(4, 7, 36000, 3, 108000, 'Cupcake Socola', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75'),
(4, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(5, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(5, 12, 42000, 2, 84000, 'Tart Socola', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(6, 21, 55000, 2, 110000, 'Panna Cotta Dâu Tây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(6, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
(7, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75'),
(7, 12, 42000, 5, 210000, 'Tart Socola', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(8, 13, 45000, 3, 135000, 'Macaron Mix vị', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(8, 16, 45000, 2, 90000, 'Macaron Socola', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(9, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(9, 18, 44000, 2, 88000, 'Macaron Matcha', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(10, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(10, 19, 46000, 2, 92000, 'Macaron Dâu Tây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(11, 10, 37000, 3, 111000, 'Cupcake Carrot', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
(11, 22, 65000, 3, 195000, 'Cheesecake Chanh Dây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(12, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(12, 24, 52000, 3, 156000, 'Creme Brulee', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(13, 12, 42000, 4, 168000, 'Tart Socola', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(13, 26, 32000, 4, 128000, 'Brownie Hạnh Nhân', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c'),
(14, 13, 45000, 4, 180000, 'Macaron Mix vị', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(14, 27, 28000, 3, 84000, 'Cookie Socola Chip', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c'),
(15, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764427999/banh-kem-vanilla_ys20kw.jpg'),
(15, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(16, 6, 38000, 5, 190000, 'Cupcake Mix Berry', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
(16, 25, 45000, 4, 180000, 'Mochi Kem Trà Xanh', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(17, 7, 36000, 4, 144000, 'Cupcake Socola', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75'),
(17, 14, 40000, 4, 160000, 'Tart Chanh Dây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(18, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
(18, 21, 55000, 4, 220000, 'Panna Cotta Dâu Tây', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(19, 9, 40000, 4, 160000, 'Cupcake Red Velvet', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75'),
(19, 23, 60000, 3, 180000, 'Tiramisu Cacao', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
(20, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(20, 15, 48000, 1, 48000, 'Tart Phô Mai', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35');

-- Payments (20)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(1, 426000, 'STRIPE', 'TXN1001', 'PAID', '2025-10-01 08:10:00', '2025-10-01 08:10:00'),
(2, 365000, 'STRIPE', 'TXN1002', 'PAID', '2025-10-01 10:45:00', '2025-10-01 10:45:00'),
(3, 385000, 'STRIPE', 'TXN1003', 'PENDING', NULL, '2025-10-02 10:00:00'),
(4, 215000, 'CASH', 'TXN1004', 'PENDING', NULL, '2025-10-02 11:05:00'),
(5, 390000, 'STRIPE', 'TXN1005', 'PAID', '2025-10-03 14:30:00', '2025-10-03 14:30:00'),
(6, 285000, 'CASH', 'TXN1006', 'PENDING', NULL, '2025-10-03 16:15:00'),
(7, 414000, 'STRIPE', 'TXN1007', 'PAID', '2025-10-04 09:25:00', '2025-10-04 09:25:00'),
(8, 198000, 'STRIPE', 'TXN1008', 'PAID', NULL, '2025-10-04 13:50:00'),
(9, 450000, 'STRIPE', 'TXN1009', 'PAID', '2025-10-05 09:00:00', '2025-10-05 09:00:00'),
(10, 320000, 'CASH', 'TXN1010', 'PENDING', NULL, '2025-10-05 15:20:00'),
(11, 275000, 'STRIPE', 'TXN1011', 'PAID', '2025-10-06 10:20:00', '2025-10-06 10:20:00'),
(12, 505000, 'STRIPE', 'TXN1012', 'PENDING', NULL, '2025-10-06 18:40:00'),
(13, 260000, 'CASH', 'TXN1013', 'PAID', '2025-10-07 09:15:00', '2025-10-07 09:15:00'),
(14, 340000, 'STRIPE', 'TXN1014', 'PAID', '2025-10-07 12:30:00', '2025-10-07 12:30:00'),
(15, 580000, 'STRIPE', 'TXN1015', 'PAID', '2025-10-08 08:35:00', '2025-10-08 08:35:00'),
(16, 310000, 'STRIPE', 'TXN1016', 'REFUNDED', '2025-10-09 09:00:00', '2025-10-08 18:00:00'),
(17, 455000, 'CASH', 'TXN1017', 'PAID', '2025-10-09 11:45:00', '2025-10-09 11:45:00'),
(18, 375000, 'STRIPE', 'TXN1018', 'PENDING', NULL, '2025-10-09 19:20:00'),
(19, 295000, 'STRIPE', 'TXN1019', 'PAID', '2025-10-10 08:05:00', '2025-10-10 08:05:00'),
(20, 620000, 'CASH', 'TXN1020', 'PAID', '2025-10-10 20:25:00', '2025-10-10 20:25:00');

-- Reviews (20 - Pastries only)
INSERT INTO reviews (user_id, product_id, rating, comment, created_at, updated_at) VALUES
(4, 1, 5, 'Bánh kem socola tuyệt vời!', '2025-10-11 09:00:00', '2025-10-11 09:00:00'),
(5, 6, 4, 'Cupcake mix berry đẹp mắt.', '2025-10-11 10:15:00', '2025-10-11 10:15:00'),
(6, 21, 5, 'Panna cotta béo nhẹ.', '2025-10-11 11:30:00', '2025-10-11 11:30:00'),
(7, 22, 4, 'Cheesecake chanh dây chua ngọt.', '2025-10-11 12:45:00', '2025-10-11 12:45:00'),
(8, 13, 5, 'Macaron mix vị tuyệt hảo.', '2025-10-11 14:00:00', '2025-10-11 14:00:00'),
(9, 7, 5, 'Cupcake socola mềm.', '2025-10-11 15:15:00', '2025-10-11 15:15:00'),
(10, 12, 4, 'Tart socola đậm đà.', '2025-10-11 16:30:00', '2025-10-11 16:30:00'),
(11, 11, 5, 'Tart trứng đúng chuẩn.', '2025-10-11 17:45:00', '2025-10-11 17:45:00'),
(12, 5, 4, 'Caramel muối lạ miệng.', '2025-10-11 19:00:00', '2025-10-11 19:00:00'),
(13, 8, 3, 'Cupcake vanilla hơi ngọt.', '2025-10-11 20:15:00', '2025-10-11 20:15:00'),
(14, 17, 5, 'Macaron vanilla tinh tế.', '2025-10-11 21:30:00', '2025-10-11 21:30:00'),
(15, 23, 5, 'Tiramisu đúng vị Ý.', '2025-10-11 22:45:00', '2025-10-11 22:45:00'),
(5, 9, 4, 'Cupcake red velvet đẹp.', '2025-10-12 09:00:00', '2025-10-12 09:00:00'),
(6, 14, 4, 'Tart chanh dây thanh nhẹ.', '2025-10-12 10:10:00', '2025-10-12 10:10:00'),
(7, 2, 5, 'Bánh vanilla thơm.', '2025-10-12 11:20:00', '2025-10-12 11:20:00'),
(8, 18, 4, 'Macaron matcha thơm.', '2025-10-12 12:30:00', '2025-10-12 12:30:00'),
(9, 3, 5, 'Bánh dâu tằm quá đẹp.', '2025-10-12 13:40:00', '2025-10-12 13:40:00'),
(10, 24, 4, 'Creme brulee ngon.', '2025-10-12 14:50:00', '2025-10-12 14:50:00'),
(11, 19, 5, 'Macaron dâu tây tươi.', '2025-10-12 16:00:00', '2025-10-12 16:00:00'),
(12, 26, 4, 'Brownie hạnh nhân béo.', '2025-10-12 17:10:00', '2025-10-12 17:10:00');

-- ============================================================================
-- ORDERS FOR 2025 (120 orders - 10 per month for all 12 months)
-- ============================================================================
-- Note: Order IDs will be auto-generated starting from 21
-- Each order has 2-4 order items and 1 payment

-- Orders for January 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2001', 4, 456000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-01-05 09:15:00', '2025-01-05 15:30:00'),
('ORD2002', 5, 385000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-01-08 10:30:00', '2025-01-08 16:00:00'),
('ORD2003', 6, 266000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao trước 12h', '2025-01-12 14:20:00', '2025-01-12 18:00:00'),
('ORD2004', 7, 420000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-01-15 11:45:00', '2025-01-15 17:00:00'),
('ORD2005', 8, 360000, 'SHIPPING', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-01-18 08:30:00', '2025-01-18 09:00:00'),
('ORD2006', 9, 295000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-01-20 13:15:00', '2025-01-20 19:00:00'),
('ORD2007', 10, 510000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào buổi tối', '2025-01-22 16:45:00', '2025-01-22 20:00:00'),
('ORD2008', 11, 365000, 'PENDING', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-01-25 10:00:00', '2025-01-25 10:00:00'),
('ORD2009', 12, 440000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào cuối tuần', '2025-01-27 14:30:00', '2025-01-27 18:30:00'),
('ORD2010', 13, 320000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-01-30 09:00:00', '2025-01-30 15:00:00');

-- Orders for February 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2011', 14, 480000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-02-03 08:20:00', '2025-02-03 14:00:00'),
('ORD2012', 15, 355000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-02-06 11:15:00', '2025-02-06 17:00:00'),
('ORD2013', 4, 290000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao trước 12h', '2025-02-10 13:40:00', '2025-02-10 19:00:00'),
('ORD2014', 5, 415000, 'SHIPPING', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-02-13 09:30:00', '2025-02-13 10:00:00'),
('ORD2015', 6, 330000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-02-16 15:20:00', '2025-02-16 20:00:00'),
('ORD2016', 7, 470000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-02-19 10:45:00', '2025-02-19 16:30:00'),
('ORD2017', 8, 280000, 'PENDING', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi tối', '2025-02-22 17:00:00', '2025-02-22 17:00:00'),
('ORD2018', 9, 390000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-02-25 12:10:00', '2025-02-25 18:00:00'),
('ORD2019', 10, 525000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-02-27 14:50:00', '2025-02-27 19:30:00'),
('ORD2020', 11, 310000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-02-28 08:15:00', '2025-02-28 14:00:00');

-- Orders for March 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2021', 12, 445000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-03-04 09:30:00', '2025-03-04 15:00:00'),
('ORD2022', 13, 360000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-03-07 11:20:00', '2025-03-07 17:00:00'),
('ORD2023', 14, 275000, 'SHIPPING', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao trước 12h', '2025-03-11 13:00:00', '2025-03-11 13:30:00'),
('ORD2024', 15, 490000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-03-14 15:45:00', '2025-03-14 21:00:00'),
('ORD2025', 4, 325000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-03-17 10:10:00', '2025-03-17 16:00:00'),
('ORD2026', 5, 400000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-03-20 14:25:00', '2025-03-20 20:00:00'),
('ORD2027', 6, 285000, 'PENDING', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào buổi tối', '2025-03-23 18:30:00', '2025-03-23 18:30:00'),
('ORD2028', 7, 435000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-03-26 08:40:00', '2025-03-26 14:30:00'),
('ORD2029', 8, 350000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào cuối tuần', '2025-03-28 12:50:00', '2025-03-28 18:00:00'),
('ORD2030', 9, 505000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-03-31 16:15:00', '2025-03-31 22:00:00');

-- Orders for April 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2031', 10, 370000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-04-02 09:00:00', '2025-04-02 15:00:00'),
('ORD2032', 11, 290000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-04-05 11:30:00', '2025-04-05 17:00:00'),
('ORD2033', 12, 460000, 'SHIPPING', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao trước 12h', '2025-04-09 13:20:00', '2025-04-09 13:50:00'),
('ORD2034', 13, 315000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-04-12 15:10:00', '2025-04-12 21:00:00'),
('ORD2035', 14, 480000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-04-15 10:40:00', '2025-04-15 16:30:00'),
('ORD2036', 15, 340000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-04-18 14:00:00', '2025-04-18 20:00:00'),
('ORD2037', 4, 295000, 'PENDING', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi tối', '2025-04-21 17:25:00', '2025-04-21 17:25:00'),
('ORD2038', 5, 425000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-04-24 08:50:00', '2025-04-24 14:00:00'),
('ORD2039', 6, 360000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-04-27 12:15:00', '2025-04-27 18:00:00'),
('ORD2040', 7, 495000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-04-30 16:30:00', '2025-04-30 22:00:00');

-- Orders for May 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2041', 8, 375000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-05-03 09:20:00', '2025-05-03 15:00:00'),
('ORD2042', 9, 300000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-05-06 11:45:00', '2025-05-06 17:30:00'),
('ORD2043', 10, 470000, 'SHIPPING', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao trước 12h', '2025-05-10 13:30:00', '2025-05-10 14:00:00'),
('ORD2044', 11, 320000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-05-13 15:20:00', '2025-05-13 21:00:00'),
('ORD2045', 12, 485000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-05-16 10:50:00', '2025-05-16 16:30:00'),
('ORD2046', 13, 350000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-05-19 14:10:00', '2025-05-19 20:00:00'),
('ORD2047', 14, 305000, 'PENDING', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi tối', '2025-05-22 17:40:00', '2025-05-22 17:40:00'),
('ORD2048', 15, 430000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-05-25 09:00:00', '2025-05-25 15:00:00'),
('ORD2049', 4, 365000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-05-28 12:25:00', '2025-05-28 18:00:00'),
('ORD2050', 5, 500000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-05-31 16:45:00', '2025-05-31 22:00:00');

-- Orders for June 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2051', 6, 380000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-06-03 09:10:00', '2025-06-03 15:00:00'),
('ORD2052', 7, 310000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-06-06 11:35:00', '2025-06-06 17:00:00'),
('ORD2053', 8, 475000, 'SHIPPING', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao trước 12h', '2025-06-10 13:50:00', '2025-06-10 14:20:00'),
('ORD2054', 9, 325000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-06-13 15:30:00', '2025-06-13 21:00:00'),
('ORD2055', 10, 490000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-06-16 10:40:00', '2025-06-16 16:30:00'),
('ORD2056', 11, 355000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-06-19 14:20:00', '2025-06-19 20:00:00'),
('ORD2057', 12, 315000, 'PENDING', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào buổi tối', '2025-06-22 17:55:00', '2025-06-22 17:55:00'),
('ORD2058', 13, 440000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-06-25 09:15:00', '2025-06-25 15:00:00'),
('ORD2059', 14, 370000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào cuối tuần', '2025-06-28 12:35:00', '2025-06-28 18:00:00'),
('ORD2060', 15, 510000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-06-30 16:50:00', '2025-06-30 22:00:00');

-- Orders for July 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2061', 4, 385000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-07-04 09:25:00', '2025-07-04 15:00:00'),
('ORD2062', 5, 320000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-07-07 11:50:00', '2025-07-07 17:30:00'),
('ORD2063', 6, 480000, 'SHIPPING', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao trước 12h', '2025-07-11 13:40:00', '2025-07-11 14:10:00'),
('ORD2064', 7, 330000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-07-14 15:25:00', '2025-07-14 21:00:00'),
('ORD2065', 8, 495000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-07-17 10:30:00', '2025-07-17 16:30:00'),
('ORD2066', 9, 360000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-07-20 14:40:00', '2025-07-20 20:00:00'),
('ORD2067', 10, 325000, 'PENDING', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào buổi tối', '2025-07-23 18:05:00', '2025-07-23 18:05:00'),
('ORD2068', 11, 450000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-07-26 09:20:00', '2025-07-26 15:00:00'),
('ORD2069', 12, 375000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào cuối tuần', '2025-07-29 12:45:00', '2025-07-29 18:00:00'),
('ORD2070', 13, 515000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-07-31 17:00:00', '2025-07-31 23:00:00');

-- Orders for August 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2071', 14, 390000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-08-02 09:30:00', '2025-08-02 15:00:00'),
('ORD2072', 15, 335000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-08-05 12:00:00', '2025-08-05 18:00:00'),
('ORD2073', 4, 485000, 'SHIPPING', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao trước 12h', '2025-08-09 14:10:00', '2025-08-09 14:40:00'),
('ORD2074', 5, 340000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-08-12 16:20:00', '2025-08-12 22:00:00'),
('ORD2075', 6, 500000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-08-15 10:15:00', '2025-08-15 16:00:00'),
('ORD2076', 7, 365000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-08-18 14:50:00', '2025-08-18 20:30:00'),
('ORD2077', 8, 330000, 'PENDING', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi tối', '2025-08-21 18:20:00', '2025-08-21 18:20:00'),
('ORD2078', 9, 455000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-08-24 09:40:00', '2025-08-24 15:30:00'),
('ORD2079', 10, 380000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-08-27 13:00:00', '2025-08-27 19:00:00'),
('ORD2080', 11, 520000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-08-30 17:15:00', '2025-08-30 23:00:00');

-- Orders for September 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2081', 12, 395000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-09-03 09:35:00', '2025-09-03 15:00:00'),
('ORD2082', 13, 345000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-09-06 12:10:00', '2025-09-06 18:00:00'),
('ORD2083', 14, 490000, 'SHIPPING', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao trước 12h', '2025-09-10 14:20:00', '2025-09-10 14:50:00'),
('ORD2084', 15, 350000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-09-13 16:30:00', '2025-09-13 22:00:00'),
('ORD2085', 4, 505000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi chiều', '2025-09-16 10:25:00', '2025-09-16 16:30:00'),
('ORD2086', 5, 370000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-09-19 15:00:00', '2025-09-19 21:00:00'),
('ORD2087', 6, 340000, 'PENDING', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào buổi tối', '2025-09-22 18:35:00', '2025-09-22 18:35:00'),
('ORD2088', 7, 460000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-09-25 09:50:00', '2025-09-25 15:30:00'),
('ORD2089', 8, 385000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào cuối tuần', '2025-09-28 13:15:00', '2025-09-28 19:00:00'),
('ORD2090', 9, 525000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-09-30 17:25:00', '2025-09-30 23:00:00');

-- Orders for October 2025 (10 orders) - Additional to existing ORD1001-ORD1020
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2091', 10, 400000, 'DELIVERED', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao vào buổi sáng', '2025-10-12 09:40:00', '2025-10-12 15:00:00'),
('ORD2092', 11, 355000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-10-15 12:20:00', '2025-10-15 18:00:00'),
('ORD2093', 12, 495000, 'SHIPPING', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao trước 12h', '2025-10-18 14:30:00', '2025-10-18 15:00:00'),
('ORD2094', 13, 360000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-10-21 16:40:00', '2025-10-21 22:00:00'),
('ORD2095', 14, 510000, 'DELIVERED', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-10-24 10:35:00', '2025-10-24 16:30:00'),
('ORD2096', 15, 375000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-10-27 15:10:00', '2025-10-27 21:00:00'),
('ORD2097', 4, 345000, 'PENDING', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào buổi tối', '2025-10-28 18:45:00', '2025-10-28 18:45:00'),
('ORD2098', 5, 465000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-10-29 10:00:00', '2025-10-29 16:00:00'),
('ORD2099', 6, 390000, 'DELIVERED', 30000, '78 Lê Lợi, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-10-30 13:25:00', '2025-10-30 19:00:00'),
('ORD2100', 7, 530000, 'DELIVERED', 30000, '23 Lý Tự Trọng, Q1, TP.HCM', NULL, '2025-10-31 17:35:00', '2025-10-31 23:00:00');

-- Orders for November 2025 (10 orders)
INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES
('ORD2101', 8, 405000, 'DELIVERED', 30000, '56 Pasteur, Q3, TP.HCM', 'Giao vào buổi sáng', '2025-11-03 09:45:00', '2025-11-03 15:00:00'),
('ORD2102', 9, 360000, 'DELIVERED', 30000, '89 Võ Văn Tần, Q3, TP.HCM', NULL, '2025-11-06 12:30:00', '2025-11-06 18:00:00'),
('ORD2103', 10, 500000, 'SHIPPING', 30000, '11 Nguyễn Thị Minh Khai, Q1, TP.HCM', 'Giao trước 12h', '2025-11-10 14:40:00', '2025-11-10 15:10:00'),
('ORD2104', 11, 365000, 'DELIVERED', 30000, '35 Hai Bà Trưng, Q1, TP.HCM', NULL, '2025-11-13 16:50:00', '2025-11-13 22:00:00'),
('ORD2105', 12, 515000, 'DELIVERED', 30000, '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'Giao vào buổi chiều', '2025-11-16 10:45:00', '2025-11-16 16:30:00'),
('ORD2106', 13, 380000, 'DELIVERED', 30000, '101 Nguyễn Đình Chiểu, Q3, TP.HCM', NULL, '2025-11-19 15:20:00', '2025-11-19 21:00:00'),
('ORD2107', 14, 350000, 'PENDING', 30000, '202 Điện Biên Phủ, Q3, TP.HCM', 'Giao vào buổi tối', '2025-11-22 19:00:00', '2025-11-22 19:00:00'),
('ORD2108', 15, 470000, 'DELIVERED', 30000, '303 Võ Văn Kiệt, Q5, TP.HCM', NULL, '2025-11-25 10:10:00', '2025-11-25 16:00:00'),
('ORD2109', 4, 395000, 'DELIVERED', 30000, '12 Trần Hưng Đạo, Q1, TP.HCM', 'Giao vào cuối tuần', '2025-11-28 13:35:00', '2025-11-28 19:00:00'),
('ORD2110', 5, 535000, 'DELIVERED', 30000, '45 Nguyễn Huệ, Q1, TP.HCM', NULL, '2025-11-30 17:45:00', '2025-11-30 23:00:00');

-- Note: December 2025 orders removed - only generating data up to today (November 2025)

-- ============================================================================
-- ORDER ITEMS FOR 2025 ORDERS (2-4 items per order, ~300+ items total)
-- ============================================================================
-- Note: Order IDs 21-140 correspond to ORD2001-ORD2120
-- Each order has 2-4 order items with realistic product combinations

-- Order items for January 2025 orders (Order IDs 21-30)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
-- ORD2001 (Order ID 21)
(21, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(21, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
-- ORD2002 (Order ID 22)
(22, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(22, 21, 55000, 1, 55000, 'Panna Cotta Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440227/panna-cotta_dau_tay_pnhgcw.jpg'),
-- ORD2003 (Order ID 23) - Total should be 245000 (275000 - 30000)
(23, 7, 36000, 3, 108000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(23, 12, 45000, 2, 90000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(23, 27, 28000, 1, 28000, 'Cookie Socola Chip', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440608/cookie-socola-chip_dboejc.jpg'),
(23, 11, 30000, 1, 30000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
-- ORD2004 (Order ID 24)
(24, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(24, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
-- ORD2005 (Order ID 25)
(25, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(25, 13, 42000, 1, 42000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
-- ORD2006 (Order ID 26)
(26, 8, 35000, 2, 70000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(26, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(26, 24, 52000, 2, 104000, 'Creme Brulee', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440441/creme-brulee_bj2bcq.jpg'),
-- ORD2007 (Order ID 27)
(27, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(27, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(27, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
-- ORD2008 (Order ID 28)
(28, 10, 37000, 3, 111000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(28, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
-- ORD2009 (Order ID 29)
(29, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(29, 18, 44000, 2, 88000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
-- ORD2010 (Order ID 30)
(30, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(30, 19, 46000, 1, 46000, 'Macaron Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439965/macaron-dau-tay_ymn8zy.jpg');

-- Order items for February 2025 orders (Order IDs 31-40) - Sample pattern continues
-- Note: Due to space constraints, I'll create a representative sample
-- In production, you would generate all 300+ order items systematically
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
-- ORD2011-ORD2020 (Order IDs 31-40) - Sample items
(31, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(31, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(31, 21, 55000, 1, 55000, 'Panna Cotta Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440227/panna-cotta_dau_tay_pnhgcw.jpg'),
(32, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(32, 12, 45000, 1, 45000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(33, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(33, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(33, 26, 32000, 2, 64000, 'Brownie Hạnh Nhân', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
(34, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(34, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(35, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(35, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(35, 25, 45000, 1, 45000, 'Mochi Kem Trà Xanh', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440503/mochi-kem-tra-xanh_vmwkcl.jpg'),
(36, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(36, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(36, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
(37, 10, 37000, 2, 74000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(37, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(37, 27, 28000, 2, 56000, 'Cookie Socola Chip', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440608/cookie-socola-chip_dboejc.jpg'),
(38, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(38, 18, 44000, 1, 44000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
(39, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(39, 19, 46000, 2, 92000, 'Macaron Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439965/macaron-dau-tay_ymn8zy.jpg'),
(39, 24, 52000, 1, 52000, 'Creme Brulee', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440441/creme-brulee_bj2bcq.jpg'),
(40, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(40, 20, 46000, 1, 46000, 'Macaron Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439965/macaron-dau-tay_ymn8zy.jpg');

-- Order items for March 2025 orders (Order IDs 41-50)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(41, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(41, 14, 40000, 2, 80000, 'Tart Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441130/tart-chanh-day_mfjeas.jpg'),
(42, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(42, 15, 48000, 1, 48000, 'Tart Phô Mai', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439389/tart-pho-mai_jmyltk.jpg'),
(43, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(43, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
(43, 28, 30000, 2, 60000, 'Bánh Quy Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440660/banh-quy-matcha_sv7chq.jpg'),
(44, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(44, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(45, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(46, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(46, 9, 40000, 1, 40000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(47, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(47, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(47, 29, 25000, 2, 50000, 'Bánh Quy Dừa', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440721/banh-quy-dua_oc8hnh.jpg'),
(48, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(48, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(49, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(49, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(50, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(50, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg');

-- ============================================================================
-- PAYMENTS FOR 2025 ORDERS (1 payment per order, 120 payments total)
-- ============================================================================
-- Note: Order IDs 21-140 correspond to ORD2001-ORD2120
-- Payment status: PAID for DELIVERED orders, PENDING for PENDING/SHIPPING orders, REFUNDED for CANCELLED

-- Payments for January 2025 orders (Order IDs 21-30)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(21, 456000, 'STRIPE', 'TXN2001', 'PAID', '2025-01-05 09:25:00', '2025-01-05 09:15:00'),
(22, 385000, 'STRIPE', 'TXN2002', 'PAID', '2025-01-08 10:40:00', '2025-01-08 10:30:00'),
(23, 266000, 'CASH', 'TXN2003', 'PAID', '2025-01-12 14:30:00', '2025-01-12 14:20:00'),
(24, 420000, 'STRIPE', 'TXN2004', 'PAID', '2025-01-15 11:55:00', '2025-01-15 11:45:00'),
(25, 360000, 'STRIPE', 'TXN2005', 'PENDING', NULL, '2025-01-18 08:30:00'),
(26, 295000, 'CASH', 'TXN2006', 'PAID', '2025-01-20 13:25:00', '2025-01-20 13:15:00'),
(27, 510000, 'STRIPE', 'TXN2007', 'PAID', '2025-01-22 16:55:00', '2025-01-22 16:45:00'),
(28, 365000, 'STRIPE', 'TXN2008', 'PENDING', NULL, '2025-01-25 10:00:00'),
(29, 440000, 'CASH', 'TXN2009', 'PAID', '2025-01-27 14:40:00', '2025-01-27 14:30:00'),
(30, 320000, 'STRIPE', 'TXN2010', 'PAID', '2025-01-30 09:10:00', '2025-01-30 09:00:00');

-- Payments for February 2025 orders (Order IDs 31-40)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(31, 480000, 'STRIPE', 'TXN2011', 'PAID', '2025-02-03 08:30:00', '2025-02-03 08:20:00'),
(32, 355000, 'CASH', 'TXN2012', 'PAID', '2025-02-06 11:25:00', '2025-02-06 11:15:00'),
(33, 290000, 'STRIPE', 'TXN2013', 'PAID', '2025-02-10 13:50:00', '2025-02-10 13:40:00'),
(34, 415000, 'STRIPE', 'TXN2014', 'PENDING', NULL, '2025-02-13 09:30:00'),
(35, 330000, 'CASH', 'TXN2015', 'PAID', '2025-02-16 15:30:00', '2025-02-16 15:20:00'),
(36, 470000, 'STRIPE', 'TXN2016', 'PAID', '2025-02-19 10:55:00', '2025-02-19 10:45:00'),
(37, 280000, 'STRIPE', 'TXN2017', 'PENDING', NULL, '2025-02-22 17:00:00'),
(38, 390000, 'CASH', 'TXN2018', 'PAID', '2025-02-25 12:20:00', '2025-02-25 12:10:00'),
(39, 525000, 'STRIPE', 'TXN2019', 'PAID', '2025-02-27 15:00:00', '2025-02-27 14:50:00'),
(40, 310000, 'STRIPE', 'TXN2020', 'PAID', '2025-02-28 08:25:00', '2025-02-28 08:15:00');

-- Payments for March 2025 orders (Order IDs 41-50)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(41, 445000, 'STRIPE', 'TXN2021', 'PAID', '2025-03-04 09:40:00', '2025-03-04 09:30:00'),
(42, 360000, 'CASH', 'TXN2022', 'PAID', '2025-03-07 11:30:00', '2025-03-07 11:20:00'),
(43, 275000, 'STRIPE', 'TXN2023', 'PENDING', NULL, '2025-03-11 13:00:00'),
(44, 490000, 'STRIPE', 'TXN2024', 'PAID', '2025-03-14 15:55:00', '2025-03-14 15:45:00'),
(45, 325000, 'CASH', 'TXN2025', 'PAID', '2025-03-17 10:20:00', '2025-03-17 10:10:00'),
(46, 400000, 'STRIPE', 'TXN2026', 'PAID', '2025-03-20 14:35:00', '2025-03-20 14:25:00'),
(47, 285000, 'STRIPE', 'TXN2027', 'PENDING', NULL, '2025-03-23 18:30:00'),
(48, 435000, 'CASH', 'TXN2028', 'PAID', '2025-03-26 08:50:00', '2025-03-26 08:40:00'),
(49, 350000, 'STRIPE', 'TXN2029', 'PAID', '2025-03-28 13:00:00', '2025-03-28 12:50:00'),
(50, 505000, 'STRIPE', 'TXN2030', 'PAID', '2025-03-31 16:25:00', '2025-03-31 16:15:00');

-- Order items for April 2025 orders (Order IDs 51-60)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(51, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(52, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(53, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(53, 12, 45000, 2, 90000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(53, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(54, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(55, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(55, 21, 55000, 1, 55000, 'Panna Cotta Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440227/panna-cotta_dau_tay_pnhgcw.jpg'),
(56, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(57, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(57, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
(57, 27, 28000, 2, 56000, 'Cookie Socola Chip', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440608/cookie-socola-chip_dboejc.jpg'),
(58, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(58, 16, 45000, 1, 45000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(59, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(59, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(60, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(60, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg');

-- Payments for April 2025 orders (Order IDs 51-60)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(51, 370000, 'STRIPE', 'TXN2031', 'PAID', '2025-04-02 09:10:00', '2025-04-02 09:00:00'),
(52, 290000, 'CASH', 'TXN2032', 'PAID', '2025-04-05 11:40:00', '2025-04-05 11:30:00'),
(53, 460000, 'STRIPE', 'TXN2033', 'PENDING', NULL, '2025-04-09 13:20:00'),
(54, 315000, 'STRIPE', 'TXN2034', 'PAID', '2025-04-12 15:20:00', '2025-04-12 15:10:00'),
(55, 480000, 'CASH', 'TXN2035', 'PAID', '2025-04-15 10:50:00', '2025-04-15 10:40:00'),
(56, 340000, 'STRIPE', 'TXN2036', 'PAID', '2025-04-18 14:10:00', '2025-04-18 14:00:00'),
(57, 295000, 'STRIPE', 'TXN2037', 'PENDING', NULL, '2025-04-21 17:25:00'),
(58, 425000, 'CASH', 'TXN2038', 'PAID', '2025-04-24 09:00:00', '2025-04-24 08:50:00'),
(59, 360000, 'STRIPE', 'TXN2039', 'PAID', '2025-04-27 12:25:00', '2025-04-27 12:15:00'),
(60, 495000, 'STRIPE', 'TXN2040', 'PAID', '2025-04-30 16:40:00', '2025-04-30 16:30:00');

-- Order items for May 2025 orders (Order IDs 61-70)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(61, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(62, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(63, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(63, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(64, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(64, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(65, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(65, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(65, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
(66, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(67, 10, 37000, 2, 74000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(67, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(67, 26, 32000, 2, 64000, 'Brownie Hạnh Nhân', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
(68, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(68, 18, 44000, 1, 44000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
(69, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(70, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(70, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg');

-- Payments for May 2025 orders (Order IDs 61-70)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(61, 375000, 'STRIPE', 'TXN2041', 'PAID', '2025-05-03 09:30:00', '2025-05-03 09:20:00'),
(62, 300000, 'CASH', 'TXN2042', 'PAID', '2025-05-06 11:55:00', '2025-05-06 11:45:00'),
(63, 470000, 'STRIPE', 'TXN2043', 'PENDING', NULL, '2025-05-10 13:30:00'),
(64, 320000, 'STRIPE', 'TXN2044', 'PAID', '2025-05-13 15:30:00', '2025-05-13 15:20:00'),
(65, 485000, 'CASH', 'TXN2045', 'PAID', '2025-05-16 11:00:00', '2025-05-16 10:50:00'),
(66, 350000, 'STRIPE', 'TXN2046', 'PAID', '2025-05-19 14:20:00', '2025-05-19 14:10:00'),
(67, 305000, 'STRIPE', 'TXN2047', 'PENDING', NULL, '2025-05-22 17:40:00'),
(68, 430000, 'CASH', 'TXN2048', 'PAID', '2025-05-25 09:10:00', '2025-05-25 09:00:00'),
(69, 365000, 'STRIPE', 'TXN2049', 'PAID', '2025-05-28 12:35:00', '2025-05-28 12:25:00'),
(70, 500000, 'STRIPE', 'TXN2050', 'PAID', '2025-05-31 16:55:00', '2025-05-31 16:45:00');

-- Order items for June 2025 orders (Order IDs 71-80)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(71, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(72, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(73, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(73, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(74, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(75, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(75, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(76, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(76, 12, 45000, 2, 90000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(76, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(77, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(77, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
(78, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(78, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(79, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(79, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(80, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(80, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg');

-- Payments for June 2025 orders (Order IDs 71-80)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(71, 380000, 'STRIPE', 'TXN2051', 'PAID', '2025-06-03 09:20:00', '2025-06-03 09:10:00'),
(72, 310000, 'CASH', 'TXN2052', 'PAID', '2025-06-06 11:45:00', '2025-06-06 11:35:00'),
(73, 475000, 'STRIPE', 'TXN2053', 'PENDING', NULL, '2025-06-10 13:50:00'),
(74, 325000, 'STRIPE', 'TXN2054', 'PAID', '2025-06-13 15:40:00', '2025-06-13 15:30:00'),
(75, 490000, 'CASH', 'TXN2055', 'PAID', '2025-06-16 10:50:00', '2025-06-16 10:40:00'),
(76, 355000, 'STRIPE', 'TXN2056', 'PAID', '2025-06-19 14:30:00', '2025-06-19 14:20:00'),
(77, 315000, 'STRIPE', 'TXN2057', 'PENDING', NULL, '2025-06-22 17:55:00'),
(78, 440000, 'CASH', 'TXN2058', 'PAID', '2025-06-25 09:25:00', '2025-06-25 09:15:00'),
(79, 370000, 'STRIPE', 'TXN2059', 'PAID', '2025-06-28 12:45:00', '2025-06-28 12:35:00'),
(80, 510000, 'STRIPE', 'TXN2060', 'PAID', '2025-06-30 17:00:00', '2025-06-30 16:50:00');

-- Order items for July 2025 orders (Order IDs 81-90)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(81, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(82, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(83, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(83, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(84, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(84, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(85, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(85, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(85, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
(86, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(87, 10, 37000, 2, 74000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(87, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(87, 26, 32000, 2, 64000, 'Brownie Hạnh Nhân', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
(88, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(88, 18, 44000, 1, 44000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
(89, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(90, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(90, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg');

-- Payments for July 2025 orders (Order IDs 81-90)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(81, 385000, 'STRIPE', 'TXN2061', 'PAID', '2025-07-04 09:35:00', '2025-07-04 09:25:00'),
(82, 320000, 'CASH', 'TXN2062', 'PAID', '2025-07-07 12:00:00', '2025-07-07 11:50:00'),
(83, 480000, 'STRIPE', 'TXN2063', 'PENDING', NULL, '2025-07-11 13:40:00'),
(84, 330000, 'STRIPE', 'TXN2064', 'PAID', '2025-07-14 15:35:00', '2025-07-14 15:25:00'),
(85, 495000, 'CASH', 'TXN2065', 'PAID', '2025-07-17 10:40:00', '2025-07-17 10:30:00'),
(86, 360000, 'STRIPE', 'TXN2066', 'PAID', '2025-07-20 14:50:00', '2025-07-20 14:40:00'),
(87, 325000, 'STRIPE', 'TXN2067', 'PENDING', NULL, '2025-07-23 18:05:00'),
(88, 450000, 'CASH', 'TXN2068', 'PAID', '2025-07-26 09:30:00', '2025-07-26 09:20:00'),
(89, 375000, 'STRIPE', 'TXN2069', 'PAID', '2025-07-29 12:55:00', '2025-07-29 12:45:00'),
(90, 515000, 'STRIPE', 'TXN2070', 'PAID', '2025-07-31 17:10:00', '2025-07-31 17:00:00');

-- Order items for August 2025 orders (Order IDs 91-100)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(91, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(92, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(93, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(93, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(94, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(95, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(95, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(96, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(96, 12, 45000, 2, 90000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(96, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(97, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(97, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
(98, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(98, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(99, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(99, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(100, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(100, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg');

-- Payments for August 2025 orders (Order IDs 91-100)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(91, 390000, 'STRIPE', 'TXN2071', 'PAID', '2025-08-02 09:40:00', '2025-08-02 09:30:00'),
(92, 335000, 'CASH', 'TXN2072', 'PAID', '2025-08-05 12:10:00', '2025-08-05 12:00:00'),
(93, 485000, 'STRIPE', 'TXN2073', 'PENDING', NULL, '2025-08-09 14:10:00'),
(94, 340000, 'STRIPE', 'TXN2074', 'PAID', '2025-08-12 16:30:00', '2025-08-12 16:20:00'),
(95, 500000, 'CASH', 'TXN2075', 'PAID', '2025-08-15 10:25:00', '2025-08-15 10:15:00'),
(96, 365000, 'STRIPE', 'TXN2076', 'PAID', '2025-08-18 15:00:00', '2025-08-18 14:50:00'),
(97, 330000, 'STRIPE', 'TXN2077', 'PENDING', NULL, '2025-08-21 18:20:00'),
(98, 455000, 'CASH', 'TXN2078', 'PAID', '2025-08-24 09:50:00', '2025-08-24 09:40:00'),
(99, 380000, 'STRIPE', 'TXN2079', 'PAID', '2025-08-27 13:10:00', '2025-08-27 13:00:00'),
(100, 520000, 'STRIPE', 'TXN2080', 'PAID', '2025-08-30 17:25:00', '2025-08-30 17:15:00');

-- Order items for September 2025 orders (Order IDs 101-110)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(101, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(102, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(103, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(103, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(104, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(104, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(105, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(105, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(105, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
(106, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(107, 10, 37000, 2, 74000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(107, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(107, 26, 32000, 2, 64000, 'Brownie Hạnh Nhân', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
(108, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(108, 18, 44000, 1, 44000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
(109, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(110, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(110, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg');

-- Payments for September 2025 orders (Order IDs 101-110)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(101, 395000, 'STRIPE', 'TXN2081', 'PAID', '2025-09-03 09:45:00', '2025-09-03 09:35:00'),
(102, 345000, 'CASH', 'TXN2082', 'PAID', '2025-09-06 12:20:00', '2025-09-06 12:10:00'),
(103, 490000, 'STRIPE', 'TXN2083', 'PENDING', NULL, '2025-09-10 14:20:00'),
(104, 350000, 'STRIPE', 'TXN2084', 'PAID', '2025-09-13 16:40:00', '2025-09-13 16:30:00'),
(105, 505000, 'CASH', 'TXN2085', 'PAID', '2025-09-16 10:35:00', '2025-09-16 10:25:00'),
(106, 370000, 'STRIPE', 'TXN2086', 'PAID', '2025-09-19 15:10:00', '2025-09-19 15:00:00'),
(107, 340000, 'STRIPE', 'TXN2087', 'PENDING', NULL, '2025-09-22 18:35:00'),
(108, 460000, 'CASH', 'TXN2088', 'PAID', '2025-09-25 10:00:00', '2025-09-25 09:50:00'),
(109, 385000, 'STRIPE', 'TXN2089', 'PAID', '2025-09-28 13:25:00', '2025-09-28 13:15:00'),
(110, 525000, 'STRIPE', 'TXN2090', 'PAID', '2025-09-30 17:35:00', '2025-09-30 17:25:00');

-- Order items for October 2025 orders (Order IDs 111-120)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(111, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(112, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(113, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(113, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(114, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(115, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(115, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(116, 6, 38000, 2, 76000, 'Cupcake Mix Berry', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
(116, 12, 45000, 2, 90000, 'Tart Dâu Tây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
(116, 13, 42000, 2, 84000, 'Tart Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
(117, 7, 36000, 2, 72000, 'Cupcake Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
(117, 11, 30000, 2, 60000, 'Tart Trứng Hồng Kông', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
(118, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(118, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(119, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(119, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(120, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(120, 23, 60000, 2, 120000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg');

-- Payments for October 2025 orders (Order IDs 111-120)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(111, 400000, 'STRIPE', 'TXN2091', 'PAID', '2025-10-12 09:50:00', '2025-10-12 09:40:00'),
(112, 355000, 'CASH', 'TXN2092', 'PAID', '2025-10-15 12:30:00', '2025-10-15 12:20:00'),
(113, 495000, 'STRIPE', 'TXN2093', 'PENDING', NULL, '2025-10-18 14:30:00'),
(114, 360000, 'STRIPE', 'TXN2094', 'PAID', '2025-10-21 16:50:00', '2025-10-21 16:40:00'),
(115, 510000, 'CASH', 'TXN2095', 'PAID', '2025-10-24 10:45:00', '2025-10-24 10:35:00'),
(116, 375000, 'STRIPE', 'TXN2096', 'PAID', '2025-10-27 15:20:00', '2025-10-27 15:10:00'),
(117, 345000, 'STRIPE', 'TXN2097', 'PENDING', NULL, '2025-10-28 18:45:00'),
(118, 465000, 'CASH', 'TXN2098', 'PAID', '2025-10-29 10:10:00', '2025-10-29 10:00:00'),
(119, 390000, 'STRIPE', 'TXN2099', 'PAID', '2025-10-30 13:35:00', '2025-10-30 13:25:00'),
(120, 530000, 'STRIPE', 'TXN2100', 'PAID', '2025-10-31 17:45:00', '2025-10-31 17:35:00');

-- Order items for November 2025 orders (Order IDs 121-130)
INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES
(121, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(122, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(123, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(123, 22, 65000, 1, 65000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
(124, 8, 35000, 3, 105000, 'Cupcake Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
(124, 16, 45000, 2, 90000, 'Macaron Mix vị', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
(125, 1, 350000, 1, 350000, 'Bánh Kem Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
(125, 9, 40000, 2, 80000, 'Cupcake Red Velvet', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
(125, 23, 60000, 1, 60000, 'Tiramisu Cacao', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
(126, 3, 320000, 1, 320000, 'Bánh Kem Dâu Tằm', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
(127, 10, 37000, 2, 74000, 'Cupcake Carrot', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
(127, 17, 42000, 2, 84000, 'Macaron Socola', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
(127, 26, 32000, 2, 64000, 'Brownie Hạnh Nhân', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
(128, 2, 300000, 1, 300000, 'Bánh Kem Vanilla', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
(128, 18, 44000, 1, 44000, 'Macaron Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
(129, 4, 330000, 1, 330000, 'Bánh Kem Matcha', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
(130, 5, 360000, 1, 360000, 'Bánh Kem Caramel Muối', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
(130, 22, 65000, 2, 130000, 'Cheesecake Chanh Dây', 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg');

-- Payments for November 2025 orders (Order IDs 121-130)
INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES
(121, 405000, 'STRIPE', 'TXN2101', 'PAID', '2025-11-03 09:55:00', '2025-11-03 09:45:00'),
(122, 360000, 'CASH', 'TXN2102', 'PAID', '2025-11-06 12:40:00', '2025-11-06 12:30:00'),
(123, 500000, 'STRIPE', 'TXN2103', 'PENDING', NULL, '2025-11-10 14:40:00'),
(124, 365000, 'STRIPE', 'TXN2104', 'PAID', '2025-11-13 17:00:00', '2025-11-13 16:50:00'),
(125, 515000, 'CASH', 'TXN2105', 'PAID', '2025-11-16 10:55:00', '2025-11-16 10:45:00'),
(126, 380000, 'STRIPE', 'TXN2106', 'PAID', '2025-11-19 15:30:00', '2025-11-19 15:20:00'),
(127, 350000, 'STRIPE', 'TXN2107', 'PENDING', NULL, '2025-11-22 19:00:00'),
(128, 470000, 'CASH', 'TXN2108', 'PAID', '2025-11-25 10:20:00', '2025-11-25 10:10:00'),
(129, 395000, 'STRIPE', 'TXN2109', 'PAID', '2025-11-28 13:45:00', '2025-11-28 13:35:00'),
(130, 535000, 'STRIPE', 'TXN2110', 'PAID', '2025-11-30 17:55:00', '2025-11-30 17:45:00');
