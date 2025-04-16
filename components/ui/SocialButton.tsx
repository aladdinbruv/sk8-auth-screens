import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, LAYOUT, SPACING, ANIMATION, SHADOWS } from '../../constants/theme';

export type SocialProviderType = 'google' | 'facebook' | 'twitter' | 'apple' | 'github';

interface SocialButtonProps {
  provider: SocialProviderType;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  loading?: boolean;
  label?: string;
  accessibilityLabel?: string;
}

// Provider configurations
const PROVIDER_CONFIG: Record<SocialProviderType, {
  icon: string;
  color: string;
  backgroundColor: string;
  label: string;
}> = {
  google: {
    icon: 'google',
    color: '#fff',
    backgroundColor: '#DB4437',
    label: 'Continue with Google',
  },
  facebook: {
    icon: 'facebook',
    color: '#fff',
    backgroundColor: '#4267B2',
    label: 'Continue with Facebook',
  },
  twitter: {
    icon: 'twitter',
    color: '#fff',
    backgroundColor: '#1DA1F2',
    label: 'Continue with Twitter',
  },
  apple: {
    icon: 'apple',
    color: '#fff',
    backgroundColor: '#000',
    label: 'Continue with Apple',
  },
  github: {
    icon: 'github',
    color: '#fff',
    backgroundColor: '#333',
    label: 'Continue with GitHub',
  },
};

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
  textStyle,
  disabled = false,
  hapticFeedback = true,
  loading = false,
  label,
  accessibilityLabel,
}) => {
  // Get provider configuration
  const config = PROVIDER_CONFIG[provider];
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.6 : 1);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor: config.backgroundColor,
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
    scale.value = withSpring(1);
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
    <Animated.View style={[styles.animatedContainer, animatedContainerStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: loading }}
        accessibilityLabel={accessibilityLabel || config.label}
      >
        <View style={styles.contentContainer}>
          <FontAwesome5 
            name={config.icon} 
            size={18} 
            color={config.color} 
            style={styles.icon} 
            brand 
          />
          <Text style={[styles.text, textStyle]}>
            {loading ? 'Loading...' : (label || config.label)}
          </Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
  },
  icon: {
    marginRight: SPACING.m,
  },
  text: {
    fontFamily: FONTS.robotoBold,
    fontSize: FONTS.body,
    color: '#FFFFFF',
  },
});

export default SocialButton; 