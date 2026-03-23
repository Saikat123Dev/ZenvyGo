import { redis } from '../cache/redis.client';
import { logger } from '../utils/logger';

/**
 * Cache cleanup scheduler
 * Periodically cleans up expired entries and manages memory usage
 */
class CacheCleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs: number = 5 * 60 * 1000; // 5 minutes
  private readonly maxMemoryMB: number = 100; // 100MB max cache size

  /**
   * Start the cleanup scheduler
   */
  public start(): void {
    if (this.intervalId) {
      logger.warn('Cache cleanup scheduler already running');
      return;
    }

    logger.info('Starting cache cleanup scheduler', {
      interval: `${this.cleanupIntervalMs / 1000}s`,
      maxMemory: `${this.maxMemoryMB}MB`,
    });

    // Run cleanup immediately
    this.runCleanup();

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.cleanupIntervalMs);
  }

  /**
   * Stop the cleanup scheduler
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Cache cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup process
   */
  private async runCleanup(): Promise<void> {
    try {
      const startTime = Date.now();

      // Clean expired entries
      const expiredCount = await redis.cleanupExpired();

      // Get cache statistics
      const stats = redis.getStats();
      const memoryUsageMB = stats.memoryUsageBytes / (1024 * 1024);

      logger.info('Cache cleanup completed', {
        expiredCount,
        totalKeys: stats.totalKeys,
        memoryUsageMB: memoryUsageMB.toFixed(2),
        durationMs: Date.now() - startTime,
      });

      // If memory usage exceeds limit, run aggressive cleanup
      if (memoryUsageMB > this.maxMemoryMB) {
        await this.aggressiveCleanup(memoryUsageMB);
      }
    } catch (error) {
      logger.error('Cache cleanup failed', { error });
    }
  }

  /**
   * Aggressive cleanup when memory limit is exceeded
   * Uses LRU (Least Recently Used) strategy
   */
  private async aggressiveCleanup(currentMemoryMB: number): Promise<void> {
    logger.warn('Cache memory limit exceeded, running aggressive cleanup', {
      currentMemoryMB: currentMemoryMB.toFixed(2),
      limitMB: this.maxMemoryMB,
    });

    try {
      // Clear old cache entries (not OTP or session data)
      await redis.clearPattern('cache:*');

      const newStats = redis.getStats();
      const newMemoryMB = newStats.memoryUsageBytes / (1024 * 1024);

      logger.info('Aggressive cleanup completed', {
        freedMB: (currentMemoryMB - newMemoryMB).toFixed(2),
        newMemoryMB: newMemoryMB.toFixed(2),
      });
    } catch (error) {
      logger.error('Aggressive cleanup failed', { error });
    }
  }

  /**
   * Manually trigger cache cleanup
   */
  public async manualCleanup(): Promise<void> {
    logger.info('Manual cache cleanup triggered');
    await this.runCleanup();
  }
}

export const cacheCleanupScheduler = new CacheCleanupScheduler();
