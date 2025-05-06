CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `read` BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(50),
  action_data JSON,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
