import { BaseDomainEvent } from '../../../shared/events/domain-event.interface';

export interface ContactSessionCreatedPayload {
  ownerId: string;
  sessionId: string;
  vehicleId: string;
  reasonCode: string;
  requestedChannel: string;
}

export class ContactSessionCreatedEvent extends BaseDomainEvent {
  constructor(aggregateId: string, payload: ContactSessionCreatedPayload) {
    super(aggregateId, 'contact.session.created', payload);
  }
}
