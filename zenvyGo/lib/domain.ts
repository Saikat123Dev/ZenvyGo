export const CONTACT_REASON_OPTIONS = [
  {
    value: 'blocking_access',
    label: 'Blocking access',
    description: 'Vehicle is preventing entry or exit.',
  },
  {
    value: 'lights_on',
    label: 'Lights on',
    description: 'Headlights or cabin lights appear to be on.',
  },
  {
    value: 'window_open',
    label: 'Window open',
    description: 'A door or window seems open.',
  },
  {
    value: 'towing_risk',
    label: 'Towing risk',
    description: 'The vehicle may be ticketed or towed.',
  },
  {
    value: 'accident_damage',
    label: 'Accident or damage',
    description: 'Damage or an incident was noticed.',
  },
  {
    value: 'security_concern',
    label: 'Security concern',
    description: 'There is a theft or safety concern.',
  },
  {
    value: 'urgent_personal_reason',
    label: 'Urgent personal',
    description: 'An urgent issue needs the owner’s attention.',
  },
] as const;

export const CONTACT_CHANNEL_OPTIONS = [
  {
    value: 'call',
    label: 'Call',
    description: 'Best for urgent attention.',
  },
  {
    value: 'sms',
    label: 'SMS',
    description: 'Short text alert to the owner.',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    description: 'Useful when messaging is preferred.',
  },
  {
    value: 'in_app',
    label: 'In app',
    description: 'Creates an in-app request and alert.',
  },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
] as const;

export type ContactReason = (typeof CONTACT_REASON_OPTIONS)[number]['value'];
export type ContactChannel = (typeof CONTACT_CHANNEL_OPTIONS)[number]['value'];
export type AppLanguage = (typeof LANGUAGE_OPTIONS)[number]['value'];
