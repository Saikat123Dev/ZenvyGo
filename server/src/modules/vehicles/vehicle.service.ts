import { VEHICLE } from '../../shared/config/constants';
import { cacheService } from '../../shared/cache/cache.service';
import { REDIS_TTL } from '../../shared/cache/redis.client';
import {
  BadRequestError,
  NotFoundError,
} from '../../shared/utils/api-error';
import { generateUUID } from '../../shared/utils/crypto';
import { VehicleRepository, type VehicleRecord } from './vehicle.repository';

export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  plateRegion: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

class VehicleService {
  private readonly repository = new VehicleRepository();

  public async listByOwner(ownerId: string): Promise<Vehicle[]> {
    // Cache the entire list for this owner
    const cacheKey = `list:${ownerId}`;
    const cached = await cacheService.get<Vehicle[]>('VEHICLE', cacheKey);
    if (cached) {
      return cached;
    }

    const records = await this.repository.findByOwner(ownerId);
    const vehicles = records.map((record) => this.toVehicle(record));

    // Cache for 5 minutes (balances freshness with performance)
    await cacheService.set('VEHICLE', cacheKey, vehicles, REDIS_TTL.CACHE_SHORT);
    return vehicles;
  }

  public async getOwnedVehicle(ownerId: string, vehicleId: string): Promise<Vehicle> {
    const cacheKey = `${ownerId}:${vehicleId}`;
    const cached = await cacheService.getCachedVehicle<Vehicle>(cacheKey);
    if (cached) {
      return cached;
    }

    const record = await this.repository.findByIdAndOwner(vehicleId, ownerId);
    if (!record) {
      throw new NotFoundError('Vehicle not found');
    }

    const vehicle = this.toVehicle(record);
    await cacheService.cacheVehicle(cacheKey, vehicle as unknown as object);
    return vehicle;
  }

  public async create(ownerId: string, input: {
    plateNumber: string;
    plateRegion?: string | null;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    year?: number | null;
  }): Promise<Vehicle> {
    const count = await this.repository.countActiveByOwner(ownerId);
    if (count >= VEHICLE.MAX_VEHICLES_PER_USER) {
      throw new BadRequestError('Vehicle limit reached for this account');
    }

    const vehicleId = generateUUID();
    await this.repository.create({
      id: vehicleId,
      ownerId,
      ...input,
    });

    // Invalidate list cache
    await this.invalidateOwnerCache(ownerId);

    return this.getOwnedVehicle(ownerId, vehicleId);
  }

  public async update(
    ownerId: string,
    vehicleId: string,
    input: {
      plateNumber?: string;
      plateRegion?: string | null;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      year?: number | null;
      status?: 'active' | 'archived';
    },
  ): Promise<Vehicle> {
    await this.getOwnedVehicle(ownerId, vehicleId);
    await this.repository.update(vehicleId, ownerId, input);

    // Clear both individual and list cache
    await cacheService.clearVehicleCache(`${ownerId}:${vehicleId}`);
    await this.invalidateOwnerCache(ownerId);

    return this.getOwnedVehicle(ownerId, vehicleId);
  }

  public async archive(ownerId: string, vehicleId: string): Promise<void> {
    await this.getOwnedVehicle(ownerId, vehicleId);
    await this.repository.softDelete(vehicleId, ownerId);

    // Clear both individual and list cache
    await cacheService.clearVehicleCache(`${ownerId}:${vehicleId}`);
    await this.invalidateOwnerCache(ownerId);
  }

  /**
   * Invalidate all cache entries for an owner
   */
  private async invalidateOwnerCache(ownerId: string): Promise<void> {
    await cacheService.delete('VEHICLE', `list:${ownerId}`);
  }

  private toVehicle(record: VehicleRecord): Vehicle {
    return {
      id: record.id,
      ownerId: record.owner_id,
      plateNumber: record.plate_number,
      plateRegion: record.plate_region,
      make: record.make,
      model: record.model,
      color: record.color,
      year: record.year,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const vehicleService = new VehicleService();
