import { NotFoundError } from '../utils/api-error';
import { createHash, encrypt, decrypt, generateUUID } from '../utils/crypto';
import { PiiVaultRepository } from './pii-vault.repository';

interface EncryptedPayload {
  encrypted: string;
  iv: string;
  authTag: string;
}

export class PiiVaultService {
  private readonly repository = new PiiVaultRepository();

  public async storePhoneNumber(phoneNumber: string): Promise<string> {
    const phoneHash = createHash(phoneNumber);
    const existing = await this.repository.findByHash(phoneHash);

    if (existing) {
      return existing.id;
    }

    const encryptedPayload = encrypt(phoneNumber);
    await this.repository.create({
      id: generateUUID(),
      piiType: 'phone_number',
      piiHash: phoneHash,
      encryptedPayload: JSON.stringify(encryptedPayload),
    });

    const created = await this.repository.findByHash(phoneHash);
    if (!created) {
      throw new Error('Failed to create PII vault entry');
    }

    return created.id;
  }

  public async readPhoneNumber(referenceId: string): Promise<string> {
    const entry = await this.repository.findById(referenceId);
    if (!entry) {
      throw new NotFoundError('PII vault entry not found');
    }

    return decrypt(JSON.parse(entry.encrypted_payload) as EncryptedPayload);
  }
}

export const piiVaultService = new PiiVaultService();
