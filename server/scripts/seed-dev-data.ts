import QRCode from 'qrcode';
import { db } from '../src/shared/database/connection';
import { env } from '../src/shared/config/env';
import { piiVaultService } from '../src/shared/pii/pii-vault.service';
import { createHash, generateToken, generateUUID } from '../src/shared/utils/crypto';

async function main() {
  await db.connect();

  try {
    const phoneNumber = '+971500000001';
    const phoneRef = await piiVaultService.storePhoneNumber(phoneNumber);

    let owner = await db.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE phone_ref = ? LIMIT 1',
      [phoneRef],
    );

    if (!owner) {
      const userId = generateUUID();
      await db.query(
        `
          INSERT INTO users (id, phone_ref, phone_last4, name, language, country, status)
          VALUES (?, ?, '0001', 'Demo Owner', 'en', 'AE', 'active')
        `,
        [userId, phoneRef],
      );
      owner = { id: userId };
    }

    let vehicle = await db.queryOne<{ id: string }>(
      'SELECT id FROM vehicles WHERE owner_id = ? AND plate_number = ? LIMIT 1',
      [owner.id, 'DXB-12345'],
    );

    if (!vehicle) {
      const vehicleId = generateUUID();
      await db.query(
        `
          INSERT INTO vehicles (
            id, owner_id, plate_number, plate_region, make, model, color, year, status
          )
          VALUES (?, ?, 'DXB-12345', 'Dubai', 'Toyota', 'Camry', 'White', 2023, 'active')
        `,
        [vehicleId, owner.id],
      );
      vehicle = { id: vehicleId };
    }

    let tag = await db.queryOne<{ id: string; token: string }>(
      'SELECT id, token FROM tags WHERE vehicle_id = ? LIMIT 1',
      [vehicle.id],
    );

    if (!tag) {
      const tagId = generateUUID();
      const token = generateToken(24);
      const qrCodeUrl = await QRCode.toDataURL(`${env.APP_BASE_URL}/t/${token}`);

      await db.query(
        `
          INSERT INTO tags (id, vehicle_id, token, type, state, qr_code_url, activated_at)
          VALUES (?, ?, ?, 'qr', 'activated', ?, UTC_TIMESTAMP())
        `,
        [tagId, vehicle.id, token, qrCodeUrl],
      );

      tag = { id: tagId, token };
    }

    const emergencyProfile = await db.queryOne<{ id: string }>(
      'SELECT id FROM emergency_profiles WHERE vehicle_id = ? LIMIT 1',
      [vehicle.id],
    );

    if (!emergencyProfile) {
      const contactRef = await piiVaultService.storePhoneNumber('+971500000099');
      await db.query(
        `
          INSERT INTO emergency_profiles (
            id, vehicle_id, contacts_json, medical_notes, roadside_assistance_number
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          generateUUID(),
          vehicle.id,
          JSON.stringify([
            {
              name: 'Emergency Contact',
              relation: 'Family',
              phoneRef: contactRef,
            },
          ]),
          'Sample emergency notes for development only',
          '+971800123456',
        ],
      );
    }

    const contactSessionId = generateUUID();
    await db.query(
      `
        INSERT INTO contact_sessions (
          id, vehicle_id, owner_id, tag_id, reason_code, requested_channel, delivery_status,
          status, requester_context, message, expires_at
        )
        VALUES (?, ?, ?, ?, 'blocking_access', 'in_app', 'logged', 'initiated', ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))
      `,
      [
        contactSessionId,
        vehicle.id,
        owner.id,
        tag.id,
        JSON.stringify({ requesterName: 'Security Desk', seeded: true }),
        'This is a seeded contact session for local testing.',
      ],
    );

    await db.query(
      `
        INSERT INTO alerts (id, user_id, session_id, title, body, severity, channel, metadata)
        VALUES (?, ?, ?, ?, ?, 'warning', 'system', ?)
      `,
      [
        generateUUID(),
        owner.id,
        contactSessionId,
        'Seeded alert',
        'A sample alert has been created for development.',
        JSON.stringify({ seeded: true, tagTokenHash: createHash(tag.token) }),
      ],
    );

    console.log('Seed complete');
    console.log({
      ownerId: owner.id,
      vehicleId: vehicle.id,
      tagId: tag.id,
      tagToken: tag.token,
    });
  } finally {
    await db.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
