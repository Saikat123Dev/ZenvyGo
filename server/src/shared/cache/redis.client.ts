import Redis from 'ioredis';
import { redisConfig, REDIS_PREFIXES, REDIS_TTL } from '../config/redis.config';
import { isDevelopment, env } from '../config/env';

/**
 * Redis client singleton
 * Manages Redis connections and provides utility methods
 */
class RedisClient {
  private static instance: RedisClient | null = null;
  private redis: Redis | null = null;
  private isConnected = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Initialize Redis connection
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.redis) {
      return;
    }

    try {
      if (env.REDIS_URL) {
        this.redis = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (attempt: number) => Math.min(attempt * 100, 2000),
        });
      } else {
        this.redis = new Redis(redisConfig);
      }

      // Set up event handlers before any commands run
      this.redis.on('connect', () => {
        if (isDevelopment) {
          console.log('🔄 Redis connecting...');
        }
      });

      this.redis.on('ready', () => {
        this.isConnected = true;
        if (isDevelopment) {
          console.log('✅ Redis ready');
        }
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis error:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        if (isDevelopment) {
          console.log('📴 Redis connection closed');
        }
      });

      this.redis.on('reconnecting', (ms: number) => {
        if (isDevelopment) {
          console.log(`🔄 Redis reconnecting in ${ms}ms...`);
        }
      });

      // Test connection
      await this.redis.ping();
      this.isConnected = true;

      if (isDevelopment) {
        const connectionLabel = env.REDIS_URL ?? `${redisConfig.host}:${redisConfig.port}`;
        console.log('✅ Redis connection established');
        console.log(`🔴 Connected to Redis: ${connectionLabel}`);
      }
    } catch (error) {
      console.warn('⚠️ Redis unavailable. Continuing without Redis.', error);
      if (this.redis) {
        this.redis.disconnect();
      }
      this.redis = null;
      this.isConnected = false;
    }
  }

  /**
   * Get Redis client instance
   */
  public getClient(): Redis {
    if (!this.redis || !this.isConnected) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.redis;
  }

  /**
   * Set key-value with optional TTL
   */
  public async set(
    key: string,
    value: string | number | boolean | object,
    ttl?: number
  ): Promise<void> {
    const client = this.getClient();
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (ttl) {
      await client.setex(key, ttl, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  }

  /**
   * Get value by key
   */
  public async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return client.get(key);
  }

  /**
   * Get and parse JSON value
   */
  public async getObject<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete key
   */
  public async delete(key: string): Promise<number> {
    const client = this.getClient();
    return client.del(key);
  }

  /**
   * Delete multiple keys
   */
  public async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    const client = this.getClient();
    return client.del(...keys);
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration for existing key
   */
  public async expire(key: string, ttl: number): Promise<boolean> {
    const client = this.getClient();
    const result = await client.expire(key, ttl);
    return result === 1;
  }

  /**
   * Get TTL for key
   */
  public async getTTL(key: string): Promise<number> {
    const client = this.getClient();
    return client.ttl(key);
  }

  /**
   * Increment counter
   */
  public async increment(key: string, by: number = 1): Promise<number> {
    const client = this.getClient();
    return client.incrby(key, by);
  }

  /**
   * Decrement counter
   */
  public async decrement(key: string, by: number = 1): Promise<number> {
    const client = this.getClient();
    return client.decrby(key, by);
  }

  /**
   * Add item to list (left push)
   */
  public async listPush(key: string, value: string | object): Promise<number> {
    const client = this.getClient();
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return client.lpush(key, serializedValue);
  }

  /**
   * Remove and return item from list (right pop)
   */
  public async listPop(key: string): Promise<string | null> {
    const client = this.getClient();
    return client.rpop(key);
  }

  /**
   * Get list length
   */
  public async listLength(key: string): Promise<number> {
    const client = this.getClient();
    return client.llen(key);
  }

  /**
   * Add member to set
   */
  public async setAdd(key: string, member: string): Promise<number> {
    const client = this.getClient();
    return client.sadd(key, member);
  }

  /**
   * Remove member from set
   */
  public async setRemove(key: string, member: string): Promise<number> {
    const client = this.getClient();
    return client.srem(key, member);
  }

  /**
   * Check if member exists in set
   */
  public async setIsMember(key: string, member: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.sismember(key, member);
    return result === 1;
  }

  /**
   * Get all members of set
   */
  public async setMembers(key: string): Promise<string[]> {
    const client = this.getClient();
    return client.smembers(key);
  }

  /**
   * Find keys by pattern
   */
  public async findKeys(pattern: string): Promise<string[]> {
    const client = this.getClient();
    return client.keys(pattern);
  }

  /**
   * Clear all keys matching pattern (use with caution!)
   */
  public async clearPattern(pattern: string): Promise<number> {
    const keys = await this.findKeys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    return this.deleteMany(keys);
  }

  /**
   * Get Redis info
   */
  public async getInfo(): Promise<string> {
    const client = this.getClient();
    return client.info();
  }

  /**
   * Flush current database (use with caution!)
   */
  public async flushDatabase(): Promise<string> {
    const client = this.getClient();
    return client.flushdb();
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    if (this.redis && this.isConnected) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
      console.log('📴 Redis connection closed');
    }
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    isConnected: boolean;
    status?: string;
  } {
    return {
      isConnected: this.isConnected,
      status: this.redis?.status || 'disconnected',
    };
  }
}

// Export singleton instance
export const redis = RedisClient.getInstance();

// Export Redis prefixes and TTL constants for convenience
export { REDIS_PREFIXES, REDIS_TTL };

// Export ioredis types
export type { Redis } from 'ioredis';
