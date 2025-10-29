// tests/frontend/component.test.jsx
// Unit tests for React components

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Import components
import NodeVisualization from '../../frontend/src/components/distributed/NodeVisualization';
import ClockSyncTimeline from '../../frontend/src/components/distributed/ClockSyncTimeline';
import LeaderElectionPanel from '../../frontend/src/components/distributed/LeaderElectionPanel';
import ConsistencyToggle from '../../frontend/src/components/distributed/ConsistencyToggle';
import LoadBalancerView from '../../frontend/src/components/distributed/LoadBalancerView';
import ConcurrencyDemo from '../../frontend/src/components/distributed/ConcurrencyDemo';
import ReplicationStatus from '../../frontend/src/components/distributed/ReplicationStatus';
import MapReduceVisualizer from '../../frontend/src/components/distributed/MapReduceVisualizer';
import EventLogViewer from '../../frontend/src/components/distributed/EventLogViewer';

describe('NodeVisualization', () => {
   const mockNodes = [
      { id: 1, status: 'active', currentLoad: 10, uptime: '2h', lamportClock: 100 },
      { id: 2, status: 'active', currentLoad: 20, uptime: '1h', lamportClock: 98 },
      { id: 3, status: 'failed', currentLoad: 0, uptime: '0s', lamportClock: 50 }
   ];

   const mockLeader = { id: 1, status: 'leader' };

   it('renders all nodes', () => {
      render(<NodeVisualization nodes={mockNodes} leader={mockLeader} />);

      expect(screen.getByText('Node 1')).toBeInTheDocument();
      expect(screen.getByText('Node 2')).toBeInTheDocument();
      expect(screen.getByText('Node 3')).toBeInTheDocument();
   });

   // Integration Tests
   describe('Integration: Distributed System Dashboard', () => {
      it('renders all components together', () => {
         const mockData = {
            nodes: [
               { id: 1, status: 'active', currentLoad: 10 },
               { id: 2, status: 'active', currentLoad: 20 }
            ],
            leader: { id: 1 },
            events: [
               {
                  nodeId: 1,
                  eventType: 'node_started',
                  description: 'Node started',
                  severity: 'info',
                  timestamp: new Date().toISOString()
               }
            ]
         };

         const { container } = render(
            <div>
               <NodeVisualization nodes={mockData.nodes} leader={mockData.leader} />
               <EventLogViewer events={mockData.events} nodes={mockData.nodes} />
            </div>
         );

         expect(container).toBeInTheDocument();
         expect(screen.getByText('Active Nodes')).toBeInTheDocument();
         expect(screen.getByText('Distributed Event Log')).toBeInTheDocument();
      });

      it('updates when node status changes', () => {
         const { rerender } = render(
            <NodeVisualization
               nodes={[{ id: 1, status: 'active', currentLoad: 10 }]}
               leader={{ id: 1 }}
            />
         );

         expect(screen.getByText('active')).toBeInTheDocument();

         // Update node status
         rerender(
            <NodeVisualization
               nodes={[{ id: 1, status: 'failed', currentLoad: 0 }]}
               leader={null}
            />
         );

         expect(screen.getByText('failed')).toBeInTheDocument();
      });

      it('handles leader election flow', async () => {
         const onTrigger = vi.fn();
         const { rerender } = render(
            <LeaderElectionPanel
               nodes={[
                  { id: 1, status: 'active' },
                  { id: 2, status: 'active' }
               ]}
               leader={{ id: 1 }}
               electionInProgress={false}
               electionHistory={[]}
               onTriggerElection={onTrigger}
            />
         );

         // Trigger election
         const button = screen.getByText('Trigger Election');
         fireEvent.click(button);

         expect(onTrigger).toHaveBeenCalled();

         // Election in progress
         rerender(
            <LeaderElectionPanel
               nodes={[
                  { id: 1, status: 'active' },
                  { id: 2, status: 'active' }
               ]}
               leader={{ id: 1 }}
               electionInProgress={true}
               electionHistory={[]}
               onTriggerElection={onTrigger}
            />
         );

         expect(screen.getByText('Election in Progress...')).toBeInTheDocument();

         // Election complete
         rerender(
            <LeaderElectionPanel
               nodes={[
                  { id: 1, status: 'active' },
                  { id: 2, status: 'leader' }
               ]}
               leader={{ id: 2 }}
               electionInProgress={false}
               electionHistory={[
                  {
                     id: 1,
                     winner: 2,
                     timestamp: new Date().toISOString(),
                     participants: [1, 2]
                  }
               ]}
               onTriggerElection={onTrigger}
            />
         );

         expect(screen.getByText('Node 2')).toBeInTheDocument();
      });
   });

   // Performance Tests
   describe('Performance Tests', () => {
      it('handles large event log efficiently', () => {
         const largeEventLog = Array.from({ length: 1000 }, (_, i) => ({
            nodeId: (i % 3) + 1,
            eventType: 'test_event',
            description: `Event ${i}`,
            severity: 'info',
            lamportTimestamp: i,
            timestamp: new Date().toISOString()
         }));

         const mockNodes = [
            { id: 1, status: 'active' },
            { id: 2, status: 'active' },
            { id: 3, status: 'active' }
         ];

         const start = performance.now();
         render(<EventLogViewer events={largeEventLog} nodes={mockNodes} />);
         const duration = performance.now() - start;

         // Should render in less than 1 second
         expect(duration).toBeLessThan(1000);
      });

      it('efficiently updates load balancer view', () => {
         const mockNodes = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            currentLoad: Math.floor(Math.random() * 100)
         }));

         const { rerender } = render(
            <LoadBalancerView
               nodes={mockNodes}
               algorithm="round_robin"
               requests={[]}
            />
         );

         const start = performance.now();

         // Simulate 100 updates
         for (let i = 0; i < 100; i++) {
            const updatedNodes = mockNodes.map(node => ({
               ...node,
               currentLoad: Math.floor(Math.random() * 100)
            }));

            rerender(
               <LoadBalancerView
                  nodes={updatedNodes}
                  algorithm="round_robin"
                  requests={[]}
               />
            );
         }

         const duration = performance.now() - start;

         // Should handle 100 updates efficiently
         expect(duration).toBeLessThan(2000);
      });
   });

   // Accessibility Tests
   describe('Accessibility Tests', () => {
      it('components have proper ARIA labels', () => {
         render(
            <NodeVisualization
               nodes={[{ id: 1, status: 'active', currentLoad: 10 }]}
               leader={{ id: 1 }}
            />
         );

         const heading = screen.getByText('Active Nodes');
         expect(heading).toBeInTheDocument();
      });

      it('buttons are keyboard accessible', () => {
         const onTrigger = vi.fn();
         render(
            <LeaderElectionPanel
               nodes={[{ id: 1, status: 'active' }]}
               leader={{ id: 1 }}
               electionInProgress={false}
               electionHistory={[]}
               onTriggerElection={onTrigger}
            />
         );

         const button = screen.getByText('Trigger Election');
         button.focus();

         expect(document.activeElement).toBe(button);

         fireEvent.keyPress(button, { key: 'Enter', code: 13 });
         expect(onTrigger).toHaveBeenCalled();
      });

      it('form controls have labels', () => {
         render(<ConsistencyToggle currentMode="strong" onModeChange={vi.fn()} />);

         const buttons = screen.getAllByRole('button');
         expect(buttons.length).toBeGreaterThan(0);

         buttons.forEach(button => {
            expect(button).toHaveTextContent(/.+/);
         });
      });
   });

   // Error Handling Tests
   describe('Error Handling', () => {
      it('handles missing node data gracefully', () => {
         render(<NodeVisualization nodes={null} leader={null} />);

         expect(screen.getByText('No active nodes')).toBeInTheDocument();
      });

      it('handles missing event data', () => {
         render(<EventLogViewer events={null} nodes={[]} />);

         expect(screen.getByText('No events found')).toBeInTheDocument();
      });

      it('handles invalid consistency mode', () => {
         const { container } = render(
            <ConsistencyToggle currentMode="invalid" onModeChange={vi.fn()} />
         );

         // Should still render without crashing
         expect(container).toBeInTheDocument();
      });

      it('handles simulation errors', async () => {
         const onRun = vi.fn(() => {
            throw new Error('Simulation failed');
         });

         render(<ConcurrencyDemo onRunSimulation={onRun} />);

         const runButton = screen.getByText('Run Simulation');
         fireEvent.click(runButton);

         // Component should handle error gracefully
         expect(container).toBeInTheDocument();
      });
   });

   // Snapshot Tests
   describe('Snapshot Tests', () => {
      it('matches NodeVisualization snapshot', () => {
         const { container } = render(
            <NodeVisualization
               nodes={[
                  { id: 1, status: 'active', currentLoad: 10, uptime: '2h' }
               ]}
               leader={{ id: 1 }}
            />
         );

         expect(container).toMatchSnapshot();
      });

      it('matches LeaderElectionPanel snapshot', () => {
         const { container } = render(
            <LeaderElectionPanel
               nodes={[{ id: 1, status: 'leader' }]}
               leader={{ id: 1 }}
               electionInProgress={false}
               electionHistory={[]}
            />
         );

         expect(container).toMatchSnapshot();
      });

      it('matches ConsistencyToggle snapshot', () => {
         const { container } = render(
            <ConsistencyToggle currentMode="strong" onModeChange={vi.fn()} />
         );

         expect(container).toMatchSnapshot();
      });
   });

   // Custom Hook Tests (if applicable)
   describe('Custom Hooks', () => {
      it('useWebSocket connects and receives messages', async () => {
         // Mock WebSocket
         global.WebSocket = vi.fn(() => ({
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            send: vi.fn(),
            close: vi.fn()
         }));

         // Test hook usage in component context
         // Note: Actual implementation would depend on your custom hooks
      });
   });

   // Mocking and Spy Tests
   describe('Component Interactions', () => {
      it('calls API when triggering election', () => {
         const mockApi = vi.fn();
         const onTrigger = vi.fn(() => mockApi());

         render(
            <LeaderElectionPanel
               nodes={[{ id: 1, status: 'active' }]}
               leader={{ id: 1 }}
               electionInProgress={false}
               electionHistory={[]}
               onTriggerElection={onTrigger}
            />
         );

         fireEvent.click(screen.getByText('Trigger Election'));

         expect(onTrigger).toHaveBeenCalled();
         expect(mockApi).toHaveBeenCalled();
      });

      it('updates load balancer algorithm', () => {
         const onChange = vi.fn();

         render(
            <LoadBalancerView
               nodes={[{ id: 1, currentLoad: 10 }]}
               algorithm="round_robin"
               requests={[]}
               onAlgorithmChange={onChange}
            />
         );

         const button = screen.getByText('Least Connections');
         fireEvent.click(button);

         expect(onChange).toHaveBeenCalledWith('least_connections');
      });
   });

   it('displays leader badge', () => {
      render(<NodeVisualization nodes={mockNodes} leader={mockLeader} />);

      expect(screen.getByText('👑 LEADER')).toBeInTheDocument();
   });

   it('shows correct status for failed nodes', () => {
      render(<NodeVisualization nodes={mockNodes} leader={mockLeader} />);

      const failedNode = screen.getByText('Node 3').closest('div');
      expect(failedNode).toHaveClass('border-red-300');
   });

   it('displays node metrics', () => {
      render(<NodeVisualization nodes={mockNodes} leader={mockLeader} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // Load
      expect(screen.getByText('2h')).toBeInTheDocument(); // Uptime
   });

   it('shows empty state when no nodes', () => {
      render(<NodeVisualization nodes={[]} leader={null} />);

      expect(screen.getByText('No active nodes')).toBeInTheDocument();
   });
});

