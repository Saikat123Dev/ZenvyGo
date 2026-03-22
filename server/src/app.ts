import express from 'express';
import { env } from './shared/config/env';
import { db } from './shared/database/connection';
import { redis } from './shared/cache/redis.client';
import { authModule } from './modules/auth';
import { usersModule } from './modules/users';
import { vehiclesModule } from './modules/vehicles';
import { tagsModule } from './modules/tags';
import { contactModule } from './modules/contact';
import { alertsModule } from './modules/alerts';
import { emergencyProfilesModule } from './modules/emergency-profiles';
import { systemModule } from './modules/system';
import { corsMiddleware } from './shared/middleware/cors.middleware';
import { helmetMiddleware } from './shared/middleware/helmet.middleware';
import { addTraceId, requestLogger } from './shared/middleware/request-logger.middleware';
import {
  errorHandler,
  notFoundHandler,
} from './shared/middleware/error-handler.middleware';
import type { AppModule } from './shared/http/app-module';

const appModules: AppModule[] = [
  systemModule,
  authModule,
  usersModule,
  vehiclesModule,
  tagsModule,
  contactModule,
  alertsModule,
  emergencyProfilesModule,
];

export async function initializeApplication() {
  await db.connect();
  await redis.connect();

  const app = express();
  app.disable('x-powered-by');

  app.use(addTraceId);
  app.use(requestLogger);
  app.use(corsMiddleware);
  app.use(helmetMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  for (const module of appModules) {
    if (module.initialize) {
      await module.initialize();
    }

    const mountPath = module.mountPath ?? `/api/${env.API_VERSION}`;
    app.use(mountPath, module.router);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
