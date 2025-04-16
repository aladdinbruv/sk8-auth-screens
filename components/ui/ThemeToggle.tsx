import React from 'react';
import { 
  StyleSheet, 
  Pressable, 
  View, 
  ViewStyle 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { COLORS, SPACING, LAYOUT, ANIMATION, SHADOWS } from '../../constants/theme';

interface ThemeToggleProps {
  style?: ViewStyle;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  hapticFeedback?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  showIcon = true,
  size = 'medium',
  hapticFeedback = true,
}) => {
  const { mode, isDark, toggleMode } = useTheme();
  
  // Calculate sizes based on the selected size
  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 22,
          knobSize: 18,
        };
      case 'large':
        return {
          width: 70,
          height: 36,
          knobSize: 30,
        };
      case 'medium':
      default:
        return {
          width: 52,
          height: 28,
          knobSize: 24,
        };
    }
  };
  
  const { width, height, knobSize } = getSize();
  
  // Animation values
  const animationProgress = useSharedValue(isDark ? 1 : 0);
  const scale = useSharedValue(1);
  
  // Handle toggle press
  const handleToggle = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Toggle theme
    toggleMode();
    
    // Animate progress
    animationProgress.value = withTiming(
      isDark ? 0 : 1,
      { duration: ANIMATION.duration.medium }
    );
    
    // Add a small bounce effect to the toggle
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1)
    );
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [COLORS.backgroundLight, COLORS.primaryBlue]
    );
    
    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });
  
  const knobAnimatedStyle = useAnimatedStyle(() => {
    const translateX = withTiming(
      animationProgress.value * (width - knobSize - 4) + 2,
      { duration: ANIMATION.duration.medium, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
    
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      ['#F2F2F2', '#FFFFFF']
    );
    
    return {
      transform: [
        { translateX },
        { scale: withTiming(animationProgress.value ? 1.05 : 1, { duration: ANIMATION.duration.medium }) },
      ],
      backgroundColor,
    };
  });
  
  return (
    <Pressable 
      onPress={handleToggle}
      style={[styles.pressable, style]}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Animated.View 
        style={[
          styles.container,
          containerAnimatedStyle,
          { width, height, borderRadius: height / 2 }
        ]}
      >
        <Animated.View 
          style={[
            styles.knob,
            knobAnimatedStyle,
            { width: knobSize, height: knobSize, borderRadius: knobSize / 2 }
          ]}
        >
          {showIcon && (
            <FontAwesome5
              name={isDark ? 'moon' : 'sun'}
              size={knobSize * 0.5}
              color={isDark ? '#F4D03F' : '#FFA500'}
              solid
            />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    padding: 2,
    ...SHADOWS.light,
  },
  knob: {
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
});

export default ThemeToggle; 