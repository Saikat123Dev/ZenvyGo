import type { RedisOptions } from 'ioredis';
import { env, isDevelopment } from './env';

export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  tls: env.REDIS_URL?.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  connectTimeout: 10000,
  lazyConnect: false,
  enableReadyCheck: true,
  maxRetriesPerRequest: isDevelopment ? 0 : 3,
  retryStrategy: isDevelopment ? () => null : (attempt: number) => Math.min(attempt * 100, 2000),
};

export const REDIS_PREFIXES = {
  OTP: 'otp:',
  RATE_LIMIT: 'rate_limit:',
  SESSION: 'session:',
  CACHE: 'cache:',
  USER: 'user:',
  VEHICLE: 'vehicle:',
} as const;

export const REDIS_TTL = {
  OTP: 300,
  RATE_LIMIT: 900,
  SESSION: 1800,
  CACHE_SHORT: 300,
  CACHE_MEDIUM: 900,
  CACHE_LONG: 3600,
} as const;
