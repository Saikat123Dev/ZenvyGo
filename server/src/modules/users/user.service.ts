import { NotFoundError } from '../../shared/utils/api-error';
import { cacheService } from '../../shared/cache/cache.service';
import { UserRepository, type UserRecord } from './user.repository';

export interface User {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
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

  private toUser(record: UserRecord): User {
    return {
      id: record.id,
      email: record.email,
      emailVerified: record.email_verified === 1,
      name: record.name,
      language: record.language,
      country: record.country,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const userService = new UserService();
