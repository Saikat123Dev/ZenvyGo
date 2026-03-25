import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  BellOff,
  CheckCheck,
  CheckCircle2,
  CircleAlert,
  MessageSquare,
  TriangleAlert,
} from 'lucide-react-native';
import { EmptyState } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type AlertItem } from '@/lib/api';
import { formatDateLabel, formatRelativeTime } from '@/lib/format';
import { useAlertsScreenData, useUnreadAlerts } from '@/store/app-store';

interface AlertSection {
  title: string;
  data: AlertItem[];
}

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Global store
  const { alerts, isLoading, isRefreshing, fetchAlerts, markAlertRead, markAllAlertsRead } = useAlertsScreenData();
  const unreadAlerts = useUnreadAlerts();

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts]),
  );

  // Memoized sections
  const sections = useMemo(() => {
    return alerts.reduce<AlertSection[]>((accumulator, alertItem) => {
      const title = formatDateLabel(alertItem.createdAt);
      const existing = accumulator.find((section) => section.title === title);

      if (existing) {
        existing.data.push(alertItem);
      } else {
        accumulator.push({ title, data: [alertItem] });
      }

      return accumulator;
    }, []);
  }, [alerts]);

  const handleMarkRead = useCallback(async (alertItem: AlertItem) => {
    if (alertItem.isRead) {
      return;
    }

    // Optimistic update
    markAlertRead(alertItem.id);

    try {
      // API call in background
      await apiService.markAlertRead(alertItem.id);
    } catch {
      // Revert optimism on error
      fetchAlerts();
    }
  }, [markAlertRead, fetchAlerts]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadAlerts.length === 0) return;

    // Optimistic update
    markAllAlertsRead();

    // API call in background
    try {
      await apiService.markAllAlertsRead();
    } catch {
      // Revert in real app or silent fail, for now just fetch to refresh
      fetchAlerts();
    }
  }, [unreadAlerts.length, markAllAlertsRead, fetchAlerts]);

  const renderItem = useCallback(({ item, index }: { item: AlertItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 50, 200)).springify()}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleMarkRead(item)}
        style={[
          styles.alertItem,
          {
            backgroundColor: item.isRead ? colors.surface : colors.alertUnreadBackground,
            borderColor: item.isRead ? colors.cardBorder : colors.alertUnreadBorder,
          },
        ]}>
        <View style={styles.alertRow}>
          <View
            style={[
              styles.alertIconContainer,
              {
                backgroundColor: item.isRead
                  ? colors.surfaceSecondary
                  : getAlertIconBackground(item, colors),
              },
            ]}>
            {getAlertIcon(item, colors)}
          </View>
          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.isRead && (
                <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.alertTime, { color: colors.textMuted }]}>
              {formatRelativeTime(item.createdAt)}
            </Text>
            <Text
              style={[styles.alertBody, { color: colors.textSecondary }]}
              numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </View>
        {item.severity !== 'info' && (
          <View style={[
            styles.severityBadge,
            {
              backgroundColor: item.severity === 'critical'
                ? colors.dangerBackground
                : colors.warningBackground
            }
          ]}>
            <Text style={[
              styles.severityText,
              { color: item.severity === 'critical' ? colors.danger : colors.warning }
            ]}>
              {item.severity === 'critical' ? 'Urgent' : 'Important'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  ), [colors, handleMarkRead]);

  const renderSectionHeader = useCallback(({ section }: { section: AlertSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  ), [colors.textSecondary]);

  const keyExtractor = useCallback((item: AlertItem) => item.id, []);

  if (isLoading && alerts.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#F59E0B', '#0F172A']
          : ['#F59E0B', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {unreadAlerts.length} unread notification{unreadAlerts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {unreadAlerts.length > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.markAllButton}>
              <CheckCheck size={16} color="#FFFFFF" />
              <Text style={styles.markAllText}>Mark All</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerPattern}>
          <View style={[styles.patternCircle, styles.patternCircle1]} />
          <View style={[styles.patternCircle, styles.patternCircle2]} />
        </View>
      </LinearGradient>

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<BellOff size={60} color={colors.textMuted} strokeWidth={1.5} />}
            title="No alerts yet"
            description="You'll see activity here when someone scans your QR tag or sends a contact request."
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={fetchAlerts}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={10}
        />
      )}
    </View>
  );
}

function getAlertIcon(alertItem: AlertItem, colors: (typeof Colors)['light']) {
  if (alertItem.severity === 'critical') {
    return <CircleAlert size={20} color={colors.danger} />;
  }
  if (alertItem.severity === 'warning') {
    return <TriangleAlert size={20} color={colors.warning} />;
  }
  if (alertItem.isRead) {
    return <CheckCircle2 size={20} color={colors.success} />;
  }
  return <MessageSquare size={20} color={colors.primary} />;
}

function getAlertIconBackground(alertItem: AlertItem, colors: (typeof Colors)['light']) {
  if (alertItem.severity === 'critical') {
    return colors.dangerBackground;
  }
  if (alertItem.severity === 'warning') {
    return colors.warningBackground;
  }
  return colors.primaryLighter;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingBottom: spacing.large,
    paddingHorizontal: spacing.section,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.default,
    borderRadius: borderRadius.full,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  patternCircle1: {
    top: -30,
    right: -30,
    width: 120,
    height: 120,
  },
  patternCircle2: {
    bottom: -20,
    right: 50,
    width: 80,
    height: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.screen,
  },
  sectionHeader: {
    paddingTop: spacing.large,
    paddingBottom: spacing.component,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  alertItem: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.section,
    marginBottom: spacing.component,
    ...shadows.sm,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTime: {
    fontSize: 12,
    marginTop: 2,
  },
  alertBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.default,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.component,
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
