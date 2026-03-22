import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Moon,
  Globe,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
} from 'lucide-react-native';
import { Colors, spacing, borderRadius, shadows, brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListItem, Divider, Button } from '@/components/ui';

// Mock user data
const MOCK_USER = {
  name: 'Ahmed Hassan',
  phone: '+971 50 *** **67',
  email: 'ahmed@example.com',
  avatarUrl: null,
};

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            // Perform logout
            router.replace('/(auth)');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.section },
        ]}>
        {/* Header */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLighter }]}>
            <User size={36} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {MOCK_USER.name}
          </Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
            {MOCK_USER.phone}
          </Text>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            ACCOUNT
          </Text>

          <ListItem
            leftIcon={<User size={20} color={colors.textSecondary} />}
            title="Edit Profile"
            showChevron
            onPress={() => {}}
          />

          <ListItem
            leftIcon={<Bell size={20} color={colors.textSecondary} />}
            title="Notifications"
            rightContent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            bottomBorder={false}
          />
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            PREFERENCES
          </Text>

          <ListItem
            leftIcon={<Moon size={20} color={colors.textSecondary} />}
            title="Dark Mode"
            rightContent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />

          <ListItem
            leftIcon={<Globe size={20} color={colors.textSecondary} />}
            title="Language"
            subtitle="English"
            showChevron
            onPress={() => {}}
            bottomBorder={false}
          />
        </View>

        {/* Security Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            SECURITY
          </Text>

          <ListItem
            leftIcon={<Shield size={20} color={colors.textSecondary} />}
            title="Privacy Settings"
            showChevron
            onPress={() => {}}
          />

          <ListItem
            leftIcon={<Smartphone size={20} color={colors.textSecondary} />}
            title="Active Sessions"
            showChevron
            onPress={() => {}}
            bottomBorder={false}
          />
        </View>

        {/* Support Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            SUPPORT
          </Text>

          <ListItem
            leftIcon={<FileText size={20} color={colors.textSecondary} />}
            title="Terms & Privacy"
            showChevron
            onPress={() => {}}
          />

          <ListItem
            leftIcon={<HelpCircle size={20} color={colors.textSecondary} />}
            title="Help & Support"
            showChevron
            onPress={() => {}}
            bottomBorder={false}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Version 1.0.0
        </Text>

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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.large,
  },
  userCard: {
    alignItems: 'center',
    padding: spacing.large,
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing.section,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
  },
  section: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.section,
    overflow: 'hidden',
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.section,
    paddingTop: spacing.section,
    paddingBottom: spacing.default,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.section,
    borderRadius: borderRadius.xl,
    gap: spacing.default,
    ...shadows.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: spacing.section,
  },
});
