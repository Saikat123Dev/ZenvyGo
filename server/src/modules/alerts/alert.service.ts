import { cacheService } from '../../shared/cache/cache.service';
import { REDIS_TTL } from '../../shared/cache/redis.client';
import { NotFoundError } from '../../shared/utils/api-error';
import { generateUUID } from '../../shared/utils/crypto';
import { AlertRepository, type AlertRecord } from './alert.repository';

export interface Alert {
  id: string;
  userId: string;
  sessionId: string | null;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  channel: 'system' | 'in_app';
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

class AlertService {
  private readonly repository = new AlertRepository();

  public async createSystemAlert(input: {
    userId: string;
    sessionId?: string | null;
    title: string;
    body: string;
    severity?: 'info' | 'warning' | 'critical';
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    await this.repository.create({
      id: generateUUID(),
      userId: input.userId,
      sessionId: input.sessionId ?? null,
      title: input.title,
      body: input.body,
      severity: input.severity ?? 'info',
      channel: 'system',
      metadata: input.metadata ?? null,
    });

    // Invalidate user's alert cache
    await this.invalidateUserCache(input.userId);
  }

  public async listByUser(userId: string): Promise<Alert[]> {
    // Cache alerts list for this user
    const cacheKey = `alerts:list:${userId}`;
    const cached = await cacheService.get<Alert[]>('CACHE', cacheKey);
    if (cached) {
      return cached;
    }

    const records = await this.repository.listByUser(userId);
    const alerts = records.map((record) => this.toAlert(record));

    // Cache for 2 minutes (alerts should be relatively fresh)
    await cacheService.set('CACHE', cacheKey, alerts, 120);
    return alerts;
  }

  public async markRead(userId: string, alertId: string): Promise<Alert> {
    const existing = await this.repository.findByIdForUser(alertId, userId);
    if (!existing) {
      throw new NotFoundError('Alert not found');
    }

    await this.repository.markRead(alertId, userId);

    // Invalidate cache
    await this.invalidateUserCache(userId);

    const updated = await this.repository.findByIdForUser(alertId, userId);
    if (!updated) {
      throw new Error('Failed to load alert');
    }

    return this.toAlert(updated);
  }

  /**
   * Invalidate all cache entries for a user
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await cacheService.delete('CACHE', `alerts:list:${userId}`);
  }

  private toAlert(record: AlertRecord): Alert {
    return {
      id: record.id,
      userId: record.user_id,
      sessionId: record.session_id,
      title: record.title,
      body: record.body,
      severity: record.severity,
      channel: record.channel,
      isRead: Boolean(record.is_read),
      metadata: record.metadata
        ? (JSON.parse(record.metadata) as Record<string, unknown>)
        : null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const alertService = new AlertService();
