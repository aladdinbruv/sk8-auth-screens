import React, { useEffect, useState, useRef, forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
  ViewStyle,
  Animated as RNAnimated,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
  Keyboard,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, LAYOUT, SPACING, ANIMATION } from '../../constants/theme';

export type ValidationState = 'default' | 'valid' | 'invalid';

interface AnimatedInputProps extends TextInputProps {
  icon?: string;
  iconColor?: string;
  validationState?: ValidationState;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  isSecure?: boolean;
  nextInputRef?: React.RefObject<TextInput>;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
}

const AnimatedInput = forwardRef<TextInput, AnimatedInputProps>(
  (
    {
      icon,
      iconColor = COLORS.primaryBlue,
      validationState = 'default',
      errorMessage = '',
      containerStyle,
      isSecure = false,
      nextInputRef,
      onSubmitEditing,
      ...props
    },
    ref
  ) => {
    // Animation values
    const borderColor = useSharedValue(0);
    const errorOpacity = useSharedValue(0);
    const pulseAnimation = useSharedValue(1);
    const isFocusedShared = useSharedValue(0);

    // State
    const [isFocused, setIsFocused] = useState(false);

    // Effect to update animations based on validation state
    useEffect(() => {
      if (validationState === 'valid') {
        borderColor.value = withTiming(1, { duration: ANIMATION.duration.medium });
        errorOpacity.value = withTiming(0, { duration: ANIMATION.duration.medium });
      } else if (validationState === 'invalid') {
        borderColor.value = withTiming(2, { duration: ANIMATION.duration.medium });
        pulseAnimation.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
        errorOpacity.value = withTiming(1, { duration: ANIMATION.duration.medium });
      } else {
        borderColor.value = withTiming(0, { duration: ANIMATION.duration.medium });
        errorOpacity.value = withTiming(0, { duration: ANIMATION.duration.medium });
      }
    }, [validationState]);

    // Effect to handle focus animations
    useEffect(() => {
      isFocusedShared.value = withTiming(isFocused ? 1 : 0, { duration: ANIMATION.duration.medium });
    }, [isFocused]);

    // Animated styles
    const containerAnimatedStyle = useAnimatedStyle(() => {
      const borderColorInterpolated = interpolateColor(
        borderColor.value,
        [0, 1, 2],
        [COLORS.border, COLORS.success, COLORS.error]
      );

      const focusBorderColor = interpolateColor(
        isFocusedShared.value,
        [0, 1],
        [borderColorInterpolated, iconColor]
      );

      return {
        borderColor: focusBorderColor,
        transform: [{ scale: pulseAnimation.value }],
      };
    });

    const errorTextStyle = useAnimatedStyle(() => {
      return {
        opacity: errorOpacity.value,
        transform: [{ translateY: (1 - errorOpacity.value) * -5 }],
      };
    });

    // Handle focus events
    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    // Handle submit and keyboard next
    const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      if (nextInputRef?.current) {
        nextInputRef.current.focus();
      } else {
        Keyboard.dismiss();
      }
      onSubmitEditing?.(e);
    };

    return (
      <View style={styles.wrapper}>
        <Animated.View
          style={[styles.container, containerAnimatedStyle, containerStyle]}
        >
          {icon && (
            <FontAwesome5
              name={icon}
              size={16}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={COLORS.textPlaceholder}
            secureTextEntry={isSecure}
            returnKeyType={nextInputRef ? 'next' : 'done'}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            {...props}
          />
          {validationState !== 'default' && (
            <FontAwesome5
              name={validationState === 'valid' ? 'check-circle' : 'exclamation-circle'}
              size={18}
              color={validationState === 'valid' ? COLORS.success : COLORS.error}
              style={styles.validationIcon}
            />
          )}
        </Animated.View>
        {errorMessage && (
          <Animated.Text style={[styles.errorText, errorTextStyle]}>
            {errorMessage}
          </Animated.Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.l,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.border.radius.medium,
    borderWidth: LAYOUT.border.width,
    borderColor: COLORS.border,
    height: LAYOUT.input.height,
    paddingHorizontal: SPACING.m,
  },
  icon: {
    marginRight: SPACING.m,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.roboto,
    fontSize: FONTS.body,
  },
  validationIcon: {
    marginLeft: SPACING.s,
  },
  errorText: {
    fontFamily: FONTS.roboto,
    fontSize: FONTS.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.m,
  },
});

export default AnimatedInput; 