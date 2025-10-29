#!/usr/bin/env python3
"""
scripts/seed_data.py
Seed database with sample data for testing
"""

import psycopg2
from psycopg2.extras import execute_batch
import random
from datetime import datetime, timedelta
import hashlib
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'port': int(os.getenv('DATABASE_PORT', 5432)),
    'database': os.getenv('DATABASE_NAME', 'food_delivery'),
    'user': os.getenv('DATABASE_USER', 'postgres'),
    'password': os.getenv('DATABASE_PASSWORD', 'postgres')
}

def hash_password(password: str) -> str:
    """Simple password hashing for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()

def seed_users(cursor, count=50):
    """Seed users table"""
    print(f"Seeding {count} users...")
    
    users = []
    roles = ['customer', 'customer', 'customer', 'restaurant_owner', 'admin']
    
    for i in range(1, count + 1):
        users.append((
            f'user{i}',
            f'user{i}@example.com',
            hash_password('password123'),
            random.choice(roles)
        ))
    
    execute_batch(cursor, """
        INSERT INTO users (username, email, password_hash, role)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (username) DO NOTHING
    """, users)
    
    print(f"✓ {count} users seeded")

def seed_restaurants(cursor, count=20):
    """Seed restaurants table"""
    print(f"Seeding {count} restaurants...")
    
    restaurant_names = [
        'Pizza Palace', 'Burger Barn', 'Sushi Station', 'Taco Town',
        'Pasta Paradise', 'Curry House', 'BBQ Pit', 'Salad Bar',
        'Noodle Nation', 'Sandwich Shop', 'Steak House', 'Seafood Shack',
        'Vegan Valley', 'Bakery Bliss', 'Coffee Corner', 'Ice Cream Island',
        'Thai Taste', 'Mexican Fiesta', 'Chinese Garden', 'Indian Spice'
    ]
    
    cuisines = ['Italian', 'American', 'Japanese', 'Mexican', 'Indian', 
                'Chinese', 'Thai', 'Mediterranean', 'Vegan', 'Seafood']
    
    restaurants = []
    for i, name in enumerate(restaurant_names[:count], 1):
        restaurants.append((
            name,
            f'{random.randint(100, 999)} {random.choice(["Main", "Oak", "Elm", "Park"])} St',
            round(random.uniform(40.7, 40.8), 6),
            round(random.uniform(-74.0, -73.9), 6),
            random.choice(cuisines),
            round(random.uniform(3.5, 5.0), 1)
        ))
    
    execute_batch(cursor, """
        INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type, rating)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, restaurants)
    
    print(f"✓ {count} restaurants seeded")

