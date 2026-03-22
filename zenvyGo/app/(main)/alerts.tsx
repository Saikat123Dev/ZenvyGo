import React, { useCallback, useState } from 'react';
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
import { Bell, BellOff, CheckCircle2, CircleAlert, TriangleAlert } from 'lucide-react-native';
import { AlertCard, EmptyState } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type AlertItem } from '@/lib/api';
import { formatDateLabel, formatRelativeTime } from '@/lib/format';

interface AlertSection {
  title: string;
  data: AlertItem[];
}

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const loadAlerts = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await apiService.listAlerts();
      if (!response.success) {
        throw new Error(response.error || 'Unable to load alerts');
      }

      setAlerts(
        [...(response.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      );
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  const unreadAlerts = alerts.filter((alert) => !alert.isRead);

  const sections = alerts.reduce<AlertSection[]>((accumulator, alertItem) => {
    const title = formatDateLabel(alertItem.createdAt);
    const existing = accumulator.find((section) => section.title === title);

    if (existing) {
      existing.data.push(alertItem);
    } else {
      accumulator.push({ title, data: [alertItem] });
    }

    return accumulator;
  }, []);

  const handleMarkRead = async (alertItem: AlertItem) => {
    if (alertItem.isRead) {
      return;
    }

    const response = await apiService.markAlertRead(alertItem.id);
    if (!response.success) {
      return;
    }

    setAlerts((current) =>
      current.map((item) =>
        item.id === alertItem.id ? { ...item, isRead: true } : item,
      ),
    );
  };

  const handleMarkAllRead = async () => {
    await Promise.allSettled(unreadAlerts.map((alertItem) => apiService.markAlertRead(alertItem.id)));
    setAlerts((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.component,
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Alerts</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Contact requests, tag activity, and system notices.
          </Text>
        </View>
        {unreadAlerts.length > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark All Read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {sections.length === 0 ? (
        <EmptyState
          icon={<BellOff size={60} color={colors.textMuted} strokeWidth={1.5} />}
          title="No alerts yet"
          description="You will see new activity here after a QR contact request or tag event."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <AlertCard
              isUnread={!item.isRead}
              style={styles.alertCard}
              onPress={() => handleMarkRead(item)}>
              <View style={styles.alertRow}>
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: item.isRead
                        ? colors.surfaceSecondary
                        : colors.primaryLighter,
                    },
                  ]}>
                  {getAlertIcon(item, colors)}
                </View>
                <View style={styles.alertCopy}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                  <Text style={[styles.alertBody, { color: colors.textSecondary }]}>
                    {item.body}
                  </Text>
                </View>
                {!item.isRead ? (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
            </AlertCard>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAlerts('refresh')}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

function getAlertIcon(alertItem: AlertItem, colors: (typeof Colors)['light']) {
  if (alertItem.severity === 'critical') {
    return <CircleAlert size={18} color={colors.danger} />;
  }

  if (alertItem.severity === 'warning') {
    return <TriangleAlert size={18} color={colors.warning} />;
  }

  if (alertItem.isRead) {
    return <CheckCircle2 size={18} color={colors.success} />;
  }

  return <Bell size={18} color={colors.primary} />;
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.component,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    paddingTop: 4,
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
  alertCard: {
    marginBottom: spacing.component,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
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
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginLeft: spacing.default,
  },
});
