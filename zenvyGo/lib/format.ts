import { CONTACT_CHANNEL_OPTIONS, CONTACT_REASON_OPTIONS } from './domain';
import type { TagSummary, Vehicle } from './api';

export function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return value;
  }

  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'Just now';
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)} min ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} hr ago`;
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)} day${diff >= 2 * day ? 's' : ''} ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

export function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Earlier';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((today - target) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function formatReasonCode(code: string): string {
  return (
    CONTACT_REASON_OPTIONS.find((option) => option.value === code)?.label ??
    startCase(code)
  );
}

export function formatChannel(channel: string): string {
  return (
    CONTACT_CHANNEL_OPTIONS.find((option) => option.value === channel)?.label ??
    startCase(channel)
  );
}

export function formatTagState(state: TagSummary['state']): string {
  switch (state) {
    case 'activated':
      return 'Activated';
    case 'generated':
      return 'Generated';
    case 'suspended':
      return 'Suspended';
    case 'retired':
      return 'Retired';
    default:
      return startCase(state);
  }
}

export function formatVehicleName(vehicle: Pick<Vehicle, 'make' | 'model' | 'year' | 'plateNumber'>): string {
  const parts = [vehicle.make, vehicle.model, vehicle.year ? String(vehicle.year) : null].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(' ') : vehicle.plateNumber;
}

export function formatPlate(vehicle: Pick<Vehicle, 'plateNumber' | 'plateRegion'>): string {
  return vehicle.plateRegion
    ? `${vehicle.plateNumber} • ${vehicle.plateRegion}`
    : vehicle.plateNumber;
}

export function formatLanguage(language: string): string {
  switch (language) {
    case 'ar':
      return 'Arabic';
    case 'en':
    default:
      return 'English';
  }
}

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (!name) {
    return prefix;
  }

  const firstName = name.trim().split(/\s+/)[0];
  return `${prefix}, ${firstName}`;
}

export function maskEmail(email?: string | null): string {
  if (!email) {
    return 'No email';
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return email;
  }

  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.length > 3 ? localPart.slice(-1) : '';
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

export function extractTagToken(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  const cleaned = trimmed.split('?')[0].split('#')[0];
  const segments = cleaned.split('/').filter(Boolean);
  const candidate = segments.length > 0 ? segments[segments.length - 1] : cleaned;
  return candidate.length >= 16 ? candidate : null;
}

function startCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
