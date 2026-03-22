import type { AppModule } from '../../shared/http/app-module';
import { userRouter } from './user.routes';

export const usersModule: AppModule = {
  name: 'users',
  router: userRouter,
};
