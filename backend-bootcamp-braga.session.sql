-- @block
-- List tables
SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
    AND schemaname != 'information_schema';
-- @block
-- Create a table
CREATE TABLE portfolio_items (
    id SERIAL PRIMARY KEY,
    filter VARCHAR(255),
    img_src VARCHAR(255),
    title VARCHAR(255),
    summary VARCHAR(255),
    gallery_href VARCHAR(255),
    gallery_title VARCHAR(255)
);
-- @block
-- Create a table
CREATE TABLE resume_entries (
    id SERIAL PRIMARY KEY,
    "column" SMALLINT,
    title VARCHAR(255),
    items TEXT []
);
-- @block
-- Create a table
CREATE TABLE user_auth (
    email VARCHAR(100) PRIMARY KEY,
    hashed_password varchar(255)
);
-- @block
-- Inserting data to the new table
INSERT INTO portfolio_items (
        filter,
        img_src,
        title,
        summary,
        gallery_href,
        gallery_title
    )
VALUES (
        'filter-app',
        'assets/img/portfolio/portfolio-1.jpg',
        'App 1',
        'App',
        'assets/img/portfolio/portfolio-1.jpg',
        'App 1'
    ),
    (
        'filter-web',
        'assets/img/portfolio/portfolio-2.jpg',
        'Web 3',
        'Web',
        'assets/img/portfolio/portfolio-2.jpg',
        'Web 3'
    );
-- @block
-- Read from a table
SELECT *
FROM user_auth;
-- @block
-- Remove table
DROP TABLE user_auth;
-- @block
-- Update row
UPDATE portfolio_items
SET title =,
    WHERE id = 4
RETURNING *;