import type { PoolConnection } from 'mysql2/promise';
import { db } from './connection';

export type TransactionCallback<T> = (connection: PoolConnection) => Promise<T>;

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
  return db.transaction(callback);
}

export async function executeInTransaction<T>(
  connection: PoolConnection,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await connection.execute(sql, params as any[]);
  return rows as T[];
}

export async function executeOneInTransaction<T>(
  connection: PoolConnection,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await executeInTransaction<T>(connection, sql, params);
  return rows[0] ?? null;
}
