import { env } from './shared/config/env';
import { db } from './shared/database/connection';
import { log } from './shared/utils/logger';
import { initializeApplication } from './app';

async function bootstrap() {
  const app = await initializeApplication();

  const server = app.listen(env.PORT, () => {
    log.info('Server started', {
      port: env.PORT,
      apiVersion: env.API_VERSION,
      baseUrl: env.APP_BASE_URL,
    });
  });

  const shutdown = async (signal: string) => {
    log.info('Shutdown signal received', { signal });
    server.close(async () => {
      await Promise.allSettled([db.disconnect()]);
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  log.error('Failed to bootstrap application', error);
  process.exit(1);
});
