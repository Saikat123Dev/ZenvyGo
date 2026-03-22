import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, componentHeights, borderRadius, animations } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      ...props
    },
    ref
    ) => {
      const colorScheme = useColorScheme();
      const colors = Colors[colorScheme ?? 'light'];
      const [isFocused, setIsFocused] = useState(false);
      const isMultiline = Boolean(props.multiline);

      const borderColorValue = useSharedValue(colors.inputBorder);

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderColor: withTiming(borderColorValue.value, { duration: animations.fast }),
    }));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      borderColorValue.value = error ? colors.inputError : colors.inputBorderFocus;
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      borderColorValue.value = error ? colors.inputError : colors.inputBorder;
      props.onBlur?.(e);
    };

    const getBorderColor = () => {
      if (error) return colors.inputError;
      if (isFocused) return colors.inputBorderFocus;
      return colors.inputBorder;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: error ? colors.inputErrorBackground : colors.inputBackground,
              borderColor: getBorderColor(),
              minHeight: isMultiline ? 112 : componentHeights.input,
              height: isMultiline ? undefined : componentHeights.input,
              alignItems: isMultiline ? 'flex-start' : 'center',
            },
            animatedBorderStyle,
          ]}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            {...props}
            style={[
              styles.input,
              { color: colors.text },
              leftIcon ? styles.inputWithLeftIcon : undefined,
              rightIcon ? styles.inputWithRightIcon : undefined,
              isMultiline ? styles.multilineInput : undefined,
              inputStyle,
            ]}
            placeholderTextColor={colors.inputPlaceholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.rightIcon}>
              {rightIcon}
            </TouchableOpacity>
          )}
        </Animated.View>
        {(error || hint) && (
          <Text
            style={[
              styles.helperText,
              { color: error ? colors.inputError : colors.textMuted },
            ]}>
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
});

export default Input;
