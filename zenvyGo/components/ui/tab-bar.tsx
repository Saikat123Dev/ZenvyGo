import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Home, Car, QrCode, Bell, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

// Minimalist animation configurations
const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 1 };
const SCALE_SPRING_CONFIG = { damping: 14, stiffness: 200, mass: 0.8 };

type IconComponent = typeof Home;

const EXCLUDED_TAB_ROUTES = new Set([
  'help',
  'documents',
  'document',
  'terms',
  'privacy-policy',
  'about',
]);

// Map routes to icons
const getIconForRoute = (routeName: string): IconComponent => {
  switch (routeName) {
    case 'index':
      return Home;
    case 'vehicles':
      return Car;
    case 'scan':
      return QrCode;
    case 'alerts':
      return Bell;
    case 'profile':
      return User;
    default:
      return Home;
  }
};

interface TabBarItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colorScheme: 'light' | 'dark';
  icon: IconComponent;
}

const TabBarItem = React.memo(({ routeName, isFocused, onPress, onLongPress, colorScheme, icon: Icon }: TabBarItemProps) => {
  const isDark = colorScheme === 'dark';
  const isScanTab = routeName === 'scan';

  // Animation values
  const focusValue = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusValue.value = withSpring(isFocused ? 1 : 0, SCALE_SPRING_CONFIG);
  }, [isFocused, focusValue]);

  // Premium minimal colors
  const activeColor = isDark ? '#FFFFFF' : '#0F172A';
  const inactiveColor = isDark ? '#71717A' : '#94A3B8';
  
  if (isScanTab) {
    const scanBgColor = isDark ? '#FFFFFF' : '#0F172A';
    const scanIconColor = isDark ? '#000000' : '#FFFFFF';
    
    // Scale on press for the central action button
    const animatedScanStyle = useAnimatedStyle(() => {
      const scale = interpolate(focusValue.value, [0, 1], [1, 0.95], Extrapolate.CLAMP);
      return {
        transform: [{ scale }],
      };
    });

    return (
      <Pressable
        onPressIn={() => { focusValue.value = withSpring(1, SCALE_SPRING_CONFIG); }}
        onPressOut={() => { focusValue.value = withSpring(0, SCALE_SPRING_CONFIG); }}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.scanTabContainer}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <Animated.View style={[styles.scanTabInner, { backgroundColor: scanBgColor }, animatedScanStyle]}>
          <Icon size={24} color={scanIconColor} strokeWidth={2.5} />
        </Animated.View>
      </Pressable>
    );
  }

  // Smooth Y-axis movement and scaling for regular tabs
  const animatedIconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusValue.value, [0, 1], [0, -3], Extrapolate.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  // Small refined indicator dot
  const animatedDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(focusValue.value, [0.5, 1], [0, 1], Extrapolate.CLAMP);
    const scale = interpolate(focusValue.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Icon 
          size={24} 
          color={iconColor}
          strokeWidth={isFocused ? 2.5 : 2} 
        />
      </Animated.View>
      <Animated.View style={[styles.dotIndicator, { backgroundColor: activeColor }, animatedDotStyle]} />
    </Pressable>
  );
});

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Enforce strict tab order and uniqueness
  const TAB_ORDER = ['index', 'vehicles', 'scan', 'alerts', 'profile'];
  const routeMap = Object.fromEntries(state.routes.map(r => [r.name, r]));
  const visibleRoutes = TAB_ORDER
    .map(name => routeMap[name])
    .filter(Boolean);

  const activeIndex = visibleRoutes.findIndex(vRoute => vRoute.key === state.routes[state.index]?.key);

  const isAndroid = Platform.OS === 'android';
  const bottomPad = insets.bottom;
  const paddingBottom = isAndroid ? Math.max(bottomPad, 16) : Math.max(bottomPad, 12);

  return (
    <View style={[styles.container, { bottom: paddingBottom }]}>...
      <View style={[
        styles.tabBarWrapper, 
        { 
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        },
        styles.shadow,
        isDark ? styles.shadowDark : styles.shadowLight
      ]}>
        <View style={styles.tabBar}>
          {visibleRoutes.map((route, index) => {
            if (!route || !descriptors[route.key]) return null;
            const { options } = descriptors[route.key];
            // Re-find active index correctly within visible routes
            const activeVisibleIndex = visibleRoutes.findIndex(vRoute => vRoute.key === state.routes[state.index]?.key);
            const isFocused = activeVisibleIndex === index;

            const onPress = () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const Icon = getIconForRoute(route.name);
            return (
              <TabBarItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                colorScheme={colorScheme}
                icon={Icon}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const TAB_BAR_HEIGHT = 68;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  tabBarWrapper: {
    height: TAB_BAR_HEIGHT,
    width: '100%',
    borderRadius: 34,
    borderWidth: 1,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  shadowLight: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIndicator: {
    position: 'absolute',
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  scanTabContainer: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scanTabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
