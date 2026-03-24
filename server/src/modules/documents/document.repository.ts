import { BaseRepository } from '../../shared/database/base.repository';
import type { DocumentType } from './document.schemas';

export interface DocumentRecord {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  document_type: DocumentType;
  document_name: string;
  document_number: string | null;
  file_url: string;
  file_type: string;
  original_filename: string;
  file_size_bytes: number;
  issued_at: string | null;
  expires_at: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  is_visible_to_passenger: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDocumentInput {
  id: string;
  userId: string;
  vehicleId?: string | null;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string | null;
  fileUrl: string;
  fileType: string;
  originalFilename: string;
  fileSizeBytes: number;
  issuedAt?: string | null;
  expiresAt?: string | null;
  isVisibleToPassenger?: boolean;
}

export interface UpdateDocumentInput {
  documentName?: string;
  documentNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  isVisibleToPassenger?: boolean;
}

export class DocumentRepository extends BaseRepository {
  constructor() {
    super('driver_documents');
  }

  async findByUserId(userId: string): Promise<DocumentRecord[]> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE user_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    return this.query<DocumentRecord>(sql, [userId]);
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE id = ? AND deleted_at IS NULL
    `;
    return this.queryOne<DocumentRecord>(sql, [id]);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<DocumentRecord | null> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE id = ? AND user_id = ? AND deleted_at IS NULL
    `;
    return this.queryOne<DocumentRecord>(sql, [id, userId]);
  }

  async findVisibleByUserId(userId: string): Promise<DocumentRecord[]> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE user_id = ? AND is_visible_to_passenger = 1 AND deleted_at IS NULL
      ORDER BY document_type, created_at DESC
    `;
    return this.query<DocumentRecord>(sql, [userId]);
  }

  async create(input: CreateDocumentInput): Promise<void> {
    const sql = `
      INSERT INTO ${this.tableName} (
        id, user_id, vehicle_id, document_type, document_name, document_number,
        file_url, file_type, original_filename, file_size_bytes,
        issued_at, expires_at, is_visible_to_passenger
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      input.id,
      input.userId,
      input.vehicleId ?? null,
      input.documentType,
      input.documentName,
      input.documentNumber ?? null,
      input.fileUrl,
      input.fileType,
      input.originalFilename,
      input.fileSizeBytes,
      input.issuedAt ?? null,
      input.expiresAt ?? null,
      input.isVisibleToPassenger ? 1 : 0,
    ]);
  }

  async update(id: string, input: UpdateDocumentInput): Promise<void> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.documentName !== undefined) {
      updates.push('document_name = ?');
      values.push(input.documentName);
    }

    if (input.documentNumber !== undefined) {
      updates.push('document_number = ?');
      values.push(input.documentNumber);
    }

    if (input.issuedAt !== undefined) {
      updates.push('issued_at = ?');
      values.push(input.issuedAt);
    }

    if (input.expiresAt !== undefined) {
      updates.push('expires_at = ?');
      values.push(input.expiresAt);
    }

    if (input.isVisibleToPassenger !== undefined) {
      updates.push('is_visible_to_passenger = ?');
      values.push(input.isVisibleToPassenger ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(id);
    const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
    await this.query(sql, values);
  }

  async softDelete(id: string): Promise<void> {
    const sql = `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`;
    await this.query(sql, [id]);
  }

  async updateVisibility(id: string, isVisible: boolean): Promise<void> {
    const sql = `UPDATE ${this.tableName} SET is_visible_to_passenger = ? WHERE id = ?`;
    await this.query(sql, [isVisible ? 1 : 0, id]);
  }

  async findByVehicleId(vehicleId: string): Promise<DocumentRecord[]> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE vehicle_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    return this.query<DocumentRecord>(sql, [vehicleId]);
  }

  async findVisibleByVehicleId(vehicleId: string): Promise<DocumentRecord[]> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE vehicle_id = ? AND is_visible_to_passenger = 1 AND deleted_at IS NULL
      ORDER BY document_type, created_at DESC
    `;
    return this.query<DocumentRecord>(sql, [vehicleId]);
  }
}
