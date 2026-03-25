import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, borderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBackground, text: colors.success };
      case 'warning':
        return { bg: colors.warningBackground, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerBackground, text: colors.danger };
      case 'info':
        return { bg: colors.infoBackground, text: colors.info };
      case 'primary':
        return { bg: colors.primaryLighter, text: colors.primary };
      default:
        return { bg: colors.surfaceSecondary, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 2 : 4,
        },
      ]}>
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: text },
            size === 'sm' && styles.dotSmall,
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: text, fontSize: size === 'sm' ? 11 : 12 },
        ]}>
        {children}
      </Text>
    </View>
  );
}

// Status Badge with dot indicator
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'error';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variantMap: Record<string, BadgeVariant> = {
    active: 'success',
    pending: 'warning',
    inactive: 'default',
    error: 'danger',
  };

  const labelMap: Record<string, string> = {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
    error: 'Error',
  };

  return (
    <Badge variant={variantMap[status]} size="sm" dot>
      {label || labelMap[status]}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginEnd: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginEnd: 4,
  },
  text: {
    fontWeight: '500',
  },
});

export default Badge;
