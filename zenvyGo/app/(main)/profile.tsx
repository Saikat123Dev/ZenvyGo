import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  BadgeCheck,
  Globe,
  LogOut,
  Mail,
  Monitor,
  Moon,
  PencilLine,
  Shield,
  Sun,
  User,
  X,
} from 'lucide-react-native';
import { Badge, Button, Card, Input, ListItem } from '@/components/ui';
import { Colors, ThemeColors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api';
import { LANGUAGE_OPTIONS } from '@/lib/domain';
import { formatLanguage, maskEmail } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { ThemePreference, useThemePreference } from '@/providers/ThemeProvider';

interface ActivitySummary {
  vehicles: number;
  tags: number;
  unreadAlerts: number;
  openRequests: number;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user, finishAuthentication, signOut } = useAuth();
  const { themePreference, setThemePreference } = useThemePreference();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    vehicles: 0,
    tags: 0,
    unreadAlerts: 0,
    openRequests: 0,
  });
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileLanguage, setProfileLanguage] = useState<'en' | 'ar'>(
    user?.language === 'ar' ? 'ar' : 'en',
  );

  const themeLabel =
    themePreference === 'system'
      ? 'System'
      : themePreference === 'light'
        ? 'Light'
        : 'Dark';

  const themeOptions: Array<{
    value: ThemePreference;
    label: string;
    description: string;
    icon: typeof Sun;
  }> = [
    {
      value: 'system',
      label: 'System',
      description: 'Match device setting',
      icon: Monitor,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Bright and clean',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon,
    },
  ];

  const loadProfileSummary = useCallback(async () => {
    setLoading(true);

    try {
      const [vehiclesResponse, tagsResponse, alertsResponse, sessionsResponse] = await Promise.all([
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
        throw new Error(failure.error || 'Unable to load profile');
      }

      setActivitySummary({
        vehicles: vehiclesResponse.data?.length ?? 0,
        tags: tagsResponse.data?.length ?? 0,
        unreadAlerts: alertsResponse.data?.filter((item) => !item.isRead).length ?? 0,
        openRequests:
          sessionsResponse.data?.filter((item) => item.status === 'initiated').length ?? 0,
      });
    } catch {
      setActivitySummary({
        vehicles: 0,
        tags: 0,
        unreadAlerts: 0,
        openRequests: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setProfileName(user?.name ?? '');
      setProfileLanguage(user?.language === 'ar' ? 'ar' : 'en');
      loadProfileSummary();
    }, [loadProfileSummary, user?.language, user?.name]),
  );

  const handleSaveProfile = async () => {
    setSaving(true);
    const response = await apiService.updateProfile({
      name: profileName.trim() || null,
      language: profileLanguage,
    });
    setSaving(false);

    if (!response.success || !response.data) {
      Alert.alert('Unable to update profile', response.error || 'Please try again.');
      return;
    }

    finishAuthentication(response.data);
    setEditModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'This will clear the saved session on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.section, paddingBottom: spacing.screen },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

        <Card style={styles.userCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLighter }]}>
            <User size={38} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || 'Account owner'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {maskEmail(user?.email)}
          </Text>
          <View style={styles.userMetaRow}>
            <Badge variant="success">Verified</Badge>
            <Badge variant="primary">{formatLanguage(user?.language || 'en')}</Badge>
            <Badge variant="info">{user?.country || 'US'}</Badge>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACTIVITY</Text>
          {loading ? (
            <View style={styles.summaryLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.summaryGrid}>
              <SummaryMetric label="Vehicles" value={activitySummary.vehicles} colors={colors} />
              <SummaryMetric label="Tags" value={activitySummary.tags} colors={colors} />
              <SummaryMetric label="Unread Alerts" value={activitySummary.unreadAlerts} colors={colors} />
              <SummaryMetric label="Open Requests" value={activitySummary.openRequests} colors={colors} />
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
          <ListItem
            leftIcon={<PencilLine size={20} color={colors.textSecondary} />}
            title="Edit Profile"
            subtitle="Update your display name and preferred language"
            showChevron
            onPress={() => setEditModalVisible(true)}
          />
          <ListItem
            leftIcon={<Sun size={20} color={colors.textSecondary} />}
            title="Appearance"
            subtitle={`${themeLabel} mode`}
            showChevron
            onPress={() => setThemeModalVisible(true)}
          />
          <ListItem
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
            title="Email"
            subtitle={user?.email || 'No email saved'}
          />
          <ListItem
            leftIcon={<Globe size={20} color={colors.textSecondary} />}
            title="Language"
            subtitle={formatLanguage(user?.language || 'en')}
          />
          <ListItem
            leftIcon={<Shield size={20} color={colors.textSecondary} />}
            title="Privacy"
            subtitle="QR contacts are routed through the platform without exposing your real number."
            bottomBorder={false}
          />
        </Card>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProfileModal
        colors={colors}
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Profile"
        subtitle="Keep your owner details current across the app."
        footer={
          <Button loading={saving} onPress={handleSaveProfile} fullWidth={false}>
            Save Changes
          </Button>
        }>
        <Input
          label="Display Name"
          value={profileName}
          onChangeText={setProfileName}
          placeholder="Ahmed Hassan"
        />
        <Text style={[styles.modalSectionLabel, { color: colors.textMuted }]}>LANGUAGE</Text>
        <View style={styles.languageOptions}>
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = profileLanguage === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                onPress={() => setProfileLanguage(option.value)}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: selected ? colors.primaryLighter : colors.surfaceSecondary,
                    borderColor: selected ? colors.primaryLight : colors.border,
                  },
                ]}>
                <BadgeCheck
                  size={18}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.languageOptionText,
                    { color: selected ? colors.primary : colors.textSecondary },
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ProfileModal>

      <ProfileModal
        colors={colors}
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title="Appearance"
        subtitle="Choose how ZenvyGo should look on this device."
      >
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => {
            const selected = option.value === themePreference;
            const Icon = option.icon;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                onPress={() => setThemePreference(option.value)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? colors.primaryLighter : colors.surfaceSecondary,
                    borderColor: selected ? colors.primaryLight : colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.themeIcon,
                    {
                      backgroundColor: selected ? colors.surface : colors.surface,
                      borderColor: selected ? colors.primaryLight : colors.border,
                    },
                  ]}>
                  <Icon size={18} color={selected ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.themeCopy}>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: selected ? colors.primary : colors.text },
                    ]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {selected ? (
                  <Badge variant="primary">Active</Badge>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ProfileModal>
    </View>
  );
}

