CREATE DATABASE barter;

-- reset.sql
DROP TABLE IF EXISTS items_images;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50),
    facebook VARCHAR(50),
    instagram VARCHAR(50),
    profile_picture VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    date_added BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    date_edited BIGINT
);


CREATE TABLE items_images (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    url VARCHAR(400) NOT NULL
);

-- new tables
/*
- likes
- matches
- messages
*/