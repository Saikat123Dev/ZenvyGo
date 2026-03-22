import { EventEmitter } from 'events';
import type { DomainEvent } from './domain-event.interface';
import type { EventHandler, EventHandlerMetadata } from './event-handler.interface';
import { log } from '../utils/logger';

/**
 * Event bus configuration
 */
interface EventBusConfig {
  /** Maximum number of listeners per event type */
  maxListeners: number;

  /** Whether to retry failed handlers */
  retryFailedHandlers: boolean;

  /** Default number of retry attempts */
  defaultMaxRetries: number;

  /** Delay between retries in milliseconds */
  retryDelay: number;

  /** Whether to log all events (useful for debugging) */
  logAllEvents: boolean;
}

/**
 * Event execution result
 */
interface EventExecutionResult {
  eventId: string;
  eventType: string;
  handlerName: string;
  success: boolean;
  duration: number;
  error?: Error;
  retryAttempt?: number;
}

/**
 * In-process event bus for domain events
 * Enables loose coupling between modules through event-driven communication
 */
class EventBus {
  private static instance: EventBus | null = null;
  private eventEmitter: EventEmitter;
  private handlers: Map<string, EventHandlerMetadata[]>;
  private config: EventBusConfig;
  private executionResults: EventExecutionResult[] = [];

  private constructor(config?: Partial<EventBusConfig>) {
    this.config = {
      maxListeners: 20,
      retryFailedHandlers: true,
      defaultMaxRetries: 3,
      retryDelay: 1000,
      logAllEvents: false,
      ...config,
    };

    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(this.config.maxListeners);
    this.handlers = new Map();

    // Set up error handling
    this.eventEmitter.on('error', (error) => {
      log.error('Event bus error', error);
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<EventBusConfig>): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Register an event handler
   */
  public registerHandler(handler: EventHandler, options?: {
    priority?: number;
    retryOnFailure?: boolean;
    maxRetries?: number;
  }): void {
    const eventTypes = handler.getHandledEventTypes();
    const handlerName = handler.getHandlerName?.() || handler.constructor.name;

    const metadata: EventHandlerMetadata = {
      handler,
      eventTypes,
      name: handlerName,
      priority: options?.priority || 0,
      retryOnFailure: options?.retryOnFailure ?? this.config.retryFailedHandlers,
      maxRetries: options?.maxRetries ?? this.config.defaultMaxRetries,
    };

    // Register for each event type
    for (const eventType of eventTypes) {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }

      const handlersForType = this.handlers.get(eventType)!;
      handlersForType.push(metadata);

      // Sort by priority (higher priority first)
      handlersForType.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      log.info(`Registered event handler`, {
        handlerName,
        eventType,
        priority: metadata.priority,
        totalHandlers: handlersForType.length,
      });
    }
  }

  /**
   * Unregister an event handler
   */
  public unregisterHandler(handler: EventHandler): void {
    const eventTypes = handler.getHandledEventTypes();
    const handlerName = handler.getHandlerName?.() || handler.constructor.name;

    for (const eventType of eventTypes) {
      const handlersForType = this.handlers.get(eventType);
      if (handlersForType) {
        const index = handlersForType.findIndex(meta => meta.handler === handler);
        if (index > -1) {
          handlersForType.splice(index, 1);
          log.info(`Unregistered event handler`, {
            handlerName,
            eventType,
          });

          // Remove the array if empty
          if (handlersForType.length === 0) {
            this.handlers.delete(eventType);
          }
        }
      }
    }
  }

  /**
   * Emit a domain event
   */
  public async emit(event: DomainEvent): Promise<void> {
    if (this.config.logAllEvents) {
      log.info('Event emitted', {
        eventId: event.id,
        eventType: event.type,
        aggregateId: event.aggregateId,
        traceId: event.metadata?.traceId,
      });
    }

    // Get handlers for this event type
    const handlersForType = this.handlers.get(event.type) || [];

    if (handlersForType.length === 0) {
      log.warn('No handlers registered for event', {
        eventType: event.type,
        eventId: event.id,
      });
      return;
    }

    // Execute all handlers concurrently
    const handlerPromises = handlersForType.map(async (metadata) => {
      return this.executeHandler(metadata, event);
    });

    // Wait for all handlers to complete
    const results = await Promise.allSettled(handlerPromises);

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const handlerName = handlersForType[index]?.name || 'Unknown';
        log.error('Event handler failed', result.reason, {
          eventId: event.id,
          eventType: event.type,
          handlerName,
        });
      }
    });
  }

  /**
   * Emit multiple events in sequence
   */
  public async emitAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.emit(event);
    }
  }

  /**
   * Execute a specific handler for an event
   */
  private async executeHandler(
    metadata: EventHandlerMetadata,
    event: DomainEvent,
    retryAttempt = 0
  ): Promise<void> {
    const startTime = Date.now();
    let executionResult: EventExecutionResult;

    try {
      await metadata.handler.handle(event);

      executionResult = {
        eventId: event.id,
        eventType: event.type,
        handlerName: metadata.name,
        success: true,
        duration: Date.now() - startTime,
        retryAttempt: retryAttempt > 0 ? retryAttempt : undefined,
      };

      // Store execution result for monitoring
      this.executionResults.push(executionResult);

      if (retryAttempt > 0) {
        log.info('Event handler retry succeeded', {
          eventId: event.id,
          eventType: event.type,
          handlerName: metadata.name,
          retryAttempt,
        });
      }

    } catch (error) {
      executionResult = {
        eventId: event.id,
        eventType: event.type,
        handlerName: metadata.name,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
        retryAttempt: retryAttempt > 0 ? retryAttempt : undefined,
      };

      this.executionResults.push(executionResult);

      // Retry if configured and not exceeded max attempts
      if (metadata.retryOnFailure &&
          retryAttempt < (metadata.maxRetries || this.config.defaultMaxRetries)) {

        log.warn('Event handler failed, retrying', {
          eventId: event.id,
          eventType: event.type,
          handlerName: metadata.name,
          retryAttempt: retryAttempt + 1,
          error: error instanceof Error ? error.message : String(error),
        });

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));

        // Retry
        return this.executeHandler(metadata, event, retryAttempt + 1);
      }

      // If all retries exhausted, throw the error
      throw error;
    }
  }

  /**
   * Get registered handlers for an event type
   */
  public getHandlers(eventType: string): EventHandlerMetadata[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Get all registered event types
   */
  public getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get execution statistics
   */
  public getExecutionStats(): {
    totalEvents: number;
    successRate: number;
    avgDuration: number;
    recentFailures: EventExecutionResult[];
  } {
    const recent = this.executionResults.slice(-100); // Last 100 executions
    const successful = recent.filter(r => r.success);
    const failures = recent.filter(r => !r.success);

    return {
      totalEvents: recent.length,
      successRate: recent.length > 0 ? successful.length / recent.length : 0,
      avgDuration: recent.length > 0 ?
        recent.reduce((sum, r) => sum + r.duration, 0) / recent.length : 0,
      recentFailures: failures.slice(-10), // Last 10 failures
    };
  }

  /**
   * Clear execution history
   */
  public clearExecutionHistory(): void {
    this.executionResults = [];
  }

  /**
   * Destroy the event bus (for testing)
   */
  public destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.handlers.clear();
    this.executionResults = [];
    EventBus.instance = null;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Export types
export type { DomainEvent } from './domain-event.interface';
export type { EventHandler, EventHandlerMetadata } from './event-handler.interface';
