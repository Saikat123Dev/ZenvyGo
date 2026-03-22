import { generateUUID } from '../../shared/utils/crypto';
import { normalizePhoneNumber } from '../../shared/utils/phone';
import { piiVaultService } from '../../shared/pii/pii-vault.service';
import { vehicleService } from '../vehicles/vehicle.service';
import {
  EmergencyProfileRepository,
  type EmergencyProfileRecord,
} from './emergency-profile.repository';

interface StoredEmergencyContact {
  name: string;
  phoneRef: string;
  relation?: string | null;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string | null;
}

export interface EmergencyProfile {
  id: string;
  vehicleId: string;
  contacts: EmergencyContact[];
  medicalNotes: string | null;
  roadsideAssistanceNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

class EmergencyProfileService {
  private readonly repository = new EmergencyProfileRepository();

  public async getByVehicle(ownerId: string, vehicleId: string): Promise<EmergencyProfile | null> {
    await vehicleService.getOwnedVehicle(ownerId, vehicleId);

    const record = await this.repository.findByVehicleId(vehicleId);
    if (!record) {
      return null;
    }

    return this.toProfile(record);
  }

  public async upsert(ownerId: string, vehicleId: string, input: {
    contacts: EmergencyContact[];
    medicalNotes?: string | null;
    roadsideAssistanceNumber?: string | null;
  }): Promise<EmergencyProfile> {
    await vehicleService.getOwnedVehicle(ownerId, vehicleId);

    const storedContacts: StoredEmergencyContact[] = [];
    for (const contact of input.contacts) {
      const normalizedPhone = normalizePhoneNumber(contact.phone);
      const phoneRef = await piiVaultService.storePhoneNumber(normalizedPhone);

      storedContacts.push({
        name: contact.name,
        phoneRef,
        relation: contact.relation ?? null,
      });
    }

    const existing = await this.repository.findByVehicleId(vehicleId);
    await this.repository.upsert({
      id: existing?.id ?? generateUUID(),
      vehicleId,
      contactsJson: JSON.stringify(storedContacts),
      medicalNotes: input.medicalNotes ?? null,
      roadsideAssistanceNumber: input.roadsideAssistanceNumber ?? null,
    });

    const updated = await this.repository.findByVehicleId(vehicleId);
    if (!updated) {
      throw new Error('Failed to load emergency profile');
    }

    return this.toProfile(updated);
  }

  private async toProfile(record: EmergencyProfileRecord): Promise<EmergencyProfile> {
    const storedContacts = record.contacts_json
      ? (JSON.parse(record.contacts_json) as StoredEmergencyContact[])
      : [];

    const contacts: EmergencyContact[] = [];
    for (const contact of storedContacts) {
      contacts.push({
        name: contact.name,
        phone: await piiVaultService.readPhoneNumber(contact.phoneRef),
        relation: contact.relation ?? null,
      });
    }

    return {
      id: record.id,
      vehicleId: record.vehicle_id,
      contacts,
      medicalNotes: record.medical_notes,
      roadsideAssistanceNumber: record.roadside_assistance_number,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const emergencyProfileService = new EmergencyProfileService();