function SummaryMetric({
  colors,
  label,
  value,
}: {
  colors: ThemeColors;
  label: string;
  value: number;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surfaceSecondary }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ProfileModal({
  children,
  colors,
  footer,
  onClose,
  subtitle,
  title,
  visible,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  footer?: React.ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrapper}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {subtitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            {footer ? <View style={styles.modalFooter}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.section,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.large,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.section,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: spacing.default,
  },
  userMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.default,
    marginTop: spacing.section,
  },
  summaryCard: {
    marginBottom: spacing.section,
  },
  sectionCard: {
    marginBottom: spacing.section,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.section,
    paddingTop: spacing.section,
    paddingBottom: spacing.default,
  },
  summaryLoading: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.component,
  },
  metricCard: {
    width: '48%',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.component,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.default,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.default,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    ...shadows.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '76%',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.card,
    paddingTop: spacing.card,
    paddingBottom: spacing.section,
    gap: spacing.component,
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.default,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flexGrow: 0,
  },
  modalBodyContent: {
    paddingHorizontal: spacing.card,
    paddingBottom: spacing.section,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.section,
    alignItems: 'flex-end',
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.component,
  },
  languageOptions: {
    gap: spacing.component,
  },
  themeOptions: {
    gap: spacing.component,
  },
  languageOption: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
  },
  themeOption: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.component,
  },
  themeIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeCopy: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  languageOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
