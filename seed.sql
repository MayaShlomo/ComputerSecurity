USE comunicationltd;

INSERT INTO users (username, email, password_hash, salt)
VALUES ('admin', 'admin@comunicationltd.com', 'temp_hash_admin', 'temp_salt_admin');

INSERT INTO customers (name, email, phone)
VALUES ('TechCorp Solutions Ltd', 'contact@techcorp-solutions.com', '+972-3-1234567');
