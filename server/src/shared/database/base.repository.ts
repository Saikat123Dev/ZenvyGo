import { db } from './connection';

export abstract class BaseRepository {
  protected constructor(protected readonly tableName: string) {}

  protected async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return db.query<T>(sql, params);
  }

  protected async queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    return db.queryOne<T>(sql, params);
  }

  protected async withTransaction<T>(
    callback: Parameters<typeof db.transaction<T>>[0],
  ): Promise<T> {
    return db.transaction(callback);
  }
}
