import { redis, REDIS_PREFIXES, REDIS_TTL } from './redis.client';

type CacheValue = string | number | boolean | object;

class CacheService {
  public async set<T extends CacheValue>(
    prefix: keyof typeof REDIS_PREFIXES,
    key: string,
    data: T,
    ttl?: number,
  ): Promise<void> {
    await redis.set(this.buildKey(prefix, key), data, ttl);
  }

  public async get<T>(prefix: keyof typeof REDIS_PREFIXES, key: string): Promise<T | null> {
    const fullKey = this.buildKey(prefix, key);
    const rawValue = await redis.get(fullKey);

    if (rawValue === null) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  }

  public async delete(prefix: keyof typeof REDIS_PREFIXES, key: string): Promise<void> {
    await redis.delete(this.buildKey(prefix, key));
  }

  public async getOrSet<T extends CacheValue>(
    prefix: keyof typeof REDIS_PREFIXES,
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(prefix, key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(prefix, key, value, ttl ?? this.getDefaultTTL(prefix));
    return value;
  }

  public async cacheUser(userId: string, userData: CacheValue, ttl?: number): Promise<void> {
    await this.set('USER', userId, userData, ttl ?? REDIS_TTL.CACHE_MEDIUM);
  }

  public async getCachedUser<T>(userId: string): Promise<T | null> {
    return this.get<T>('USER', userId);
  }

  public async clearUserCache(userId: string): Promise<void> {
    await this.delete('USER', userId);
  }

  public async cacheVehicle(
    vehicleId: string,
    vehicleData: CacheValue,
    ttl?: number,
  ): Promise<void> {
    await this.set('VEHICLE', vehicleId, vehicleData, ttl ?? REDIS_TTL.CACHE_MEDIUM);
  }

  public async getCachedVehicle<T>(vehicleId: string): Promise<T | null> {
    return this.get<T>('VEHICLE', vehicleId);
  }

  public async clearVehicleCache(vehicleId: string): Promise<void> {
    await this.delete('VEHICLE', vehicleId);
  }

  public async clearAll(): Promise<void> {
    for (const prefix of ['CACHE', 'USER', 'VEHICLE'] as const) {
      await redis.clearPattern(`${REDIS_PREFIXES[prefix]}*`);
    }
  }

  private buildKey(prefix: keyof typeof REDIS_PREFIXES, key: string): string {
    return `${REDIS_PREFIXES[prefix]}${key}`;
  }

  private getDefaultTTL(prefix: keyof typeof REDIS_PREFIXES): number {
    switch (prefix) {
      case 'OTP':
        return REDIS_TTL.OTP;
      case 'RATE_LIMIT':
        return REDIS_TTL.RATE_LIMIT;
      case 'SESSION':
        return REDIS_TTL.SESSION;
      default:
        return REDIS_TTL.CACHE_MEDIUM;
    }
  }
}

export const cacheService = new CacheService();
