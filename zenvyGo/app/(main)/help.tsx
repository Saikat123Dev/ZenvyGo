import React, { useState } from 'react';
import {
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Mail,
  MessageCircle,
  Phone,
  QrCode,
  Shield,
  Tag,
  Car,
  Bell,
  UserCircle,
} from 'lucide-react-native';
import { Card } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: typeof QrCode;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How does ZenvyGo protect my phone number?',
    answer: 'ZenvyGo uses a privacy-first relay system. When someone scans your QR tag, they never see your actual phone number. Instead, all communication is routed through our secure platform, keeping your personal information completely private.',
    category: 'Privacy',
    icon: Shield,
  },
  {
    id: '2',
    question: 'How do I generate a QR tag for my vehicle?',
    answer: 'Go to the Vehicles tab, select your vehicle, and tap "Generate QR". You can then print and place the QR sticker on your windshield. Anyone who scans it can contact you without seeing your number.',
    category: 'QR Tags',
    icon: QrCode,
  },
  {
    id: '3',
    question: 'What happens when someone scans my QR?',
    answer: 'When someone scans your QR tag, they can select a reason for contact (like parking issue, emergency, or delivery) and their preferred communication method. You receive an alert with their request and can choose how to respond.',
    category: 'QR Tags',
    icon: Tag,
  },
  {
    id: '4',
    question: 'Can I add multiple vehicles?',
    answer: 'Yes! You can add as many vehicles as you need. Each vehicle can have its own QR tag, and you can manage them all from the Vehicles tab. Perfect for families or businesses with multiple cars.',
    category: 'Vehicles',
    icon: Car,
  },
  {
    id: '5',
    question: 'What are emergency contacts used for?',
    answer: 'Emergency contacts are stored with each vehicle and can be shared with first responders or helpful bystanders in case of an accident. You can add medical notes and roadside assistance numbers too.',
    category: 'Safety',
    icon: Shield,
  },
  {
    id: '6',
    question: 'How do I receive notifications?',
    answer: 'Enable push notifications in Settings to get instant alerts when someone contacts you through your QR tag. You can customize notification sounds and vibration preferences.',
    category: 'Notifications',
    icon: Bell,
  },
  {
    id: '7',
    question: 'Can I change my account email?',
    answer: 'Currently, email changes require contacting support. Email us at support@zenvygo.com with your current and new email addresses for assistance.',
    category: 'Account',
    icon: UserCircle,
  },
  {
    id: '8',
    question: 'Is ZenvyGo available outside the UAE?',
    answer: 'ZenvyGo is currently optimized for the UAE, Saudi Arabia, and Qatar regions. We are expanding to more countries soon. The app works globally, but some features may vary by region.',
    category: 'General',
    icon: CircleHelp,
  },
];

function FAQAccordion({ item, colors }: { item: FAQItem; colors: typeof Colors.light }) {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 180, { duration: 200 });
    height.value = withTiming(isOpen ? 0 : 1, { duration: 200 });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value * 500,
  }));

  const Icon = item.icon;

  return (
    <Card style={styles.faqCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleOpen}
        style={styles.faqHeader}>
        <View style={[styles.faqIcon, { backgroundColor: colors.primaryLighter }]}>
          <Icon size={18} color={colors.primary} />
        </View>
        <Text style={[styles.faqQuestion, { color: colors.text }]} numberOfLines={2}>
          {item.question}
        </Text>
        <Animated.View style={arrowStyle}>
          <ChevronDown size={20} color={colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.faqContent, contentStyle]}>
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
          {item.answer}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.categoryText, { color: colors.textMuted }]}>
            {item.category}
          </Text>
        </View>
      </Animated.View>
    </Card>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@zenvygo.com?subject=ZenvyGo Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+971800ZENVYGO');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/971501234567?text=Hi, I need help with ZenvyGo');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#0D9488', '#0F172A']
          : ['#0D9488', '#14B8A6']}
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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>Find answers or contact us</Text>
          </View>
          <View style={styles.headerIcon}>
            <CircleHelp size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.large }]}>

        {/* Contact Options */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACT US</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEmailSupport}
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.contactIcon, { backgroundColor: colors.primaryLighter }]}>
              <Mail size={24} color={colors.primary} />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email</Text>
            <Text style={[styles.contactHint, { color: colors.textSecondary }]}>
              support@zenvygo.com
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleWhatsApp}
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.contactIcon, { backgroundColor: colors.successBackground }]}>
              <MessageCircle size={24} color={colors.success} />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp</Text>
            <Text style={[styles.contactHint, { color: colors.textSecondary }]}>
              Quick chat support
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCallSupport}
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.contactIcon, { backgroundColor: colors.warningBackground }]}>
              <Phone size={24} color={colors.warning} />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Call</Text>
            <Text style={[styles.contactHint, { color: colors.textSecondary }]}>
              800-ZENVYGO
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          FREQUENTLY ASKED QUESTIONS
        </Text>
        {FAQ_DATA.map((item) => (
          <FAQAccordion key={item.id} item={item} colors={colors} />
        ))}

        {/* Still need help */}
        <Card style={[styles.helpCard, { backgroundColor: colors.primaryLighter }]}>
          <View style={styles.helpContent}>
            <CircleHelp size={32} color={colors.primary} strokeWidth={1.5} />
            <View style={styles.helpCopy}>
              <Text style={[styles.helpTitle, { color: colors.primary }]}>
                Still need help?
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Our support team is available 24/7 to assist you with any questions.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEmailSupport}
            style={[styles.helpButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>
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
  contactGrid: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  contactCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.section,
    alignItems: 'center',
    ...shadows.sm,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactHint: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  faqCard: {
    marginBottom: spacing.component,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.component,
  },
  faqIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  faqContent: {
    overflow: 'hidden',
    marginTop: spacing.component,
    paddingTop: spacing.component,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
    marginTop: spacing.component,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  helpCard: {
    marginTop: spacing.section,
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.section,
    marginBottom: spacing.section,
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.tight,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.section,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
