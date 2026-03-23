import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  Info,
  Lock,
  MessageCircleQuestion,
  Moon,
  Settings2,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  Vibrate,
  X,
} from 'lucide-react-native';
import { Card } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemePreference, useThemePreference } from '@/providers/ThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { themePreference, setThemePreference } = useThemePreference();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const themeLabel =
    themePreference === 'system'
      ? 'System'
      : themePreference === 'light'
        ? 'Light'
        : 'Dark';

  const themeIcon =
    themePreference === 'light' ? Sun : themePreference === 'dark' ? Moon : Smartphone;
  const ThemeIcon = themeIcon;

  const themeOptions: Array<{
    value: ThemePreference;
    label: string;
    description: string;
    icon: typeof Sun;
  }> = [
    { value: 'system', label: 'System', description: 'Match your device settings', icon: Smartphone },
    { value: 'light', label: 'Light', description: 'Bright and clean interface', icon: Sun },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes at night', icon: Moon },
  ];

  const handleCheckForUpdates = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version is ready to be downloaded. Would you like to update now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download & Restart',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (e: any) {
                  Alert.alert('Update Error', e.message || 'Failed to apply the update.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', 'You are already running the latest version.');
      }
    } catch (error: any) {
      Alert.alert('Update Error', error.message || 'Failed to check for updates. You might be in development mode.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data including vehicles, tags, and contact history will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Contact Support',
              'To delete your account, please contact support@zenvygo.com with your registered email address.',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#1E3A8A', '#0F172A']
          : ['#1E3A8A', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your ZenvyGo experience</Text>
          </View>
          <View style={styles.headerIcon}>
            <Settings2 size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.large }]}>

        {/* Appearance Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <ThemeIcon size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Theme</Text>
              <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>{themeLabel}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Notifications Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NOTIFICATIONS</Text>
        <Card style={styles.sectionCard} padding="none">
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningBackground }]}>
              <Bell size={20} color={colors.warning} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Get alerts for contact requests
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.infoBackground }]}>
              <Bell size={20} color={colors.info} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Sound</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Play sound for new alerts
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={soundEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.successBackground }]}>
              <Vibrate size={20} color={colors.success} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Haptic feedback for interactions
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={vibrationEnabled ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        {/* Privacy & Security Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PRIVACY & SECURITY</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/privacy-policy' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Privacy Policy</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                How we protect your data
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/terms' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.infoBackground }]}>
              <FileText size={20} color={colors.info} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Terms of Service</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Usage terms and conditions
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Change Password', 'Password change feature coming soon.')}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningBackground }]}>
              <Lock size={20} color={colors.warning} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Update your account password
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SUPPORT</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/help' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.successBackground }]}>
              <CircleHelp size={20} color={colors.success} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Help & FAQ</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Common questions answered
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Contact Support', 'Email us at support@zenvygo.com')}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <MessageCircleQuestion size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Contact Support</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Get help from our team
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/about' as any)}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.infoBackground }]}>
              <Info size={20} color={colors.info} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>About ZenvyGo</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                App version and info
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* App Updates Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APP UPDATES</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCheckForUpdates}
            disabled={isCheckingUpdate}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.infoBackground }]}>
              <Download size={20} color={colors.info} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Check for Updates</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {isCheckingUpdate ? 'Checking for updates...' : 'Download and install OTA updates'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { color: colors.danger }]}>DANGER ZONE</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.dangerBackground }]}>
              <Trash2 size={20} color={colors.danger} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.danger }]}>Delete Account</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                Permanently remove all your data
              </Text>
            </View>
            <ChevronRight size={20} color={colors.danger} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderCopy}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Select how ZenvyGo should appear
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setThemeModalVisible(false)}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.themeOptions}>
                {themeOptions.map((option) => {
                  const selected = option.value === themePreference;
                  const Icon = option.icon;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.85}
                      onPress={() => {
                        setThemePreference(option.value);
                        setThemeModalVisible(false);
                      }}
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
                            backgroundColor: colors.surface,
                            borderColor: selected ? colors.primaryLight : colors.border,
                          },
                        ]}>
                        <Icon size={22} color={selected ? colors.primary : colors.textSecondary} />
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
                      {selected && (
                        <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.section,
    paddingTop: spacing.section,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.component,
    marginTop: spacing.section,
    marginLeft: spacing.tight,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
    borderBottomWidth: 1,
  },
  settingsRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  settingsCopy: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 13,
    marginTop: 2,
  },
  settingsHint: {
    fontSize: 13,
    marginTop: 2,
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
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    overflow: 'hidden',
    paddingBottom: spacing.large,
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
  themeOptions: {
    paddingHorizontal: spacing.card,
    gap: spacing.component,
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeCopy: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