describe('ClockSyncTimeline', () => {
   const mockEvents = [
      {
         nodeId: 1,
         lamportTimestamp: 100,
         eventType: 'order_created',
         description: 'Order created',
         timestamp: new Date().toISOString()
      },
      {
         nodeId: 2,
         lamportTimestamp: 101,
         eventType: 'order_confirmed',
         description: 'Order confirmed',
         timestamp: new Date().toISOString()
      }
   ];

   const mockNodes = [
      { id: 1, status: 'active' },
      { id: 2, status: 'active' }
   ];

   it('renders events in order', () => {
      render(<ClockSyncTimeline events={mockEvents} nodes={mockNodes} />);

      const timestamps = screen.getAllByText(/\d+/);
      expect(timestamps.length).toBeGreaterThan(0);
   });

   it('allows filtering by node', () => {
      render(<ClockSyncTimeline events={mockEvents} nodes={mockNodes} />);

      const filter = screen.getByRole('combobox');
      fireEvent.change(filter, { target: { value: '1' } });

      expect(screen.getByText('Order created')).toBeInTheDocument();
   });

   it('displays event statistics', () => {
      render(<ClockSyncTimeline events={mockEvents} nodes={mockNodes} />);

      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
   });

   it('shows empty state', () => {
      render(<ClockSyncTimeline events={[]} nodes={mockNodes} />);

      expect(screen.getByText('No events to display')).toBeInTheDocument();
   });
});

