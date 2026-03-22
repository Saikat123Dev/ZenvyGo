import type { AppModule } from '../../shared/http/app-module';
import { tagRouter } from './tag.routes';

export const tagsModule: AppModule = {
  name: 'tags',
  router: tagRouter,
};
