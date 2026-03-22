import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Bell,
  Car,
  ChevronRight,
  CircleAlert,
  MessageSquareWarning,
  QrCode,
  ShieldCheck,
  Tag,
} from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type AlertItem, type ContactSession, type TagSummary, type Vehicle } from '@/lib/api';
import {
  formatChannel,
  formatReasonCode,
  formatRelativeTime,
  formatVehicleName,
  getGreeting,
} from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';

interface DashboardData {
  vehicles: Vehicle[];
  tags: TagSummary[];
  alerts: AlertItem[];
  sessions: ContactSession[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData>({
    vehicles: [],
    tags: [],
    alerts: [],
    sessions: [],
  });

  const loadDashboard = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [vehiclesResponse, tagsResponse, alertsResponse, sessionsResponse] =
        await Promise.all([
          apiService.listVehicles(),
          apiService.listTags(),
          apiService.listAlerts(),
          apiService.listContactSessions(),
        ]);

      const failure =
        [vehiclesResponse, tagsResponse, alertsResponse, sessionsResponse].find(
          (response) => !response.success,
        ) ?? null;

      if (failure) {
        throw new Error(failure.error || 'Failed to load dashboard');
      }

      setDashboard({
        vehicles: [...(vehiclesResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
        tags: [...(tagsResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
        alerts: [...(alertsResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
        sessions: [...(sessionsResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      });
      setError(null);
    } catch (loadError: any) {
      setError(loadError.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const unreadAlerts = dashboard.alerts.filter((alert) => !alert.isRead);
  const activeVehicles = dashboard.vehicles.filter((vehicle) => vehicle.status === 'active');
  const activeTags = dashboard.tags.filter((tag) => tag.state === 'activated');
  const openSessions = dashboard.sessions.filter((session) => session.status === 'initiated');

  const handleResolveSession = async (sessionId: string) => {
    const response = await apiService.resolveContactSession(sessionId);
    if (!response.success) {
      Alert.alert('Unable to resolve request', response.error || 'Please try again.');
      return;
    }

    loadDashboard('refresh');
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.section },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard('refresh')}
            tintColor={colors.primary}
          />
        }>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting(user?.name)}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Track vehicles, tags, and incoming contact requests in one place.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/alerts')}
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}>
            <Bell size={22} color={colors.text} strokeWidth={2} />
            {unreadAlerts.length > 0 ? (
              <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.notificationCount}>
                  {Math.min(unreadAlerts.length, 9)}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(255, 255, 255, 0.16)' }]}>
              <ShieldCheck size={24} color="#FFFFFF" />
            </View>
            <Badge variant="info">Owner Workspace</Badge>
          </View>
          <Text style={styles.heroTitle}>Your ZenvyGo account is active</Text>
          <Text style={styles.heroDescription}>
            QR tags stay privacy-safe while alerts and requests are logged against your vehicles.
          </Text>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon={<Car size={22} color={colors.primary} />}
            label="Vehicles"
            value={String(activeVehicles.length)}
            colors={colors}
            onPress={() => router.push('/(main)/vehicles')}
          />
          <StatCard
            icon={<Tag size={22} color={colors.success} />}
            label="Active tags"
            value={String(activeTags.length)}
            colors={colors}
            onPress={() => router.push('/(main)/vehicles')}
          />
          <StatCard
            icon={<MessageSquareWarning size={22} color={colors.warning} />}
            label="Open requests"
            value={String(openSessions.length)}
            colors={colors}
            onPress={() => router.push('/(main)/alerts')}
          />
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={[styles.errorTitle, { color: colors.danger }]}>{error}</Text>
            <Text style={[styles.errorCopy, { color: colors.textSecondary }]}>
              Pull to refresh or try again in a moment.
            </Text>
          </Card>
        ) : null}

        <SectionHeader
          title="Open Requests"
          actionLabel={openSessions.length > 0 ? 'Refresh' : undefined}
          onActionPress={() => loadDashboard('refresh')}
        />
        {openSessions.length === 0 ? (
          <EmptyState
            icon={<CircleAlert size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title="No pending contact requests"
            description="When someone contacts you through a QR tag, the request will appear here."
          />
        ) : (
          openSessions.slice(0, 3).map((session) => {
            const vehicle = dashboard.vehicles.find((item) => item.id === session.vehicleId);
            const requesterName =
              typeof session.requesterContext?.requesterName === 'string'
                ? session.requesterContext.requesterName
                : null;

            return (
              <Card key={session.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.listCardCopy}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>
                      {formatReasonCode(session.reasonCode)}
                    </Text>
                    <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                      {vehicle ? formatVehicleName(vehicle) : 'Vehicle request'} •{' '}
                      {formatRelativeTime(session.createdAt)}
                    </Text>
                  </View>
                  <Badge variant="warning">{formatChannel(session.requestedChannel)}</Badge>
                </View>
                {requesterName ? (
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Requested by {requesterName}
                  </Text>
                ) : null}
                {session.message ? (
                  <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                    {session.message}
                  </Text>
                ) : null}
                <Button
                  variant="secondary"
                  fullWidth={false}
                  style={styles.inlineButton}
                  onPress={() => handleResolveSession(session.id)}>
                  Mark Resolved
                </Button>
              </Card>
            );
          })
        )}

        <SectionHeader
          title="Recent Alerts"
          actionLabel={dashboard.alerts.length > 0 ? 'View All' : undefined}
          onActionPress={() => router.push('/(main)/alerts')}
        />
        {dashboard.alerts.length === 0 ? (
          <EmptyState
            icon={<Bell size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title="No alerts yet"
            description="Alerts will appear when a tag is used or when a contact request is created."
          />
        ) : (
          dashboard.alerts.slice(0, 4).map((alertItem) => (
            <TouchableOpacity
              key={alertItem.id}
              activeOpacity={0.8}
              onPress={() => router.push('/(main)/alerts')}>
              <Card
                variant={alertItem.isRead ? 'default' : 'highlight'}
                style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.listCardCopy}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>
                      {alertItem.title}
                    </Text>
                    <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                      {formatRelativeTime(alertItem.createdAt)}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
                <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                  {alertItem.body}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <QuickAction
            label="Vehicles"
            icon={<Car size={22} color={colors.primary} />}
            colors={colors}
            onPress={() => router.push('/(main)/vehicles')}
          />
          <QuickAction
            label="Scan QR"
            icon={<QrCode size={22} color={colors.info} />}
            colors={colors}
            onPress={() => router.push('/(main)/scan')}
          />
          <QuickAction
            label="Alerts"
            icon={<Bell size={22} color={colors.warning} />}
            colors={colors}
            onPress={() => router.push('/(main)/alerts')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  colors,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: (typeof Colors)['light'];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.statCardTouchable} onPress={onPress}>
      <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.statIcon, { backgroundColor: colors.surfaceSecondary }]}>{icon}</View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      </Card>
    </TouchableOpacity>
  );
}

function QuickAction({
  label,
  icon,
  colors,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  colors: (typeof Colors)['light'];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.quickAction, { backgroundColor: colors.surface }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
        {icon}
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
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
  scrollContent: {
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.large,
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.section,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.default,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroCard: {
    marginBottom: spacing.large,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.default,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.component,
    marginBottom: spacing.default,
  },
  statCardTouchable: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    minHeight: 136,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorCard: {
    marginBottom: spacing.default,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorCopy: {
    fontSize: 13,
    lineHeight: 20,
  },
  listCard: {
    marginBottom: spacing.component,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.default,
  },
  listCardCopy: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    marginTop: spacing.component,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.component,
  },
  inlineButton: {
    marginTop: spacing.section,
    paddingHorizontal: spacing.section,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.component,
    marginTop: spacing.default,
  },
  quickAction: {
    flex: 1,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.large,
    paddingHorizontal: spacing.component,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
