import type { PoolOptions } from 'mysql2';
import { env } from './env';

export const databaseConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  charset: 'utf8mb4',
  timezone: 'Z',
  namedPlaceholders: false,
  multipleStatements: false,
};
