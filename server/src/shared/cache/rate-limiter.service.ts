import type { Request, RequestHandler } from 'express';
import { RATE_LIMITS } from '../config/constants';
import { REDIS_PREFIXES } from './redis.client';

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

class RateLimitService {
  private readonly buckets = new Map<string, { timestamps: number[]; expiresAt: number }>();

  public async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const redisKey = `${REDIS_PREFIXES.RATE_LIMIT}${key}`;
    const existing = this.buckets.get(redisKey);

    let timestamps = existing?.timestamps ?? [];
    if (existing && existing.expiresAt <= now) {
      timestamps = [];
    }

    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);
    timestamps.push(now);

    this.buckets.set(redisKey, {
      timestamps,
      expiresAt: now + config.windowMs,
    });

    const totalHits = timestamps.length;

    return {
      allowed: totalHits <= config.max,
      remaining: Math.max(0, config.max - totalHits),
      resetTime: new Date(now + config.windowMs),
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
