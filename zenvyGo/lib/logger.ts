import { config } from '@/constants/config';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

type LogEntry = {
  ts: string;
  level: LogLevel;
  scope?: string;
  message: string;
  data?: LogMeta;
};

const levelOrder: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
};

const normalizeLevel = (value?: string): LogLevel | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'trace' ||
    normalized === 'debug' ||
    normalized === 'info' ||
    normalized === 'warn' ||
    normalized === 'error'
  ) {
    return normalized as LogLevel;
  }

  return null;
};

const defaultLevelForEnv = (appEnv: string): LogLevel => {
  switch (appEnv) {
    case 'production':
      return 'warn';
    case 'preview':
      return 'info';
    default:
      return 'debug';
  }
};

const resolvedLevel: LogLevel =
  normalizeLevel(config.logLevel) ?? defaultLevelForEnv(config.appEnv);

const shouldLog = (level: LogLevel) => levelOrder[level] >= levelOrder[resolvedLevel];

const serializeError = (error: unknown): LogMeta | undefined => {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { error };
};

const formatData = (meta?: LogMeta) => {
  if (!meta) {
    return undefined;
  }

  const formatted: LogMeta = {};
  Object.entries(meta).forEach(([key, value]) => {
    if (value instanceof Error) {
      formatted[key] = serializeError(value);
    } else {
      formatted[key] = value;
    }
  });
  return formatted;
};

const emit = (level: LogLevel, scope: string | undefined, message: string, meta?: LogMeta) => {
  if (!shouldLog(level)) {
    return;
  }

  const data = formatData(meta);
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(data ? { data } : {}),
  };

  const prefix = scope ? `[${level.toUpperCase()}][${scope}]` : `[${level.toUpperCase()}]`;
  const consoleFn = level === 'error'
    ? console.error
    : level === 'warn'
      ? console.warn
      : level === 'debug' || level === 'trace'
        ? console.debug
        : console.info;

  if (__DEV__) {
    if (data) {
      consoleFn(`${prefix} ${message}`, data);
    } else {
      consoleFn(`${prefix} ${message}`);
    }
  } else {
    consoleFn(JSON.stringify(entry));
  }
};

export const createLogger = (scope?: string) => ({
  trace: (message: string, meta?: LogMeta) => emit('trace', scope, message, meta),
  debug: (message: string, meta?: LogMeta) => emit('debug', scope, message, meta),
  info: (message: string, meta?: LogMeta) => emit('info', scope, message, meta),
  warn: (message: string, meta?: LogMeta) => emit('warn', scope, message, meta),
  error: (message: string, meta?: LogMeta) => emit('error', scope, message, meta),
});

export const log = createLogger();
