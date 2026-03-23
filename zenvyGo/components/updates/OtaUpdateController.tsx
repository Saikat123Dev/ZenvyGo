import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import * as Updates from 'expo-updates';
import type { UpdateInfo } from 'expo-updates';
import { createLogger } from '@/lib/logger';

const FOREGROUND_CHECK_INTERVAL_MS = 30 * 60 * 1000;
const otaLogger = createLogger('ota');

const getUpdateKey = (update?: UpdateInfo) => {
  if (!update) {
    return null;
  }

  return update.updateId ?? `rollback-${update.createdAt.getTime()}`;
};

async function checkForOtaUpdate() {
  const update = await Updates.checkForUpdateAsync();

  if (!update.isAvailable) {
    otaLogger.debug('No OTA update available on foreground check');
    return;
  }

  otaLogger.info('OTA update available, downloading update bundle');
  await Updates.fetchUpdateAsync();
}

export function OtaUpdateController() {
  const {
    checkError,
    downloadError,
    downloadedUpdate,
    isChecking,
    isDownloading,
    isStartupProcedureRunning,
    isUpdatePending,
  } = Updates.useUpdates();
  const appStateRef = useRef(AppState.currentState);
  const lastCheckAtRef = useRef(Date.now());
  const promptedUpdateKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = nextAppState;

      if (!wasInBackground || nextAppState !== 'active') {
        return;
      }

      if (isStartupProcedureRunning || isChecking || isDownloading) {
        return;
      }

      const now = Date.now();
      if (now - lastCheckAtRef.current < FOREGROUND_CHECK_INTERVAL_MS) {
        return;
      }

      lastCheckAtRef.current = now;
      void checkForOtaUpdate().catch((error) => {
        otaLogger.warn('Foreground OTA check failed', { error });
      });
    });

    return () => {
      subscription.remove();
    };
  }, [isChecking, isDownloading, isStartupProcedureRunning]);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled || !isUpdatePending) {
      return;
    }

    const updateKey = getUpdateKey(downloadedUpdate);
    if (!updateKey || promptedUpdateKeyRef.current === updateKey) {
      return;
    }

    promptedUpdateKeyRef.current = updateKey;
    otaLogger.info('Downloaded OTA update is ready to apply', {
      updateId: downloadedUpdate?.updateId ?? 'rollback',
    });

    Alert.alert(
      'Update Ready',
      'A new ZenvyGo update has been downloaded. Restart now to apply it?',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Restart now',
          onPress: () => {
            void Updates.reloadAsync().catch((error) => {
              otaLogger.error('Failed to reload app after OTA download', { error });
              Alert.alert(
                'Update Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to restart the app with the downloaded update.',
              );
            });
          },
        },
      ],
    );
  }, [downloadedUpdate, isUpdatePending]);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled || !checkError) {
      return;
    }

    otaLogger.warn('OTA check reported an error', { error: checkError });
  }, [checkError]);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled || !downloadError) {
      return;
    }

    otaLogger.warn('OTA download reported an error', { error: downloadError });
  }, [downloadError]);

  return null;
}
