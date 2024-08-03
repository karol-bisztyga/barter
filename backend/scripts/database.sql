CREATE DATABASE barter;

-- reset.sql
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS items_images;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50),
    facebook VARCHAR(50),
    instagram VARCHAR(50),
    profile_picture VARCHAR(100),
    password VARCHAR(100) NOT NULL
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);


CREATE TABLE items_images (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    url VARCHAR(100) NOT NULL
);
