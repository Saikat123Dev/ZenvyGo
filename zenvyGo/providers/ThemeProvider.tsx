import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  themePreference: ThemePreference;
  colorScheme: 'light' | 'dark';
  setThemePreference: (value: ThemePreference) => void;
  isReady: boolean;
};

const THEME_PREFERENCE_KEY = 'themePreference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (!isMounted) {
          return;
        }

        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreferenceState(stored);
        }
      } catch {
        // Ignore storage errors and fall back to system preference.
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback((value: ThemePreference) => {
    setThemePreferenceState(value);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, value).catch(() => {
      // Ignore storage errors to keep UI responsive.
    });
  }, []);

  const colorScheme = useMemo<'light' | 'dark'>(() => {
    if (themePreference === 'system') {
      return systemScheme ?? 'light';
    }

    return themePreference;
  }, [systemScheme, themePreference]);

  const value = useMemo(
    () => ({ themePreference, colorScheme, setThemePreference, isReady }),
    [colorScheme, isReady, setThemePreference, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference must be used within ThemeProvider');
  }
  return context;
}
