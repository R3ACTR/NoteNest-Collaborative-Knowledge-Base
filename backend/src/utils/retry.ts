import logger from './logger';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Base delay in ms
  maxDelay: number; // Max delay in ms
  backoffFactor: number; // Exponential backoff factor
  retryableErrors?: (error: any) => boolean; // Function to determine if error is retryable
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 100, // 100ms
  maxDelay: 5000, // 5s
  backoffFactor: 2,
  retryableErrors: (error: any) => {
    // Retry on network errors, timeouts, 5xx status codes
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }
    if (error.status && error.status >= 500) {
      return true;
    }
    return false;
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === config.maxAttempts) {
        logger.error(`Operation failed after ${config.maxAttempts} attempts`, error);
        throw error;
      }

      if (config.retryableErrors && !config.retryableErrors(error)) {
        logger.warn(`Non-retryable error on attempt ${attempt}`, error);
        throw error;
      }

      const delay = Math.min(config.baseDelay * Math.pow(config.backoffFactor, attempt - 1), config.maxDelay);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Specific retry for idempotent operations
export async function retryIdempotent<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  return withRetry(operation, finalConfig);
}
