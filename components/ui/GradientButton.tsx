import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  AccessibilityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, LAYOUT, SPACING, ANIMATION } from '../../constants/theme';
import theme from '../../constants/theme';

// Get SHADOWS from theme
const { SHADOWS } = theme;

interface GradientButtonProps extends AccessibilityProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  loading?: boolean;
  bounceEffect?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors = COLORS.gradientBlue,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  textStyle,
  disabled = false,
  hapticFeedback = true,
  loading = false,
  bounceEffect = true,
  ...accessibilityProps
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.6 : 1);
  
  // Effect to handle disabled state
  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.6 : 1, { 
      duration: ANIMATION.duration.medium, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [disabled]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Button press handlers
  const handlePressIn = () => {
    scale.value = withTiming(ANIMATION.scale.pressed, { duration: ANIMATION.duration.fast });
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (bounceEffect) {
      scale.value = withSequence(
        withTiming(1.03, { duration: ANIMATION.duration.fast }),
        withSpring(1)
      );
    } else {
      scale.value = withTiming(1, { duration: ANIMATION.duration.medium });
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && !loading && onPress) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress(event);
    }
  };

  return (
    <Animated.View style={[styles.animatedContainer, animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: loading }}
        {...accessibilityProps}
      >
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          style={styles.gradient}
        >
          <Text style={[styles.text, textStyle]}>
            {loading ? 'Loading...' : title}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    borderRadius: LAYOUT.border.radius.large,
    overflow: 'hidden',
    height: LAYOUT.button.height,
    ...SHADOWS.medium,
  },
  pressable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
  },
  text: {
    fontFamily: FONTS.robotoBold,
    fontSize: FONTS.button,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default GradientButton; 