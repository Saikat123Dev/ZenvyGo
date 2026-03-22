import type { ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../shared/database/base.repository';

export interface EmergencyProfileRecord {
  id: string;
  vehicle_id: string;
  contacts_json: string | null;
  medical_notes: string | null;
  roadside_assistance_number: string | null;
  created_at: string;
  updated_at: string;
}

export class EmergencyProfileRepository extends BaseRepository {
  constructor() {
    super('emergency_profiles');
  }

  public async findByVehicleId(vehicleId: string): Promise<EmergencyProfileRecord | null> {
    return this.queryOne<EmergencyProfileRecord>(
      `
        SELECT id, vehicle_id, contacts_json, medical_notes, roadside_assistance_number,
               created_at, updated_at
        FROM emergency_profiles
        WHERE vehicle_id = ?
        LIMIT 1
      `,
      [vehicleId],
    );
  }

  public async upsert(input: {
    id: string;
    vehicleId: string;
    contactsJson: string;
    medicalNotes?: string | null;
    roadsideAssistanceNumber?: string | null;
  }): Promise<void> {
    await this.query<ResultSetHeader>(
      `
        INSERT INTO emergency_profiles (
          id, vehicle_id, contacts_json, medical_notes, roadside_assistance_number
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          contacts_json = VALUES(contacts_json),
          medical_notes = VALUES(medical_notes),
          roadside_assistance_number = VALUES(roadside_assistance_number),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        input.id,
        input.vehicleId,
        input.contactsJson,
        input.medicalNotes ?? null,
        input.roadsideAssistanceNumber ?? null,
      ],
    );
  }
}
