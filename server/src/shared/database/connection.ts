import mysql from 'mysql2/promise';
import { databaseConfig } from '../config/database.config';
import { isDevelopment } from '../config/env';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger({ scope: 'database' });

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private pool: mysql.Pool | null = null;
  private connected = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }

    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected && this.pool) {
      return;
    }

    this.pool = mysql.createPool(databaseConfig);
    await this.testConnection();
    this.connected = true;

    if (isDevelopment) {
      logger.info('Database pool initialized', {
        host: databaseConfig.host,
        port: databaseConfig.port,
        database: databaseConfig.database,
      });
    }
  }

  public getPool(): mysql.Pool {
    if (!this.pool || !this.connected) {
      throw new Error('Database is not connected');
    }

    return this.pool;
  }

  public async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const [rows] = await this.getPool().execute(sql, params as any[]);
    return rows as T[];
  }

  public async queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.getPool().getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.end();
    this.pool = null;
    this.connected = false;
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.connected };
  }

  private async testConnection(): Promise<void> {
    const connection = await this.pool?.getConnection();

    if (!connection) {
      throw new Error('Failed to create database connection');
    }

    try {
      await connection.query('SELECT 1');
    } finally {
      connection.release();
    }
  }
}

export const db = DatabaseManager.getInstance();

export type DatabasePool = mysql.Pool;
export type DatabaseConnection = mysql.PoolConnection;
export type { ResultSetHeader, RowDataPacket } from 'mysql2';
