import React, { useCallback, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemePreference, useThemePreference } from '@/providers/ThemeProvider';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  labelKey: string;
  descriptionKey: string;
  icon: typeof Sun;
}> = [
  { value: 'system', labelKey: 'settings.themeSystem', descriptionKey: 'settings.systemDesc', icon: Smartphone },
  { value: 'light', labelKey: 'settings.themeLight', descriptionKey: 'settings.lightDesc', icon: Sun },
  { value: 'dark', labelKey: 'settings.themeDark', descriptionKey: 'settings.darkDesc', icon: Moon },
];

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { themePreference, setThemePreference } = useThemePreference();
  const { t } = useTranslation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const themeLabel =
    themePreference === 'system'
      ? t('settings.themeSystem')
      : themePreference === 'light'
        ? t('settings.themeLight')
        : t('settings.themeDark');

  const themeIcon =
    themePreference === 'light' ? Sun : themePreference === 'dark' ? Moon : Smartphone;
  const ThemeIcon = themeIcon;

  const handleCheckForUpdates = useCallback(async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          t('settings.updateAvailable'),
          t('settings.updateAvailableDesc'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.downloadRestart'),
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (e: any) {
                  Alert.alert(t('settings.updateError'), e.message || t('common.tryAgain'));
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(t('settings.upToDate'), t('settings.upToDateDesc'));
      }
    } catch (error: any) {
      Alert.alert(t('settings.updateError'), error.message || t('common.tryAgain'));
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.contactSupport'),
              t('settings.deleteAccountContact'),
            );
          },
        },
      ],
    );
  }, [t]);

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
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
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
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.appearance')}</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <ThemeIcon size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.theme')}</Text>
              <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>{themeLabel}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Notifications Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.notifications')}</Text>
        <Card style={styles.sectionCard} padding="none">
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningBackground }]}>
              <Bell size={20} color={colors.warning} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.pushNotifications')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.pushNotificationsHint')}
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
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.sound')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.soundHint')}
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
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.vibration')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.vibrationHint')}
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
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.privacy')}</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/privacy-policy' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.privacyPolicy')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.privacyPolicyHint')}
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
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.terms')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.termsHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/documents' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.successBackground }]}>
              <FileText size={20} color={colors.success} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.myDocuments')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.myDocumentsHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert(t('settings.changePassword'), t('settings.passwordComingSoon'))}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningBackground }]}>
              <Lock size={20} color={colors.warning} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.changePassword')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.changePasswordHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.support')}</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/help' as any)}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.successBackground }]}>
              <CircleHelp size={20} color={colors.success} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.helpFaq')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.helpFaqHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert(t('settings.contactSupport'), t('settings.contactSupportEmail'))}
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLighter }]}>
              <MessageCircleQuestion size={20} color={colors.primary} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.contactSupport')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.contactSupportHint')}
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
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.about')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.aboutHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* App Updates Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.appUpdates')}</Text>
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
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{t('settings.checkUpdates')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {isCheckingUpdate ? t('settings.checkingUpdates') : t('settings.checkUpdatesHint')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { color: colors.danger }]}>{t('settings.dangerZone')}</Text>
        <Card style={styles.sectionCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            style={styles.settingsRowLast}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.dangerBackground }]}>
              <Trash2 size={20} color={colors.danger} />
            </View>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: colors.danger }]}>{t('settings.deleteAccount')}</Text>
              <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
                {t('settings.deleteAccountHint')}
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
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.chooseTheme')}</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    {t('settings.chooseThemeDesc')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setThemeModalVisible(false)}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.themeOptions}>
                {THEME_OPTIONS.map((option) => {
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
                          {t(option.labelKey)}
                        </Text>
                        <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                          {t(option.descriptionKey)}
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
    marginEnd: spacing.component,
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
    marginStart: spacing.tight,
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
    marginEnd: spacing.component,
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
