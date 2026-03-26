import { NotFoundError } from '../../shared/utils/api-error';
import { cacheService } from '../../shared/cache/cache.service';
import {
  UserRepository,
  DEFAULT_DOC_VISIBILITY,
  type UserRecord,
  type UserRole,
  type DocumentVisibilitySettings,
} from './user.repository';

export type { UserRole, DocumentVisibilitySettings };

export interface User {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  role: UserRole;
  documentVisibilitySettings: DocumentVisibilitySettings;
  language: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

class UserService {
  private readonly repository = new UserRepository();

  public async getById(userId: string): Promise<User> {
    const cached = await cacheService.getCachedUser<User>(userId);
    if (cached) {
      return cached;
    }

    const record = await this.repository.findById(userId);
    if (!record) {
      throw new NotFoundError('User not found');
    }

    const user = this.toUser(record);
    await cacheService.cacheUser(user.id, user as unknown as object);
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await this.repository.findByEmail(email);
    if (!record) {
      return null;
    }
    return this.toUser(record);
  }

  public async findByEmailWithPassword(email: string): Promise<UserRecord | null> {
    return this.repository.findByEmail(email);
  }

  public async createUser(input: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    language: string;
    country: string;
    emailVerified?: boolean;
  }): Promise<User> {
    await this.repository.create(input);
    const created = await this.repository.findByEmail(input.email);
    if (!created) {
      throw new Error('Failed to create user');
    }

    const user = this.toUser(created);
    await cacheService.cacheUser(user.id, user as unknown as object);
    return user;
  }

  public async updateEmailVerified(userId: string, verified: boolean): Promise<void> {
    await this.repository.updateEmailVerified(userId, verified);
    await cacheService.clearUserCache(userId);
  }

  public async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repository.updatePassword(userId, passwordHash);
    await cacheService.clearUserCache(userId);
  }

  public async updateProfile(
    userId: string,
    input: { name?: string | null; language?: string },
  ): Promise<User> {
    await this.repository.updateProfile(userId, input);
    await cacheService.clearUserCache(userId);
    return this.getById(userId);
  }

  public async switchRole(userId: string, role: UserRole): Promise<User> {
    await this.repository.updateRole(userId, role);
    await cacheService.clearUserCache(userId);
    return this.getById(userId);
  }

  public async getDocumentVisibilitySettings(userId: string): Promise<DocumentVisibilitySettings> {
    const user = await this.getById(userId);
    return user.documentVisibilitySettings;
  }

  public async updateDocumentVisibilitySettings(
    userId: string,
    settings: Partial<DocumentVisibilitySettings>,
  ): Promise<DocumentVisibilitySettings> {
    const current = await this.getDocumentVisibilitySettings(userId);
    const merged: DocumentVisibilitySettings = { ...current, ...settings };
    await this.repository.updateDocumentVisibilitySettings(userId, merged);
    await cacheService.clearUserCache(userId);
    return merged;
  }

  private parseDocVisibilitySettings(raw: string | null): DocumentVisibilitySettings {
    if (!raw) {
      return { ...DEFAULT_DOC_VISIBILITY };
    }
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return {
        driving_license: parsed.driving_license ?? DEFAULT_DOC_VISIBILITY.driving_license,
        rc: parsed.rc ?? DEFAULT_DOC_VISIBILITY.rc,
        puc: parsed.puc ?? DEFAULT_DOC_VISIBILITY.puc,
        insurance: parsed.insurance ?? DEFAULT_DOC_VISIBILITY.insurance,
        other: parsed.other ?? DEFAULT_DOC_VISIBILITY.other,
      };
    } catch {
      return { ...DEFAULT_DOC_VISIBILITY };
    }
  }

  private toUser(record: UserRecord): User {
    return {
      id: record.id,
      email: record.email,
      emailVerified: record.email_verified === 1,
      name: record.name,
      role: record.role ?? 'normal',
      documentVisibilitySettings: this.parseDocVisibilitySettings(
        record.document_visibility_settings,
      ),
      language: record.language,
      country: record.country,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const userService = new UserService();
