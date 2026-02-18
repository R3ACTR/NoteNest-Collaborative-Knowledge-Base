import logger from '../utils/logger';
import { metrics } from '../utils/metrics';

export interface EventListener {
  (payload: any): Promise<void> | void;
}

export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * Subscribe to an event
   * @param eventName The name of the event
   * @param listener The listener function
   */
  subscribe(eventName: string, listener: EventListener): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }

  /**
   * Unsubscribe from an event
   * @param eventName The name of the event
   * @param listener The listener function to remove
   */
  unsubscribe(eventName: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param eventName The name of the event
   * @param payload The event payload
   */
  async emit(eventName: string, payload: any): Promise<void> {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }

    // Execute listeners asynchronously and handle errors
    const promises = eventListeners.map(async (listener) => {
      try {
        await listener(payload);
      } catch (error) {
        metrics.increment('eventBusFailures');
        logger.error(`Error in event listener for ${eventName}:`, error);
        // Continue with other listeners even if one fails (fallback)
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get the number of listeners for an event (for testing/debugging)
   * @param eventName The name of the event
   */
  getListenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.length || 0;
  }

  /**
   * Clear all listeners (for testing)
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}
