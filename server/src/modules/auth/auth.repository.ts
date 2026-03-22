import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export class AuthRepository extends BaseRepository {
  constructor() {
    super('refresh_tokens');
  }

  public async createRefreshToken(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [input.id, input.userId, input.tokenHash, input.expiresAt],
    );
  }

  public async findActiveRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.queryOne<RefreshTokenRecord>(
      `
        SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
        FROM refresh_tokens
        WHERE token_hash = ?
          AND revoked_at IS NULL
          AND expires_at > UTC_TIMESTAMP()
        LIMIT 1
      `,
      [tokenHash],
    );
  }

  public async revokeRefreshToken(id: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE refresh_tokens
        SET revoked_at = UTC_TIMESTAMP()
        WHERE id = ?
      `,
      [id],
    );
  }

  public async pruneUserRefreshTokens(userId: string, keepTokenId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE refresh_tokens
        SET revoked_at = UTC_TIMESTAMP()
        WHERE user_id = ?
          AND id <> ?
          AND revoked_at IS NULL
      `,
      [userId, keepTokenId],
    );
  }
}
