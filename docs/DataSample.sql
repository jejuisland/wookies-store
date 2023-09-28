use bookstore_db;

INSERT INTO users (username, password) VALUES
  ('DarthVader', 'Vader'),
  ('wookies1', 'wook1'),
  ('wookies2', 'wook2');
  
  
INSERT INTO Books (title, description, author, coverImage, price, createdAt, updatedAt)
VALUES
  ('Star Wars - Nicki Minaj Invasions', 'Nicki Minaj the alien master force the wookies to twerk', 'Lohgarra Wookie', 'https://i.imgur.com/fiTsKUd.jpg', 19.99, NOW(), NOW()),
  ('Star Wars - Taylor Swift Extraction', 'Taylor Swift kidnapped by alien master named Nicki Minaj', 'Lohgarra Wookie Jr.', 'https://www.billboard.com/wp-content/uploads/media/taylor-swift-nicki-minaj-2012-billboard-650.jpg?w=650&h=430&crop=1', 14.99, NOW(), NOW());
