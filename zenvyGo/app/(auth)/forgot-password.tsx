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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { apiService } from '@/lib/api';
import { Colors, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button, Input, OTPInput } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: false,
    password: '',
  });

  // Countdown timer
  useEffect(() => {
    if (step === 'verify' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && newPassword.length >= 8) {
      handleResetPassword();
    }
  }, [otp, newPassword]);

  const maskEmail = (email: string) => {
    if (!email) return '***@***.***';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***.***';

    const maskedLocal = localPart.length > 3
      ? `${localPart.slice(0, 2)}***${localPart.slice(-1)}`
      : `${localPart[0]}***`;

    return `${maskedLocal}@${domain}`;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors({ ...errors, email: 'Email is required' });
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: 'Invalid email address' });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!newPassword) {
      setErrors({ ...errors, password: 'Password is required' });
      return false;
    } else if (newPassword.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' });
      return false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setErrors({ ...errors, password: 'Password must contain uppercase, lowercase, and number' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);

    try {
      const response = await apiService.forgotPasswordRequest(email.trim().toLowerCase());

      if (response.success) {
        setStep('verify');
        setCountdown(60);
        setCanResend(false);
        Alert.alert(
          'Code Sent',
          'Please check your email for the password reset code'
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to send reset code. Please try again.');
      }
    } catch (err: any) {
      console.error('Forgot password request error:', err);
      Alert.alert('Error', 'Failed to send reset code. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      setErrors({ ...errors, otp: true });
      return;
    }

    if (!validatePassword()) return;

    setLoading(true);
    setErrors({ email: '', otp: false, password: '' });

    try {
      const response = await apiService.forgotPasswordReset(
        email.trim().toLowerCase(),
        otp,
        newPassword
      );

      if (response.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      } else {
        setErrors({ ...errors, otp: true });
        setOtp('');
        Alert.alert('Error', response.error || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrors({ ...errors, otp: true });
      setOtp('');
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setErrors({ ...errors, otp: false });
    setOtp('');

    try {
      const response = await apiService.resendOtp(email, 'password-reset');

      if (response.success) {
        Alert.alert('Success', 'Reset code sent to your email');
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
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 'email'
                ? 'Enter your email to receive a password reset code'
                : `Enter the code sent to ${maskEmail(email)}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' ? (
              <>
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: '' });
                  }}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />
              </>
            ) : (
              <>
                {/* OTP Input */}
                <View style={styles.otpContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Verification Code
                  </Text>
                  <OTPInput
                    value={otp}
                    onChange={(text) => {
                      setOtp(text);
                      setErrors({ ...errors, otp: false });
                    }}
                    error={errors.otp}
                    autoFocus
                  />

                  {errors.otp && (
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

                {/* New Password Input */}
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightIcon={
                    showPassword ? (
                      <EyeOff size={20} color={colors.textMuted} />
                    ) : (
                      <Eye size={20} color={colors.textMuted} />
                    )
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </Text>
              </>
            )}
          </View>

          {/* Action Button */}
          <View style={[styles.actions, { paddingBottom: insets.bottom + 24 }]}>
            {step === 'email' ? (
              <Button
                onPress={handleSendOTP}
                loading={loading}
                disabled={loading || !email.trim()}>
                Send Reset Code
              </Button>
            ) : (
              <Button
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading || otp.length !== 6 || newPassword.length < 8}>
                Reset Password
              </Button>
            )}

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backToLoginButton}>
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                Back to Log In
              </Text>
            </TouchableOpacity>
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
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.default,
    alignSelf: 'flex-start',
    width: '100%',
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
    marginBottom: spacing.default,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  resendLabel: {
    fontSize: 14,
    marginBottom: spacing.default,
  },
  resendButton: {
    padding: spacing.default,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: -spacing.default,
    marginBottom: spacing.default,
  },
  actions: {
    gap: spacing.section,
  },
  backToLoginButton: {
    alignSelf: 'center',
    paddingVertical: spacing.default,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