def seed_menu_items(cursor):
    """Seed menu items table"""
    print("Seeding menu items...")
    
    menu_templates = {
        'Pizza': ['Margherita Pizza', 'Pepperoni Pizza', 'Vegetarian Pizza', 'BBQ Chicken Pizza'],
        'Burger': ['Classic Burger', 'Cheese Burger', 'Veggie Burger', 'Double Burger'],
        'Sushi': ['California Roll', 'Salmon Nigiri', 'Tuna Sashimi', 'Dragon Roll'],
        'Taco': ['Beef Taco', 'Chicken Taco', 'Fish Taco', 'Veggie Taco'],
        'Pasta': ['Spaghetti Carbonara', 'Fettuccine Alfredo', 'Penne Arrabbiata', 'Lasagna'],
        'Curry': ['Chicken Curry', 'Lamb Curry', 'Veggie Curry', 'Paneer Tikka Masala'],
        'Sides': ['French Fries', 'Onion Rings', 'Coleslaw', 'Garlic Bread'],
        'Drinks': ['Coca Cola', 'Sprite', 'Water', 'Lemonade'],
        'Desserts': ['Ice Cream', 'Cheesecake', 'Brownie', 'Tiramisu']
    }
    
    menu_items = []
    cursor.execute("SELECT id FROM restaurants")
    restaurant_ids = [row[0] for row in cursor.fetchall()]
    
    for restaurant_id in restaurant_ids:
        # Each restaurant gets 10-15 items
        num_items = random.randint(10, 15)
        categories = random.sample(list(menu_templates.keys()), min(3, len(menu_templates)))
        
        for category in categories:
            items = random.sample(menu_templates[category], min(num_items // 3, len(menu_templates[category])))
            for item in items:
                menu_items.append((
                    restaurant_id,
                    item,
                    f'Delicious {item.lower()}',
                    round(random.uniform(5.99, 29.99), 2),
                    random.choice([True, True, True, False])  # 75% available
                ))
    
    execute_batch(cursor, """
        INSERT INTO menu_items (restaurant_id, name, description, price, is_available)
        VALUES (%s, %s, %s, %s, %s)
    """, menu_items)
    
    print(f"✓ {len(menu_items)} menu items seeded")

def seed_delivery_agents(cursor, count=30):
    """Seed delivery agents table"""
    print(f"Seeding {count} delivery agents...")
    
    first_names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 
                   'Tom', 'Anna', 'James', 'Mary', 'Robert', 'Linda', 'Michael', 'Patricia']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
                  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez']
    
    agents = []
    for i in range(1, count + 1):
        agents.append((
            f'{random.choice(first_names)} {random.choice(last_names)}',
            f'555-{random.randint(1000, 9999)}',
            random.choice([True, True, False]),  # 66% available
            round(random.uniform(40.7, 40.8), 6),
            round(random.uniform(-74.0, -73.9), 6)
        ))
    
    execute_batch(cursor, """
        INSERT INTO delivery_agents (name, phone, is_available, current_location_lat, current_location_lng)
        VALUES (%s, %s, %s, %s, %s)
    """, agents)
    
    print(f"✓ {count} delivery agents seeded")

def seed_orders(cursor, count=100):
    """Seed orders and order items"""
    print(f"Seeding {count} orders...")
    
    cursor.execute("SELECT id FROM users WHERE role = 'customer'")
    user_ids = [row[0] for row in cursor.fetchall()]
    
    if not user_ids:
        print("⚠ No customers found, creating sample customers first")
        seed_users(cursor, 20)
        cursor.execute("SELECT id FROM users WHERE role = 'customer'")
        user_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM restaurants")
    restaurant_ids = [row[0] for row in cursor.fetchall()]
    
    if not restaurant_ids:
        print("⚠ No restaurants found, skipping orders")
        return
    
    statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
    
    orders = []
    order_items_batch = []
    
    for i in range(count):
        user_id = random.choice(user_ids)
        restaurant_id = random.choice(restaurant_ids)
        status = random.choice(statuses)
        
        # Get menu items for this restaurant
        cursor.execute("SELECT id, price FROM menu_items WHERE restaurant_id = %s AND is_available = true LIMIT 10", (restaurant_id,))
        menu_items = cursor.fetchall()
        
        if not menu_items:
            continue
        
        # Create order
        total_amount = 0
        num_items = random.randint(1, 4)
        selected_items = random.sample(menu_items, min(num_items, len(menu_items)))
        
        for menu_item_id, price in selected_items:
            quantity = random.randint(1, 3)
            total_amount += price * quantity
        
        created_at = datetime.now() - timedelta(days=random.randint(0, 30))
        
        orders.append((
            user_id,
            restaurant_id,
            status,
            round(total_amount, 2),
            f'{random.randint(100, 999)} {random.choice(["Main", "Oak", "Elm", "Park"])} St, Apt {random.randint(1, 100)}',
            created_at,
            created_at,
            random.randint(1, 3)  # node_id
        ))
        
        # Store items to insert after we have order IDs
        order_items_batch.append({
            'items': selected_items,
            'order_index': i
        })
    
    # Insert orders
    cursor.executemany("""
        INSERT INTO orders (user_id, restaurant_id, status, total_amount, delivery_address, created_at, updated_at, node_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, orders)
    
    # Get the order IDs that were just created
    cursor.execute("SELECT id FROM orders ORDER BY id DESC LIMIT %s", (count,))
    order_ids = [row[0] for row in cursor.fetchall()]
    order_ids.reverse()
    
    # Insert order items
    order_items = []
    for idx, batch in enumerate(order_items_batch):
        if idx < len(order_ids):
            order_id = order_ids[idx]
            for menu_item_id, price in batch['items']:
                quantity = random.randint(1, 3)
                order_items.append((
                    order_id,
                    menu_item_id,
                    quantity,
                    price
                ))
    
    if order_items:
        execute_batch(cursor, """
            INSERT INTO order_items (order_id, menu_item_id, quantity, price)
            VALUES (%s, %s, %s, %s)
        """, order_items)
    
    print(f"✓ {len(orders)} orders seeded with {len(order_items)} order items")

def seed_deliveries(cursor):
    """Seed deliveries table"""
    print("Seeding deliveries...")
    
    cursor.execute("SELECT id FROM orders WHERE status IN ('out_for_delivery', 'delivered')")
    order_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM delivery_agents")
    agent_ids = [row[0] for row in cursor.fetchall()]
    
    if not agent_ids:
        print("⚠ No delivery agents found, skipping deliveries")
        return
    
    deliveries = []
    for order_id in order_ids:
        agent_id = random.choice(agent_ids)
        status = random.choice(['assigned', 'picked_up', 'delivered'])
        
        created_at = datetime.now() - timedelta(hours=random.randint(1, 48))
        pickup_time = created_at + timedelta(minutes=random.randint(10, 30)) if status in ['picked_up', 'delivered'] else None
        delivery_time = pickup_time + timedelta(minutes=random.randint(15, 45)) if status == 'delivered' and pickup_time else None
        
        deliveries.append((
            order_id,
            agent_id,
            status,
            pickup_time,
            delivery_time
        ))
    
    if deliveries:
        execute_batch(cursor, """
            INSERT INTO deliveries (order_id, agent_id, status, pickup_time, delivery_time)
            VALUES (%s, %s, %s, %s, %s)
        """, deliveries)
    
    print(f"✓ {len(deliveries)} deliveries seeded")

def seed_event_log(cursor, count=200):
    """Seed event log table"""
    print(f"Seeding {count} event log entries...")
    
    event_types = [
        'node_started', 'node_failed', 'leader_elected', 'replication',
        'transaction', 'consistency', 'load_balance', 'lock_acquired', 'lock_released'
    ]
    
    severities = ['info', 'info', 'info', 'warning', 'error']
    
    events = []
    lamport_time = 1
    
    for i in range(count):
        node_id = random.randint(1, 3)
        event_type = random.choice(event_types)
        severity = random.choice(severities)
        
        descriptions = {
            'node_started': f'Node {node_id} started successfully',
            'node_failed': f'Node {node_id} failed health check',
            'leader_elected': f'Node {node_id} elected as leader',
            'replication': f'Data replicated to node {node_id}',
            'transaction': f'Transaction committed on node {node_id}',
            'consistency': f'Consistency check passed on node {node_id}',
            'load_balance': f'Request routed to node {node_id}',
            'lock_acquired': f'Lock acquired by node {node_id}',
            'lock_released': f'Lock released by node {node_id}'
        }
        
        events.append((
            node_id,
            event_type,
            descriptions.get(event_type, f'Event on node {node_id}'),
            lamport_time,
            severity,
            '{}',
            datetime.now() - timedelta(minutes=random.randint(0, 1440))
        ))
        
        lamport_time += random.randint(1, 5)
    
    execute_batch(cursor, """
        INSERT INTO event_log (node_id, event_type, description, lamport_timestamp, severity, metadata, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, events)
    
    print(f"✓ {count} event log entries seeded")

def main():
    print("\n" + "="*60)
    print("SEEDING DATABASE")
    print("="*60 + "\n")
    
    try:
        # Connect to database
        print("Connecting to database...")
        print(f"Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print(f"Database: {DB_CONFIG['database']}")
        print(f"User: {DB_CONFIG['user']}")
        
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("✓ Connected to database\n")
        
        # Seed tables
        seed_users(cursor, 50)
        seed_restaurants(cursor, 20)
        seed_menu_items(cursor)
        seed_delivery_agents(cursor, 30)
        seed_orders(cursor, 100)
        seed_deliveries(cursor)
        seed_event_log(cursor, 200)
        
        # Commit changes
        conn.commit()
        
        print("\n" + "="*60)
        print("✓ DATABASE SEEDING COMPLETE")
        print("="*60 + "\n")
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM users")
        print(f"Total users: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM restaurants")
        print(f"Total restaurants: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM menu_items")
        print(f"Total menu items: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM orders")
        print(f"Total orders: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM delivery_agents")
        print(f"Total delivery agents: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM event_log")
        print(f"Total event log entries: {cursor.fetchone()[0]}")
        
        print()
        
    except psycopg2.OperationalError as e:
        print(f"\n✗ Database connection error: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database 'food_delivery' exists")
        print("3. User has proper permissions")
        print("\nTo create database:")
        print("  sudo -u postgres psql -c \"CREATE DATABASE food_delivery;\"")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    main()