import React from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outline' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  onPress,
  disabled = false,
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.alertUnreadBackground;
      default:
        return colors.cardBackground;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outline':
        return colors.border;
      case 'highlight':
        return colors.alertUnreadBorder;
      default:
        return colors.cardBorder;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.component;
      case 'lg':
        return spacing.large;
      default:
        return spacing.card;
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'elevated':
        return shadows.md;
      case 'outline':
        return undefined;
      default:
        return shadows.sm;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: 1,
    borderRadius: borderRadius['2xl'],
    padding: getPadding(),
    ...getShadow(),
  };

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[cardStyle, animatedStyle, style]}>
        {children}
      </AnimatedTouchable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// Pre-configured card variants
interface VehicleCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function VehicleCard({ children, onPress, style }: VehicleCardProps) {
  return (
    <Card variant="default" padding="md" onPress={onPress} style={style}>
      {children}
    </Card>
  );
}

interface AlertCardProps {
  children: React.ReactNode;
  isUnread?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AlertCard({
  children,
  isUnread = false,
  onPress,
  style,
}: AlertCardProps) {
  return (
    <Card
      variant={isUnread ? 'highlight' : 'default'}
      padding="md"
      onPress={onPress}
      style={style}>
      {children}
    </Card>
  );
}

interface StatCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ children, onPress, style }: StatCardProps) {
  return (
    <Card
      variant="default"
      padding="md"
      onPress={onPress}
      style={{ alignItems: 'center', ...(style as object) }}>
      {children}
    </Card>
  );
}

export default Card;
