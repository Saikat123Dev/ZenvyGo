import { redis } from './redis.client';
import { log } from '../utils/logger';

/**
 * Cache health-check & metrics scheduler.
 *
 * With Upstash Redis, key expiration is handled natively via TTL —
 * no manual cleanup is needed. This scheduler periodically logs
 * database metrics for observability.
 */
class CacheCleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly metricsIntervalMs: number = 15 * 60 * 1000; // 15 minutes

  /** Start the periodic metrics logger. */
  public start(): void {
    if (this.intervalId) {
      log.warn('Cache metrics scheduler already running');
      return;
    }

    log.info('Starting Redis metrics scheduler', {
      interval: `${this.metricsIntervalMs / 1000}s`,
    });

    // Run health check immediately
    void this.runHealthCheck();

    // Schedule periodic metrics
    this.intervalId = setInterval(() => {
      void this.runHealthCheck();
    }, this.metricsIntervalMs);
  }

  /** Stop the scheduler. */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log.info('Redis metrics scheduler stopped');
    }
  }

  /** Run health check and log metrics. */
  private async runHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();

      const isHealthy = await redis.ping();
      const dbSize = await redis.dbSize();

      log.info('Redis health check', {
        healthy: isHealthy,
        totalKeys: dbSize,
        latencyMs: Date.now() - startTime,
      });
    } catch (error) {
      log.error('Redis health check failed', { error });
    }
  }

  /** Manually trigger a health check. */
  public async manualCleanup(): Promise<void> {
    log.info('Manual Redis health check triggered');
    await this.runHealthCheck();
  }
}

export const cacheCleanupScheduler = new CacheCleanupScheduler();
