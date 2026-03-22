import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface TagRecord {
  id: string;
  vehicle_id: string;
  token: string;
  type: 'qr' | 'etag';
  state: 'generated' | 'activated' | 'suspended' | 'retired';
  qr_code_url: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagWithOwnerRecord extends TagRecord {
  owner_id: string;
  plate_number: string;
}

export class TagRepository extends BaseRepository {
  constructor() {
    super('tags');
  }

  public async findByOwner(ownerId: string): Promise<TagRecord[]> {
    return this.query<TagRecord>(
      `
        SELECT t.id, t.vehicle_id, t.token, t.type, t.state, t.qr_code_url, t.activated_at,
               t.created_at, t.updated_at
        FROM tags t
        INNER JOIN vehicles v ON v.id = t.vehicle_id
        WHERE v.owner_id = ?
          AND v.deleted_at IS NULL
        ORDER BY t.created_at DESC
      `,
      [ownerId],
    );
  }

  public async findByIdForOwner(tagId: string, ownerId: string): Promise<TagRecord | null> {
    return this.queryOne<TagRecord>(
      `
        SELECT t.id, t.vehicle_id, t.token, t.type, t.state, t.qr_code_url, t.activated_at,
               t.created_at, t.updated_at
        FROM tags t
        INNER JOIN vehicles v ON v.id = t.vehicle_id
        WHERE t.id = ?
          AND v.owner_id = ?
          AND v.deleted_at IS NULL
        LIMIT 1
      `,
      [tagId, ownerId],
    );
  }

  public async findByToken(token: string): Promise<TagWithOwnerRecord | null> {
    return this.queryOne<TagWithOwnerRecord>(
      `
        SELECT t.id, t.vehicle_id, t.token, t.type, t.state, t.qr_code_url, t.activated_at,
               t.created_at, t.updated_at, v.owner_id, v.plate_number
        FROM tags t
        INNER JOIN vehicles v ON v.id = t.vehicle_id
        WHERE t.token = ?
          AND v.deleted_at IS NULL
        LIMIT 1
      `,
      [token],
    );
  }

  public async create(input: {
    id: string;
    vehicleId: string;
    token: string;
    type: 'qr' | 'etag';
    qrCodeUrl: string;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO tags (id, vehicle_id, token, type, state, qr_code_url)
        VALUES (?, ?, ?, ?, 'generated', ?)
      `,
      [input.id, input.vehicleId, input.token, input.type, input.qrCodeUrl],
    );
  }

  public async activate(tagId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE tags
        SET state = 'activated', activated_at = COALESCE(activated_at, UTC_TIMESTAMP()),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [tagId],
    );
  }
}
