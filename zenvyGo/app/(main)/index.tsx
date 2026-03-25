import React, { useCallback, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Bell,
  Car,
  ChevronRight,
  CircleAlert,
  MessageSquareWarning,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api';
import {
  formatChannel,
  formatReasonCode,
  formatRelativeTime,
  formatVehicleName,
  getGreeting,
} from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import {
  useActiveVehicles,
  useActiveTags,
  useHomeScreenData,
  useOpenSessions,
  useUnreadAlerts,
} from '@/store/app-store';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Global store with selectors
  const { vehicles, alerts, sessions, isLoading, isRefreshing, error, fetchAll, updateSession } =
    useHomeScreenData();
  const activeVehicles = useActiveVehicles();
  const activeTags = useActiveTags();
  const unreadAlerts = useUnreadAlerts();
  const openSessions = useOpenSessions();

  // Load data on focus (with caching)
  useFocusEffect(
    useCallback(() => {
      fetchAll('silent');
    }, [fetchAll]),
  );

  const handleResolveSession = useCallback(async (sessionId: string) => {
    const response = await apiService.resolveContactSession(sessionId);
    if (!response.success || !response.data) {
      Alert.alert('Unable to resolve request', response.error || 'Please try again.');
      return;
    }

    updateSession(response.data);
  }, [updateSession]);

  // Memoized session list items
  const sessionListItems = useMemo(() => {
    return openSessions.slice(0, 3).map((session) => {
      const vehicle = vehicles.find((item) => item.id === session.vehicleId);
      const requesterName =
        typeof session.requesterContext?.requesterName === 'string'
          ? session.requesterContext.requesterName
          : null;

      return {
        session,
        vehicle,
        requesterName,
      };
    });
  }, [openSessions, vehicles]);

  // Memoized alert list items
  const alertListItems = useMemo(() => {
    return alerts.slice(0, 4);
  }, [alerts]);

  if (isLoading && vehicles.length === 0) {
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
            refreshing={isRefreshing}
            onRefresh={() => fetchAll('refresh')}
            tintColor={colors.primary}
          />
        }>
        {/* Header with notifications and settings */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting(user?.name)}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your ZenvyGo command center
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/(main)/settings' as any)}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}>
              <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(main)/alerts')}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}>
              <Bell size={20} color={colors.text} strokeWidth={2} />
              {unreadAlerts.length > 0 ? (
                <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.notificationCount}>
                    {Math.min(unreadAlerts.length, 9)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* Gradient Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={colorScheme === 'dark'
              ? ['#1E3A8A', '#0F172A']
              : ['#1E3A8A', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconContainer}>
                  <ShieldCheck size={28} color="#FFFFFF" strokeWidth={1.5} />
                </View>
                <View style={styles.heroBadge}>
                  <Sparkles size={12} color="#FBBF24" />
                  <Text style={styles.heroBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>Welcome to ZenvyGo</Text>
              <Text style={styles.heroDescription}>
                Your vehicles are protected. QR tags handle contact requests while keeping your number private.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeVehicles.length}</Text>
                  <Text style={styles.heroStatLabel}>Vehicles</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeTags.length}</Text>
                  <Text style={styles.heroStatLabel}>Active Tags</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{openSessions.length}</Text>
                  <Text style={styles.heroStatLabel}>Requests</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroPattern}>
              <View style={[styles.patternCircle, styles.patternCircle1]} />
              <View style={[styles.patternCircle, styles.patternCircle2]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          <AnimatedStatCard
            icon={<Car size={22} color={colors.primary} />}
            label="Vehicles"
            value={String(activeVehicles.length)}
            trend={activeVehicles.length > 0 ? '+' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/vehicles')}
            delay={0}
          />
          <AnimatedStatCard
            icon={<Tag size={22} color={colors.success} />}
            label="Active Tags"
            value={String(activeTags.length)}
            trend={activeTags.length > 0 ? '+' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/vehicles')}
            delay={100}
          />
          <AnimatedStatCard
            icon={<MessageSquareWarning size={22} color={colors.warning} />}
            label="Requests"
            value={String(openSessions.length)}
            trend={openSessions.length > 0 ? '!' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/alerts')}
            delay={200}
          />
        </Animated.View>

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
          onActionPress={() => fetchAll('refresh')}
        />
        {openSessions.length === 0 ? (
          <EmptyState
            icon={<CircleAlert size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title="No pending contact requests"
            description="When someone contacts you through a QR tag, the request will appear here."
          />
        ) : (
          sessionListItems.map(({ session, vehicle, requesterName }) => (
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
          ))
        )}

        <SectionHeader
          title="Recent Alerts"
          actionLabel={alerts.length > 0 ? 'View All' : undefined}
          onActionPress={() => router.push('/(main)/alerts')}
        />
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title="No alerts yet"
            description="Alerts will appear when a tag is used or when a contact request is created."
          />
        ) : (
          alertListItems.map((alertItem) => (
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
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionsRow}>
          <QuickAction
            label="Manage Vehicles"
            description="Add, edit, generate QR"
            icon={<Car size={24} color={colors.primary} />}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/vehicles')}
          />
          <QuickAction
            label="Scan QR Code"
            description="Contact a vehicle owner"
            icon={<QrCode size={24} color={colors.info} />}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/scan')}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.actionsRow}>
          <QuickAction
            label="View Alerts"
            description={`${unreadAlerts.length} unread`}
            icon={<Bell size={24} color={colors.warning} />}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/alerts')}
          />
          <QuickAction
            label="Settings"
            description="Preferences & help"
            icon={<Settings size={24} color={colors.textSecondary} />}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/settings' as any)}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const AnimatedStatCard = React.memo(function AnimatedStatCard({
  icon,
  label,
  value,
  trend,
  colors,
  colorScheme,
  onPress,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  colors: (typeof Colors)['light'];
  colorScheme: string | null;
  onPress: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()} style={styles.statCardTouchable}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}>
        <Animated.View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface },
            animatedStyle,
          ]}>
          <View style={[styles.statIcon, { backgroundColor: colors.surfaceSecondary }]}>
            {icon}
          </View>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            {trend && (
              <View style={[styles.trendBadge, { backgroundColor: colors.successBackground }]}>
                <TrendingUp size={10} color={colors.success} />
              </View>
            )}
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const QuickAction = React.memo(function QuickAction({
  label,
  description,
  icon,
  colors,
  colorScheme,
  onPress,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  colors: (typeof Colors)['light'];
  colorScheme: string | null;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={styles.quickActionTouchable}>
      <Animated.View
        style={[
          styles.quickAction,
          { backgroundColor: colors.surface },
          animatedStyle,
        ]}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
          {icon}
        </View>
        <View style={styles.quickActionCopy}>
          <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </Animated.View>
    </TouchableOpacity>
  );
});

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
    marginBottom: spacing.tight,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.default,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
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
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.large,
    position: 'relative',
  },
  heroContent: {
    padding: spacing.card,
    zIndex: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  heroIconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.default,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.large,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.component,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  heroStatLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.tight,
  },
  heroPattern: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  patternCircle1: {
    top: -30,
    right: -30,
    width: 150,
    height: 150,
  },
  patternCircle2: {
    bottom: -40,
    right: 40,
    width: 100,
    height: 100,
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
    borderRadius: borderRadius.xl,
    padding: spacing.section,
    minHeight: 120,
    ...shadows.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  trendBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
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
    marginBottom: spacing.component,
  },
  quickActionTouchable: {
    flex: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.section,
    gap: spacing.component,
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionCopy: {
    flex: 1,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});
