# Resilience Patterns Documentation

This document provides detailed information about the resilience patterns implemented in NoteNest.

## Overview

NoteNest implements circuit breakers, retries with backoff, timeouts, and fallback mechanisms to protect against partial failures and ensure system stability.

## Circuit Breaker Pattern

### Implementation
- Located in `backend/src/utils/circuitBreaker.ts`
- Applied to Redis cache operations and external service calls
- Configurable failure threshold and reset timeout

### States
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Failure threshold exceeded, requests fail fast
- **HALF_OPEN**: Testing recovery, limited requests allowed

### Configuration
```env
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=60000
CIRCUIT_BREAKER_MONITORING_PERIOD=60000
```

### Usage Example
```typescript
const breaker = createCircuitBreaker('redis-cache', {
  failureThreshold: 5,
  resetTimeout: 60000,
  monitoringPeriod: 60000
});

try {
  const result = await breaker.call(() => redis.get(key));
} catch (error) {
  // Circuit is open or operation failed
}
```

## Retry Strategy

### Implementation
- Located in `backend/src/utils/retry.ts`
- Exponential backoff with jitter
- Only applied to idempotent operations

### Configuration
```typescript
const config = {
  maxAttempts: 3,
  baseDelay: 100,    // 100ms
  maxDelay: 5000,    // 5s
  backoffFactor: 2,
  retryableErrors: (error) => /* custom logic */
};
```

### Usage Example
```typescript
await retryIdempotent(() => fetchExternalService());
```

## Timeout Controls

### Redis Timeouts
- Connection timeout: 5 seconds
- Command timeout: 3 seconds
- Lazy connect with race condition protection

### HTTP Timeouts
- Inter-service calls: 5 seconds using AbortController
- Socket validation: 5 seconds
- Audit logging: No timeout (fire-and-forget)

## Fallback Mechanisms

### Cache Fallbacks
- **Read Operations**: If Redis fails, proceed with database query
- **Write Operations**: If circuit open, skip caching but continue with database write
- **Event Bus**: Log failures but continue core operations

### Service Degradation
- Cache disabled: System operates with database only
- Event bus down: Core functionality preserved, audit logging may fail
- Socket service down: Real-time collaboration disabled, but basic CRUD works

## Observability

### Metrics
- Cache hits/misses/failures
- Retry attempts
- Circuit breaker state changes
- HTTP request failures/timeouts

### Logging
- Circuit breaker transitions logged at appropriate levels
- Failure events with context
- Timeout warnings

### Endpoints
- `/health`: Basic system status
- `/metrics`: Detailed resilience metrics (JSON)

## Configuration Examples

### Production Environment
```env
# Circuit Breaker
CIRCUIT_BREAKER_FAILURE_THRESHOLD=10
CIRCUIT_BREAKER_RESET_TIMEOUT=120000
CIRCUIT_BREAKER_MONITORING_PERIOD=300000

# Cache
CACHE_ENABLED=true
REDIS_URL=redis://redis-cluster:6379
CACHE_TTL=1800

# Timeouts
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
HTTP_REQUEST_TIMEOUT=10000
```

### Development Environment
```env
# Circuit Breaker
CIRCUIT_BREAKER_FAILURE_THRESHOLD=3
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
CIRCUIT_BREAKER_MONITORING_PERIOD=60000

# Cache
CACHE_ENABLED=true
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Timeouts
REDIS_CONNECT_TIMEOUT=5000
REDIS_COMMAND_TIMEOUT=3000
HTTP_REQUEST_TIMEOUT=5000
```

## Failure Handling Strategy

### Cascading Failure Prevention
1. Circuit breakers prevent overwhelming failing services
2. Timeouts prevent resource exhaustion
3. Retries with backoff reduce load spikes
4. Fallbacks maintain core functionality

### Recovery
1. Circuit breakers automatically transition to HALF_OPEN
2. Successful operations close the circuit
3. Failed tests keep circuit OPEN
4. Manual reset available for maintenance

### Monitoring
- Alert on circuit breaker OPEN states
- Monitor retry rates and failure patterns
- Track timeout occurrences
- Dashboard for real-time metrics

## Testing Resilience

### Unit Tests
- Circuit breaker state transitions
- Retry logic with mocked failures
- Timeout behavior
- Fallback execution

### Integration Tests
- Redis failure scenarios
- Network partition simulation
- Service degradation testing
- Recovery verification

### Chaos Engineering
- Random service failures
- Network latency injection
- Resource exhaustion simulation
- Automated recovery testing
