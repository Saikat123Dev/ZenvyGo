"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.env = void 0;
exports.getAllowedOrigins = getAllowedOrigins;
var dotenv = require("dotenv");
var path = require("path");
var zod_1 = require("zod");
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
var envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    API_VERSION: zod_1.z.string().default('v1'),
    APP_BASE_URL: zod_1.z.string().url().default('http://localhost:3000'),
    CLIENT_ORIGINS: zod_1.z.string().optional(),
    DB_HOST: zod_1.z.string().min(1, 'Database host is required'),
    DB_PORT: zod_1.z.coerce.number().int().positive().default(3306),
    DB_NAME: zod_1.z.string().min(1, 'Database name is required'),
    DB_USER: zod_1.z.string().min(1, 'Database user is required'),
    DB_PASSWORD: zod_1.z.string().default(''),     
    DB_CONNECTION_LIMIT: zod_1.z.coerce.number().int().positive().default(10),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default('1h'),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default('30d'),
    PII_VAULT_KEY: zod_1.z
        .string()
        .length(32, 'PII vault key must be exactly 32 characters for AES-256-GCM'),
    OTP_DRIVER: zod_1.z.enum(['mock', 'email', 'disabled']).default('mock'),
    // SMTP Email Configuration
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().int().positive().default(587),
    SMTP_SECURE: zod_1.z.coerce.boolean().default(false),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_FROM_EMAIL: zod_1.z.string().email().optional(),
    SMTP_FROM_NAME: zod_1.z.string().default('ZenvyGo'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().int().positive().default(100),
});
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            var issues = error.issues
                .map(function (issue) { return "- ".concat(issue.path.join('.'), ": ").concat(issue.message); })
                .join('\n');
            console.error('Environment validation failed:\n' + issues);
            process.exit(1);
        }
        throw error;
    }
}
exports.env = validateEnv();
exports.isDevelopment = exports.env.NODE_ENV === 'development';
exports.isProduction = exports.env.NODE_ENV === 'production';
exports.isTest = exports.env.NODE_ENV === 'test';
function getAllowedOrigins() {
    if (!exports.env.CLIENT_ORIGINS) {
        return [];
    }
    return exports.env.CLIENT_ORIGINS.split(',')
        .map(function (origin) { return origin.trim(); })
        .filter(Boolean);
}
