import type { Request, RequestHandler } from 'express';
import { RATE_LIMITS } from '../config/constants';
import { redis, REDIS_PREFIXES } from './redis.client';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

function toRateLimitConfig(source: { WINDOW_MS: number; MAX: number }): RateLimitConfig {
  return {
    windowMs: source.WINDOW_MS,
    max: source.MAX,
  };
}

/**
 * Redis-backed fixed-window rate limiter.
 *
 * Uses INCR + EXPIRE for atomic counting. Rate limit state
 * persists across restarts and is shared across instances.
 */
class RateLimitService {
  /**
   * Check and increment the rate limit counter for a key.
   * Uses a fixed window: the key expires after `windowMs` milliseconds.
   */
  public async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    const redisKey = `${REDIS_PREFIXES.RATE_LIMIT}${key}`;

    // INCR is atomic — creates the key with value 1 if it doesn't exist
    const totalHits = await redis.increment(redisKey);

    // Set expiry only on first hit (when counter was just created)
    if (totalHits === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    // Calculate reset time from TTL
    const ttl = await redis.getTTL(redisKey);
    const resetMs = ttl > 0 ? ttl * 1000 : config.windowMs;

    return {
      allowed: totalHits <= config.max,
      remaining: Math.max(0, config.max - totalHits),
      resetTime: new Date(Date.now() + resetMs),
      totalHits,
    };
  }

  public async checkOTPRequestLimit(phoneHash: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`otp:request:${phoneHash}`, toRateLimitConfig(RATE_LIMITS.OTP_REQUEST));
  }

  public async checkOTPVerifyLimit(phoneHash: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`otp:verify:${phoneHash}`, toRateLimitConfig(RATE_LIMITS.OTP_VERIFY));
  }

  public async checkTagResolveLimit(ip: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`tag:${ip}`, toRateLimitConfig(RATE_LIMITS.TAG_RESOLVE));
  }

  public async checkContactSessionLimit(vehicleId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(
      `contact:${vehicleId}`,
      toRateLimitConfig(RATE_LIMITS.CONTACT_SESSION),
    );
  }

  public async checkGlobalLimit(ip: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`global:${ip}`, toRateLimitConfig(RATE_LIMITS.GLOBAL));
  }

  public getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() || 'unknown';
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0] || 'unknown';
    }

    return req.socket.remoteAddress || 'unknown';
  }

  public createRequestKey(req: Request, prefix = ''): string {
    const ip = this.getClientIP(req);
    const route = req.route?.path ?? req.path;
    const userId = req.user?.id;

    return userId ? `${prefix}${ip}:${route}:user:${userId}` : `${prefix}${ip}:${route}`;
  }
}

export const rateLimitService = new RateLimitService();

export function createRateLimitMiddleware(
  config: RateLimitConfig,
  keyPrefix = '',
): RequestHandler {
  return async (req, res, next) => {
    try {
      const key = rateLimitService.createRequestKey(req, keyPrefix);
      const result = await rateLimitService.checkRateLimit(key, config);

      res.set('X-RateLimit-Limit', String(config.max));
      res.set('X-RateLimit-Remaining', String(result.remaining));
      res.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime.getTime() / 1000)));

      if (!result.allowed) {
        res.status(429).json({
          success: false,
          message: 'Too many requests',
          errors: {
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
          },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
