-- reset.sql
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS items_images;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE EXTENSION cube;
CREATE EXTENSION earthdistance;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50),
    facebook VARCHAR(50),
    instagram VARCHAR(50),
    profile_picture VARCHAR(400),
    password VARCHAR(100) NOT NULL,
    location_coordinate_lat VARCHAR(50),
    location_coordinate_lon VARCHAR(50),
    location_city VARCHAR(100),
    verification_code VARCHAR(6),
    onboarded BOOLEAN DEFAULT FALSE,
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    date_edited BIGINT
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

-- this table should store likes and dislikes to avoid showing the same item again
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    liker_id INTEGER REFERENCES users(id) NOT NULL,
    liked_id INTEGER REFERENCES items(id) NOT NULL,
    decision BOOLEAN NOT NULL, -- true=liked, false=disliked
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    matching_item_id INTEGER REFERENCES items(id) NOT NULL,
    matched_item_id INTEGER REFERENCES items(id) NOT NULL,
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    date_updated BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    date_matching_owner_notified BIGINT DEFAULT 0,
    date_matched_owner_notified BIGINT DEFAULT 0
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) NOT NULL,
    match_id INTEGER REFERENCES matches(id) NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER REFERENCES users(id) NOT NULL,
    reported_item_id INTEGER REFERENCES items(id) NOT NULL,
    reason TEXT NOT NULL,
    date_created BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
