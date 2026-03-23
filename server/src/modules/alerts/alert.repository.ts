import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface AlertRecord {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  channel: 'system' | 'in_app';
  is_read: 0 | 1;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export class AlertRepository extends BaseRepository {
  constructor() {
    super('alerts');
  }

  public async create(input: {
    id: string;
    userId: string;
    sessionId?: string | null;
    title: string;
    body: string;
    severity: 'info' | 'warning' | 'critical';
    channel: 'system' | 'in_app';
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO alerts (id, user_id, session_id, title, body, severity, channel, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.id,
        input.userId,
        input.sessionId ?? null,
        input.title,
        input.body,
        input.severity,
        input.channel,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );
  }

  public async listByUser(userId: string): Promise<AlertRecord[]> {
    return this.query<AlertRecord>(
      `
        SELECT id, user_id, session_id, title, body, severity, channel, is_read, metadata,
               created_at, updated_at
        FROM alerts
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 100
      `,
      [userId],
    );
  }

  public async findByIdForUser(alertId: string, userId: string): Promise<AlertRecord | null> {
    return this.queryOne<AlertRecord>(
      `
        SELECT id, user_id, session_id, title, body, severity, channel, is_read, metadata,
               created_at, updated_at
        FROM alerts
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `,
      [alertId, userId],
    );
  }

  public async markRead(alertId: string, userId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE alerts
        SET is_read = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND user_id = ?
      `,
      [alertId, userId],
    );
  }

  public async markAllRead(userId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE alerts
        SET is_read = 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
          AND is_read = 0
      `,
      [userId],
    );
  }
}
