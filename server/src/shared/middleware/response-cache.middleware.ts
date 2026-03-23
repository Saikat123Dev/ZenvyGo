import { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import { cacheService } from '../cache/cache.service';
import { REDIS_TTL } from '../cache/redis.client';

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  etag: string;
}

/**
 * Response cache middleware for GET requests
 * Caches entire HTTP responses to reduce database load
 */
export function responseCacheMiddleware(ttl: number = REDIS_TTL.CACHE_SHORT) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated endpoints that are user-specific
    // We'll use a more granular approach by including userId in cache key
    const userId = (req as any).user?.id;

    // Generate cache key from URL and query params and user
    const cacheKey = generateCacheKey(req, userId);

    try {
      // Check for cached response
      const cached = await cacheService.get<CachedResponse>('CACHE', cacheKey);

      if (cached) {
        // Check if client sent If-None-Match header (ETag validation)
        const clientEtag = req.headers['if-none-match'];
        if (clientEtag && clientEtag === cached.etag) {
          // Resource hasn't changed, send 304 Not Modified
          res.status(304).end();
          return;
        }

        // Serve cached response
        res.set(cached.headers);
        res.set('X-Cache', 'HIT');
        res.set('ETag', cached.etag);
        res.status(cached.statusCode).send(cached.body);
        return;
      }

      // No cache, intercept response
      const originalSend = res.send.bind(res);
      const originalJson = res.json.bind(res);

      // Intercept send method
      res.send = function (body: any): Response {
        cacheResponse(cacheKey, res, body, ttl);
        return originalSend(body);
      };

      // Intercept json method
      res.json = function (body: any): Response {
        cacheResponse(cacheKey, res, body, ttl);
        return originalJson(body);
      };

      res.set('X-Cache', 'MISS');
      next();
    } catch (error) {
      // On cache error, bypass caching and continue
      next();
    }
  };
}

/**
 * Cache invalidation helper
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await cacheService.delete('CACHE', pattern);
}

/**
 * Generate consistent cache key from request
 */
function generateCacheKey(req: Request, userId?: string): string {
  const url = req.originalUrl || req.url;
  const userPart = userId ? `:user:${userId}` : '';
  return `${req.method}:${url}${userPart}`;
}

/**
 * Cache the response
 */
async function cacheResponse(
  cacheKey: string,
  res: Response,
  body: any,
  ttl: number,
): Promise<void> {
  // Only cache successful responses
  if (res.statusCode < 200 || res.statusCode >= 300) {
    return;
  }

  // Generate ETag from response body
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  const etag = generateEtag(bodyString);

  const cachedResponse: CachedResponse = {
    statusCode: res.statusCode,
    headers: {
      'Content-Type': res.getHeader('Content-Type')?.toString() || 'application/json',
      'ETag': etag,
    },
    body: bodyString,
    etag,
  };

  try {
    await cacheService.set('CACHE', cacheKey, cachedResponse, ttl);
  } catch (error) {
    // Silent fail on cache write errors
  }
}

/**
 * Generate ETag from content
 */
function generateEtag(content: string): string {
  return `"${crypto.createHash('md5').update(content).digest('hex').substring(0, 16)}"`;
}

/**
 * Middleware to set Cache-Control headers
 */
export function cacheControlMiddleware(maxAge: number = 300) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `private, max-age=${maxAge}`);
    } else {
      res.set('Cache-Control', 'no-store');
    }
    next();
  };
}
