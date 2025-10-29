-- ============================================================================
-- DISTRIBUTED FOOD DELIVERY SYSTEM - DATABASE SCHEMA
-- ============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- RESTAURANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    rating REAL DEFAULT 0.0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);

-- ============================================================================
-- MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
    item_id INTEGER PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL CHECK(price >= 0),
    quantity_available INTEGER DEFAULT 0 CHECK(quantity_available >= 0),
    category TEXT,
    is_available INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    logical_timestamp INTEGER NOT NULL,
    processed_by_node INTEGER NOT NULL,
    delivery_address TEXT,
    payment_method TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_node ON orders(processed_by_node);
CREATE INDEX IF NOT EXISTS idx_orders_logical_time ON orders(logical_timestamp);

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price REAL NOT NULL CHECK(price >= 0),
    subtotal REAL GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON order_items(item_id);

-- ============================================================================
-- DELIVERY AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_agents (
    agent_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_available INTEGER DEFAULT 1,
    current_location TEXT,
    assigned_order_id TEXT,
    total_deliveries INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_order_id) REFERENCES orders(order_id)
);

CREATE INDEX IF NOT EXISTS idx_agents_available ON delivery_agents(is_available);
CREATE INDEX IF NOT EXISTS idx_agents_order ON delivery_agents(assigned_order_id);

