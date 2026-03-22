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
