import type { AppModule } from '../../shared/http/app-module';
import { authRouter } from './auth.routes';

export const authModule: AppModule = {
  name: 'auth',
  router: authRouter,
};
