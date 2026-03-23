const { expo } = require('./app.json');

module.exports = () => {
  const appEnv =
    process.env.APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || 'development';
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL || expo.extra?.apiUrl;
  const easProjectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    process.env.EAS_PROJECT_ID ||
    expo.extra?.eas?.projectId;

  const extra = {
    ...(expo.extra ?? {}),
    appEnv,
    ...(apiUrl ? { apiUrl } : {}),
    eas: {
      ...(expo.extra?.eas ?? {}),
      ...(easProjectId ? { projectId: easProjectId } : {}),
    },
  };

  const updates = {
    ...(expo.updates ?? {}),
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    ...(easProjectId
      ? {
          url: `https://u.expo.dev/${easProjectId}`,
        }
      : {}),
  };

  return {
    ...expo,
    android: {
      ...expo.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || expo.android?.googleServicesFile,
    },
    runtimeVersion: expo.runtimeVersion ?? {
      policy: 'appVersion',
    },
    updates,
    extra,
  };
};
