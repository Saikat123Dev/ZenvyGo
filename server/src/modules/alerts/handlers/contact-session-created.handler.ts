import { BaseEventHandler } from '../../../shared/events/event-handler.interface';
import type { ContactSessionCreatedEvent } from '../../contact/events/contact-session-created.event';
import { alertService } from '../alert.service';

export class ContactSessionCreatedAlertHandler extends BaseEventHandler<ContactSessionCreatedEvent> {
  public async handle(event: ContactSessionCreatedEvent): Promise<void> {
    await alertService.createSystemAlert({
      userId: event.payload.ownerId,
      sessionId: event.payload.sessionId,
      title: 'New vehicle contact request',
      body: `Reason: ${event.payload.reasonCode}. Requested channel: ${event.payload.requestedChannel}.`,
      severity: 'warning',
      metadata: event.payload,
    });
  }

  public getHandledEventTypes(): string[] {
    return ['contact.session.created'];
  }
}
