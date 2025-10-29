"""
tests/backend/test_mapreduce.py
Unit tests for MapReduce analytics engine
"""

import pytest
from unittest.mock import Mock, patch
from collections import defaultdict
import sys
sys.path.insert(0, '../../backend')

from distributed.mapreduce import MapReduceEngine, MapTask, ReduceTask


class TestMapReduceEngine:
    """Test cases for MapReduce framework"""
    
    @pytest.fixture
    def engine(self):
        """Create MapReduce engine"""
        return MapReduceEngine(num_workers=3)
    
    @pytest.fixture
    def sample_orders(self):
        """Sample order data for testing"""
        return [
            {'id': 1, 'restaurant_id': 1, 'total': 25.50, 'status': 'delivered'},
            {'id': 2, 'restaurant_id': 1, 'total': 30.00, 'status': 'delivered'},
            {'id': 3, 'restaurant_id': 2, 'total': 15.75, 'status': 'delivered'},
            {'id': 4, 'restaurant_id': 2, 'total': 45.00, 'status': 'cancelled'},
            {'id': 5, 'restaurant_id': 3, 'total': 60.00, 'status': 'delivered'},
        ]
    
    def test_map_function(self, engine, sample_orders):
        """Test map function execution"""
        def map_func(order):
            # Emit (restaurant_id, total)
            return (order['restaurant_id'], order['total'])
        
        results = engine.map(map_func, sample_orders)
        
        assert len(results) == 5
        assert all(isinstance(r, tuple) and len(r) == 2 for r in results)
    
    def test_shuffle_phase(self, engine):
        """Test shuffle and group by key"""
        mapped_data = [
            (1, 25.50),
            (1, 30.00),
            (2, 15.75),
            (2, 45.00),
            (3, 60.00)
        ]
        
        shuffled = engine.shuffle(mapped_data)
        
        assert 1 in shuffled
        assert len(shuffled[1]) == 2
        assert shuffled[1] == [25.50, 30.00]
        assert shuffled[3] == [60.00]
    
    def test_reduce_function(self, engine):
        """Test reduce function execution"""
        def reduce_func(key, values):
            # Calculate total revenue per restaurant
            return (key, sum(values))
        
        shuffled_data = {
            1: [25.50, 30.00],
            2: [15.75, 45.00],
            3: [60.00]
        }
        
        results = engine.reduce(reduce_func, shuffled_data)
        
        assert len(results) == 3
        assert (1, 55.50) in results
        assert (2, 60.75) in results
        assert (3, 60.00) in results
    
    def test_full_mapreduce_pipeline(self, engine, sample_orders):
        """Test complete MapReduce job"""
        def map_func(order):
            if order['status'] == 'delivered':
                return (order['restaurant_id'], order['total'])
            return None
        
        def reduce_func(restaurant_id, totals):
            return (restaurant_id, {
                'total_revenue': sum(totals),
                'order_count': len(totals),
                'avg_order_value': sum(totals) / len(totals)
            })
        
        results = engine.run_job(map_func, reduce_func, sample_orders)
        
        assert len(results) == 3
        
        # Check restaurant 1 (2 delivered orders)
        r1_result = next(r for r in results if r[0] == 1)
        assert r1_result[1]['order_count'] == 2
        assert r1_result[1]['total_revenue'] == 55.50
    
    def test_word_count_example(self, engine):
        """Test classic word count MapReduce example"""
        documents = [
            "hello world",
            "hello python",
            "world of python"
        ]
        
        def map_func(doc):
            # Emit (word, 1) for each word
            return [(word, 1) for word in doc.split()]
        
        def reduce_func(word, counts):
            return (word, sum(counts))
        
        # Flatten map results
        mapped = []
        for doc in documents:
            mapped.extend(map_func(doc))
        
        shuffled = engine.shuffle(mapped)
        results = engine.reduce(reduce_func, shuffled)
        
        word_counts = dict(results)
        assert word_counts['hello'] == 2
        assert word_counts['world'] == 2
        assert word_counts['python'] == 2
        assert word_counts['of'] == 1
    
    def test_parallel_map_execution(self, engine, sample_orders):
        """Test that map tasks are executed in parallel"""
        def slow_map_func(order):
            import time
            time.sleep(0.1)  # Simulate processing
            return (order['restaurant_id'], 1)
        
        import time
        start = time.time()
        results = engine.map_parallel(slow_map_func, sample_orders)
        duration = time.time() - start
        
        # With 3 workers, should take ~0.2s instead of 0.5s
        assert duration < 0.3
        assert len(results) == 5
    
    def test_combiner_optimization(self, engine):
        """Test combiner for reducing shuffle data"""
        mapped_data = [
            (1, 1), (1, 1), (1, 1),
            (2, 1), (2, 1),
            (3, 1)
        ]
        
        def combiner_func(key, values):
            # Pre-aggregate before shuffle
            return (key, sum(values))
        
        combined = engine.combine(mapped_data, combiner_func)
        
        # Should reduce data size
        assert len(combined) <= 3
        assert dict(combined) == {1: 3, 2: 2, 3: 1}
    
    def test_partitioner(self, engine):
        """Test custom partitioner for data distribution"""
        mapped_data = [
            (1, 10), (2, 20), (3, 30),
            (4, 40), (5, 50), (6, 60)
        ]
        
        def hash_partitioner(key, num_partitions):
            return key % num_partitions
        
        partitions = engine.partition(mapped_data, num_partitions=3, partitioner=hash_partitioner)
        
        assert len(partitions) == 3
        # Keys 1,4 should go to partition 1
        # Keys 2,5 should go to partition 2
        # Keys 3,6 should go to partition 0
        assert (1, 10) in partitions[1]
        assert (4, 40) in partitions[1]


