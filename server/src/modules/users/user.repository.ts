import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export type UserRole = 'normal' | 'taxi';

export interface DocumentVisibilitySettings {
  driving_license: boolean;
  rc: boolean;
  puc: boolean;
  insurance: boolean;
  other: boolean;
}

export const DEFAULT_DOC_VISIBILITY: DocumentVisibilitySettings = {
  driving_license: true,
  rc: true,
  puc: true,
  insurance: true,
  other: false,
};

export interface UserRecord {
  id: string;
  phone_ref: string | null;
  phone_last4: string;
  email: string | null;
  password_hash: string | null;
  email_verified: number;
  name: string | null;
  role: UserRole;
  document_visibility_settings: string | null; // JSON string in DB
  language: string;
  country: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  private static readonly SELECT_COLS = `
    id, phone_ref, phone_last4, email, password_hash, email_verified,
    name, role, document_visibility_settings, language, country,
    status, created_at, updated_at
  `;

  public async findById(id: string): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      `
        SELECT ${UserRepository.SELECT_COLS}
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );
  }

  public async findByEmail(email: string): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      `
        SELECT ${UserRepository.SELECT_COLS}
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email.toLowerCase()],
    );
  }

  public async findByPhoneRef(phoneRef: string): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      `
        SELECT ${UserRepository.SELECT_COLS}
        FROM users
        WHERE phone_ref = ?
        LIMIT 1
      `,
      [phoneRef],
    );
  }

  public async create(input: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    language: string;
    country: string;
    emailVerified?: boolean;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO users (id, email, password_hash, email_verified, name, role,
                          document_visibility_settings, language, country,
                          phone_ref, phone_last4, status)
        VALUES (?, ?, ?, ?, ?, 'normal', NULL, ?, ?, NULL, '', 'active')
      `,
      [
        input.id,
        input.email.toLowerCase(),
        input.passwordHash,
        input.emailVerified ? 1 : 0,
        input.name,
        input.language,
        input.country,
      ],
    );
  }

  public async updateEmailVerified(userId: string, verified: boolean): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE users
        SET email_verified = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [verified ? 1 : 0, userId],
    );
  }

  public async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE users
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [passwordHash, userId],
    );
  }

  public async updateProfile(
    userId: string,
    input: { name?: string | null; language?: string },
  ): Promise<void> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }

    if (input.language !== undefined) {
      updates.push('language = ?');
      params.push(input.language);
    }

    if (updates.length === 0) {
      return;
    }

    await this.query<ResultSetHeader>(
      `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [...params, userId],
    );
  }

  public async updateRole(userId: string, role: UserRole): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE users
        SET role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [role, userId],
    );
  }

  public async updateDocumentVisibilitySettings(
    userId: string,
    settings: DocumentVisibilitySettings,
  ): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE users
        SET document_visibility_settings = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [JSON.stringify(settings), userId],
    );
  }
}
