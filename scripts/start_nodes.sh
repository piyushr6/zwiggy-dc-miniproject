#!/bin/bash

# scripts/start_nodes.sh
# Script to start all distributed nodes (No Docker)

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================"
echo "Starting Distributed Nodes"
echo "========================================${NC}"

# Function to start a node
start_node() {
    local node_id=$1
    local port=$2
    local config_path=$3
    
    echo -e "\n${YELLOW}Starting Node ${node_id}...${NC}"
    
    # Kill existing process on port if any
    lsof -ti:${port} 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    # Start node in background
    cd zwiggy/backend
    NODE_ID=${node_id} \
    NODE_PORT=${port} \
    CONFIG_PATH="../../${config_path}" \
    python3 -m uvicorn zwiggy.backend.main:app \
        --host 0.0.0.0 \
        --port ${port} \
        --reload \
        --log-level info \
        > ../../logs/node${node_id}.log 2>&1 &
    
    local pid=$!
    cd ../..
    
    echo ${pid} > logs/node${node_id}.pid
    echo -e "${GREEN}✓ Node ${node_id} started on port ${port} (PID: ${pid})${NC}"
    
    # Wait a bit for node to initialize
    sleep 2
}

# Function to check if node is running
check_node() {
    local port=$1
    local node_id=$2
    
    if curl -s http://localhost:${port}/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Node ${node_id} is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Node ${node_id} health check failed${NC}"
        return 1
    fi
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    else
        echo -e "${RED}Virtual environment not found. Run ./scripts/setup.sh first${NC}"
        exit 1
    fi
fi

# Check if PostgreSQL is running
echo -e "\n${YELLOW}Checking PostgreSQL connection...${NC}"
if psql -h localhost -U postgres -d food_delivery -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not accessible${NC}"
    echo -e "${YELLOW}Please ensure PostgreSQL is running:${NC}"
    echo "  - Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  - macOS: brew services start postgresql"
    echo "  - Windows: Start PostgreSQL service from Services"
    exit 1
fi

# Check if database exists
echo -e "\n${YELLOW}Checking database...${NC}"
if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw food_delivery; then
    echo -e "${GREEN}✓ Database 'food_delivery' exists${NC}"
else
    echo -e "${YELLOW}Database 'food_delivery' not found. Creating...${NC}"
    psql -h localhost -U postgres -c "CREATE DATABASE food_delivery;" || {
        echo -e "${RED}Failed to create database. Please create it manually:${NC}"
        echo "  sudo -u postgres psql -c \"CREATE DATABASE food_delivery;\""
        exit 1
    }
fi

# Start nodes
start_node 1 5001 "zwiggy/nodes/node1/config.yml"
start_node 2 5002 "zwiggy/nodes/node2/config.yml"
start_node 3 5003 "zwiggy/nodes/node3/config.yml"

# Wait for all nodes to be ready
echo -e "\n${YELLOW}Waiting for nodes to be ready...${NC}"
sleep 5

# Health check for all nodes
echo -e "\n${YELLOW}Performing health checks...${NC}"
all_healthy=true
check_node 5001 1 || all_healthy=false
check_node 5002 2 || all_healthy=false
check_node 5003 3 || all_healthy=false

if [ "$all_healthy" = true ]; then
    echo -e "\n${GREEN}========================================"
    echo "All nodes started successfully!"
    echo "========================================${NC}"
    echo ""
    echo -e "${BLUE}Node URLs:${NC}"
    echo "  Node 1: http://localhost:5001"
    echo "  Node 2: http://localhost:5002"
    echo "  Node 3: http://localhost:5003"
    echo ""
    echo -e "${BLUE}API Documentation:${NC}"
    echo "  Node 1: http://localhost:5001/docs"
    echo "  Node 2: http://localhost:5002/docs"
    echo "  Node 3: http://localhost:5003/docs"
    echo ""
    echo -e "${BLUE}Logs:${NC}"
    echo "  tail -f logs/node1.log"
    echo "  tail -f logs/node2.log"
    echo "  tail -f logs/node3.log"
    echo ""
    echo -e "${YELLOW}To stop nodes:${NC}"
    echo "  kill \$(cat logs/node*.pid)"
    echo "  or run: pkill -f 'uvicorn zwiggy.backend.main'"
else
    echo -e "\n${RED}========================================"
    echo "Some nodes failed to start!"
    echo "========================================${NC}"
    echo -e "${YELLOW}Check logs for details:${NC}"
    echo "  tail -f logs/node*.log"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  1. Port already in use: lsof -ti:5001 | xargs kill -9"
    echo "  2. Database not accessible: check PostgreSQL status"
    echo "  3. Missing dependencies: source venv/bin/activate && pip install -r requirements.txt"
    exit 1
