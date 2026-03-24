import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { OtaUpdateController } from '@/components/updates/OtaUpdateController';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ThemeProvider as AppThemeProvider } from '@/providers/ThemeProvider';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom navigation themes based on ZenvyGo design
const ZenvyGoLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.danger,
  },
};

const ZenvyGoDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.danger,
  },
};

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </AppThemeProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Ignore system UI errors so navigation can continue rendering.
    });
  }, [colors.background]);

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
      return;
    }

    if (isAuthenticated && !inMainGroup) {
      router.replace('/(main)');
    }
  }, [isAuthenticated, router, segments, status]);

  if (status === 'loading') {
    return (
      <NavigationThemeProvider value={colorScheme === 'dark' ? ZenvyGoDarkTheme : ZenvyGoLightTheme}>
        <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    );
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? ZenvyGoDarkTheme : ZenvyGoLightTheme}>
      <OtaUpdateController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Modal',
            headerStyle: { backgroundColor: colors.headerBackground },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
