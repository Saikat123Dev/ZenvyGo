import React, { useCallback, useMemo, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  BadgeCheck,
  Bell,
  Car,
  ChevronRight,
  CircleHelp,
  Info,
  LogOut,
  MessageSquareText,
  Monitor,
  Moon,
  PencilLine,
  Settings,
  Shield,
  Sun,
  Tag,
  User,
  X,
} from 'lucide-react-native';
import { Badge, Button, Card, Input } from '@/components/ui';
import { Colors, ThemeColors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api';
import { LANGUAGE_OPTIONS } from '@/lib/domain';
import { formatLanguage, maskEmail } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { ThemePreference, useThemePreference } from '@/providers/ThemeProvider';
import { useAppStore, useOpenSessions, useUnreadAlerts } from '@/store/app-store';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user, finishAuthentication, signOut } = useAuth();
  const { themePreference, setThemePreference } = useThemePreference();

  // Global store
  const { vehicles, tags, isLoading, fetchAll } = useAppStore();
  const unreadAlerts = useUnreadAlerts();
  const openSessions = useOpenSessions();

  // Memoized activity summary from global store
  const activitySummary = useMemo(() => ({
    vehicles: vehicles.length,
    tags: tags.length,
    unreadAlerts: unreadAlerts.length,
    openRequests: openSessions.length,
  }), [vehicles.length, tags.length, unreadAlerts.length, openSessions.length]);

  const [saving, setSaving] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
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

  // Load data on focus (with caching)
  useFocusEffect(
    useCallback(() => {
      setProfileName(user?.name ?? '');
      setProfileLanguage(user?.language === 'ar' ? 'ar' : 'en');
      fetchAll('silent');
    }, [fetchAll, user?.language, user?.name]),
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
          { paddingBottom: insets.bottom + spacing.large },
        ]}>
        {/* Gradient Header with User Info */}
        <LinearGradient
          colors={colorScheme === 'dark'
            ? ['#1E3A8A', '#0F172A']
            : ['#1E3A8A', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileHeader, { paddingTop: insets.top + spacing.section }]}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color="#1E3A8A" strokeWidth={1.5} />
              </View>
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={18} color="#FFFFFF" fill="#0D9488" />
              </View>
            </View>
            <Text style={styles.profileName}>{user?.name || 'Account Owner'}</Text>
            <Text style={styles.profileEmail}>{maskEmail(user?.email)}</Text>
            <View style={styles.profileBadges}>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>
                  {formatLanguage(user?.language || 'en')}
                </Text>
              </View>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>{user?.country || 'UAE'}</Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.headerPattern}>
            <View style={[styles.patternCircle, styles.patternCircle1]} />
            <View style={[styles.patternCircle, styles.patternCircle2]} />
          </View>
        </LinearGradient>

        {/* Activity Stats */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card style={styles.statsCard}>
            <Text style={[styles.cardTitle, { color: colors.textMuted }]}>YOUR ACTIVITY</Text>
            {isLoading && vehicles.length === 0 ? (
              <View style={styles.statsLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <Car size={20} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {activitySummary.vehicles}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vehicles</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <Tag size={20} color={colors.success} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {activitySummary.tags}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tags</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <Bell size={20} color={colors.warning} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {activitySummary.unreadAlerts}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Unread</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <MessageSquareText size={20} color={colors.info} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {activitySummary.openRequests}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Requests</Text>
                </View>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card style={styles.menuCard} padding="none">
            <Text style={[styles.menuTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditModalVisible(true)}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: colors.primaryLighter }]}>
                <PencilLine size={18} color={colors.primary} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Edit Profile</Text>
                <Text style={[styles.menuHint, { color: colors.textSecondary }]}>
                  Name and language preference
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setThemeModalVisible(true)}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: colors.warningBackground }]}>
                {themePreference === 'light' ? (
                  <Sun size={18} color={colors.warning} />
                ) : themePreference === 'dark' ? (
                  <Moon size={18} color={colors.warning} />
                ) : (
                  <Monitor size={18} color={colors.warning} />
                )}
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.menuHint, { color: colors.textSecondary }]}>
                  {themeLabel} theme selected
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(main)/settings' as any)}
              style={styles.menuItemLast}>
              <View style={[styles.menuIcon, { backgroundColor: colors.infoBackground }]}>
                <Settings size={18} color={colors.info} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Settings</Text>
                <Text style={[styles.menuHint, { color: colors.textSecondary }]}>
                  Notifications, privacy, security
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Card style={styles.menuCard} padding="none">
            <Text style={[styles.menuTitle, { color: colors.textMuted }]}>SUPPORT</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(main)/help' as any)}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: colors.successBackground }]}>
                <CircleHelp size={18} color={colors.success} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Help & FAQ</Text>
                <Text style={[styles.menuHint, { color: colors.textSecondary }]}>
                  Common questions answered
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(main)/about' as any)}
              style={styles.menuItemLast}>
              <View style={[styles.menuIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <Info size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>About ZenvyGo</Text>
                <Text style={[styles.menuHint, { color: colors.textSecondary }]}>
                  Version and app info
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.dangerBackground }]}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <LogOut size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Shield size={14} color={colors.textMuted} />
          <Text style={[styles.privacyText, { color: colors.textMuted }]}>
            Your data is encrypted and never shared with third parties
          </Text>
        </View>
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
  },
  profileHeader: {
    paddingBottom: spacing.large,
    paddingHorizontal: spacing.section,
    position: 'relative',
    overflow: 'hidden',
  },
  profileContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.section,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.tight,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    marginBottom: spacing.section,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: spacing.default,
  },
  profileBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '60%',
    zIndex: 1,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  patternCircle1: {
    top: -40,
    right: -40,
    width: 180,
    height: 180,
  },
  patternCircle2: {
    bottom: -30,
    right: 60,
    width: 120,
    height: 120,
  },
  statsCard: {
    marginHorizontal: spacing.section,
    marginTop: -spacing.large,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.section,
  },
  statsLoading: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  statItem: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.component,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: spacing.default,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  menuCard: {
    marginHorizontal: spacing.section,
    marginTop: spacing.section,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.section,
    paddingTop: spacing.section,
    paddingBottom: spacing.component,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuHint: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.default,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.section,
    marginHorizontal: spacing.section,
    marginTop: spacing.section,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.default,
    paddingVertical: spacing.large,
    paddingHorizontal: spacing.section,
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
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
