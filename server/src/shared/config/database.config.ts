import type { PoolOptions } from 'mysql2';
import { env } from './env';

export const databaseConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionLimit: env.DB_CONNECTION_LIMIT, // Increased from 10 to 20 for better concurrency
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000,
  idleTimeout: 30000, // Close idle connections after 30s before server drops them
  charset: 'utf8mb4',
  timezone: 'Z',
  namedPlaceholders: false,
  multipleStatements: false,
  // Connection pool optimization
  maxIdle: 5, // Maximum idle connections to maintain
  idleCheckInterval: 60000, // Check for idle connections every 60s
};
