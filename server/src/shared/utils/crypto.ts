import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Encryption algorithm (AES-256-GCM)
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Initialization vector length
const KEY = Buffer.from(env.PII_VAULT_KEY, 'utf-8'); // 32 bytes for AES-256

/**
 * Encrypted data interface
 */
interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Used for PII (Personally Identifiable Information) like phone numbers
 *
 * @param text - Plain text to encrypt
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(text: string): EncryptedData {
  // Generate random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt data encrypted with AES-256-GCM
 *
 * @param encryptedData - Encrypted data with IV and auth tag
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: EncryptedData): string {
  // Convert hex strings back to buffers
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the text
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a secure random token
 *
 * @param length - Length of the token in bytes (default: 32)
 * @returns URL-safe random string
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate a numeric OTP (One-Time Password)
 *
 * @param length - Number of digits (default: 6)
 * @returns Numeric OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Hash a password using crypto.scrypt
 * Alternative to bcrypt using Node.js built-in crypto
 *
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(16).toString('hex');

    // Hash password with salt
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // Return salt and hash combined
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a password against a hash
 *
 * @param password - Plain text password
 * @param hash - Hashed password with salt
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Split salt and hash
    const [salt, key] = hash.split(':');

    if (!salt || !key) {
      resolve(false);
      return;
    }

    // Hash the provided password with the same salt
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // Compare hashes
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

/**
 * Create a cryptographic hash of data (SHA-256)
 *
 * @param data - Data to hash
 * @returns SHA-256 hash in hex format
 */
export function createHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
