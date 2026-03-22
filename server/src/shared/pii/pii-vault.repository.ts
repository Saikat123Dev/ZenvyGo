import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../database/base.repository';

export interface PiiVaultEntryRecord {
  id: string;
  pii_type: string;
  pii_hash: string;
  encrypted_payload: string;
  created_at: string;
  updated_at: string;
}

export class PiiVaultRepository extends BaseRepository {
  constructor() {
    super('pii_vault_entries');
  }

  public async findByHash(hash: string): Promise<PiiVaultEntryRecord | null> {
    return this.queryOne<PiiVaultEntryRecord>(
      `
        SELECT id, pii_type, pii_hash, encrypted_payload, created_at, updated_at
        FROM pii_vault_entries
        WHERE pii_hash = ?
        LIMIT 1
      `,
      [hash],
    );
  }

  public async findById(id: string): Promise<PiiVaultEntryRecord | null> {
    return this.queryOne<PiiVaultEntryRecord>(
      `
        SELECT id, pii_type, pii_hash, encrypted_payload, created_at, updated_at
        FROM pii_vault_entries
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );
  }

  public async create(entry: {
    id: string;
    piiType: string;
    piiHash: string;
    encryptedPayload: string;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO pii_vault_entries (id, pii_type, pii_hash, encrypted_payload)
        VALUES (?, ?, ?, ?)
      `,
      [entry.id, entry.piiType, entry.piiHash, entry.encryptedPayload],
    );
  }
}
