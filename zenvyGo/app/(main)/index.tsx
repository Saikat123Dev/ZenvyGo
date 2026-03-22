import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Car,
  Tag,
  Plus,
  QrCode,
  AlertCircle,
  Bell,
  ChevronRight,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, spacing, borderRadius, shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, StatCard, AlertCard, SectionHeader, Button, StatusBadge } from '@/components/ui';

// Mock data
const MOCK_ALERTS = [
  {
    id: '1',
    type: 'scan',
    title: 'QR Scanned',
    vehicle: 'Honda Civic',
    time: '2 min ago',
    isUnread: true,
    location: 'Dubai Mall Parking',
  },
  {
    id: '2',
    type: 'resolved',
    title: 'Session Resolved',
    vehicle: 'Toyota Camry',
    time: '1 hour ago',
    isUnread: false,
    reason: 'Lights On',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.section },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()}, Ahmed
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/alerts')}
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}>
            <Bell size={22} color={colors.text} strokeWidth={2} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
              <Text style={styles.notificationCount}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(main)/vehicles')}
            activeOpacity={0.7}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLighter }]}>
              <Car size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>2</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vehicles</Text>
            <StatusBadge status="active" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(main)/vehicles')}
            activeOpacity={0.7}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.successBackground }]}>
              <Tag size={24} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tags</Text>
            <StatusBadge status="active" />
          </TouchableOpacity>
        </View>

        {/* Recent Alerts Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Alerts"
            actionLabel="View All"
            onActionPress={() => router.push('/(main)/alerts')}
          />

          {MOCK_ALERTS.map((alert) => (
            <AlertCard
              key={alert.id}
              isUnread={alert.isUnread}
              onPress={() => {}}
              style={styles.alertItem}>
              <View style={styles.alertContent}>
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: alert.isUnread
                        ? colors.primaryLighter
                        : colors.surfaceSecondary,
                    },
                  ]}>
                  {alert.type === 'scan' ? (
                    <Bell size={20} color={alert.isUnread ? colors.primary : colors.textMuted} />
                  ) : (
                    <CheckCircle size={20} color={colors.success} />
                  )}
                </View>
                <View style={styles.alertText}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
                    {alert.vehicle} • {alert.time}
                  </Text>
                  {alert.location && (
                    <Text style={[styles.alertLocation, { color: colors.textMuted }]}>
                      {alert.location}
                    </Text>
                  )}
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
            </AlertCard>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => {}}
              activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLighter }]}>
                <Plus size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Add Vehicle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/(main)/scan')}
              activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.infoBackground }]}>
                <QrCode size={24} color={colors.info} strokeWidth={2} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Scan QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => {}}
              activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.dangerBackground }]}>
                <AlertCircle size={24} color={colors.danger} strokeWidth={2} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                SOS Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: spacing.xlarge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.section,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.component,
    marginBottom: spacing.large,
  },
  statCard: {
    flex: 1,
    padding: spacing.section,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    ...shadows.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: spacing.default,
  },
  section: {
    marginBottom: spacing.section,
  },
  alertItem: {
    marginBottom: spacing.component,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  alertLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  quickAction: {
    flex: 1,
    padding: spacing.section,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.default,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
