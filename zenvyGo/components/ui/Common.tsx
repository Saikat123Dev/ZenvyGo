import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, spacing, borderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Divider Component
interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export function Divider({ label, style }: DividerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (label) {
    return (
      <View style={[styles.dividerContainer, style]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerLabel, { color: colors.textMuted }]}>{label}</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.emptyContainer}>
      {icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// List Item Component
interface ListItemProps {
  leftIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  topBorder?: boolean;
  bottomBorder?: boolean;
}

export function ListItem({
  leftIcon,
  title,
  subtitle,
  rightContent,
  showChevron = false,
  onPress,
  destructive = false,
  disabled = false,
  topBorder = false,
  bottomBorder = true,
}: ListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const content = (
    <View
      style={[
        styles.listItem,
        topBorder && { borderTopWidth: 1, borderTopColor: colors.border },
        bottomBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}>
      {leftIcon && (
        <View
          style={[
            styles.listItemIcon,
            { backgroundColor: destructive ? colors.dangerBackground : colors.surfaceSecondary },
          ]}>
          {leftIcon}
        </View>
      )}
      <View style={styles.listItemContent}>
        <Text
          style={[
            styles.listItemTitle,
            { color: destructive ? colors.danger : colors.text },
            disabled && { opacity: 0.5 },
          ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent}
      {showChevron && (
        <ChevronRight size={20} color={colors.textMuted} style={{ marginStart: 8 }} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Section Header
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  onActionPress?: () => void;
  actionLabel?: string;
}

export function SectionHeader({
  title,
  action,
  onActionPress,
  actionLabel,
}: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action}
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Divider
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.component,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.section,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    marginHorizontal: spacing.component,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xlarge,
  },
  emptyIcon: {
    marginBottom: spacing.section,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.default,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.section,
  },
  emptyAction: {
    marginTop: spacing.large,
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.section,
    minHeight: 56,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.component,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.component,
    marginTop: spacing.section,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default { Divider, EmptyState, ListItem, SectionHeader };
