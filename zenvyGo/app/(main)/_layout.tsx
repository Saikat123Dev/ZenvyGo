import { HapticTab } from '@/components/haptic-tab';
import { Colors, componentHeights, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Bell, Car, Home, QrCode, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainTabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const tabBarHeight = componentHeights.tabBar + (isAndroid ? 0 : insets.bottom);

  return (
    <Tabs
      safeAreaInsets={isAndroid ? { bottom: 0 } : undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          height: tabBarHeight,
          paddingBottom: isAndroid ? spacing.tight : insets.bottom,
          paddingTop: spacing.tight,
          marginBottom: isAndroid ? insets.bottom : 0,
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              ...shadows.default,
            },
            android: {
              elevation: shadows.default.elevation,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Car size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <QrCode size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Bell size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      {/* Hidden screens - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="terms"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

interface TabIconProps {
  children: React.ReactNode;
  focused: boolean;
}

function TabIcon({ children, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
