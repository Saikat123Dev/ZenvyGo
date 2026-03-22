import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { apiService } from '@/lib/api';
import { Colors, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button, OTPInput } from '@/components/ui';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; type?: string; name?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const maskEmail = (email: string) => {
    if (!email) return '***@***.***';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***.***';

    const maskedLocal = localPart.length > 3
      ? `${localPart.slice(0, 2)}***${localPart.slice(-1)}`
      : `${localPart[0]}***`;

    return `${maskedLocal}@${domain}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await apiService.verifyEmail(params.email, otp);

      if (response.success && response.data) {
        // Navigate to main app
        Alert.alert(
          'Success',
          'Your email has been verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(main)'),
            },
          ]
        );
      } else {
        setError(true);
        setOtp('');
        Alert.alert('Error', response.error || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(true);
      setOtp('');
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setError(false);
    setOtp('');

    try {
      const response = await apiService.resendOtp(params.email, 'signup');

      if (response.success) {
        Alert.alert('Success', 'Verification code sent to your email');
      } else {
        Alert.alert('Error', response.error || 'Failed to resend code. Please try again.');
        setCanResend(true);
        setCountdown(0);
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
      setCanResend(true);
      setCountdown(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Verify Email
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={[styles.email, { color: colors.text }]}>
                {maskEmail(params.email || '')}
              </Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onChange={setOtp}
              error={error}
              autoFocus
            />

            {error && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                Invalid code. Please try again.
              </Text>
            )}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            {!canResend ? (
              <Text style={[styles.timerText, { color: colors.textMuted }]}>
                {formatTime(countdown)} remaining
              </Text>
            ) : null}
          </View>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendLabel, { color: colors.textMuted }]}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              style={styles.resendButton}>
              <Text
                style={[
                  styles.resendText,
                  { color: canResend ? colors.primary : colors.textMuted },
                ]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <View style={[styles.actions, { paddingBottom: insets.bottom + 24 }]}>
            <Button
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6}>
              Verify
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.section,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: spacing.section,
  },
  header: {
    marginBottom: spacing.xlarge,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.default,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  errorText: {
    fontSize: 14,
    marginTop: spacing.component,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xlarge,
  },
  resendLabel: {
    fontSize: 14,
    marginBottom: spacing.default,
  },
  resendButton: {
    padding: spacing.default,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
