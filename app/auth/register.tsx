import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import custom components and hooks
import AnimatedInput from '../../components/ui/AnimatedInput';
import GradientButton from '../../components/ui/GradientButton';
import SocialButton from '../../components/ui/SocialButton';
import { useTheme } from '../../contexts/ThemeContext';
import useForm from '../../hooks/useForm';
import { isEmailValid, isPasswordValid, doPasswordsMatch, isNameValid } from '../../utils/validation';
import { COLORS, FONTS, LAYOUT, SPACING, ANIMATION } from '../../constants/theme';
import theme from '../../constants/theme';

interface RegisterFormValues {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const SHADOWS = theme.SHADOWS;
  
  // Refs for focusing inputs
  const emailInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  
  // Form handling with validation
  const { 
    formState, 
    handleChange, 
    handleBlur, 
    validateForm, 
    isValid,
    setError 
  } = useForm<RegisterFormValues>(
    {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    {
      fullName: {
        required: true,
        validate: isNameValid,
        errorMessage: 'Please enter a valid name',
      },
      email: {
        required: true,
        validate: isEmailValid,
        errorMessage: 'Please enter a valid email address',
      },
      username: {
        required: true,
        validate: (value) => value.length >= 3,
        errorMessage: 'Username must be at least 3 characters',
      },
      password: {
        required: true,
        validate: isPasswordValid,
        errorMessage: 'Password must be at least 6 characters',
      },
      confirmPassword: {
        required: true,
        validate: (value) => value.length >= 6,
        errorMessage: 'Please confirm your password',
      },
    },
    true, // Validate on change
    300 // Debounce time
  );
  
  // Validate that passwords match
  useEffect(() => {
    if (formState.password.value && formState.confirmPassword.value) {
      const passwordsMatch = formState.password.value === formState.confirmPassword.value;
      setError('confirmPassword', passwordsMatch ? '' : 'Passwords do not match');
    }
  }, [formState.password.value, formState.confirmPassword.value]);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const socialOpacity = useSharedValue(0);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Bangers': require('../../assets/fonts/Bangers-Regular.ttf'),
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    // Staggered animations
    setTimeout(() => {
      // Animate header with bounce
      headerOpacity.value = withSequence(
        withTiming(1, { duration: ANIMATION.duration.slow }),
        withSpring(1)
      );
      
      // Fade in form elements with a slide up
      setTimeout(() => {
        formOpacity.value = withTiming(1, { 
          duration: ANIMATION.duration.extraSlow,
          easing: Easing.out(Easing.cubic)
        });
      }, 300);
      
      // Fade in social buttons last
      setTimeout(() => {
        socialOpacity.value = withTiming(1, { 
          duration: ANIMATION.duration.extraSlow,
          easing: Easing.out(Easing.cubic)
        });
      }, 600);
    }, 100);
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: (1 - headerOpacity.value) * -30 }]
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: (1 - formOpacity.value) * 50 }]
    };
  });
  
  const socialAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: socialOpacity.value,
      transform: [{ translateY: (1 - socialOpacity.value) * 30 }]
    };
  });

  // Handle register
  const handleRegister = () => {
    const isFormValid = validateForm();
    
    if (isFormValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('Registration attempt with:', formState);
      // Navigate to main app or verification screen
      // router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  // Handle social signup
  const handleSocialSignup = (provider: string) => {
    console.log(`Signup with ${provider}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Implement OAuth logic here
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1564417510515-b3d20c821653?q=80&w=1664&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
                <FontAwesome5 name="fire" size={32} color={colors.primaryPink} style={styles.headerIcon} />
                <Text style={styles.headerText}>Join the Crew</Text>
              </Animated.View>
              
              <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                <AnimatedInput
                  icon="user-alt"
                  iconColor={colors.primaryPink}
                  placeholder="Full Name"
                  value={formState.fullName.value}
                  onChangeText={(text) => handleChange('fullName', text)}
                  onBlur={() => handleBlur('fullName')}
                  validationState={formState.fullName.validationState}
                  errorMessage={formState.fullName.error}
                  returnKeyType="next"
                  nextInputRef={emailInputRef}
                  accessibilityLabel="Full name input"
                  accessibilityHint="Enter your full name"
                />
                
                <AnimatedInput
                  ref={emailInputRef}
                  icon="envelope"
                  iconColor={colors.primaryPink}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formState.email.value}
                  onChangeText={(text) => handleChange('email', text)}
                  onBlur={() => handleBlur('email')}
                  validationState={formState.email.validationState}
                  errorMessage={formState.email.error}
                  returnKeyType="next"
                  nextInputRef={usernameInputRef}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                />
                
                <AnimatedInput
                  ref={usernameInputRef}
                  icon="user"
                  iconColor={colors.primaryPink}
                  placeholder="Username"
                  autoCapitalize="none"
                  value={formState.username.value}
                  onChangeText={(text) => handleChange('username', text)}
                  onBlur={() => handleBlur('username')}
                  validationState={formState.username.validationState}
                  errorMessage={formState.username.error}
                  returnKeyType="next"
                  nextInputRef={passwordInputRef}
                  accessibilityLabel="Username input"
                  accessibilityHint="Create a username"
                />
                
                <AnimatedInput
                  ref={passwordInputRef}
                  icon="lock"
                  iconColor={colors.primaryPink}
                  placeholder="Password"
                  isSecure
                  value={formState.password.value}
                  onChangeText={(text) => handleChange('password', text)}
                  onBlur={() => handleBlur('password')}
                  validationState={formState.password.validationState}
                  errorMessage={formState.password.error}
                  returnKeyType="next"
                  nextInputRef={confirmPasswordInputRef}
                  accessibilityLabel="Password input"
                  accessibilityHint="Create a password"
                />
                
                <AnimatedInput
                  ref={confirmPasswordInputRef}
                  icon="lock"
                  iconColor={colors.primaryPink}
                  placeholder="Confirm Password"
                  isSecure
                  value={formState.confirmPassword.value}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                  onBlur={() => handleBlur('confirmPassword')}
                  validationState={formState.confirmPassword.validationState}
                  errorMessage={formState.confirmPassword.error}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  accessibilityLabel="Confirm password input"
                  accessibilityHint="Confirm your password"
                />
                
                <GradientButton
                  title="Create Account"
                  onPress={handleRegister}
                  colors={colors.gradientPink}
                  style={styles.registerButton}
                  disabled={!isValid}
                  accessibilityLabel="Create account button"
                  accessibilityHint="Tap to create your account"
                />
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>
              </Animated.View>
              
              <Animated.View style={[styles.socialContainer, socialAnimatedStyle]}>
                <SocialButton
                  provider="google"
                  onPress={() => handleSocialSignup('google')}
                  style={styles.socialButton}
                />
                <SocialButton
                  provider="apple"
                  onPress={() => handleSocialSignup('apple')}
                  style={styles.socialButton}
                />
                
              </Animated.View>
              
              <Animated.View style={[styles.footerContainer, socialAnimatedStyle]}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/auth/login" style={styles.linkText}>
                  Log In
                </Link>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerIcon: {
    marginBottom: SPACING.s,
  },
  headerText: {
    fontFamily: FONTS.bangers,
    fontSize: FONTS.h2,
    color: '#FFF',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: SPACING.l,
  },
  registerButton: {
    marginTop: SPACING.m,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.l,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    paddingHorizontal: SPACING.m,
    color: '#CCCCCC',
    fontSize: FONTS.caption,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  socialButton: {
    marginHorizontal: SPACING.xs,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#CCCCCC',
    marginRight: SPACING.xs,
  },
  linkText: {
    color: '#FF47D2',
    fontFamily: FONTS.robotoBold,
  },
}); 