import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  Tag,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, spacing, borderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlertCard, EmptyState } from '@/components/ui';

type AlertType = 'scan' | 'resolved' | 'tag';

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  vehicle: string;
  time: string;
  isUnread: boolean;
  location: string | null;
  reason: string | null;
}

interface AlertSection {
  title: string;
  data: AlertItem[];
}

// Mock alerts data grouped by date
const MOCK_ALERTS_DATA: AlertSection[] = [
  {
    title: 'Today',
    data: [
      {
        id: '1',
        type: 'scan',
        title: 'Someone scanned your QR',
        vehicle: 'Honda Civic',
        time: '2 min ago',
        isUnread: true,
        location: 'Dubai Mall Parking',
        reason: null,
      },
      {
        id: '2',
        type: 'resolved',
        title: 'Session Resolved',
        vehicle: 'Toyota Camry',
        time: '1 hour ago',
        isUnread: false,
        location: null,
        reason: 'Lights On',
      },
    ],
  },
  {
    title: 'Yesterday',
    data: [
      {
        id: '3',
        type: 'tag',
        title: 'Tag Activated',
        vehicle: 'Honda Civic',
        time: '1 day ago',
        isUnread: false,
        location: null,
        reason: null,
      },
      {
        id: '4',
        type: 'scan',
        title: 'Someone scanned your QR',
        vehicle: 'Toyota Camry',
        time: '1 day ago',
        isUnread: false,
        location: 'JBR Parking',
        reason: 'Blocking',
      },
    ],
  },
  {
    title: 'Last Week',
    data: [
      {
        id: '5',
        type: 'resolved',
        title: 'Session Resolved',
        vehicle: 'Honda Civic',
        time: '5 days ago',
        isUnread: false,
        location: null,
        reason: 'Emergency',
      },
    ],
  },
];

export default function AlertsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getAlertIcon = (type: AlertType, isUnread: boolean) => {
    const iconProps = {
      size: 20,
      strokeWidth: 2,
    };

    switch (type) {
      case 'scan':
        return (
          <Bell
            {...iconProps}
            color={isUnread ? colors.primary : colors.textMuted}
          />
        );
      case 'resolved':
        return <CheckCircle {...iconProps} color={colors.success} />;
      case 'tag':
        return <Tag {...iconProps} color={colors.textMuted} />;
      default:
        return <Bell {...iconProps} color={colors.textMuted} />;
    }
  };

  const handleMarkAllRead = () => {
    // Implement mark all read
  };

  const totalUnread = MOCK_ALERTS_DATA.reduce(
    (acc, section) => acc + section.data.filter((a) => a.isUnread).length,
    0
  );

  const hasAlerts = MOCK_ALERTS_DATA.some((section) => section.data.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.component,
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Alerts</Text>
        {totalUnread > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!hasAlerts ? (
        <EmptyState
          icon={<BellOff size={64} color={colors.textMuted} strokeWidth={1.5} />}
          title="No Alerts Yet"
          description="You'll receive alerts when someone scans your vehicle's QR code."
        />
      ) : (
        <SectionList
          sections={MOCK_ALERTS_DATA}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={[
                styles.sectionHeader,
                { backgroundColor: colors.background },
              ]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <AlertCard
              isUnread={item.isUnread}
              onPress={() => {}}
              style={styles.alertItem}>
              <View style={styles.alertContent}>
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: item.isUnread
                        ? colors.primaryLighter
                        : colors.surfaceSecondary,
                    },
                  ]}>
                  {getAlertIcon(item.type, item.isUnread)}
                </View>
                <View style={styles.alertText}>
                  <Text
                    style={[
                      styles.alertTitle,
                      { color: colors.text },
                      item.isUnread && styles.alertTitleUnread,
                    ]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
                    {item.vehicle} • {item.time}
                  </Text>
                  {item.location && (
                    <View style={styles.alertMeta}>
                      <MapPin size={12} color={colors.textMuted} />
                      <Text style={[styles.alertMetaText, { color: colors.textMuted }]}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                  {item.reason && (
                    <View style={styles.alertMeta}>
                      <AlertTriangle size={12} color={colors.textMuted} />
                      <Text style={[styles.alertMetaText, { color: colors.textMuted }]}>
                        Reason: {item.reason}
                      </Text>
                    </View>
                  )}
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
            </AlertCard>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={<View style={{ height: spacing.xlarge }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.component,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.section,
    paddingTop: spacing.component,
  },
  sectionHeader: {
    paddingVertical: spacing.component,
    paddingTop: spacing.section,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertItem: {
    marginBottom: spacing.component,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  alertTitleUnread: {
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  alertMetaText: {
    fontSize: 12,
  },
});
