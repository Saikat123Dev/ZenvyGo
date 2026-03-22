import QRCode from 'qrcode';
import { TAG } from '../../shared/config/constants';
import { env } from '../../shared/config/env';
import { NotFoundError } from '../../shared/utils/api-error';
import { generateToken, generateUUID } from '../../shared/utils/crypto';
import { vehicleService } from '../vehicles/vehicle.service';
import { TagRepository, type TagRecord, type TagWithOwnerRecord } from './tag.repository';

export interface TagSummary {
  id: string;
  vehicleId: string;
  token: string;
  type: 'qr' | 'etag';
  state: 'generated' | 'activated' | 'suspended' | 'retired';
  qrCodeUrl: string;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedTag {
  tagId: string;
  vehicleId: string;
  ownerId: string;
  plateNumber: string;
  state: 'generated' | 'activated' | 'suspended' | 'retired';
  allowedReasonCodes: string[];
  allowedChannels: string[];
}

class TagService {
  private readonly repository = new TagRepository();

  public async listByOwner(ownerId: string): Promise<TagSummary[]> {
    const records = await this.repository.findByOwner(ownerId);
    return records.map((record) => this.toSummary(record));
  }

  public async create(ownerId: string, input: {
    vehicleId: string;
    type: 'qr' | 'etag';
  }): Promise<TagSummary> {
    await vehicleService.getOwnedVehicle(ownerId, input.vehicleId);

    const tagId = generateUUID();
    const token = generateToken(TAG.TOKEN_LENGTH);
    const scanUrl = `${env.APP_BASE_URL}/t/${token}`;
    const qrCodeUrl = await QRCode.toDataURL(scanUrl, { width: TAG.QR_CODE_SIZE });

    await this.repository.create({
      id: tagId,
      vehicleId: input.vehicleId,
      token,
      type: input.type,
      qrCodeUrl,
    });

    const created = await this.repository.findByIdForOwner(tagId, ownerId);
    if (!created) {
      throw new Error('Failed to create tag');
    }

    return this.toSummary(created);
  }

  public async activate(ownerId: string, tagId: string): Promise<TagSummary> {
    const existing = await this.repository.findByIdForOwner(tagId, ownerId);
    if (!existing) {
      throw new NotFoundError('Tag not found');
    }

    await this.repository.activate(tagId);

    const updated = await this.repository.findByIdForOwner(tagId, ownerId);
    if (!updated) {
      throw new Error('Failed to reload tag after activation');
    }

    return this.toSummary(updated);
  }

  public async resolveToken(token: string): Promise<ResolvedTag> {
    const tag = await this.repository.findByToken(token);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return this.toResolvedTag(tag);
  }

  private toSummary(record: TagRecord): TagSummary {
    return {
      id: record.id,
      vehicleId: record.vehicle_id,
      token: record.token,
      type: record.type,
      state: record.state,
      qrCodeUrl: record.qr_code_url,
      activatedAt: record.activated_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  private toResolvedTag(record: TagWithOwnerRecord): ResolvedTag {
    return {
      tagId: record.id,
      vehicleId: record.vehicle_id,
      ownerId: record.owner_id,
      plateNumber: record.plate_number,
      state: record.state,
      allowedReasonCodes: [
        'blocking_access',
        'lights_on',
        'window_open',
        'towing_risk',
        'accident_damage',
        'security_concern',
        'urgent_personal_reason',
      ],
      allowedChannels: ['call', 'sms', 'whatsapp', 'in_app'],
    };
  }
}

export const tagService = new TagService();
