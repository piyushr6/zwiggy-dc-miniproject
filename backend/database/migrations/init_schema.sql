-- =====================================================================
-- DISTRIBUTED FOOD DELIVERY SYSTEM (POSTGRESQL VERSION)
-- =====================================================================

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    rating DOUBLE PRECISION DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    item_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK(price >= 0),
    quantity_available INTEGER DEFAULT 0 CHECK(quantity_available >= 0),
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- USERS
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
    total_amount NUMERIC(12,2) NOT NULL CHECK(total_amount >= 0),
    status VARCHAR(30) DEFAULT 'pending' CHECK(status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
    logical_timestamp BIGINT NOT NULL,
    processed_by_node INTEGER NOT NULL,
    delivery_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- DELIVERY AGENTS
CREATE TABLE IF NOT EXISTS delivery_agents (
    agent_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_location VARCHAR(100),
    assigned_order_id UUID REFERENCES orders(order_id),
    total_deliveries INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_available ON delivery_agents(is_available);

-- EVENT LOG
CREATE TABLE IF NOT EXISTS event_log (
    id SERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    logical_time BIGINT NOT NULL,
    physical_time DOUBLE PRECISION NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REPLICATION LOG
CREATE TABLE IF NOT EXISTS replication_log (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(10) NOT NULL CHECK(operation IN ('INSERT','UPDATE','DELETE')),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(150) NOT NULL,
    data JSONB NOT NULL,
    replicated_to TEXT,
    timestamp DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POPULAR ITEMS
CREATE TABLE IF NOT EXISTS popular_items (
    item_id INTEGER PRIMARY KEY REFERENCES menu_items(item_id),
    item_name VARCHAR(255) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    total_revenue NUMERIC(12,2) DEFAULT 0,
    last_ordered TIMESTAMP
);

-- RESTAURANT PERFORMANCE
CREATE TABLE IF NOT EXISTS restaurant_performance (
    restaurant_id INTEGER PRIMARY KEY REFERENCES restaurants(restaurant_id),
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC(12,2) DEFAULT 0,
    avg_order_value NUMERIC(12,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    avg_rating DOUBLE PRECISION DEFAULT 0,
    last_order TIMESTAMP
);
