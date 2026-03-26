import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Shield } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRIVACY_SECTIONS = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, add a vehicle, or contact us for support.

This includes:
• Account information (email, name, country)
• Vehicle details (plate number, make, model, color)
• Emergency contact information you choose to add
• Contact request messages sent through QR tags`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process contact requests through QR tags
• Send you technical notices and support messages
• Respond to your comments and questions
• Protect the safety and security of our users`,
  },
  {
    title: 'Privacy Protection',
    content: `ZenvyGo is built with privacy at its core:

• Your phone number is NEVER shared with people who scan your QR tags
• All contact requests are routed through our secure relay system
• You control what information is visible to others
• Emergency contacts are only shared when you explicitly authorize it`,
  },
  {
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your data:

• All data is encrypted in transit using TLS 1.3
• Sensitive data is encrypted at rest
• Regular security audits and penetration testing
• Secure authentication with email verification`,
  },
  {
    title: 'Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we need to retain it for legal purposes.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:
• Access your personal information
• Correct inaccurate data
• Delete your account and data
• Export your data in a portable format
• Opt out of marketing communications

To exercise these rights, contact us at privacy@zenvygo.com`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@zenvygo.com
Address: Dubai, United Arab Emirates

Last updated: March 2024`,
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>How we protect your data</Text>
          </View>
          <View style={styles.headerIcon}>
            <Shield size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 68 + Math.max(insets.bottom, 16) + 32 }]}>

        <Card style={styles.introCard}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            At ZenvyGo, we take your privacy seriously. This policy explains how we
            collect, use, and protect your personal information when you use our
            vehicle contact platform.
          </Text>
        </Card>

        {PRIVACY_SECTIONS.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </Card>
        ))}
      </ScrollView>
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
  introCard: {
    marginBottom: spacing.section,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionCard: {
    marginBottom: spacing.component,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.component,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
});
