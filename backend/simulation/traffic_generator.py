import threading
import random
import time

class TrafficGenerator:
    """Simulates concurrent order requests"""
    
    def __init__(self, order_service: OrderService):
        self.order_service = order_service
        self.results = []
    
    def generate_concurrent_orders(self, num_orders: int, 
                                   restaurant_id: int, 
                                   use_locks: bool = False):
        """Generate multiple concurrent orders to same restaurant"""
        threads = []
        
        print(f"\n{'='*60}")
        print(f"CONCURRENCY TEST: {'WITH' if use_locks else 'WITHOUT'} LOCKS")
        print(f"Generating {num_orders} concurrent orders...")
        print(f"{'='*60}\n")
        
        for i in range(num_orders):
            thread = threading.Thread(
                target=self._create_order_worker,
                args=(i, restaurant_id, use_locks)
            )
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        print(f"\n{'='*60}")
        print(f"CONCURRENCY TEST COMPLETED")
        print(f"Orders processed: {len(self.results)}")
        print(f"{'='*60}\n")
    
    def _create_order_worker(self, order_num: int, restaurant_id: int, use_locks: bool):
        """Worker thread to create order"""
        items = [
            {
                "item_id": random.randint(1, 9),
                "item_name": f"Item_{random.randint(1, 9)}",
                "quantity": random.randint(1, 3),
                "price": random.uniform(5.0, 20.0)
            }
        ]
        
        order = self.order_service.create_order(
            user_id=random.randint(100, 999),
            restaurant_id=restaurant_id,
            items=items,
            use_lock=use_locks
        )
        
        if order:
            self.results.append(order)


