import type { AppModule } from '../../shared/http/app-module';
import { documentRouter } from './document.routes';

export const documentsModule: AppModule = {
  name: 'documents',
  router: documentRouter,
};
