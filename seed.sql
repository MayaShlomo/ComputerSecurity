-- Sample data for Communication_LTD security project
-- Development and testing purposes only

-- System administrator account (password will be set during deployment)
INSERT INTO users (username, email, password_hash, salt) 
VALUES ('admin', 'admin@comunicationltd.com', 'temp_hash_admin', 'temp_salt_admin');

-- Test user account for development
INSERT INTO users (username, email, password_hash, salt) 
VALUES ('demo_user', 'demo@comunicationltd.com', 'temp_hash_demo', 'temp_salt_demo');

-- Sample customer records
INSERT INTO customers (name, email, phone) 
VALUES 
('TechCorp Solutions Ltd', 'contact@techcorp-solutions.com', '+972-3-1234567'),
('DataFlow Systems', 'info@dataflow-systems.com', '+972-4-2345678'),
('CloudNet Services', 'support@cloudnet-services.com', '+972-2-3456789');

-- Sample password history entries (for testing password reuse prevention)
INSERT INTO password_history (user_id, password_hash) 
VALUES 
(1, 'prev_hash_1'), 
(1, 'prev_hash_2'),
(2, 'prev_hash_demo_1');