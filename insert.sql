\copy users(name, role, age, state) FROM 'users.txt' DELIMITER ',' CSV;
\copy categories(name, description) FROM 'categories.txt' DELIMITER ',' CSV;
\copy products(name, sku, category_id, price, is_delete) FROM 'products.txt' DELIMITER ',' CSV;
\copy orders(user_id, product_id, quantity, price, is_cart) FROM 'orders.txt' DELIMITER ',' CSV;
