import { eventBus } from '../../shared/events/event-bus';
import type { AppModule } from '../../shared/http/app-module';
import { ContactSessionCreatedAlertHandler } from './handlers/contact-session-created.handler';
import { alertRouter } from './alert.routes';

export const alertsModule: AppModule = {
  name: 'alerts',
  router: alertRouter,
  async initialize() {
    eventBus.registerHandler(new ContactSessionCreatedAlertHandler());
  },
};