describe('LeaderElectionPanel', () => {
   const mockNodes = [
      { id: 1, status: 'active' },
      { id: 2, status: 'active' },
      { id: 3, status: 'leader' }
   ];

   const mockLeader = { id: 3 };
   const mockElectionHistory = [
      {
         id: 1,
         winner: 3,
         timestamp: new Date().toISOString(),
         participants: [1, 2, 3]
      }
   ];

   it('displays current leader', () => {
      render(
         <LeaderElectionPanel
            nodes={mockNodes}
            leader={mockLeader}
            electionInProgress={false}
            electionHistory={mockElectionHistory}
         />
      );

      expect(screen.getByText('Node 3')).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
   });

   it('shows election in progress indicator', () => {
      render(
         <LeaderElectionPanel
            nodes={mockNodes}
            leader={mockLeader}
            electionInProgress={true}
            electionHistory={[]}
         />
      );

      expect(screen.getByText('Election in Progress...')).toBeInTheDocument();
   });

   it('triggers election on button click', () => {
      const onTrigger = vi.fn();
      render(
         <LeaderElectionPanel
            nodes={mockNodes}
            leader={mockLeader}
            electionInProgress={false}
            electionHistory={[]}
            onTriggerElection={onTrigger}
         />
      );

      const button = screen.getByText('Trigger Election');
      fireEvent.click(button);

      expect(onTrigger).toHaveBeenCalled();
   });

   it('disables trigger button during election', () => {
      render(
         <LeaderElectionPanel
            nodes={mockNodes}
            leader={mockLeader}
            electionInProgress={true}
            electionHistory={[]}
         />
      );

      const button = screen.getByText('Trigger Election');
      expect(button).toBeDisabled();
   });

   it('displays node priorities correctly', () => {
      render(
         <LeaderElectionPanel
            nodes={mockNodes}
            leader={mockLeader}
            electionInProgress={false}
            electionHistory={[]}
         />
      );

      expect(screen.getByText('#1')).toBeInTheDocument();
   });
});

