export const REDIS_PREFIXES = {
  OTP: 'otp:',
  RATE_LIMIT: 'rate_limit:',
  SESSION: 'session:',
  CACHE: 'cache:',
  USER: 'user:',
  VEHICLE: 'vehicle:',
} as const;

export const REDIS_TTL = {
  /** OTP codes — 5 minutes */
  OTP: 300,
  /** Rate limit windows — 15 minutes */
  RATE_LIMIT: 900,
  /** User sessions — 30 minutes */
  SESSION: 1800,
  /** Response-level cache — 1 minute */
  RESPONSE_CACHE: 60,
  /** Short-lived entity cache — 5 minutes */
  CACHE_SHORT: 300,
  /** Medium entity cache — 15 minutes */
  CACHE_MEDIUM: 900,
  /** Long entity cache — 1 hour */
  CACHE_LONG: 3600,
  /** Resolved tag lookups — 15 minutes */
  TAG_RESOLVE: 900,
} as const;
