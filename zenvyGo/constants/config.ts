import Constants from 'expo-constants';

const DEFAULT_API_URL =
  'https://4637-2401-4900-b75b-deb-d06d-d750-81ef-3d9d.ngrok-free.app/api/v1';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  DEFAULT_API_URL;

export const API_URL = configuredApiUrl.replace(/\/$/, '');

export const config = {
  apiUrl: API_URL,
};
