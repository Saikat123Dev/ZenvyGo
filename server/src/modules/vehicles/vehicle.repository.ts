import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface VehicleRecord {
  id: string;
  owner_id: string;
  plate_number: string;
  plate_region: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class VehicleRepository extends BaseRepository {
  constructor() {
    super('vehicles');
  }

  public async countActiveByOwner(ownerId: string): Promise<number> {
    const result = await this.queryOne<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM vehicles
        WHERE owner_id = ?
          AND deleted_at IS NULL
      `,
      [ownerId],
    );

    return Number(result?.count ?? 0);
  }

  public async findByOwner(ownerId: string): Promise<VehicleRecord[]> {
    return this.query<VehicleRecord>(
      `
        SELECT id, owner_id, plate_number, plate_region, make, model, color, year, status,
               created_at, updated_at, deleted_at
        FROM vehicles
        WHERE owner_id = ?
          AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      [ownerId],
    );
  }

  public async findByIdAndOwner(vehicleId: string, ownerId: string): Promise<VehicleRecord | null> {
    return this.queryOne<VehicleRecord>(
      `
        SELECT id, owner_id, plate_number, plate_region, make, model, color, year, status,
               created_at, updated_at, deleted_at
        FROM vehicles
        WHERE id = ?
          AND owner_id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [vehicleId, ownerId],
    );
  }

  public async create(input: {
    id: string;
    ownerId: string;
    plateNumber: string;
    plateRegion?: string | null;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    year?: number | null;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO vehicles (
          id, owner_id, plate_number, plate_region, make, model, color, year, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        input.id,
        input.ownerId,
        input.plateNumber,
        input.plateRegion ?? null,
        input.make ?? null,
        input.model ?? null,
        input.color ?? null,
        input.year ?? null,
      ],
    );
  }

  public async update(
    vehicleId: string,
    ownerId: string,
    input: {
      plateNumber?: string;
      plateRegion?: string | null;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      year?: number | null;
      status?: 'active' | 'archived';
    },
  ): Promise<void> {
    const updates: string[] = [];
    const params: unknown[] = [];

    const fieldMap: Record<string, string> = {
      plateNumber: 'plate_number',
      plateRegion: 'plate_region',
      make: 'make',
      model: 'model',
      color: 'color',
      year: 'year',
      status: 'status',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in input && input[key as keyof typeof input] !== undefined) {
        updates.push(`${column} = ?`);
        params.push(input[key as keyof typeof input] ?? null);
      }
    }

    if (updates.length === 0) {
      return;
    }

    await this.query<ResultSetHeader>(
      `
        UPDATE vehicles
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND owner_id = ?
          AND deleted_at IS NULL
      `,
      [...params, vehicleId, ownerId],
    );
  }

  public async softDelete(vehicleId: string, ownerId: string): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        UPDATE vehicles
        SET status = 'archived', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND owner_id = ?
          AND deleted_at IS NULL
      `,
      [vehicleId, ownerId],
    );
  }
}
