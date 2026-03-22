export const API = {
  PREFIX: '/api',
  VERSION: 'v1',
  get BASE_PATH() {
    return `${this.PREFIX}/${this.VERSION}`;
  },
} as const;

export const AUTH = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 5 * 60,
  MAX_OTP_ATTEMPTS: 3,
  OTP_LOCK_SECONDS: 15 * 60,
  ACCESS_TOKEN_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '30d',
  MAX_ACTIVE_REFRESH_TOKENS: 5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const VEHICLE = {
  MAX_VEHICLES_PER_USER: 10,
  PLATE_NUMBER_MAX_LENGTH: 20,
} as const;

export const TAG = {
  TOKEN_LENGTH: 24,
  QR_CODE_SIZE: 320,
} as const;

export const SESSION = {
  MAX_SESSIONS_PER_HOUR: 10,
  SESSION_EXPIRY_MINUTES: 30,
  MAX_MESSAGE_LENGTH: 500,
  REASON_CODES: [
    'blocking_access',
    'lights_on',
    'window_open',
    'towing_risk',
    'accident_damage',
    'security_concern',
    'urgent_personal_reason',
  ],
  CHANNELS: ['call', 'sms', 'whatsapp', 'in_app'],
} as const;

export const RATE_LIMITS = {
  OTP_REQUEST: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 5,
  },
  OTP_VERIFY: {
    WINDOW_MS: 5 * 60 * 1000,
    MAX: 5,
  },
  TAG_RESOLVE: {
    WINDOW_MS: 60 * 60 * 1000,
    MAX: 60,
  },
  CONTACT_SESSION: {
    WINDOW_MS: 60 * 60 * 1000,
    MAX: 10,
  },
  GLOBAL: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 100,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
