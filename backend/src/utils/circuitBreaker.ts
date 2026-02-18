import logger from './logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  resetTimeout: number; // Time in ms to wait before trying half-open
  monitoringPeriod: number; // Time window in ms for failure count
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private successCount: number = 0; // For half-open state

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      } else {
        this.state = CircuitState.HALF_OPEN;
        logger.info(`Circuit breaker '${this.name}' transitioning to HALF_OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 1) { // Simple: one success closes it
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        logger.info(`Circuit breaker '${this.name}' transitioning to CLOSED`);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
      this.successCount = 0;
      logger.warn(`Circuit breaker '${this.name}' transitioning to OPEN due to failure in HALF_OPEN`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
      logger.warn(`Circuit breaker '${this.name}' transitioning to OPEN (failure threshold reached)`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  // Reset for testing or manual intervention
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    logger.info(`Circuit breaker '${this.name}' manually reset to CLOSED`);
  }
}

// Factory for creating circuit breakers
export const createCircuitBreaker = (name: string, config: CircuitBreakerConfig): CircuitBreaker => {
  return new CircuitBreaker(name, config);
};
