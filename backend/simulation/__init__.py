
"""
Simulation and Testing Tools

Tools for testing and demonstrating distributed system behavior:

1. TrafficGenerator: Simulates concurrent traffic
   - Generates multiple concurrent requests
   - Tests race conditions
   - Demonstrates lock effectiveness
   - Load testing

2. FailureInjector: Simulates node failures
   - Random node failures
   - Controlled failure scenarios
   - Recovery simulation
   - Leader failure testing

3. ClockDriftSimulator: Simulates clock drift
   - Random clock offsets
   - Demonstrates logical clock importance
   - Shows ordering issues with physical clocks

These tools help demonstrate and test distributed system
concepts in controlled scenarios.

Usage Example:
    from backend.simulation import TrafficGenerator, FailureInjector
    
    # Generate concurrent traffic
    traffic_gen = TrafficGenerator(order_service)
    traffic_gen.generate_concurrent_orders(10, restaurant_id=1, use_locks=True)
    
    # Simulate node failure
    failure_injector = FailureInjector(nodes)
    failure_injector.simulate_node_failure(node_id=3)
"""

from .traffic_generator import TrafficGenerator
from .failure_injector import FailureInjector
from .clock_drift import ClockDriftSimulator

__all__ = [
    'TrafficGenerator',
    'FailureInjector',
    'ClockDriftSimulator'
]
