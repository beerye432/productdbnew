DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE users (
    id    SERIAL PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE,
    role  char(1) NOT NULL,
    age   INTEGER NOT NULL,
    state char(2) NOT NULL
);

CREATE TABLE categories (
    id  SERIAL PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE,
    description  TEXT NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku CHAR(10) NOT NULL UNIQUE,
    category_id INTEGER REFERENCES categories (id) NOT NULL,
    price FLOAT NOT NULL CHECK (price >= 0),
    is_delete BOOLEAN NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) NOT NULL,
    product_id INTEGER REFERENCES products (id) NOT NULL,
    quantity INTEGER NOT NULL,
    price FLOAT NOT NULL CHECK (price >= 0),
    is_cart BOOLEAN NOT NULL
);
