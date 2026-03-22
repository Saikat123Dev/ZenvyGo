import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface ContactSessionRecord {
  id: string;
  vehicle_id: string;
  owner_id: string;
  tag_id: string;
  reason_code: string;
  requested_channel: 'call' | 'sms' | 'whatsapp' | 'in_app';
  delivery_status: 'logged' | 'queued' | 'failed';
  status: 'initiated' | 'resolved' | 'expired';
  requester_context: string | null;
  message: string | null;
  expires_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export class ContactRepository extends BaseRepository {
  constructor() {
    super('contact_sessions');
  }

  public async create(input: {
    id: string;
    vehicleId: string;
    ownerId: string;
    tagId: string;
    reasonCode: string;
    requestedChannel: 'call' | 'sms' | 'whatsapp' | 'in_app';
    requesterContext: Record<string, unknown> | null;
    message?: string | null;
    expiresAt: Date;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO contact_sessions (
          id, vehicle_id, owner_id, tag_id, reason_code, requested_channel, delivery_status,
          status, requester_context, message, expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'logged', 'initiated', ?, ?, ?)
      `,
      [
        input.id,
        input.vehicleId,
        input.ownerId,
        input.tagId,
        input.reasonCode,
        input.requestedChannel,
        input.requesterContext ? JSON.stringify(input.requesterContext) : null,
        input.message ?? null,
        input.expiresAt,
      ],
    );
  }

  public async findById(id: string): Promise<ContactSessionRecord | null> {
    return this.queryOne<ContactSessionRecord>(
      `
        SELECT id, vehicle_id, owner_id, tag_id, reason_code, requested_channel, delivery_status,
               status, requester_context, message, expires_at, resolved_at, created_at, updated_at
        FROM contact_sessions
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );
  }

  public async findByOwner(ownerId: string): Promise<ContactSessionRecord[]> {
    return this.query<ContactSessionRecord>(
      `
        SELECT id, vehicle_id, owner_id, tag_id, reason_code, requested_channel, delivery_status,
               status, requester_context, message, expires_at, resolved_at, created_at, updated_at
        FROM contact_sessions
        WHERE owner_id = ?
        ORDER BY created_at DESC
      `,
      [ownerId],
    );
  }

  public async findByIdForOwner(id: string, ownerId: string): Promise<ContactSessionRecord | null> {
    return this.queryOne<ContactSessionRecord>(
      `
        SELECT id, vehicle_id, owner_id, tag_id, reason_code, requested_channel, delivery_status,
               status, requester_context, message, expires_at, resolved_at, created_at, updated_at
        FROM contact_sessions
        WHERE id = ?
          AND owner_id = ?
        LIMIT 1
      `,
      [id, ownerId],
    );
  }

  public async resolve(id: string, ownerId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE contact_sessions
        SET status = 'resolved', resolved_at = UTC_TIMESTAMP(), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND owner_id = ?
      `,
      [id, ownerId],
    );
  }
}
