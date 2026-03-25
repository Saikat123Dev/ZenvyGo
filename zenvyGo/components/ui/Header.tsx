import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { Colors, componentHeights, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  transparent?: boolean;
  large?: boolean;
}

export function Header({
  title,
  showBack = false,
  showClose = false,
  onBack,
  onClose,
  rightAction,
  leftAction,
  transparent = false,
  large = false,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: transparent ? 'transparent' : colors.headerBackground,
          borderBottomColor: transparent ? 'transparent' : colors.border,
        },
      ]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.headerBackground}
        translucent={transparent}
      />
      <View style={[styles.headerContent, large && styles.headerLarge]}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {showClose && (
            <TouchableOpacity
              onPress={handleClose}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {leftAction}
        </View>

        {title && (
          <Text
            style={[
              styles.title,
              large ? styles.titleLarge : null,
              { color: colors.text },
            ]}
            numberOfLines={1}>
            {title}
          </Text>
        )}

        <View style={styles.rightSection}>{rightAction}</View>
      </View>
    </View>
  );
}

// Screen Wrapper with safe areas
interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  padding?: boolean;
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  scroll = false,
  safeArea = true,
  padding = true,
  backgroundColor,
}: ScreenContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.screenContainer,
    {
      backgroundColor: backgroundColor || colors.background,
      paddingTop: safeArea ? insets.top : 0,
      paddingBottom: safeArea ? insets.bottom : 0,
      paddingHorizontal: padding ? spacing.section : 0,
    },
  ];

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screenContainer, { backgroundColor: backgroundColor || colors.background }]}
        contentContainerStyle={[
          { paddingHorizontal: padding ? spacing.section : 0 },
          { paddingBottom: insets.bottom + spacing.section },
        ]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  headerContent: {
    height: componentHeights.header,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.section,
  },
  headerLarge: {
    height: componentHeights.header + 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 4,
    marginEnd: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 2,
  },
  titleLarge: {
    fontSize: 20,
    fontWeight: '700',
  },
  screenContainer: {
    flex: 1,
  },
});

export default Header;
