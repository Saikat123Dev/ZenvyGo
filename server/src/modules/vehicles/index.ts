import type { AppModule } from '../../shared/http/app-module';
import { vehicleRouter } from './vehicle.routes';

export const vehiclesModule: AppModule = {
  name: 'vehicles',
  router: vehicleRouter,
};