class TestMapReduceAnalytics:
    """Test MapReduce for specific analytics scenarios"""
    
    @pytest.fixture
    def engine(self):
        return MapReduceEngine(num_workers=3)
    
    @pytest.fixture
    def order_data(self):
        """Complex order dataset"""
        return [
            {'order_id': 1, 'restaurant': 'Pizza Place', 'hour': 12, 'total': 25.50, 'items': ['pizza', 'soda']},
            {'order_id': 2, 'restaurant': 'Pizza Place', 'hour': 12, 'total': 30.00, 'items': ['pizza', 'salad']},
            {'order_id': 3, 'restaurant': 'Burger Joint', 'hour': 18, 'total': 15.75, 'items': ['burger', 'fries']},
            {'order_id': 4, 'restaurant': 'Pizza Place', 'hour': 19, 'total': 40.00, 'items': ['pizza', 'wings']},
            {'order_id': 5, 'restaurant': 'Burger Joint', 'hour': 19, 'total': 20.00, 'items': ['burger', 'shake']},
        ]
    
    def test_peak_hours_analysis(self, engine, order_data):
        """Test finding peak ordering hours"""
        def map_func(order):
            return (order['hour'], 1)
        
        def reduce_func(hour, counts):
            return (hour, sum(counts))
        
        results = engine.run_job(map_func, reduce_func, order_data)
        peak_hours = dict(results)
        
        assert peak_hours[12] == 2
        assert peak_hours[18] == 1
        assert peak_hours[19] == 2
    
    def test_popular_items_analysis(self, engine, order_data):
        """Test finding most popular menu items"""
        def map_func(order):
            # Emit (item, 1) for each item in order
            return [(item, 1) for item in order['items']]
        
        def reduce_func(item, counts):
            return (item, sum(counts))
        
        # Flatten mapped results
        mapped = []
        for order in order_data:
            mapped.extend(map_func(order))
        
        shuffled = engine.shuffle(mapped)
        results = engine.reduce(reduce_func, shuffled)
        
        item_counts = dict(results)
        assert item_counts['pizza'] == 3
        assert item_counts['burger'] == 2
    
    def test_restaurant_revenue_analysis(self, engine, order_data):
        """Test revenue calculation per restaurant"""
        def map_func(order):
            return (order['restaurant'], order['total'])
        
        def reduce_func(restaurant, totals):
            return (restaurant, {
                'revenue': sum(totals),
                'orders': len(totals),
                'avg_order': sum(totals) / len(totals)
            })
        
        results = engine.run_job(map_func, reduce_func, order_data)
        revenue_data = {r[0]: r[1] for r in results}
        
        assert revenue_data['Pizza Place']['orders'] == 3
        assert revenue_data['Pizza Place']['revenue'] == 95.50
        assert revenue_data['Burger Joint']['orders'] == 2
    
    def test_time_based_revenue_analysis(self, engine, order_data):
        """Test revenue by time period"""
        def map_func(order):
            # Categorize by time period
            if order['hour'] < 15:
                period = 'lunch'
            else:
                period = 'dinner'
            return (period, order['total'])
        
        def reduce_func(period, totals):
            return (period, sum(totals))
        
        results = engine.run_job(map_func, reduce_func, order_data)
        period_revenue = dict(results)
        
        assert period_revenue['lunch'] == 55.50  # Orders at 12
        assert period_revenue['dinner'] == 75.75  # Orders at 18, 19
    
    def test_join_operation(self, engine):
        """Test join operation using MapReduce"""
        orders = [
            {'order_id': 1, 'restaurant_id': 1, 'total': 25.50},
            {'order_id': 2, 'restaurant_id': 2, 'total': 30.00}
        ]
        
        restaurants = [
            {'restaurant_id': 1, 'name': 'Pizza Place', 'cuisine': 'Italian'},
            {'restaurant_id': 2, 'name': 'Burger Joint', 'cuisine': 'American'}
        ]
        
        def map_orders(order):
            return (order['restaurant_id'], ('order', order))
        
        def map_restaurants(restaurant):
            return (restaurant['restaurant_id'], ('restaurant', restaurant))
        
        # Map both datasets
        mapped_orders = [map_orders(o) for o in orders]
        mapped_restaurants = [map_restaurants(r) for r in restaurants]
        all_mapped = mapped_orders + mapped_restaurants
        
        # Shuffle
        shuffled = engine.shuffle(all_mapped)
        
        # Reduce (join)
        def reduce_join(restaurant_id, values):
            order_data = None
            restaurant_data = None
            
            for value_type, data in values:
                if value_type == 'order':
                    order_data = data
                elif value_type == 'restaurant':
                    restaurant_data = data
            
            if order_data and restaurant_data:
                return (restaurant_id, {
                    'order': order_data,
                    'restaurant': restaurant_data
                })
            return None
        
        results = engine.reduce(reduce_join, shuffled)
        results = [r for r in results if r is not None]
        
        assert len(results) == 2
        assert results[0][1]['restaurant']['name'] == 'Pizza Place'


