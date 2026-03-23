import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Car, QrCode, User, Bell } from 'lucide-react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors, spacing, componentHeights, shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MainTabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          height: componentHeights.tabBar + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: spacing.tight,
          ...Platform.select({
            ios: {
              ...shadows.default,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
