-- Users table (for multi-user support)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bid List table (combines in-lane, proxy, and pass)
CREATE TABLE IF NOT EXISTS bid_list (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  vehicle_id INT NOT NULL REFERENCES runlist_vehicles(id) ON DELETE CASCADE,
  auction_id INT NOT NULL REFERENCES runlists(id) ON DELETE CASCADE,
  bid_type VARCHAR(20) NOT NULL CHECK (bid_type IN ('in-lane', 'proxy', 'pass')),
  max_bid DECIMAL(10,2), -- NULL for in-lane and pass, required for proxy
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, vehicle_id, auction_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bid_list_user_auction ON bid_list(user_id, auction_id);
CREATE INDEX IF NOT EXISTS idx_bid_list_bid_type ON bid_list(bid_type);
CREATE INDEX IF NOT EXISTS idx_bid_list_vehicle ON bid_list(vehicle_id);

-- Insert default user for single-user mode (can be updated later)
INSERT INTO users (email, name) 
VALUES ('default@autointel.local', 'Default User')
ON CONFLICT (email) DO NOTHING;
