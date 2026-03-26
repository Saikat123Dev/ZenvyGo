import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TabBar } from '@/components/ui/tab-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function MainTabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const bottomPad = insets.bottom;
  const isDark = colorScheme === 'dark';

  // Calculate the total height of the floating tab bar (68 is the height of the tab bar itself + margin)
  const TABS_HEIGHT = 68 + Math.max(bottomPad, 16) + 16; 

  return (
    <Tabs
      {...({ sceneContainerStyle: { paddingBottom: TABS_HEIGHT } } as any)}
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: t('navigation.vehicles'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('navigation.scan'),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('navigation.alerts'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
        }}
      />
      {/* Hidden screens - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="privacy-policy" options={{ href: null }} />
      <Tabs.Screen name="terms" options={{ href: null }} />
    </Tabs>
  );
}