-- ============================================================================
-- EVENT LOG TABLE (for distributed system monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    logical_time INTEGER NOT NULL,
    physical_time REAL NOT NULL,
    data TEXT,  -- JSON data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_log_node ON event_log(node_id);
CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_event_log_logical ON event_log(logical_time);
CREATE INDEX IF NOT EXISTS idx_event_log_physical ON event_log(physical_time);

-- ============================================================================
-- REPLICATION LOG TABLE (tracks replication status)
-- ============================================================================
CREATE TABLE IF NOT EXISTS replication_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    data TEXT NOT NULL,  -- JSON data
    replicated_to TEXT,  -- Comma-separated replica IDs
    timestamp REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_replication_log_timestamp ON replication_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_replication_log_table ON replication_log(table_name);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Popular items tracking
CREATE TABLE IF NOT EXISTS popular_items (
    item_id INTEGER PRIMARY KEY,
    item_name TEXT NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0.0,
    last_ordered TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- Restaurant performance
CREATE TABLE IF NOT EXISTS restaurant_performance (
    restaurant_id INTEGER PRIMARY KEY,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0.0,
    avg_order_value REAL DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0.0,
    last_order TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert sample restaurants
INSERT OR IGNORE INTO restaurants (restaurant_id, name, cuisine, rating) VALUES
(1, 'Pizza Palace', 'Italian', 4.5),
(2, 'Burger Haven', 'American', 4.3),
(3, 'Sushi World', 'Japanese', 4.7),
(4, 'Taco Fiesta', 'Mexican', 4.4),
(5, 'Curry House', 'Indian', 4.6);

-- Insert sample menu items
INSERT OR IGNORE INTO menu_items (item_id, restaurant_id, name, price, quantity_available, category) VALUES
-- Pizza Palace
(1, 1, 'Margherita Pizza', 12.99, 50, 'Pizza'),
(2, 1, 'Pepperoni Pizza', 14.99, 30, 'Pizza'),
(3, 1, 'Pasta Alfredo', 11.99, 40, 'Pasta'),
(4, 1, 'Caesar Salad', 7.99, 60, 'Salad'),

-- Burger Haven
(5, 2, 'Classic Burger', 9.99, 60, 'Burger'),
(6, 2, 'Cheese Burger', 10.99, 45, 'Burger'),
(7, 2, 'Fries', 3.99, 100, 'Sides'),
(8, 2, 'Milkshake', 5.99, 50, 'Drinks'),

-- Sushi World
(9, 3, 'California Roll', 8.99, 35, 'Roll'),
(10, 3, 'Salmon Sashimi', 15.99, 20, 'Sashimi'),
(11, 3, 'Miso Soup', 4.99, 50, 'Soup'),
(12, 3, 'Green Tea', 2.99, 80, 'Drinks'),

-- Taco Fiesta
(13, 4, 'Beef Tacos', 8.99, 70, 'Tacos'),
(14, 4, 'Chicken Burrito', 10.99, 45, 'Burrito'),
(15, 4, 'Nachos', 6.99, 55, 'Appetizer'),
(16, 4, 'Guacamole', 4.99, 40, 'Sides'),

-- Curry House
(17, 5, 'Chicken Tikka Masala', 13.99, 40, 'Curry'),
(18, 5, 'Lamb Biryani', 15.99, 30, 'Rice'),
(19, 5, 'Naan Bread', 2.99, 100, 'Bread'),
(20, 5, 'Samosas', 5.99, 60, 'Appetizer');

-- Insert sample users
INSERT OR IGNORE INTO users (user_id, name, email, phone, address, city) VALUES
(101, 'Alice Johnson', 'alice@example.com', '555-1001', '123 Main St', 'Mumbai'),
(102, 'Bob Smith', 'bob@example.com', '555-1002', '456 Oak Ave', 'Mumbai'),
(103, 'Carol White', 'carol@example.com', '555-1003', '789 Pine Rd', 'Mumbai'),
(104, 'David Brown', 'david@example.com', '555-1004', '321 Elm St', 'Mumbai'),
(105, 'Emma Davis', 'emma@example.com', '555-1005', '654 Maple Dr', 'Mumbai');

-- Insert sample delivery agents
INSERT OR IGNORE INTO delivery_agents (agent_id, name, phone, current_location, rating) VALUES
(1, 'John Doe', '555-2001', 'Zone A', 4.8),
(2, 'Jane Smith', '555-2002', 'Zone B', 4.9),
(3, 'Mike Johnson', '555-2003', 'Zone C', 4.7),
(4, 'Sarah Williams', '555-2004', 'Zone A', 4.6),
(5, 'Tom Anderson', '555-2005', 'Zone B', 4.8);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update restaurant performance on new order
CREATE TRIGGER IF NOT EXISTS update_restaurant_performance_insert
AFTER INSERT ON orders
BEGIN
    INSERT INTO restaurant_performance (restaurant_id, total_orders, total_revenue, avg_order_value, last_order)
    VALUES (NEW.restaurant_id, 1, NEW.total_amount, NEW.total_amount, NEW.created_at)
    ON CONFLICT(restaurant_id) DO UPDATE SET
        total_orders = total_orders + 1,
        total_revenue = total_revenue + NEW.total_amount,
        avg_order_value = (total_revenue + NEW.total_amount) / (total_orders + 1),
        last_order = NEW.created_at;
END;

-- Update popular items on order item insert
CREATE TRIGGER IF NOT EXISTS update_popular_items
AFTER INSERT ON order_items
BEGIN
    INSERT INTO popular_items (item_id, item_name, total_orders, total_quantity, total_revenue, last_ordered)
    VALUES (NEW.item_id, NEW.item_name, 1, NEW.quantity, NEW.quantity * NEW.price, CURRENT_TIMESTAMP)
    ON CONFLICT(item_id) DO UPDATE SET
        total_orders = total_orders + 1,
        total_quantity = total_quantity + NEW.quantity,
        total_revenue = total_revenue + (NEW.quantity * NEW.price),
        last_ordered = CURRENT_TIMESTAMP;
END;

-- Update timestamps on record updates
CREATE TRIGGER IF NOT EXISTS update_restaurant_timestamp
AFTER UPDATE ON restaurants
BEGIN
    UPDATE restaurants SET updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = NEW.restaurant_id;
END;

CREATE TRIGGER IF NOT EXISTS update_order_timestamp
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = NEW.order_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Order details with all information
CREATE VIEW IF NOT EXISTS order_details AS
SELECT 
    o.order_id,
    o.user_id,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    o.restaurant_id,
    r.name as restaurant_name,
    r.cuisine,
    o.total_amount,
    o.status,
    o.logical_timestamp,
    o.processed_by_node,
    o.created_at,
    o.updated_at
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN restaurants r ON o.restaurant_id = r.restaurant_id;

-- Restaurant menu with availability
CREATE VIEW IF NOT EXISTS restaurant_menu AS
SELECT 
    r.restaurant_id,
    r.name as restaurant_name,
    r.cuisine,
    r.rating as restaurant_rating,
    mi.item_id,
    mi.name as item_name,
    mi.description,
    mi.price,
    mi.quantity_available,
    mi.category,
    mi.is_available
FROM restaurants r
JOIN menu_items mi ON r.restaurant_id = mi.restaurant_id
WHERE r.is_active = 1;

-- Active delivery status
CREATE VIEW IF NOT EXISTS active_deliveries AS
SELECT 
    da.agent_id,
    da.name as agent_name,
    da.phone as agent_phone,
    da.current_location,
    da.assigned_order_id,
    o.user_id,
    u.name as customer_name,
    o.restaurant_id,
    r.name as restaurant_name,
    o.status as order_status,
    o.total_amount
FROM delivery_agents da
LEFT JOIN orders o ON da.assigned_order_id = o.order_id
LEFT JOIN users u ON o.user_id = u.user_id
LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
WHERE da.is_available = 0 AND da.assigned_order_id IS NOT NULL;

-- ============================================================================
-- STORED PROCEDURES (Simulated with prepared statements)
-- ============================================================================

-- Note: SQLite doesn't have stored procedures, but we can create
-- prepared statements that can be called from application code

-- Example queries that would be "procedures":

-- Get restaurant with menu
-- SELECT * FROM restaurant_menu WHERE restaurant_id = ?;

-- Get user order history
-- SELECT * FROM order_details WHERE user_id = ? ORDER BY created_at DESC;

-- Get available delivery agents
-- SELECT * FROM delivery_agents WHERE is_available = 1;

-- Get orders by status
-- SELECT * FROM order_details WHERE status = ?;

-- Get top selling items
-- SELECT * FROM popular_items ORDER BY total_quantity DESC LIMIT ?;

-- Get restaurant performance
-- SELECT * FROM restaurant_performance ORDER BY total_revenue DESC;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

/*
DISTRIBUTED SYSTEM CONSIDERATIONS:

1. REPLICATION:
   - replication_log table tracks all write operations
   - Timestamps enable delta synchronization
   - Replica databases can catch up by querying this log

2. CONSISTENCY:
   - Strong consistency: Read from primary after sync write
   - Eventual consistency: Read from replicas with possible lag
   - Causal consistency: logical_timestamp in orders enables ordering

3. PARTITIONING:
   - processed_by_node field tracks which node handled request
   - Enables horizontal scaling and load balancing
   - Can partition data by restaurant, geography, or user

4. FAILURE HANDLING:
   - Multiple replicas provide redundancy
   - Event log enables reconstruction of state
   - Node tracking enables detection of failures

5. ANALYTICS:
   - Popular items and performance tables enable fast queries
   - Can be computed using MapReduce across nodes
   - Triggers maintain aggregated data in real-time

6. MONITORING:
   - Event log tracks all distributed events
   - Replication log enables lag monitoring
   - Indexes optimize query performance

PERFORMANCE OPTIMIZATIONS:
- Indexes on foreign keys and frequently queried columns
- Views for complex joins used repeatedly
- Triggers for maintaining aggregated statistics
- Generated columns for computed values
- Proper use of CHECK constraints for data integrity

SCALABILITY:
- Can shard by restaurant_id or user_id
- Read replicas handle read load
- Primary handles all writes
- Async replication for eventual consistency
*/

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT OR IGNORE INTO schema_version (version, description) VALUES
(1, 'Initial schema with all tables, indexes, triggers, and seed data');

-- End of schema
