import a from './a.js';
import b from './b.js';
import c from './c.js';
import d from './d.js';

export const sdPhases = [
  { id: 1, title: 'Fundamentals', bn: 'ভিত্তি', color: '#a78bfa', desc: 'Requirements, functional vs non-functional, estimation' },
  { id: 2, title: 'Architecture', bn: 'Architecture', color: '#b794f6', desc: 'Monolith, modular monolith, microservices, event-driven' },
  { id: 3, title: 'API Design', bn: 'API Design', color: '#c084fc', desc: 'REST, GraphQL, gRPC, versioning, idempotency' },
  { id: 4, title: 'Database Design', bn: 'Database Design', color: '#d58bf8', desc: 'SQL vs NoSQL, schema, normalization, indexing' },
  { id: 5, title: 'Database Internals', bn: 'Database Internals', color: '#e879f9', desc: 'Transactions, ACID, isolation, MVCC, locks' },
  { id: 6, title: 'Caching', bn: 'Caching', color: '#f472b6', desc: 'Redis, cache-aside, write-through, TTL, invalidation' },
  { id: 7, title: 'Scaling', bn: 'Scaling', color: '#fb7185', desc: 'Vertical/horizontal, replication, sharding, partitioning' },
  { id: 8, title: 'Load Balancing', bn: 'Load Balancing', color: '#fb923c', desc: 'Algorithms, reverse proxy, health checks, failover' },
  { id: 9, title: 'Distributed Systems', bn: 'Distributed Systems', color: '#fbbf24', desc: 'CAP, consistency, consensus, distributed locks' },
  { id: 10, title: 'Messaging Systems', bn: 'Messaging', color: '#facc15', desc: 'Queues, pub/sub, Kafka, RabbitMQ' },
  { id: 11, title: 'Reliability', bn: 'Reliability', color: '#a3e635', desc: 'Fault tolerance, circuit breaker, retry, timeout, rate limit' },
  { id: 12, title: 'Storage & CDN', bn: 'Storage ও CDN', color: '#4ade80', desc: 'Object storage, S3, file delivery, media processing' },
  { id: 13, title: 'Real-time Systems', bn: 'Real-time', color: '#2dd4bf', desc: 'WebSocket, SSE, notifications, chat' },
  { id: 14, title: 'Observability', bn: 'Observability', color: '#22d3ee', desc: 'Logging, metrics, tracing, OpenTelemetry' },
  { id: 15, title: 'Deployment Architecture', bn: 'Deployment', color: '#38bdf8', desc: 'Docker, CI/CD, Kubernetes, IaC' },
  { id: 16, title: 'Advanced Design', bn: 'Advanced Design', color: '#818cf8', desc: 'Multi-tenancy, HA, DR, cost, real-world projects' },
];

export const sdLessons = [...a, ...b, ...c, ...d];
