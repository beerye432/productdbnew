alter sequence categories_id_seq restart with 1;
alter sequence users_id_seq restart with 1;
alter sequence states_id_seq restart with 1;
alter sequence orders_id_seq restart with 1;
alter sequence products_id_seq restart with 1;

\copy states(name) FROM 'states.txt' DELIMITER ',' CSV;
\copy users(name, role, age, state_id) FROM 'users.txt' DELIMITER ',' CSV;
\copy categories(name, description) FROM 'categories.txt' DELIMITER ',' CSV;
\copy products(name, sku, category_id, price, is_delete) FROM 'products.txt' DELIMITER ',' CSV;
\copy orders(user_id, product_id, quantity, price, is_cart) FROM 'orders.txt' DELIMITER ',' CSV;
