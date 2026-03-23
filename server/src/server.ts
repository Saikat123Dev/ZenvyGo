import { env } from './shared/config/env';
import { db } from './shared/database/connection';
import { cacheCleanupScheduler } from './shared/cache/cache-cleanup.scheduler';
import { runMigrations } from './shared/database/migrations';
import { log } from './shared/utils/logger';
import { initializeApplication } from './app';

async function bootstrap() {
  await runMigrations('up');
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
      // Cleanup resources
      cacheCleanupScheduler.stop();
      await Promise.allSettled([db.disconnect()]);
      log.info('Server shutdown complete');
      process.exit(0);
    });

    // Force exit after 30 seconds if graceful shutdown fails
    setTimeout(() => {
      log.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  log.error('Failed to bootstrap application', error);
  process.exit(1);
});
