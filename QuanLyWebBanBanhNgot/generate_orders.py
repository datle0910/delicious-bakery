import random
from datetime import datetime, timedelta

# Product data (id, name, price, image)
products = [
    (1, 'Bánh Kem Socola', 350000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764425119/banh-kem-socola_rbqnxa.jpg'),
    (2, 'Bánh Kem Vanilla', 300000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441041/banh-kem-vanilla_seyzex.jpg'),
    (3, 'Bánh Kem Dâu Tằm', 320000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428069/Banh-kem-dau-tam_rrkaat.jpg'),
    (4, 'Bánh Kem Matcha', 330000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428123/banh-kem-matcha_x70qyh.jpg'),
    (5, 'Bánh Kem Caramel Muối', 360000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764428197/banh-kem-caramel-muoi_umt7vv.png'),
    (6, 'Cupcake Mix Berry', 38000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437679/cupcake-mix-berry_jdf22k.jpg'),
    (7, 'Cupcake Socola', 36000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764437975/cupcake-socola_suqmht.jpg'),
    (8, 'Cupcake Vanilla', 35000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438032/cupcake-vanilla_epwmqi.jpg'),
    (9, 'Cupcake Red Velvet', 40000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438121/cupcake-red-velvet_gubyho.jpg'),
    (10, 'Cupcake Carrot', 37000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438326/cupcake-carrot_ic7n3c.jpg'),
    (11, 'Tart Trứng Hồng Kông', 30000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438811/tart-trung-hong-kong_adnwhc.jpg'),
    (12, 'Tart Dâu Tây', 45000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764438988/tart-dau-tay_v7rnii.jpg'),
    (13, 'Tart Socola', 42000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439189/tart-chocolate_qb5con.jpg'),
    (14, 'Tart Chanh Dây', 40000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764441130/tart-chanh-day_mfjeas.jpg'),
    (15, 'Tart Phô Mai', 48000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439389/tart-pho-mai_jmyltk.jpg'),
    (16, 'Macaron Mix vị', 45000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439546/macaron-mix-vi_wrxllw.jpg'),
    (17, 'Macaron Socola', 42000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439592/macaron-socola_dpi8ll.jpg'),
    (18, 'Macaron Vanilla', 40000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439640/macaron-vanilla_hbrtru.jpg'),
    (19, 'Macaron Matcha', 44000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439798/macaron-matcha_mqban9.jpg'),
    (20, 'Macaron Dâu Tây', 46000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764439965/macaron-dau-tay_ymn8zy.jpg'),
    (21, 'Panna Cotta Dâu Tây', 55000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440227/panna-cotta_dau_tay_pnhgcw.jpg'),
    (22, 'Cheesecake Chanh Dây', 65000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440308/cheesecake-chanh-day_e19ono.jpg'),
    (23, 'Tiramisu Cacao', 60000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440367/tiramisu-cacao_lpshd1.jpg'),
    (24, 'Creme Brulee', 52000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440441/creme-brulee_bj2bcq.jpg'),
    (25, 'Mochi Kem Trà Xanh', 45000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440503/mochi-kem-tra-xanh_vmwkcl.jpg'),
    (26, 'Brownie Hạnh Nhân', 32000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440549/brownie-hanh-nhan_zn8gj0.jpg'),
    (27, 'Cookie Socola Chip', 28000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440608/cookie-socola-chip_dboejc.jpg'),
    (28, 'Bánh Quy Matcha', 30000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440660/banh-quy-matcha_sv7chq.jpg'),
    (29, 'Bánh Quy Dừa', 25000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440721/banh-quy-dua_oc8hnh.jpg'),
    (30, 'Bánh Quy Hạnh Nhân', 35000, 'https://res.cloudinary.com/dgm63pzn4/image/upload/v1764440780/banh-quy-hanh-nhan_g8iyc8.jpg'),
]

# Customer data (id, name, address)
customers = [
    (4, 'Alice Nguyen', '12 Trần Hưng Đạo, Q1, TP.HCM'),
    (5, 'Bob Tran', '45 Nguyễn Huệ, Q1, TP.HCM'),
    (6, 'Charlie Pham', '78 Lê Lợi, Q1, TP.HCM'),
    (7, 'Daisy Vu', '23 Lý Tự Trọng, Q1, TP.HCM'),
    (8, 'Ethan Le', '56 Pasteur, Q3, TP.HCM'),
    (9, 'Flora Dang', '89 Võ Văn Tần, Q3, TP.HCM'),
    (10, 'George Hoang', '11 Nguyễn Thị Minh Khai, Q1, TP.HCM'),
    (11, 'Hannah Do', '35 Hai Bà Trưng, Q1, TP.HCM'),
    (12, 'Isaac Truong', '67 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM'),
    (13, 'Jasmine Ly', '101 Nguyễn Đình Chiểu, Q3, TP.HCM'),
    (14, 'Kevin Lam', '202 Điện Biên Phủ, Q3, TP.HCM'),
    (15, 'Lily Phan', '303 Võ Văn Kiệt, Q5, TP.HCM'),
]

# Order statuses distribution
order_statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPING', 'PENDING', 'PENDING', 'CANCELLED']
payment_statuses = ['PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PENDING', 'PENDING', 'REFUNDED']
payment_methods = ['STRIPE', 'STRIPE', 'STRIPE', 'STRIPE', 'CASH', 'CASH', 'STRIPE', 'STRIPE', 'CASH', 'STRIPE']

random.seed(42)  # For reproducibility

orders = []
order_items = []
payments = []

order_id = 21  # Starting from 21 (existing orders go to 20)
order_code = 2001

# Get today's date - using a fixed date for reproducibility
# Change this to datetime.now() if you want actual current date
today = datetime(2024, 12, 20)  # Using December 20, 2024 as "today"
current_year = today.year
current_month = today.month
current_day = today.day

# Generate orders for each month in 2025 up to today
# Since today is Dec 20, 2024, we'll generate from Jan 2025 to Dec 2024 (which means up to current date)
# Actually, let's generate from Jan 2025 to the current month in 2025
for month in range(1, 13):
    # For months before current month, generate 10 orders
    # For current month, only generate up to today's day
    if month < current_month or (month == 12 and current_month == 12):
        days_in_month = 10
    else:
        days_in_month = min(10, current_day)
    
    for day_offset in range(days_in_month):
        day = day_offset + 1
        # Skip if we're in current month and day is after today
        if month == current_month and day > current_day:
            break
        customer = random.choice(customers)
        customer_id, customer_name, address = customer
        
        # Generate 2-4 order items
        num_items = random.randint(2, 4)
        items = []
        total_amount = 0
        
        selected_products = random.sample(products, num_items)
        for prod_id, prod_name, prod_price, prod_image in selected_products:
            quantity = random.randint(1, 3)
            unit_price = prod_price
            total_price = unit_price * quantity
            total_amount += total_price
            items.append((prod_id, prod_name, prod_image, unit_price, quantity, total_price))
        
        shipping_fee = 30000
        total_amount += shipping_fee
        
        # Generate date within the month (use 2025 as year)
        # Make sure date doesn't exceed today
        order_day = min(day, 28) if month != current_month else min(day, current_day)
        order_date = datetime(2025, month, order_day, random.randint(8, 20), random.randint(0, 59))
        
        # Skip if order date is in the future
        if order_date > today:
            continue
        created_at = order_date.strftime('%Y-%m-%d %H:%M:%S')
        
        # Determine status
        status_idx = random.randint(0, 9)
        status = order_statuses[status_idx]
        
        # Calculate updated_at based on status
        if status == 'DELIVERED':
            updated_at = (order_date + timedelta(hours=random.randint(4, 8))).strftime('%Y-%m-%d %H:%M:%S')
        elif status == 'SHIPPING':
            updated_at = (order_date + timedelta(hours=random.randint(1, 3))).strftime('%Y-%m-%d %H:%M:%S')
        else:
            updated_at = created_at
        
        note = random.choice([None, 'Giao vào buổi sáng', 'Giao trước 12h', 'Giao vào buổi chiều', 'Giao vào buổi tối', 'Giao vào cuối tuần'])
        
        orders.append((order_id, f'ORD{order_code}', customer_id, total_amount, status, shipping_fee, address, note, created_at, updated_at))
        
        # Generate order items
        for prod_id, prod_name, prod_image, unit_price, quantity, total_price in items:
            order_items.append((order_id, prod_id, unit_price, quantity, total_price, prod_name, prod_image))
        
        # Generate payment
        payment_status = payment_statuses[status_idx]
        payment_method = payment_methods[status_idx]
        transaction_id = f'TXN{order_code}'
        
        if payment_status == 'PAID':
            paid_at = (order_date + timedelta(minutes=random.randint(5, 30))).strftime('%Y-%m-%d %H:%M:%S')
        else:
            paid_at = None
        
        payments.append((order_id, total_amount, payment_method, transaction_id, payment_status, paid_at, created_at))
        
        order_id += 1
        order_code += 1

# Generate SQL
print('-- Orders for 2025 (120 orders - 10 per month)')
print('INSERT INTO orders (code, customer_id, total_amount, status, shipping_fee, shipping_address, note, created_at, updated_at) VALUES')
for i, (oid, code, cid, total, status, fee, addr, note, created, updated) in enumerate(orders):
    note_str = f"'{note}'" if note else 'NULL'
    comma = ',' if i < len(orders) - 1 else ';'
    addr_escaped = addr.replace("'", "''")
    print(f"('{code}', {cid}, {total}, '{status}', {fee}, '{addr_escaped}', {note_str}, '{created}', '{updated}'){comma}")

print()
print('-- Order items for 2025 orders')
print('INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price, product_name, product_image) VALUES')
all_items = []
for oid in range(21, 141):
    for item in order_items:
        if item[0] == oid:
            all_items.append(item)

for i, (oid, pid, uprice, qty, tprice, pname, pimg) in enumerate(all_items):
    comma = ',' if i < len(all_items) - 1 else ';'
    pname_escaped = pname.replace("'", "''")
    print(f"({oid}, {pid}, {uprice}, {qty}, {tprice}, '{pname_escaped}', '{pimg}'){comma}")

print()
print('-- Payments for 2025 orders')
print('INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at, created_at) VALUES')
for i, (oid, amount, method, txid, status, paid_at, created) in enumerate(payments):
    paid_str = f"'{paid_at}'" if paid_at else 'NULL'
    comma = ',' if i < len(payments) - 1 else ';'
    print(f"({oid}, {amount}, '{method}', '{txid}', '{status}', {paid_str}, '{created}'){comma}")

