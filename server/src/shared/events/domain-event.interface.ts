/**
 * Base interface for all domain events
 * All events in the system should implement this interface
 */
export interface DomainEvent {
  /** Unique identifier for the event */
  readonly id: string;

  /** The aggregate ID that generated this event */
  readonly aggregateId: string;

  /** Type/name of the event */
  readonly type: string;

  /** When the event occurred */
  readonly occurredAt: Date;

  /** Version of the event schema */
  readonly version: number;

  /** Event payload data */
  readonly payload: Record<string, any>;

  /** Metadata for tracing and debugging */
  readonly metadata?: {
    traceId?: string;
    userId?: string;
    correlationId?: string;
    [key: string]: any;
  };
}

/**
 * Abstract base class for domain events
 * Provides common functionality for all domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly id: string;
  public readonly occurredAt: Date;
  public readonly version: number = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly type: string,
    public readonly payload: Record<string, any>,
    public readonly metadata?: DomainEvent['metadata']
  ) {
    this.id = this.generateEventId();
    this.occurredAt = new Date();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get event as plain object (for serialization)
   */
  public toObject(): DomainEvent {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      type: this.type,
      occurredAt: this.occurredAt,
      version: this.version,
      payload: this.payload,
      metadata: this.metadata,
    };
  }
}