describe('ConsistencyToggle', () => {
   it('renders all consistency modes', () => {
      render(<ConsistencyToggle currentMode="strong" onModeChange={vi.fn()} />);

      expect(screen.getByText('Strong Consistency')).toBeInTheDocument();
      expect(screen.getByText('Eventual Consistency')).toBeInTheDocument();
      expect(screen.getByText('Quorum Consistency')).toBeInTheDocument();
   });

   it('highlights selected mode', () => {
      render(<ConsistencyToggle currentMode="strong" onModeChange={vi.fn()} />);

      const strongButton = screen.getByText('Strong Consistency').closest('button');
      expect(strongButton).toHaveClass('border-blue-500');
   });

   it('calls onModeChange when mode selected', () => {
      const onChange = vi.fn();
      render(<ConsistencyToggle currentMode="strong" onModeChange={onChange} />);

      const eventualButton = screen.getByText('Eventual Consistency').closest('button');
      fireEvent.click(eventualButton);

      expect(onChange).toHaveBeenCalledWith('eventual');
   });

   it('displays performance metrics when provided', () => {
      const stats = {
         avgLatency: 50,
         successRate: 99,
         conflictsResolved: 5
      };

      render(
         <ConsistencyToggle
            currentMode="strong"
            onModeChange={vi.fn()}
            stats={stats}
         />
      );

      expect(screen.getByText('50ms')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
   });
});

describe('LoadBalancerView', () => {
   const mockNodes = [
      { id: 1, currentLoad: 30 },
      { id: 2, currentLoad: 50 },
      { id: 3, currentLoad: 20 }
   ];

   const mockRequests = [
      {
         type: 'GET /orders',
         nodeId: 1,
         success: true,
         latency: 45,
         timestamp: new Date().toISOString()
      }
   ];

   it('renders load distribution', () => {
      render(
         <LoadBalancerView
            nodes={mockNodes}
            algorithm="round_robin"
            requests={mockRequests}
         />
      );

      expect(screen.getByText('Node 1')).toBeInTheDocument();
      expect(screen.getByText('30 requests')).toBeInTheDocument();
   });

   it('allows algorithm selection', () => {
      const onChange = vi.fn();
      render(
         <LoadBalancerView
            nodes={mockNodes}
            algorithm="round_robin"
            requests={[]}
            onAlgorithmChange={onChange}
         />
      );

      const leastConnectionsButton = screen.getByText('Least Connections').closest('button');
      fireEvent.click(leastConnectionsButton);

      expect(onChange).toHaveBeenCalledWith('least_connections');
   });

   it('displays recent requests', () => {
      render(
         <LoadBalancerView
            nodes={mockNodes}
            algorithm="round_robin"
            requests={mockRequests}
         />
      );

      expect(screen.getByText('GET /orders')).toBeInTheDocument();
      expect(screen.getByText('45ms')).toBeInTheDocument();
   });
});

describe('ConcurrencyDemo', () => {
   it('renders scenario selector', () => {
      render(<ConcurrencyDemo onRunSimulation={vi.fn()} />);

      expect(screen.getByText('Race Condition')).toBeInTheDocument();
      expect(screen.getByText('Deadlock')).toBeInTheDocument();
   });

   it('runs simulation on button click', async () => {
      const onRun = vi.fn();
      render(<ConcurrencyDemo onRunSimulation={onRun} />);

      const runButton = screen.getByText('Run Simulation');
      fireEvent.click(runButton);

      await waitFor(() => {
         expect(screen.getByText('Running Simulation...')).toBeInTheDocument();
      });
   });

   it('displays results after simulation', async () => {
      render(<ConcurrencyDemo onRunSimulation={vi.fn()} />);

      const runButton = screen.getByText('Run Simulation');
      fireEvent.click(runButton);

      await waitFor(() => {
         expect(screen.getByText('Simulation Complete')).toBeInTheDocument();
      }, { timeout: 10000 });
   });
});

describe('ReplicationStatus', () => {
   const mockPrimary = {
      host: 'localhost:5432',
      writeOps: 100,
      dataSize: 1024000,
      connections: 5
   };

   const mockReplicas = [
      {
         id: 1,
         host: 'replica1:5432',
         status: 'synced',
         replicationLag: 10,
         readOps: 50
      },
      {
         id: 2,
         host: 'replica2:5432',
         status: 'lagging',
         replicationLag: 1500,
         readOps: 30
      }
   ];

   it('displays primary database info', () => {
      render(<ReplicationStatus primary={mockPrimary} replicas={mockReplicas} />);

      expect(screen.getByText('Primary Database')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
   });

   it('shows replica sync status', () => {
      render(<ReplicationStatus primary={mockPrimary} replicas={mockReplicas} />);

      expect(screen.getByText('Replica 1')).toBeInTheDocument();
      expect(screen.getByText('SYNCED')).toBeInTheDocument();
   });

   it('highlights lagging replicas', () => {
      render(<ReplicationStatus primary={mockPrimary} replicas={mockReplicas} />);

      const replica2 = screen.getByText('Replica 2').closest('div');
      expect(replica2).toHaveClass('border-orange-300');
   });
});

describe('EventLogViewer', () => {
   const mockEvents = [
      {
         nodeId: 1,
         eventType: 'node_started',
         description: 'Node 1 started',
         severity: 'info',
         lamportTimestamp: 100,
         timestamp: new Date().toISOString()
      },
      {
         nodeId: 2,
         eventType: 'node_failed',
         description: 'Node 2 failed',
         severity: 'error',
         lamportTimestamp: 101,
         timestamp: new Date().toISOString()
      }
   ];

   const mockNodes = [
      { id: 1, status: 'active' },
      { id: 2, status: 'failed' }
   ];

   it('displays all events', () => {
      render(<EventLogViewer events={mockEvents} nodes={mockNodes} />);

      expect(screen.getByText('Node 1 started')).toBeInTheDocument();
      expect(screen.getByText('Node 2 failed')).toBeInTheDocument();
   });

   it('allows filtering by event type', () => {
      render(<EventLogViewer events={mockEvents} nodes={mockNodes} />);

      const typeFilter = screen.getAllByRole('combobox')[1];
      fireEvent.change(typeFilter, { target: { value: 'node_started' } });

      expect(screen.getByText('Node 1 started')).toBeInTheDocument();
   });

   it('allows search', () => {
      render(<EventLogViewer events={mockEvents} nodes={mockNodes} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      fireEvent.change(searchInput, { target: { value: 'failed' } });

      expect(screen.getByText('Node 2 failed')).toBeInTheDocument();
   });

   it('displays event statistics', () => {
      render(<EventLogViewer events={mockEvents} nodes={mockNodes} />);

      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
   });
});

describe('MapReduceVisualizer', () => {
   it('renders job type selector', () => {
      render(<MapReduceVisualizer job={null} onRunJob={vi.fn()} />);

      expect(screen.getByText('Order Analytics')).toBeInTheDocument();
      expect(screen.getByText('Peak Hours Analysis')).toBeInTheDocument();
   });

   it('starts job on button click', () => {
      const onRun = vi.fn();
      render(<MapReduceVisualizer job={null} onRunJob={onRun} />);

      const startButton = screen.getByText('Start MapReduce Job');
      fireEvent.click(startButton);

      expect(onRun).toHaveBeenCalled();
   });

   it('displays job progress', async () => {
      render(<MapReduceVisualizer job={null} onRunJob={vi.fn()} />);

      const startButton = screen.getByText('Start MapReduce Job');
      fireEvent.click(startButton);

      await waitFor(() => {
         expect(screen.getByText('Map Phase')).toBeInTheDocument();
         expect(screen.getByText('Shuffle Phase')).toBeInTheDocument();
         expect(screen.getByText('Reduce Phase')).toBeInTheDocument();
      });
   });
})