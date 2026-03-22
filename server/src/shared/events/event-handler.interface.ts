import type { DomainEvent } from './domain-event.interface';

/**
 * Interface for event handlers
 * All event handlers must implement this interface
 */
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  /**
   * Handle the domain event
   * @param event - The domain event to handle
   */
  handle(event: T): Promise<void>;

  /**
   * Get the event types this handler can process
   */
  getHandledEventTypes(): string[];

  /**
   * Optional: Get handler name for logging and debugging
   */
  getHandlerName?(): string;
}

/**
 * Event handler metadata for registration
 */
export interface EventHandlerMetadata {
  /** Handler instance */
  handler: EventHandler;

  /** Event types this handler processes */
  eventTypes: string[];

  /** Handler name for debugging */
  name: string;

  /** Priority for execution order (higher = executed first) */
  priority?: number;

  /** Whether handler should be retried on failure */
  retryOnFailure?: boolean;

  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Abstract base class for event handlers
 * Provides common functionality and type safety
 */
export abstract class BaseEventHandler<T extends DomainEvent = DomainEvent>
  implements EventHandler<T> {

  /**
   * Handle the domain event - implement in subclasses
   */
  abstract handle(event: T): Promise<void>;

  /**
   * Get the event types this handler can process - implement in subclasses
   */
  abstract getHandledEventTypes(): string[];

  /**
   * Get handler name for logging (default: class name)
   */
  getHandlerName(): string {
    return this.constructor.name;
  }

  /**
   * Validate that this handler can process the given event
   */
  protected canHandle(event: DomainEvent): event is T {
    return this.getHandledEventTypes().includes(event.type);
  }

  /**
   * Log handler execution for debugging
   */
  protected logExecution(event: T, action: 'started' | 'completed' | 'failed'): void {
    console.log(`[${this.getHandlerName()}] Event ${event.type} handling ${action}`, {
      eventId: event.id,
      aggregateId: event.aggregateId,
      traceId: event.metadata?.traceId,
    });
  }
}

/**
 * Decorator for marking event handler methods
 * Can be used to automatically register handlers
 */
export function EventHandlerFor(eventTypes: string | string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    // Store metadata on the class prototype
    if (!target.constructor.eventHandlers) {
      target.constructor.eventHandlers = [];
    }

    target.constructor.eventHandlers.push({
      method: propertyKey,
      eventTypes: types,
      handler: descriptor.value,
    });

    return descriptor;
  };
}

/**
 * Type for event handler constructor
 */
export type EventHandlerConstructor = new (...args: any[]) => EventHandler;
