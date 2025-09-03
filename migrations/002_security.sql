-- optional migration if DB lacks some fields/tables

-- Users extra fields (if missing)
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;
-- ALTER TABLE users ADD COLUMN salt          VARCHAR(50)  NOT NULL;
-- ALTER TABLE users ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0;
-- ALTER TABLE users ADD COLUMN last_failed_at DATETIME NULL;

-- Password history table (if missing)
-- CREATE TABLE password_history (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );
-- CREATE INDEX idx_ph_user_changed ON password_history(user_id, changed_at DESC);
