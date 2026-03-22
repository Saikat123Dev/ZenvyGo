import type { AppModule } from '../../shared/http/app-module';
import { systemRouter } from './system.routes';

export const systemModule: AppModule = {
  name: 'system',
  mountPath: '/',
  router: systemRouter,
};
