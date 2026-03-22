import * as winston from 'winston';
import { env, isDevelopment } from '../config/env';

/**
 * Custom log format for structured JSON logging
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'service'],
  }),
  winston.format.json()
);

/**
 * Development-friendly console format
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Winston logger instance
 * Provides structured logging across the application
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: {
    service: 'vehicle-contact-api',
    environment: env.NODE_ENV,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : jsonFormat,
    }),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logger
 */
export const httpLoggerStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

/**
 * Logger methods with context support
 */
export const log = {
  /**
   * Log error with optional error object and metadata
   */
  error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>): void => {
    const errorMeta: Record<string, unknown> = { ...meta };

    if (error instanceof Error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorMeta.error = error;
    }

    logger.error(message, errorMeta);
  },

  /**
   * Log warning with metadata
   */
  warn: (message: string, meta?: Record<string, unknown>): void => {
    logger.warn(message, meta);
  },

  /**
   * Log info with metadata
   */
  info: (message: string, meta?: Record<string, unknown>): void => {
    logger.info(message, meta);
  },

  /**
   * Log debug with metadata (only in development)
   */
  debug: (message: string, meta?: Record<string, unknown>): void => {
    logger.debug(message, meta);
  },

  /**
   * Log HTTP request
   */
  http: (message: string, meta?: Record<string, unknown>): void => {
    logger.http(message, meta);
  },
};

/**
 * Create a child logger with additional context
 * Useful for module-specific logging
 */
export function createChildLogger(context: Record<string, unknown>): typeof log {
  const childLogger = logger.child(context);

  return {
    error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
      const errorMeta: Record<string, unknown> = { ...meta };
      if (error instanceof Error) {
        errorMeta.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else if (error) {
        errorMeta.error = error;
      }
      childLogger.error(message, errorMeta);
    },
    warn: (message: string, meta?: Record<string, unknown>) => childLogger.warn(message, meta),
    info: (message: string, meta?: Record<string, unknown>) => childLogger.info(message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => childLogger.debug(message, meta),
    http: (message: string, meta?: Record<string, unknown>) => childLogger.http(message, meta),
  };
}

export default logger;
