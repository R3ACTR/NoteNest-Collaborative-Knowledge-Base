import Redis from 'ioredis';
import { CircuitBreaker, createCircuitBreaker, CircuitState } from '../utils/circuitBreaker';
import { retryIdempotent } from '../utils/retry';
import { metrics } from '../utils/metrics.ts';
import logger from '../utils/logger';

export class CacheService {
  private client: Redis | null = null;
  private isEnabled: boolean = false;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    // Initialize circuit breaker with default config
    this.circuitBreaker = createCircuitBreaker('redis-cache', {
      failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'),
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '60000'), // 1 minute
      monitoringPeriod: parseInt(process.env.CIRCUIT_BREAKER_MONITORING_PERIOD || '60000'),
    });
  }

  async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const cacheEnabled = process.env.CACHE_ENABLED !== 'false'; // Default to true

      if (!cacheEnabled) {
        console.log('🔄 Cache is disabled via CACHE_ENABLED=false');
        return;
      }

      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000, // 5 second timeout
        commandTimeout: 3000, // 3 second command timeout
        enableReadyCheck: false,
      });

      // Handle Redis errors to prevent unhandled error events crashing the app
      this.client.on('error', (error) => {
        // Only log if we haven't already logged a connection failure to avoid spamming
        // checking isEnabled to see if it was ever successfully connected
        if (this.isEnabled) {
          console.warn('⚠️  Redis cache error:', error instanceof Error ? error.message : String(error));
        }
      });

      // Test connection with timeout
      await Promise.race([
        this.client.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

      this.isEnabled = true;
      console.log('🔄 Redis cache connected successfully');
    } catch (error) {
      console.warn('⚠️  Redis cache connection failed:', error instanceof Error ? error.message : String(error));
      this.client = null;
      this.isEnabled = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      const data = await this.circuitBreaker.call(async () => {
        return await retryIdempotent(async () => {
          const result = await this.client!.get(key);
          if (result) {
            metrics.increment('cacheHits');
          } else {
            metrics.increment('cacheMisses');
          }
          return result;
        });
      });
      return data ? JSON.parse(data) : null;
    } catch (error: unknown) {
      metrics.increment('cacheFailures');
      logger.warn('Cache get error:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled || !this.client) return;

    // If circuit breaker is open, skip caching (fallback)
    if (this.circuitBreaker.getState() === CircuitState.OPEN) {
      logger.debug('Circuit breaker open, skipping cache set');
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const defaultTtl = parseInt(process.env.CACHE_TTL || '3600'); // 1 hour default
      const ttl = ttlSeconds || defaultTtl;

      await this.circuitBreaker.call(async () => {
        return await retryIdempotent(async () => {
          await this.client!.setex(key, ttl, serializedValue);
        });
      });
    } catch (error: unknown) {
      metrics.increment('cacheFailures');
      logger.warn('Cache set error:', error instanceof Error ? error.message : String(error));
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.client) return;

    try {
      await this.client.del(key);
    } catch (error: unknown) {
      console.warn('Cache delete error:', error instanceof Error ? error.message : String(error));
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.client) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.warn('Cache delete pattern error:', error instanceof Error ? error.message : String(error));
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: unknown) {
      console.warn('Cache exists error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.isEnabled || !this.client) return;

    try {
      await this.client.flushall();
    } catch (error) {
      console.warn('Cache clear error:', error instanceof Error ? error.message : String(error));
    }
  }

  isCacheEnabled(): boolean {
    return this.isEnabled;
  }

  async getStats(): Promise<any> {
    if (!this.isEnabled || !this.client) return { enabled: false };

    try {
      const info = await this.client.info();
      return {
        enabled: true,
        connected_clients: this.client.status === 'ready',
        info: info
      };
    } catch (error: unknown) {
      return { enabled: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isEnabled = false;
    }
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export async function initializeCache(): Promise<void> {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
    await cacheServiceInstance.initialize();
  }
}

export function getCacheService(): CacheService | null {
  return cacheServiceInstance;
}

// Cache key generators
export const CacheKeys = {
  note: (id: string) => `note:${id}`,
  workspace: (id: string) => `workspace:${id}`,
  workspaceNotes: (workspaceId: string) => `workspace:${workspaceId}:notes`,
  userWorkspaces: (userId: string) => `user:${userId}:workspaces`,
  permission: (userId: string, resourceId: string) => `permission:${userId}:${resourceId}`,
  auditLogs: (workspaceId: string, limit: number, skip: number) => `audit:${workspaceId}:${limit}:${skip}`,
  noteVersions: (noteId: string) => `note:${noteId}:versions`,
};
