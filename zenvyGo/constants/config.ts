import Constants from 'expo-constants';

const DEFAULT_API_URL =
  'https://zenvygo.onrender.com/api/v1';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  DEFAULT_API_URL;

const configuredAppEnv =
  process.env.EXPO_PUBLIC_APP_ENV ??
  (Constants.expoConfig?.extra?.appEnv as string | undefined) ??
  'development';

const configuredLogLevel =
  process.env.EXPO_PUBLIC_LOG_LEVEL ??
  (configuredAppEnv === 'production' ? 'warn' : 'debug');

export const API_URL = configuredApiUrl.replace(/\/$/, '');
export const APP_ENV = configuredAppEnv;
export const LOG_LEVEL = configuredLogLevel;

export const config = {
  apiUrl: API_URL,
  appEnv: APP_ENV,
  logLevel: LOG_LEVEL,
};
