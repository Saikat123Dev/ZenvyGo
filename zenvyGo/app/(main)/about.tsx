import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Heart,
  Info,
  Shield,
  Star,
  Twitter,
} from 'lucide-react-native';
import { Badge, Card } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#0EA5E9', '#0F172A']
          : ['#0EA5E9', '#38BDF8']}
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
            <Text style={styles.headerTitle}>About</Text>
            <Text style={styles.headerSubtitle}>ZenvyGo app information</Text>
          </View>
          <View style={styles.headerIcon}>
            <Info size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.large }]}>

        {/* App Info Card */}
        <Card style={styles.appCard}>
          <View style={styles.appLogo}>
            <LinearGradient
              colors={['#1E3A8A', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}>
              <Text style={styles.logoText}>Z</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>ZenvyGo</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Connect. Protect. Respond.
          </Text>
          <View style={styles.versionRow}>
            <Badge variant="primary">Version {appVersion}</Badge>
            <Badge variant="info">Build {buildNumber}</Badge>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>
            Privacy-First Vehicle Contact
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            ZenvyGo enables secure, privacy-safe communication between vehicle owners and the public
            through QR code tags. Never share your personal phone number again - all contact
            requests are routed through our secure platform.
          </Text>
          <View style={styles.features}>
            <FeatureItem
              icon={Shield}
              text="Privacy-protected communication"
              colors={colors}
            />
            <FeatureItem
              icon={Globe}
              text="Works across UAE, Saudi, Qatar"
              colors={colors}
            />
            <FeatureItem
              icon={Star}
              text="Emergency contact profiles"
              colors={colors}
            />
          </View>
        </Card>

        {/* Links Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>LINKS</Text>
        <Card style={styles.linksCard} padding="none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/privacy-policy' as any)}
            style={[styles.linkRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.linkIcon, { backgroundColor: colors.primaryLighter }]}>
              <Shield size={18} color={colors.primary} />
            </View>
            <Text style={[styles.linkText, { color: colors.text }]}>Privacy Policy</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/terms' as any)}
            style={[styles.linkRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.linkIcon, { backgroundColor: colors.infoBackground }]}>
              <FileText size={18} color={colors.info} />
            </View>
            <Text style={[styles.linkText, { color: colors.text }]}>Terms of Service</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenLink('https://zenvygo.com')}
            style={styles.linkRowLast}>
            <View style={[styles.linkIcon, { backgroundColor: colors.successBackground }]}>
              <Globe size={18} color={colors.success} />
            </View>
            <Text style={[styles.linkText, { color: colors.text }]}>Visit Website</Text>
            <ExternalLink size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Social Links */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FOLLOW US</Text>
        <View style={styles.socialGrid}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenLink('https://twitter.com/zenvygo')}
            style={[styles.socialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.socialIcon, { backgroundColor: '#E8F5FD' }]}>
              <Twitter size={22} color="#1DA1F2" />
            </View>
            <Text style={[styles.socialLabel, { color: colors.text }]}>Twitter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenLink('https://github.com/zenvygo')}
            style={[styles.socialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.socialIcon, { backgroundColor: colorScheme === 'dark' ? '#2D333B' : '#F6F8FA' }]}>
              <Github size={22} color={colorScheme === 'dark' ? '#FFFFFF' : '#24292F'} />
            </View>
            <Text style={[styles.socialLabel, { color: colors.text }]}>GitHub</Text>
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <Card style={[styles.creditsCard, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.creditsContent}>
            <Heart size={20} color={colors.danger} fill={colors.danger} />
            <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
              Made with love in the UAE
            </Text>
          </View>
          <Text style={[styles.copyright, { color: colors.textMuted }]}>
            © 2024 ZenvyGo. All rights reserved.
          </Text>
        </Card>

        {/* Technical Info */}
        <View style={styles.techInfo}>
          <Text style={[styles.techText, { color: colors.textMuted }]}>
            React Native • Expo SDK 54 • Node.js
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({
  icon: Icon,
  text,
  colors,
}: {
  icon: typeof Shield;
  text: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.featureRow}>
      <Icon size={16} color={colors.success} />
      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{text}</Text>
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
  appCard: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  appLogo: {
    marginBottom: spacing.section,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.tight,
  },
  appTagline: {
    fontSize: 15,
    marginBottom: spacing.section,
  },
  versionRow: {
    flexDirection: 'row',
    gap: spacing.default,
  },
  descriptionCard: {
    marginTop: spacing.section,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.component,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.section,
  },
  features: {
    gap: spacing.component,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.component,
  },
  featureText: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.component,
    marginTop: spacing.large,
    marginLeft: spacing.tight,
  },
  linksCard: {
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
    borderBottomWidth: 1,
  },
  linkRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.section,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  socialCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.section,
    alignItems: 'center',
    ...shadows.sm,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  creditsCard: {
    marginTop: spacing.large,
    alignItems: 'center',
  },
  creditsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
    marginBottom: spacing.component,
  },
  creditsText: {
    fontSize: 14,
  },
  copyright: {
    fontSize: 12,
  },
  techInfo: {
    marginTop: spacing.section,
    alignItems: 'center',
  },
  techText: {
    fontSize: 11,
  },
});
