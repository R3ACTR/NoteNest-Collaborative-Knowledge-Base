

export interface MetricsData {
  cacheFailures: number;
  cacheHits: number;
  cacheMisses: number;
  retryAttempts: number;
  circuitBreakerOpens: number;
  circuitBreakerCloses: number;
  httpRequestFailures: number;
  httpRequestTimeouts: number;
  eventBusFailures: number;
}

class MetricsCollector {
  private data: MetricsData = {
    cacheFailures: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retryAttempts: 0,
    circuitBreakerOpens: 0,
    circuitBreakerCloses: 0,
    httpRequestFailures: 0,
    httpRequestTimeouts: 0,
    eventBusFailures: 0,
  };

  increment(metric: keyof MetricsData): void {
    this.data[metric]++;
  }

  getMetrics(): MetricsData {
    return { ...this.data };
  }

  reset(): void {
    this.data = {
      cacheFailures: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retryAttempts: 0,
      circuitBreakerOpens: 0,
      circuitBreakerCloses: 0,
      httpRequestFailures: 0,
      httpRequestTimeouts: 0,
      eventBusFailures: 0,
    };
  }
}

export const metrics = new MetricsCollector();
