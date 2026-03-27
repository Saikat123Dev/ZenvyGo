import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  formatChannel,
  formatReasonCode,
  formatRelativeTime,
  formatVehicleName,
  getGreeting,
} from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useVehicles } from '@/hooks/use-vehicles';
import { useTags } from '@/hooks/use-tags';
import { useAlerts } from '@/hooks/use-alerts';
import { useContactSessions, useResolveSession } from '@/hooks/use-sessions';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();

  const quickActionColumns = screenWidth >= 1080 ? 4 : screenWidth >= 760 ? 3 : screenWidth >= 320 ? 2 : 1;
  const quickActionItemWidth =
    quickActionColumns === 4
      ? '23.6%'
      : quickActionColumns === 3
        ? '31.8%'
        : quickActionColumns === 2
          ? '48.4%'
          : '100%';
  const isCompactQuickAction = quickActionColumns >= 3 || screenWidth < 360;

  // TanStack Query hooks
  const { data: vehicles = [], isLoading: vehiclesLoading, isRefetching: vehiclesRefetching, refetch: refetchVehicles } = useVehicles();
  const { data: tags = [] } = useTags();
  const { data: alerts = [], refetch: refetchAlerts } = useAlerts();
  const { data: sessions = [], isLoading: sessionsLoading, isRefetching: sessionsRefetching, refetch: refetchSessions } = useContactSessions();
  const resolveSessionMutation = useResolveSession();

  // Derived state
  const isLoading = vehiclesLoading || sessionsLoading;
  const isRefreshing = vehiclesRefetching || sessionsRefetching;
  const activeVehicles = useMemo(() => vehicles.filter((v) => v.status === 'active'), [vehicles]);
  const activeTags = useMemo(() => tags.filter((t) => t.state === 'activated'), [tags]);
  const unreadAlerts = useMemo(() => alerts.filter((a) => !a.isRead), [alerts]);
  const openSessions = useMemo(() => sessions.filter((s) => s.status === 'initiated'), [sessions]);

  const handleRefreshAll = useCallback(() => {
    refetchVehicles();
    refetchAlerts();
    refetchSessions();
  }, [refetchVehicles, refetchAlerts, refetchSessions]);

  const handleResolveSession = useCallback((sessionId: string) => {
    resolveSessionMutation.mutate(sessionId, {
      onError: () => {
        Alert.alert('Unable to resolve request', 'Please try again.');
      },
    });
  }, [resolveSessionMutation]);

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
          { 
            paddingTop: insets.top + spacing.section,
            paddingBottom: 68 + Math.max(insets.bottom, 16) + (Platform.OS === 'android' ? 56 : 32),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
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
              {t('home.greeting')}
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
                  <Text style={styles.heroBadgeText}>{t('home.active')}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{t('home.welcome')}</Text>
              <Text style={styles.heroDescription}>
                {t('home.welcomeDesc')}
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeVehicles.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('home.vehicles')}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeTags.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('home.activeTags')}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{openSessions.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('home.requests')}</Text>
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
            label={t('home.vehicles')}
            value={String(activeVehicles.length)}
            trend={activeVehicles.length > 0 ? '+' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/vehicles')}
            delay={0}
          />
          <AnimatedStatCard
            icon={<Tag size={22} color={colors.success} />}
            label={t('home.activeTags')}
            value={String(activeTags.length)}
            trend={activeTags.length > 0 ? '+' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/vehicles')}
            delay={100}
          />
          <AnimatedStatCard
            icon={<MessageSquareWarning size={22} color={colors.warning} />}
            label={t('home.requests')}
            value={String(openSessions.length)}
            trend={openSessions.length > 0 ? '!' : ''}
            colors={colors}
            colorScheme={colorScheme}
            onPress={() => router.push('/(main)/alerts')}
            delay={200}
          />
        </Animated.View>


        <SectionHeader
          title={t('home.openRequests')}
          actionLabel={openSessions.length > 0 ? t('common.refresh') : undefined}
          onActionPress={handleRefreshAll}
        />
        {openSessions.length === 0 ? (
          <EmptyState
            icon={<CircleAlert size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title={t('home.noRequests')}
            description={t('home.noRequestsDesc')}
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
                    {vehicle ? formatVehicleName(vehicle) : t('home.vehicleRequest')} •{' '}
                    {formatRelativeTime(session.createdAt)}
                  </Text>
                </View>
                <Badge variant="warning">{formatChannel(session.requestedChannel)}</Badge>
              </View>
              {requesterName ? (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {t('home.requestedBy', { name: requesterName })}
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
                {t('home.markResolved')}
              </Button>
            </Card>
          ))
        )}

        <SectionHeader
          title={t('home.recentAlerts')}
          actionLabel={alerts.length > 0 ? t('home.viewAll') : undefined}
          onActionPress={() => router.push('/(main)/alerts')}
        />
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell size={44} color={colors.textMuted} strokeWidth={1.5} />}
            title={t('home.noAlerts')}
            description={t('home.noAlertsDesc')}
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

        <SectionHeader title={t('home.quickActions')} />
        <View style={[styles.quickActionsPanel, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.quickActionsGrid}>
            {[
              {
                key: 'vehicles',
                label: t('home.manageVehicles'),
                description: t('home.manageVehiclesDesc'),
                badge: String(activeVehicles.length),
                icon: <Car size={22} color={colors.primary} />,
                iconBackground: colors.primaryLighter,
                accentColor: colors.primary,
                badgeBackground: colors.primaryLighter,
                onPress: () => router.push('/(main)/vehicles'),
              },
              {
                key: 'scan',
                label: t('home.scanQr'),
                description: t('home.scanQrDesc'),
                badge: String(activeTags.length),
                icon: <QrCode size={22} color={colors.info} />,
                iconBackground: colors.infoBackground,
                accentColor: colors.info,
                badgeBackground: colors.infoBackground,
                onPress: () => router.push('/(main)/scan'),
              },
              {
                key: 'alerts',
                label: t('home.viewAlerts'),
                description: `${unreadAlerts.length} ${t('home.viewAlertsDesc')}`,
                badge: unreadAlerts.length > 99 ? '99+' : String(unreadAlerts.length),
                icon: <Bell size={22} color={colors.warning} />,
                iconBackground: colors.warningBackground,
                accentColor: colors.warning,
                badgeBackground: colors.warningBackground,
                onPress: () => router.push('/(main)/alerts'),
              },
              {
                key: 'settings',
                label: t('home.settings'),
                description: t('home.settingsDesc'),
                icon: <Settings size={22} color={colors.textSecondary} />,
                iconBackground: colors.surfaceSecondary,
                accentColor: colors.textSecondary,
                badgeBackground: colors.surfaceSecondary,
                onPress: () => router.push('/(main)/settings' as any),
              },
            ].map((action, index) => (
              <Animated.View
                key={action.key}
                entering={FadeInDown.delay(400 + index * 80).springify()}
                style={[
                  styles.quickActionCell,
                  { width: quickActionItemWidth },
                ]}>
                <QuickAction
                  label={action.label}
                  description={action.description}
                  badge={action.badge}
                  ctaLabel={t('home.quickActionCta')}
                  icon={action.icon}
                  iconBackground={action.iconBackground}
                  accentColor={action.accentColor}
                  badgeBackground={action.badgeBackground}
                  colors={colors}
                  onPress={action.onPress}
                  compact={isCompactQuickAction}
                />
              </Animated.View>
            ))}
          </View>
        </View>
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
  badge,
  ctaLabel,
  icon,
  iconBackground,
  accentColor,
  badgeBackground,
  colors,
  onPress,
  compact,
}: {
  label: string;
  description: string;
  badge?: string;
  ctaLabel: string;
  icon: React.ReactNode;
  iconBackground: string;
  accentColor: string;
  badgeBackground: string;
  colors: (typeof Colors)['light'];
  onPress: () => void;
  compact: boolean;
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
          compact && styles.quickActionCompact,
          { backgroundColor: colors.surface, borderColor: colors.border },
          animatedStyle,
        ]}>
        <View style={[styles.quickActionAccent, { backgroundColor: accentColor }]} />
        <View style={styles.quickActionTop}>
          <View
            style={[
              styles.quickActionIcon,
              compact && styles.quickActionIconCompact,
              { backgroundColor: iconBackground },
            ]}>
            {icon}
          </View>
          {badge ? (
            <View style={[styles.quickActionBadge, { backgroundColor: badgeBackground }]}>
              <Text style={[styles.quickActionBadgeText, { color: accentColor }]} numberOfLines={1}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <View
          style={[
            styles.quickActionCopy,
            compact && styles.quickActionCopyCompact,
          ]}>
          <Text style={[styles.quickActionLabel, { color: colors.text }]} numberOfLines={2}>
            {label}
          </Text>
          <Text
            style={[styles.quickActionDescription, { color: colors.textSecondary }]}
            numberOfLines={compact ? 2 : 3}>
            {description}
          </Text>
        </View>
        <View style={styles.quickActionFooter}>
          <Text style={[styles.quickActionCta, { color: accentColor }]}>
            {ctaLabel}
          </Text>
          <ChevronRight style={styles.quickActionChevron} size={16} color={accentColor} />
        </View>
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
    paddingEnd: spacing.section,
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
    flexWrap: 'wrap',
    gap: spacing.component,
    marginBottom: spacing.default,
  },
  statCardTouchable: {
    flex: 1,
    minWidth: 100,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionsPanel: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.component,
    marginBottom: spacing.section,
  },
  quickActionCell: {
    minWidth: 0,
    marginBottom: spacing.component,
  },
  quickActionTouchable: {
    width: '100%',
  },
  quickAction: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.component,
    minHeight: 152,
    ...shadows.sm,
  },
  quickActionAccent: {
    height: 3,
    width: 48,
    borderBottomRightRadius: borderRadius.md,
    marginBottom: spacing.component,
  },
  quickActionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.default,
  },
  quickActionCompact: {
    minHeight: 142,
  },
  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconCompact: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
  },
  quickActionBadge: {
    maxWidth: '60%',
    minWidth: 36,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionCopy: {
    minHeight: 64,
    justifyContent: 'center',
  },
  quickActionCopyCompact: {
    minHeight: 56,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    flexShrink: 1,
  },
  quickActionDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
    flexShrink: 1,
  },
  quickActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.section,
  },
  quickActionCta: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  quickActionChevron: {
    flexShrink: 0,
    marginLeft: spacing.default,
  },
});
