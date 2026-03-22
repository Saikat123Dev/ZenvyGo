import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, QrCode, Bell, Car } from 'lucide-react-native';
import { spacing, borderRadius, brand } from '@/constants/theme';
import { Button } from '@/components/ui';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: <Shield size={64} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Privacy First',
    description:
      'Your phone number stays hidden. Communicate safely through our masked relay system.',
  },
  {
    id: '2',
    icon: <QrCode size={64} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Smart QR Tags',
    description:
      'Generate unique QR codes for your vehicles. Anyone can scan to contact you instantly.',
  },
  {
    id: '3',
    icon: <Bell size={64} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Instant Alerts',
    description:
      'Get notified immediately when someone needs to reach you about your vehicle.',
  },
  {
    id: '4',
    icon: <Car size={64} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Multi-Vehicle Support',
    description:
      'Manage all your vehicles in one place. Perfect for families and fleet owners.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleGetStarted = () => {
    router.push('/(auth)/signup');
  };

  const handleSkip = () => {
    router.push('/(auth)/signup');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        return (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient
      colors={[brand[900], brand[700], brand[800]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={[styles.skipButton, { top: insets.top + 16 }]}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={[styles.logoContainer, { marginTop: insets.top + 60 }]}>
        <View style={styles.logoIcon}>
          <Car size={32} color={brand[900]} strokeWidth={2} />
        </View>
        <Text style={styles.logoText}>SAMPARK</Text>
        <Text style={styles.tagline}>Connect. Protect. Respond.</Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.slideList}
      />

      {/* Pagination & Actions */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleNext}
            variant="secondary"
            style={styles.button}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.section,
    zIndex: 10,
    padding: spacing.default,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.component,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.default,
  },
  slideList: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xlarge,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xlarge,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.component,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.section,
  },
  bottomSection: {
    paddingHorizontal: spacing.section,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.large,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  buttonContainer: {
    marginBottom: spacing.section,
  },
  button: {
    backgroundColor: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
