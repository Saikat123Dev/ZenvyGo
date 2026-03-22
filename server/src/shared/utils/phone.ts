import { BadRequestError } from './api-error';

export function normalizePhoneNumber(value: string): string {
  const normalized = value.replace(/\s+/g, '');

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new BadRequestError('Phone number must be in E.164 format');
  }

  return normalized;
}

export function getPhoneLast4(phoneNumber: string): string {
  return phoneNumber.slice(-4);
}

export function maskPhoneNumber(phoneNumber: string): string {
  const visible = phoneNumber.slice(-4);
  return `${'*'.repeat(Math.max(0, phoneNumber.length - 4))}${visible}`;
}
