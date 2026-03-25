import { Redis } from '@upstash/redis';
import { env } from '../config/env';
import { log } from '../utils/logger';
import { REDIS_PREFIXES, REDIS_TTL } from '../config/redis.config';

/**
 * Upstash Redis client — serverless HTTP/REST based.
 * No persistent TCP connections; ideal for both serverless and traditional deployments.
 */
class UpstashRedisClient {
  private static instance: UpstashRedisClient | null = null;
  private readonly client: Redis;
  private connected = false;

  private constructor() {
    this.client = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
      automaticDeserialization: false, // we handle serialization ourselves for type safety
    });
  }

  public static getInstance(): UpstashRedisClient {
    if (!UpstashRedisClient.instance) {
      UpstashRedisClient.instance = new UpstashRedisClient();
    }
    return UpstashRedisClient.instance;
  }

  // ─── Connection lifecycle ──────────────────────────────────────────

  /** Verify connectivity with a PING. Call once at startup. */
  public async connect(): Promise<void> {
    try {
      const result = await this.client.ping();
      if (result === 'PONG') {
        this.connected = true;
        log.info('Upstash Redis connected successfully');
      } else {
        throw new Error(`Unexpected PING response: ${result}`);
      }
    } catch (error) {
      this.connected = false;
      log.error('Upstash Redis connection failed', { error });
      throw error;
    }
  }

  /** No-op for Upstash REST client (no persistent connection to close). */
  public async disconnect(): Promise<void> {
    this.connected = false;
    log.info('Upstash Redis client marked as disconnected');
  }

  public getStatus(): { isConnected: boolean; status: string } {
    return {
      isConnected: this.connected,
      status: this.connected ? 'ready' : 'disconnected',
    };
  }

  /** Lightweight health check. */
  public async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  // ─── Key-value operations ──────────────────────────────────────────

  /**
   * SET with optional TTL (seconds).
   * Objects are JSON-serialized before storage.
   */
  public async set(
    key: string,
    value: string | number | boolean | object,
    ttl?: number,
  ): Promise<void> {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (ttl && ttl > 0) {
      await this.client.set(key, serialized, { ex: ttl });
    } else {
      await this.client.set(key, serialized);
    }
  }

  /** GET — returns raw string or null. */
  public async get(key: string): Promise<string | null> {
    const value = await this.client.get<string>(key);
    return value ?? null;
  }

  /** GET + JSON.parse. Returns null on miss or parse failure. */
  public async getObject<T = any>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** DEL — returns number of keys deleted. */
  public async delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  /** DEL multiple keys. */
  public async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  /** EXISTS — returns true if key exists. */
  public async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  /** EXPIRE — set TTL on existing key. */
  public async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.client.expire(key, ttl);
    return result === 1;
  }

  /** TTL — returns remaining seconds, -2 if key doesn't exist, -1 if no expiry. */
  public async getTTL(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /** INCR / INCRBY — atomic increment. */
  public async increment(key: string, by = 1): Promise<number> {
    if (by === 1) {
      return this.client.incr(key);
    }
    return this.client.incrby(key, by);
  }

  /** DECRBY — atomic decrement. */
  public async decrement(key: string, by = 1): Promise<number> {
    return this.client.decrby(key, by);
  }

  // ─── Pattern operations (use SCAN, never KEYS) ────────────────────

  /**
   * Find keys matching a glob pattern using SCAN.
   * Production-safe: does not block the main thread.
   */
  public async findKeys(pattern: string): Promise<string[]> {
    const allKeys: string[] = [];
    let cursor = 0;

    do {
      const result = await this.client.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = Number(result[0]);
      const keys = result[1] as string[];
      allKeys.push(...keys);
    } while (cursor !== 0);

    return allKeys;
  }

  /**
   * Delete all keys matching a glob pattern.
   * Uses SCAN + DEL in batches for production safety.
   */
  public async clearPattern(pattern: string): Promise<number> {
    const keys = await this.findKeys(pattern);
    if (keys.length === 0) return 0;

    // Delete in batches of 100 to avoid oversized requests
    let deleted = 0;
    for (let i = 0; i < keys.length; i += 100) {
      const batch = keys.slice(i, i + 100);
      deleted += await this.client.del(...batch);
    }
    return deleted;
  }

  // ─── Database info ─────────────────────────────────────────────────

  /** Returns the number of keys in the database. */
  public async dbSize(): Promise<number> {
    return this.client.dbsize();
  }

  /** Flush the entire database. Use with extreme caution. */
  public async flushDatabase(): Promise<string> {
    await this.client.flushdb();
    return 'OK';
  }
}

export const redis = UpstashRedisClient.getInstance();

export { REDIS_PREFIXES, REDIS_TTL };
