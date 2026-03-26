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
import { ChevronLeft, FileText } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By downloading, installing, or using ZenvyGo ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.

These terms apply to all users of the App, including vehicle owners who generate QR tags and individuals who scan tags to make contact requests.`,
  },
  {
    title: '2. Service Description',
    content: `ZenvyGo provides a privacy-safe vehicle contact platform that allows:
• Vehicle owners to generate QR code tags for their vehicles
• Third parties to contact vehicle owners without accessing their personal phone numbers
• Secure relay of contact requests through our platform
• Storage of emergency contact information for vehicles`,
  },
  {
    title: '3. User Accounts',
    content: `To use certain features of the App, you must create an account. You agree to:
• Provide accurate and complete registration information
• Maintain the security of your account credentials
• Promptly update any changes to your information
• Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree NOT to use ZenvyGo to:
• Harass, threaten, or abuse other users
• Send spam or unsolicited messages
• Engage in fraudulent or illegal activities
• Impersonate others or provide false information
• Attempt to circumvent security measures
• Use the service for any unlawful purpose

Violations may result in immediate account termination.`,
  },
  {
    title: '5. QR Tags and Contact Requests',
    content: `• QR tags are intended for legitimate contact purposes related to vehicles
• Contact requests should be genuine and relevant (parking issues, emergencies, deliveries, etc.)
• Misuse of the contact system is prohibited
• We reserve the right to monitor and moderate contact requests
• Vehicle owners can block or report inappropriate contact attempts`,
  },
  {
    title: '6. Privacy and Data',
    content: `Your use of ZenvyGo is also governed by our Privacy Policy. Key points:
• We protect your personal phone number from disclosure
• Contact requests are routed through our secure relay system
• You control what information is shared with others
• We may collect usage data to improve our services`,
  },
  {
    title: '7. Intellectual Property',
    content: `All content, features, and functionality of ZenvyGo are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not:
• Copy, modify, or distribute our content
• Reverse engineer the App
• Use our trademarks without permission`,
  },
  {
    title: '8. Limitation of Liability',
    content: `ZenvyGo is provided "as is" without warranties of any kind. We are not liable for:
• Any indirect, incidental, or consequential damages
• Loss of data or service interruptions
• Actions taken by other users
• Any damages exceeding the fees paid to us (if any)

We do not guarantee that the service will be uninterrupted or error-free.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We may modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or in-app notification.`,
  },
  {
    title: '10. Termination',
    content: `You may delete your account at any time. We may terminate or suspend your access immediately, without notice, for conduct that we believe:
• Violates these terms
• Is harmful to other users or us
• Is fraudulent or illegal`,
  },
  {
    title: '11. Governing Law',
    content: `These terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved in the courts of Dubai, UAE.`,
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms of Service, contact us at:

Email: legal@zenvygo.com
Address: Dubai, United Arab Emirates

Last updated: March 2024`,
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#F59E0B', '#0F172A']
          : ['#F59E0B', '#FBBF24']}
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
            <Text style={styles.headerTitle}>Terms of Service</Text>
            <Text style={styles.headerSubtitle}>Usage terms and conditions</Text>
          </View>
          <View style={styles.headerIcon}>
            <FileText size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 68 + Math.max(insets.bottom, 16) + 32 }]}>

        <Card style={styles.introCard}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Please read these Terms of Service carefully before using ZenvyGo.
            By using our service, you agree to be bound by these terms.
          </Text>
        </Card>

        {TERMS_SECTIONS.map((section, index) => (
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
