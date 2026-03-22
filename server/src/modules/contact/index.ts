import type { AppModule } from '../../shared/http/app-module';
import { contactRouter } from './contact.routes';

export const contactModule: AppModule = {
  name: 'contact',
  router: contactRouter,
};
