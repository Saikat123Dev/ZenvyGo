import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, borderRadius, shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  style,
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 56;
      default:
        return 48;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.buttonPrimary;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return colors.surfaceSecondary;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outline':
        return colors.border;
      default:
        return undefined;
    }
  };

  const dimension = getSize();
  const borderColor = getBorderColor();

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: dimension,
          height: dimension,
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        borderColor && { borderWidth: 1, borderColor },
        variant === 'default' && shadows.sm,
        animatedStyle,
        style,
      ]}>
      {icon}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
