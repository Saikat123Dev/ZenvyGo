import type { AppModule } from '../../shared/http/app-module';
import { emergencyProfileRouter } from './emergency-profile.routes';

export const emergencyProfilesModule: AppModule = {
  name: 'emergency-profiles',
  router: emergencyProfileRouter,
};
