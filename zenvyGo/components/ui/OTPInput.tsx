import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, borderRadius, componentHeights, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const inputRefs = useRef<TextInput[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const digits = value.split('').concat(Array(length - value.length).fill(''));

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const pastedValue = text.slice(0, length).replace(/[^0-9]/g, '');
      onChange(pastedValue);
      if (pastedValue.length === length) {
        Keyboard.dismiss();
      } else {
        inputRefs.current[pastedValue.length]?.focus();
      }
      return;
    }

    // Handle single digit
    const newValue = digits.slice();
    newValue[index] = text.replace(/[^0-9]/g, '');
    const newOtp = newValue.join('').slice(0, length);
    onChange(newOtp);

    // Move to next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto dismiss keyboard when complete
    if (newOtp.length === length) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <OTPCell
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          isFocused={focusedIndex === index}
          hasError={error}
          colors={colors}
        />
      ))}
    </View>
  );
}

interface OTPCellProps {
  value: string;
  onChangeText: (text: string) => void;
  onKeyPress: (e: any) => void;
  onFocus: () => void;
  isFocused: boolean;
  hasError: boolean;
  colors: ThemeColors;
}

const OTPCell = React.forwardRef<TextInput, OTPCellProps>(
  ({ value, onChangeText, onKeyPress, onFocus, isFocused, hasError, colors }, ref) => {
    const scale = useSharedValue(1);

    useEffect(() => {
      scale.value = withSpring(isFocused ? 1.05 : 1, { damping: 15, stiffness: 300 });
    }, [isFocused, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const getBorderColor = () => {
      if (hasError) return colors.inputError;
      if (isFocused) return colors.inputBorderFocus;
      if (value) return colors.primary;
      return colors.inputBorder;
    };

    return (
      <Animated.View
        style={[
          styles.cell,
          {
            borderColor: getBorderColor(),
            backgroundColor: hasError ? colors.inputErrorBackground : colors.inputBackground,
          },
          animatedStyle,
        ]}>
        <TextInput
          ref={ref}
          style={[styles.cellInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={6}
          selectTextOnFocus
          selectionColor={colors.primary}
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : undefined}
        />
      </Animated.View>
    );
  }
);

OTPCell.displayName = 'OTPCell';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    width: 48,
    height: componentHeights.otpCell,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default OTPInput;
