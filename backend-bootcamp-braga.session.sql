-- @block
-- List tables
SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND 
    schemaname != 'information_schema';

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
-- Inserting data to the new table
INSERT INTO portfolio_items (filter, img_src, title, summary, gallery_href, gallery_title)
VALUES
    ('filter-app', 'assets/img/portfolio/portfolio-1.jpg', 'App 1', 'App', 'assets/img/portfolio/portfolio-1.jpg', 'App 1'),
    ('filter-web', 'assets/img/portfolio/portfolio-2.jpg', 'Web 3', 'Web', 'assets/img/portfolio/portfolio-2.jpg', 'Web 3');

-- @block
-- Read from a table
SELECT * FROM portfolio_items;

-- @block
-- Remove table
DROP TABLE portfolio_items;