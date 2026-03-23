import { SESSION } from '../../shared/config/constants';
import { cacheService } from '../../shared/cache/cache.service';
import { REDIS_TTL } from '../../shared/cache/redis.client';
import { eventBus } from '../../shared/events/event-bus';
import { generateUUID } from '../../shared/utils/crypto';
import { NotFoundError, RateLimitError } from '../../shared/utils/api-error';
import { rateLimitService } from '../../shared/cache/rate-limiter.service';
import { ContactSessionCreatedEvent } from './events/contact-session-created.event';
import { ContactRepository, type ContactSessionRecord } from './contact.repository';
import { tagService } from '../tags/tag.service';

export interface ContactSession {
  id: string;
  vehicleId: string;
  ownerId: string;
  tagId: string;
  reasonCode: string;
  requestedChannel: 'call' | 'sms' | 'whatsapp' | 'in_app';
  deliveryStatus: 'logged' | 'queued' | 'failed';
  status: 'initiated' | 'resolved' | 'expired';
  requesterContext: Record<string, unknown> | null;
  message: string | null;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

class ContactService {
  private readonly repository = new ContactRepository();

  public async createPublicSession(input: {
    token: string;
    reasonCode: 'blocking_access' | 'lights_on' | 'window_open' | 'towing_risk' | 'accident_damage' | 'security_concern' | 'urgent_personal_reason';
    requestedChannel: 'call' | 'sms' | 'whatsapp' | 'in_app';
    requesterName?: string | null;
    message?: string | null;
    requesterIp: string;
  }): Promise<ContactSession> {
    const resolvedTag = await tagService.resolveToken(input.token);
    const sessionLimit = await rateLimitService.checkContactSessionLimit(resolvedTag.vehicleId);

    if (!sessionLimit.allowed) {
      throw new RateLimitError('Contact session rate limit exceeded for this vehicle');
    }

    const contactSessionId = generateUUID();
    const expiresAt = new Date(Date.now() + SESSION.SESSION_EXPIRY_MINUTES * 60 * 1000);

    await this.repository.create({
      id: contactSessionId,
      vehicleId: resolvedTag.vehicleId,
      ownerId: resolvedTag.ownerId,
      tagId: resolvedTag.tagId,
      reasonCode: input.reasonCode,
      requestedChannel: input.requestedChannel,
      requesterContext: {
        requesterName: input.requesterName ?? null,
        requesterIp: input.requesterIp,
      },
      message: input.message ?? null,
      expiresAt,
    });

    const session = await this.repository.findById(contactSessionId);
    if (!session) {
      throw new Error('Failed to create contact session');
    }

    await eventBus.emit(
      new ContactSessionCreatedEvent(session.id, {
        ownerId: session.owner_id,
        sessionId: session.id,
        vehicleId: session.vehicle_id,
        reasonCode: session.reason_code,
        requestedChannel: session.requested_channel,
      }),
    );

    // Invalidate cache for the owner
    await this.invalidateOwnerCache(session.owner_id);

    return this.toSession(session);
  }

  public async listByOwner(ownerId: string): Promise<ContactSession[]> {
    // Cache sessions list for this owner
    const cacheKey = `sessions:list:${ownerId}`;
    const cached = await cacheService.get<ContactSession[]>('CACHE', cacheKey);
    if (cached) {
      return cached;
    }

    const sessions = await this.repository.findByOwner(ownerId);
    const result = sessions.map((session) => this.toSession(session));

    // Cache for 2 minutes (sessions should be relatively fresh)
    await cacheService.set('CACHE', cacheKey, result, 120);
    return result;
  }

  public async resolve(ownerId: string, sessionId: string): Promise<ContactSession> {
    const existing = await this.repository.findByIdForOwner(sessionId, ownerId);
    if (!existing) {
      throw new NotFoundError('Contact session not found');
    }

    await this.repository.resolve(sessionId, ownerId);

    // Invalidate cache
    await this.invalidateOwnerCache(ownerId);

    const resolved = await this.repository.findByIdForOwner(sessionId, ownerId);
    if (!resolved) {
      throw new Error('Failed to load resolved contact session');
    }

    return this.toSession(resolved);
  }

  /**
   * Invalidate all cache entries for an owner
   */
  private async invalidateOwnerCache(ownerId: string): Promise<void> {
    await cacheService.delete('CACHE', `sessions:list:${ownerId}`);
  }

  private toSession(record: ContactSessionRecord): ContactSession {
    const expiresAt = new Date(record.expires_at);
    const isExpired = record.status !== 'resolved' && expiresAt.getTime() < Date.now();

    return {
      id: record.id,
      vehicleId: record.vehicle_id,
      ownerId: record.owner_id,
      tagId: record.tag_id,
      reasonCode: record.reason_code,
      requestedChannel: record.requested_channel,
      deliveryStatus: record.delivery_status,
      status: isExpired ? 'expired' : record.status,
      requesterContext: record.requester_context
        ? (JSON.parse(record.requester_context) as Record<string, unknown>)
        : null,
      message: record.message,
      expiresAt: record.expires_at,
      resolvedAt: record.resolved_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const contactService = new ContactService();
