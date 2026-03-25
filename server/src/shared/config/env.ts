import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || undefined;
  }

  return trimmed;
};

const normalizeFtpRemoteDir = (value: unknown): string | undefined => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }

  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const trimmedTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return trimmedTrailingSlash || '/';
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_VERSION: z.string().default('v1'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  CLIENT_ORIGINS: z.string().optional(),

  DB_HOST: z.string().min(1, 'Database host is required'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1, 'Database name is required'),
  DB_USER: z.string().min(1, 'Database user is required'),
  DB_PASSWORD: z.string().default(''),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(20),

  // Upstash Redis
  REDIS_URL: z.string().url('Upstash Redis REST URL is required'),
  REDIS_TOKEN: z.string().min(1, 'Upstash Redis REST token is required'),

  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  PII_VAULT_KEY: z
    .string()
    .length(32, 'PII vault key must be exactly 32 characters for AES-256-GCM'),

  OTP_DRIVER: z.enum(['mock', 'email', 'disabled']).default('mock'),

  // SMTP Email Configuration
  SMTP_HOST: z.preprocess(normalizeOptionalString, z.string().optional()),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.preprocess((value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }
    return value;
  }, z.boolean().default(false)),
  SMTP_USER: z.preprocess(normalizeOptionalString, z.string().optional()),
  SMTP_PASSWORD: z.preprocess(normalizeOptionalString, z.string().optional()),
  SMTP_FROM_EMAIL: z.preprocess(normalizeOptionalString, z.string().email().optional()),
  SMTP_FROM_NAME: z.string().default('ZenvyGo'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // FTP Configuration for file uploads
  FTP_HOST: z.preprocess(normalizeOptionalString, z.string().optional()),
  FTP_PORT: z.coerce.number().int().positive().default(21),
  FTP_USER: z.preprocess(normalizeOptionalString, z.string().optional()),
  FTP_PASSWORD: z.preprocess(normalizeOptionalString, z.string().optional()),
  FTP_SECURE: z.preprocess((value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }
    return value;
  }, z.boolean().default(false)),
  FTP_REMOTE_DIR: z.preprocess(
    (value) => normalizeFtpRemoteDir(value) ?? '/zenvygo',
    z.string()
  ),
  FTP_BASE_PATH: z.preprocess(normalizeFtpRemoteDir, z.string().optional()),
  FTP_PUBLIC_URL: z.preprocess(normalizeOptionalString, z.string().optional()),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      console.error('Environment validation failed:\n' + issues);
      process.exit(1);
    }

    throw error;
  }
}

const parsedEnv = validateEnv();
const ftpRemoteDir = parsedEnv.FTP_REMOTE_DIR ?? parsedEnv.FTP_BASE_PATH ?? '/zenvygo';

export const env = {
  ...parsedEnv,
  FTP_REMOTE_DIR: ftpRemoteDir,
  FTP_BASE_PATH: ftpRemoteDir,
};
export type Env = typeof env;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export function getAllowedOrigins(): string[] {
  if (!env.CLIENT_ORIGINS) {
    return [];
  }

  return env.CLIENT_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