class TestMapReduceFaultTolerance:
    """Test fault tolerance and error handling"""
    
    @pytest.fixture
    def engine(self):
        return MapReduceEngine(num_workers=3)
    
    def test_map_task_failure_retry(self, engine):
        """Test that failed map tasks are retried"""
        call_count = {'count': 0}
        
        def flaky_map_func(item):
            call_count['count'] += 1
            if call_count['count'] <= 2:
                raise Exception("Simulated failure")
            return (item, 1)
        
        data = [1, 2, 3]
        
        with patch.object(engine, 'max_retries', 3):
            results = engine.map_with_retry(flaky_map_func, data)
            
            assert len(results) == 3
    
    def test_straggler_handling(self, engine):
        """Test handling of slow (straggler) tasks"""
        def slow_map_func(item):
            import time
            if item == 1:
                time.sleep(1)  # Straggler
            return (item, 1)
        
        data = [1, 2, 3, 4, 5]
        
        # Enable speculative execution
        with patch.object(engine, 'speculative_execution', True):
            import time
            start = time.time()
            results = engine.map_parallel(slow_map_func, data)
            duration = time.time() - start
            
            # Should be faster due to speculative execution
            assert len(results) == 5
    
    def test_data_locality(self, engine):
        """Test that map tasks prefer local data"""
        data_locations = {
            1: 'node1',
            2: 'node1',
            3: 'node2',
            4: 'node3'
        }
        
        def map_func(item):
            return (item, 1)
        
        task_assignments = engine.assign_tasks_with_locality(
            map_func,
            data_locations
        )
        
        # Tasks should be assigned to nodes with data
        assert task_assignments[1]['node'] == 'node1'
        assert task_assignments[2]['node'] == 'node1'
        assert task_assignments[3]['node'] == 'node2'


class TestMapReduceOptimization:
    """Test performance optimizations"""
    
    @pytest.fixture
    def engine(self):
        return MapReduceEngine(num_workers=3)
    
    def test_in_memory_combine(self, engine):
        """Test in-memory combining reduces network transfer"""
        large_dataset = [(i % 10, 1) for i in range(1000)]
        
        def combiner(key, values):
            return (key, sum(values))
        
        # Without combiner
        shuffled_no_combine = engine.shuffle(large_dataset)
        size_no_combine = sum(len(v) for v in shuffled_no_combine.values())
        
        # With combiner
        combined = engine.combine(large_dataset, combiner)
        size_with_combine = len(combined)
        
        # Should significantly reduce data size
        assert size_with_combine < size_no_combine / 10
    
    def test_pipelining(self, engine):
        """Test pipelining of map and reduce phases"""
        data = list(range(100))
        
        def map_func(x):
            return (x % 10, x)
        
        def reduce_func(key, values):
            return (key, sum(values))
        
        # With pipelining, reduce can start before all maps complete
        results = engine.run_job_pipelined(map_func, reduce_func, data)
        
        assert len(results) == 10


if __name__ == '__main__':
    pytest.main([__file__, '-v'])