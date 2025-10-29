#!/bin/bash

# scripts/setup.sh
# Setup script for distributed food delivery system (No Docker)

set -e

echo "========================================"
echo "Distributed Food Delivery System Setup"
echo "========================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL client not found${NC}"
    echo -e "${YELLOW}Please install PostgreSQL: https://www.postgresql.org/download/${NC}"
fi

# Create necessary directories
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p zwiggy/nodes/node1/data
mkdir -p zwiggy/nodes/node2/data
mkdir -p zwiggy/nodes/node3/data
mkdir -p zwiggy/backend/database/migrations
mkdir -p zwiggy/backend/core
mkdir -p zwiggy/backend/distributed
mkdir -p zwiggy/backend/concurrency
mkdir -p zwiggy/backend/models
mkdir -p zwiggy/backend/services
mkdir -p zwiggy/backend/api/routes
mkdir -p zwiggy/backend/api/middleware
mkdir -p zwiggy/backend/utils
mkdir -p logs
mkdir -p monitoring

echo -e "${GREEN}✓ Directories created${NC}"

# Create __init__.py files for Python packages
echo -e "\n${YELLOW}Creating Python package files...${NC}"
touch zwiggy/__init__.py
touch zwiggy/backend/__init__.py
touch zwiggy/backend/core/__init__.py
touch zwiggy/backend/distributed/__init__.py
touch zwiggy/backend/concurrency/__init__.py
touch zwiggy/backend/models/__init__.py
touch zwiggy/backend/services/__init__.py
touch zwiggy/backend/api/__init__.py
touch zwiggy/backend/api/routes/__init__.py
touch zwiggy/backend/api/middleware/__init__.py
touch zwiggy/backend/utils/__init__.py

echo -e "${GREEN}✓ Python packages initialized${NC}"

# Create node configuration files
echo -e "\n${YELLOW}Creating node configurations...${NC}"

# Node 1 config
cat > zwiggy/nodes/node1/config.yml << EOF
node:
  id: 1
  host: localhost
  port: 5001
  priority: 3
  
database:
  host: localhost
  port: 5432
  name: food_delivery
  user: postgres
  password: postgres
  
replication:
  role: primary
  replicas:
    - node2
    - node3
    
monitoring:
  enabled: true
  port: 9091
EOF

# Node 2 config
cat > zwiggy/nodes/node2/config.yml << EOF
node:
  id: 2
  host: localhost
  port: 5002
  priority: 2
  
database:
  host: localhost
  port: 5432
  name: food_delivery
  user: postgres
  password: postgres
  
replication:
  role: replica
  primary: node1
    
monitoring:
  enabled: true
  port: 9092
EOF

# Node 3 config
cat > zwiggy/nodes/node3/config.yml << EOF
node:
  id: 3
  host: localhost
  port: 5003
  priority: 1
  
database:
  host: localhost
  port: 5432
  name: food_delivery
  user: postgres
  password: postgres
  
replication:
  role: replica
  primary: node1
    
monitoring:
  enabled: true
  port: 9093
EOF

echo -e "${GREEN}✓ Node configurations created${NC}"

# Setup Python virtual environment
echo -e "\n${YELLOW}Setting up Python environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate

# Create requirements.txt if it doesn't exist
if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << EOF
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
alembic==1.12.1

# Async
aiohttp==3.9.1
asyncio==3.4.3

# Distributed Systems
redis==5.0.1
pyyaml==6.0.1

# Utilities
python-dotenv==1.0.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
EOF
fi

pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Setup frontend
echo -e "\n${YELLOW}Setting up frontend...${NC}"
if [ -d "zwiggy/frontend" ]; then
    cd zwiggy/frontend
    if [ ! -d "node_modules" ]; then
        npm install
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
    fi
    cd ../..
else
    echo -e "${YELLOW}Frontend directory not found, skipping...${NC}"
fi

# Create .env files
echo -e "\n${YELLOW}Creating environment files...${NC}"

# Backend .env
cat > zwiggy/backend/.env << EOF
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=food_delivery
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Node Configuration
NODE_ID=1
NODE_HOST=localhost
NODE_PORT=5001

# Security
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 16)
JWT_SECRET=your-jwt-secret-change-in-production-$(openssl rand -hex 16)

# Environment
ENVIRONMENT=development
DEBUG=True

# Distributed System
ELECTION_TIMEOUT=5000
HEARTBEAT_INTERVAL=1000
REPLICATION_LAG_THRESHOLD=1000

# Redis (if available)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
EOF

# Frontend .env
if [ -d "zwiggy/frontend" ]; then
    cat > zwiggy/frontend/.env << EOF
VITE_API_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5001/ws
VITE_NODE_1_URL=http://localhost:5001
VITE_NODE_2_URL=http://localhost:5002
VITE_NODE_3_URL=http://localhost:5003
EOF
fi

echo -e "${GREEN}✓ Environment files created${NC}"

# Initialize database schema
echo -e "\n${YELLOW}Creating database schema...${NC}"
cat > zwiggy/backend/database/migrations/init_schema.sql << EOF
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS food_delivery;

-- Connect to database
\c food_delivery;

-- Create tables for distributed food delivery system
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cuisine_type VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    restaurant_id INTEGER REFERENCES restaurants(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    node_id INTEGER,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_available BOOLEAN DEFAULT true,
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    agent_id INTEGER REFERENCES delivery_agents(id),
    status VARCHAR(50) DEFAULT 'assigned',
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_log (
    id SERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    lamport_timestamp BIGINT,
    severity VARCHAR(20) DEFAULT 'info',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS distributed_locks (
    resource_id VARCHAR(255) PRIMARY KEY,
    node_id INTEGER NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_event_log_node_id ON event_log(node_id);
CREATE INDEX IF NOT EXISTS idx_event_log_event_type ON event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_event_log_created_at ON event_log(created_at);
EOF

echo -e "${GREEN}✓ Database schema created${NC}"

# Make scripts executable
echo -e "\n${YELLOW}Making scripts executable...${NC}"
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x scripts/*.py 2>/dev/null || true
echo -e "${GREEN}✓ Scripts are now executable${NC}"

echo -e "\n${GREEN}========================================"
echo "Setup completed successfully!"
echo "========================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Install and start PostgreSQL locally"
echo "   - Ubuntu/Debian: sudo apt-get install postgresql"
echo "   - macOS: brew install postgresql"
echo "   - Windows: Download from https://www.postgresql.org/download/"
echo ""
echo "2. Create database and run migrations:"
echo "   sudo -u postgres psql -f zwiggy/backend/database/migrations/init_schema.sql"
echo ""
echo "3. Seed database with sample data:"
echo "   source venv/bin/activate"
echo "   python scripts/seed_data.py"
echo ""
echo "4. Start backend nodes:"
echo "   ./scripts/start_nodes.sh"
echo ""
echo "5. Start frontend:"
echo "   cd zwiggy/frontend && npm run dev"
echo ""
echo -e "${YELLOW}For simulation:${NC}"
echo "python scripts/run_simulation.py"
echo ""
echo -e "${GREEN}Happy coding!${NC}"